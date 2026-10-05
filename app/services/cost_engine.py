import time
from collections import deque
from typing import Dict, List, Tuple
import tiktoken


# Current pricing per 1,000,000 tokens (USD)
MODEL_PRICING = {
    # GPT-4o
    "gpt-4o": {"input": 2.50, "output": 10.00},
    "gpt-4o-2024-08-06": {"input": 2.50, "output": 10.00},
    "gpt-4o-2024-05-13": {"input": 5.00, "output": 15.00},
    # GPT-4o-mini
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},
    "gpt-4o-mini-2024-07-18": {"input": 0.15, "output": 0.60},
    # Legacy / Common
    "gpt-4-turbo": {"input": 10.00, "output": 30.00},
    "gpt-4": {"input": 30.00, "output": 60.00},
    "gpt-3.5-turbo": {"input": 0.50, "output": 1.50},
}

# Conservative fallback rate for unlisted models ($5/M in, $15/M out)
DEFAULT_PRICING = {"input": 5.00, "output": 15.00}


class CostEngine:
    def __init__(self):
        # Maps key/session -> deque of (timestamp, cost_usd)
        self._spend_records: Dict[str, deque[Tuple[float, float]]] = {}

    def count_tokens_from_messages(self, messages: List[dict], model: str = "gpt-4o") -> int:
        """Counts total input tokens for chat messages using tiktoken."""
        try:
            encoding = tiktoken.encoding_for_model(model)
        except KeyError:
            encoding = tiktoken.get_encoding("cl100k_base")

        num_tokens = 0
        for msg in messages:
            num_tokens += 3  # Every message follows <|start|>{role/name}\n{content}<|end|>\n
            for key, value in msg.items():
                if isinstance(value, str):
                    num_tokens += len(encoding.encode(value))
        num_tokens += 3  # Every reply is primed with <|start|>assistant<|message|>
        return num_tokens

    def count_tokens_from_text(self, text: str, model: str = "gpt-4o") -> int:
        """Counts tokens for raw text strings (e.g., completions or streamed chunks)."""
        if not text:
            return 0
        try:
            encoding = tiktoken.encoding_for_model(model)
        except KeyError:
            encoding = tiktoken.get_encoding("cl100k_base")
        return len(encoding.encode(text))

    def calculate_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        """Calculates precise USD cost based on token counts."""
        pricing = MODEL_PRICING.get(model, DEFAULT_PRICING)
        input_cost = (input_tokens / 1_000_000.0) * pricing["input"]
        output_cost = (output_tokens / 1_000_000.0) * pricing["output"]
        return round(input_cost + output_cost, 6)

    def is_budget_exceeded(
        self,
        identifier: str,
        hourly_limit: float,
        daily_limit: float
    ) -> Tuple[bool, str, float, float]:
        """
        Calculates rolling spend over 1 hour and 24 hours.
        Returns: (exceeded: bool, reason: str, hourly_spend: float, daily_spend: float)
        """
        now = time.time()
        one_hour_ago = now - 3600
        twenty_four_hours_ago = now - 86400

        records = self._spend_records.get(identifier, deque())

        # Clean records older than 24 hours to save memory
        while records and records[0][0] < twenty_four_hours_ago:
            records.popleft()

        hourly_spend = sum(cost for ts, cost in records if ts >= one_hour_ago)
        daily_spend = sum(cost for ts, cost in records if ts >= twenty_four_hours_ago)

        if hourly_spend >= hourly_limit:
            return True, f"Hourly budget cap of ${hourly_limit:.2f} exceeded (Current: ${hourly_spend:.4f})", hourly_spend, daily_spend

        if daily_spend >= daily_limit:
            return True, f"Daily budget cap of ${daily_limit:.2f} exceeded (Current: ${daily_spend:.4f})", hourly_spend, daily_spend

        return False, "", hourly_spend, daily_spend

    def record_spend(self, identifier: str, cost: float) -> None:
        """Appends spend record for the key."""
        now = time.time()
        if identifier not in self._spend_records:
            self._spend_records[identifier] = deque()
        self._spend_records[identifier].append((now, cost))


# Global singleton instance
cost_engine = CostEngine()


if __name__ == "__main__":
    engine = CostEngine()
    test_key = "user_api_key_demo"

    # 1. Test token count and cost
    sample_msgs = [
        {"role": "system", "content": "You are a helpful coding assistant."},
        {"role": "user", "content": "Write a Python quicksort function."}
    ]
    tokens = engine.count_tokens_from_messages(sample_msgs, "gpt-4o")
    cost = engine.calculate_cost("gpt-4o", input_tokens=tokens, output_tokens=150)
    print(f"Token count: {tokens} tokens | Calculated cost: ${cost:.6f}")
    assert tokens > 0 and cost > 0, "Token counting or cost calculation failed."

    # 2. Test budget cap breach
    # Limit: $0.10/hour. Record two $0.06 operations.
    engine.record_spend(test_key, 0.06)
    exceeded, _, hourly, _ = engine.is_budget_exceeded(test_key, hourly_limit=0.10, daily_limit=1.00)
    assert not exceeded, "Should not exceed after first operation."

    engine.record_spend(test_key, 0.06)
    exceeded, reason, hourly, _ = engine.is_budget_exceeded(test_key, hourly_limit=0.10, daily_limit=1.00)
    assert exceeded, "Should trip the breaker after second operation."

    print("ALL TESTS PASSED:")
    print(f"Breaker tripped successfully: {reason}")