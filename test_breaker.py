import httpx
import time

PROXY_URL = "http://127.0.0.1:8000/v1/chat/completions"
# Using your generated live Circuit Breaker key
HEADERS = {
    "Authorization": "Bearer cb_live_d3c36ca4fa23c2e65c68c1130ec8866f1065f390aed70e94",
    "x-session-id": "agent_session_runaway_prod_1",
    "Content-Type": "application/json"
}

payload = {
    "model": "gpt-4o-mini",
    "messages": [
        {"role": "user", "content": "Database timeout error: connection refused. Retrying query."}
    ],
    "stream": False
}

print("--- TESTING LIVE DATABASE PROXY ---")
print("Sending 3 identical requests to trigger loop interception...\n")

with httpx.Client(timeout=10.0) as client:
    for attempt in range(1, 4):
        print(f"-> Sending Request #{attempt}...")
        try:
            response = client.post(PROXY_URL, json=payload, headers=HEADERS)
            print(f"   Status Code: {response.status_code}")
            print(f"   Response Body: {response.json()}\n")
        except Exception as e:
            print(f"   Connection failed: {e}\n")
        time.sleep(0.5)

print("--- TEST COMPLETE ---")