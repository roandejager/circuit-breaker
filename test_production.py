import httpx
import time

LIVE_API_URL = "https://circuit-breaker-api.onrender.com"
TEST_PROXY_KEY = "cb_live_5c98365d4fb1b8fdac86e637d1c5ab03e2b984e939c78168"

def run_production_tests():
    print("==================================================")
    print("🚀 RUNNING LIVE PRODUCTION AUDIT & STRESS TESTS")
    print(f"Target: {LIVE_API_URL}")
    print("==================================================\n")

    with httpx.Client(timeout=15.0) as client:
        # TEST 1: Health & Latency Check
        print("[TEST 1/4] Checking Live Health & Latency...")
        t0 = time.time()
        res = client.get(f"{LIVE_API_URL}/health")
        latency_ms = (time.time() - t0) * 1000
        assert res.status_code == 200, f"Health check failed: {res.status_code}"
        print(f"✅ PASSED: API is warm and responding in {latency_ms:.1f}ms\n")

        # TEST 2: Security Patch - Attack Key Creation Without Token
        print("[TEST 2/4] Testing Security: Attempting key creation with NO Auth...")
        res = client.post(f"{LIVE_API_URL}/v1/keys/create", json={"upstream_key": "sk-proj-attack"})
        assert res.status_code == 401, f"Security failure! Expected 401, got {res.status_code}"
        print("✅ PASSED: Request rejected with HTTP 401 Unauthorized (Security patch active)\n")

        # TEST 3: Security Patch - Attack Key Creation With Fake Token
        print("[TEST 3/4] Testing Security: Attempting key creation with FAKE Bearer token...")
        fake_headers = {"Authorization": "Bearer fake_forged_jwt_token_12345"}
        res = client.post(f"{LIVE_API_URL}/v1/keys/create", json={"upstream_key": "sk-proj-attack"}, headers=fake_headers)
        assert res.status_code == 401, f"Security failure! Expected 401, got {res.status_code}"
        print("✅ PASSED: Forged JWT token rejected with HTTP 401 Unauthorized\n")

        # TEST 4: Graceful Loop Interception over HTTPS
        print("[TEST 4/4] Testing Graceful Loop Interception over HTTPS...")
        headers = {
            "Authorization": f"Bearer {TEST_PROXY_KEY}",
            "x-session-id": "live_prod_graceful_test_88",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": "Database lock detected. Retrying connection."}],
            "stream": False
        }

        for attempt in range(1, 4):
            t0 = time.time()
            res = client.post(f"{LIVE_API_URL}/v1/chat/completions", json=payload, headers=headers)
            elapsed_ms = (time.time() - t0) * 1000

            if attempt < 3:
                print(f"   -> Request #{attempt}: Status {res.status_code} ({elapsed_ms:.1f}ms)")
            else:
                print(f"   -> Request #{attempt}: Status {res.status_code} ({elapsed_ms:.1f}ms) - Breaker Check")
                # Our upgraded proxy returns a graceful 200 completion with finish_reason: "stop"
                assert res.status_code == 200, f"Expected 200 graceful exit, got {res.status_code}"
                body = res.json()
                choice = body.get("choices", [{}])[0]
                assert choice.get("finish_reason") == "stop", "Expected finish_reason to be stop"
                content = choice.get("message", {}).get("content", "")
                assert "CIRCUIT BREAKER" in content, "Missing breaker alert message in completion"
                print("✅ PASSED: Graceful loop termination verified!")
                print(f"   Response message: {content[:80]}...\n")
            time.sleep(0.3)

    print("==================================================")
    print("🎉 ALL 4 PRODUCTION TESTS PASSED WITH ZERO ERRORS")
    print("==================================================")

if __name__ == "__main__":
    run_production_tests()