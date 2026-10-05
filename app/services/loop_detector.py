import hashlib
import json
import time
from collections import deque
from typing import Dict, List, Optional, Tuple


class LoopDetector:
    def __init__(self, window_size: int = 5, repetition_threshold: int = 3, session_ttl_seconds: int = 3600):
        self.window_size = window_size
        self.repetition_threshold = repetition_threshold
        self.session_ttl_seconds = session_ttl_seconds
        
        # Maps session_id -> deque of (hash, timestamp)
        self._history: Dict[str, deque[Tuple[str, float]]] = {}

    def _normalize_and_hash(self, messages: List[dict]) -> str:
        """
        Creates a deterministic hash of the last message and tool results
        to detect recursive agent behavior.
        """
        if not messages:
            return ""

        # Focus on the most recent conversation state
        latest_message = messages[-1]
        
        # Canonical representation of the latest payload
        content = latest_message.get("content", "")
        role = latest_message.get("role", "")
        tool_calls = latest_message.get("tool_calls", "")
        
        payload = f"{role}:{content}:{tool_calls}".strip().lower()
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

    print("ALL TESTS PASSED:")
    print(f"Breaker tripped successfully: {reason}")