import uuid
from app.services.db import db_service

def provision_test_account():
    print("Creating test user in Supabase Auth...")
    test_email = f"developer_{uuid.uuid4().hex[:6]}@circuitbreaker.internal"
    test_password = "Password123!Secure"

    # 1. Create User in Supabase Auth (Triggers automatic profile creation)
    user_response = db_service.supabase.auth.admin.create_user({
        "email": test_email,
        "password": test_password,
        "email_confirm": True
    })

    user_id = user_response.user.id
    print(f"-> User created: {test_email} (ID: {user_id})")

    # 2. Generate a Circuit Breaker Proxy Key
    # We encrypt a mock OpenAI key (or pass your real one if you want live OpenAI tests)
    mock_upstream_key = "sk-proj-mock-openai-key-for-testing-12345"
    raw_proxy_key = db_service.generate_proxy_key(user_id=user_id, raw_upstream_key=mock_upstream_key)

    print("\n" + "="*60)
    print("SUCCESS: Your Circuit Breaker Key has been generated!")
    print(f"Key: {raw_proxy_key}")
    print("="*60 + "\n")

    return raw_proxy_key

if __name__ == "__main__":
    provision_test_account()