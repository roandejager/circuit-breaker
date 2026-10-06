import hashlib
import json
import re
import time
from collections import deque
from typing import Dict, List, Mapping, Optional, Tuple


class LoopDetector:
    def __init__(self, window_size: int = 5, repetition_threshold: int = 3, session_ttl_seconds: int = 3600):
        self.window_size = window_size
        self.repetition_threshold = repetition_threshold
        self.session_ttl_seconds = session_ttl_seconds
        
        # Maps session_id -> deque of (hash, timestamp)
        self._history: Dict[str, deque[Tuple[str, float]]] = {}

    def _normalize_and_hash(self, messages: List[dict]) -> str:
        """
        Hashes the stable parts of the latest message, ignoring framework metadata
        that changes between retries.
        """
        if not messages:
            return ""

        latest_message = messages[-1]

        tool_calls = latest_message.get("tool_calls")
        if tool_calls:
            canonical_calls = []
            for tool_call in tool_calls:
                function = tool_call.get("function", {})
                name = str(function.get("name", ""))
                arguments = function.get("arguments", "")
                if isinstance(arguments, str):
                    try:
                        arguments = json.loads(arguments)
                    except json.JSONDecodeError:
                        pass
                if isinstance(arguments, (dict, list)):
                    arguments = json.dumps(arguments, sort_keys=True, separators=(",", ":"))
                canonical_calls.append((name, str(arguments)))

            canonical_calls.sort(key=lambda call: call[0])
            payload = "tool_calls:[" + ",".join(
                f"{name}:{arguments}" for name, arguments in canonical_calls
            ) + "]"
        else:
            role = str(latest_message.get("role", "")).strip().lower()
            content = latest_message.get("content", "")
            if not isinstance(content, str):
                content = json.dumps(content, sort_keys=True, separators=(",", ":"))

            if role != "tool":
                content = re.sub(
                    r"^(step|turn|iteration)\s*\d+[:\-]?\s*",
                    "",
                    content,
                    flags=re.IGNORECASE,
                )
                content = re.sub(
                    r"\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?",
                    "",
                    content,
                )

            normalized_content = re.sub(r"\s+", " ", content).strip().lower()
            payload = f"{role}:{normalized_content}"

        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    def _clean_expired_entries(self, session_id: str, current_time: float) -> None:
        """Removes entries older than session_ttl_seconds."""
        if session_id not in self._history:
            return
            
        queue = self._history[session_id]
        while queue and (current_time - queue[0][1]) > self.session_ttl_seconds:
            queue.popleft()
            
        if not queue:
            del self._history[session_id]

    def check_and_record(self, session_id: str, messages: List[dict]) -> Tuple[bool, Optional[str]]:
        """
        Records the request hash and checks whether an infinite loop pattern is active.
        Returns: (is_loop: bool, reason: Optional[str])
        """
        now = time.time()
        self._clean_expired_entries(session_id, now)

        prompt_hash = self._normalize_and_hash(messages)
        if not prompt_hash:
            return False, None

        if session_id not in self._history:
            self._history[session_id] = deque(maxlen=self.window_size)

        queue = self._history[session_id]

        # 1. Exact Repetition Check: Has this prompt appeared threshold times in the window?
        recent_hashes = [h for h, _ in queue]
        match_count = recent_hashes.count(prompt_hash)
        
        if match_count + 1 >= self.repetition_threshold:
            return True, f"Identical prompt repeated {match_count + 1} times in window of {self.window_size}."

        # 2. Ping-Pong Cycle Check: Agent bouncing back and forth [A, B, A, B]
        if len(recent_hashes) >= 3:
            # Pattern: [..., A, B, A] and incoming is B
            if recent_hashes[-3] == recent_hashes[-1] and recent_hashes[-2] == prompt_hash:
                return True, "Ping-pong oscillation loop detected (A -> B -> A -> B)."

        # Record this valid step
        queue.append((prompt_hash, now))
        return False, None

    def reset_session(self, session_id: str) -> None:
        """Manually clear a session after resolution."""
        self._history.pop(session_id, None)


# Global singleton instance for the proxy engine
loop_detector = LoopDetector()


if __name__ == "__main__":
    # Self-test when executed directly
    detector = LoopDetector(window_size=5, repetition_threshold=3)
    test_session = "agent_session_101"

    # Simulate an agent repeating the same error message 3 times
    step1 = [{"role": "user", "content": "Fetch database records"}]
    step2 = [{"role": "user", "content": "Fetch database records"}]
    step3 = [{"role": "user", "content": "Fetch database records"}]

    is_loop, _ = detector.check_and_record(test_session, step1)
    assert not is_loop, "Step 1 should pass."

    is_loop, _ = detector.check_and_record(test_session, step2)
    assert not is_loop, "Step 2 should pass."

    is_loop, reason = detector.check_and_record(test_session, step3)
    assert is_loop, "Step 3 must trigger the breaker."

    tool_call_with_id_a = [{
        "role": "assistant",
        "tool_calls": [{
            "id": "call_abc123",
            "type": "function",
            "function": {
                "name": "query_database",
                "arguments": '{"table":"users","limit":10}',
            },
        }],
    }]
    tool_call_with_id_b = [{
        "role": "assistant",
        "tool_calls": [{
            "id": "call_xyz789",
            "type": "function",
            "function": {
                "name": "query_database",
                "arguments": '{"limit":10,"table":"users"}',
            },
        }],
    }]
    assert (
        detector._normalize_and_hash(tool_call_with_id_a)
        == detector._normalize_and_hash(tool_call_with_id_b)
    ), "Tool-call IDs and JSON key order must not change the hash."

    tool_detector = LoopDetector(window_size=5, repetition_threshold=3)
    assert not tool_detector.check_and_record("tool_session", tool_call_with_id_a)[0]
    assert not tool_detector.check_and_record("tool_session", tool_call_with_id_b)[0]
    tool_call_with_id_c = [{
        "role": "assistant",
        "tool_calls": [{
            "id": "call_new_id",
            "type": "function",
            "function": {
                "name": "query_database",
                "arguments": '{"table": "users", "limit": 10}',
            },
        }],
    }]
    is_tool_loop, _ = tool_detector.check_and_record("tool_session", tool_call_with_id_c)
    assert is_tool_loop, "Equivalent tool calls with changing IDs must trip the loop detector."

    dynamic_prefix_a = [{
        "role": "assistant",
        "content": "Step 3: 2026-10-06T14:18:29.335Z Retry the same request",
    }]
    dynamic_prefix_b = [{
        "role": "assistant",
        "content": "Turn 4: 2026-10-06 14:18:29.335 Retry the same request",
    }]
    assert (
        detector._normalize_and_hash(dynamic_prefix_a)
        == detector._normalize_and_hash(dynamic_prefix_b)
    ), "Step counters and ISO timestamps must not change the hash."

    print("ALL TESTS PASSED:")
    print(f"Breaker tripped successfully: {reason}")
    print("Tool-call IDs, JSON key order, step counters, and timestamps normalize consistently.")