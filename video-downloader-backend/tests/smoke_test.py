import requests


def test_health(base_url="http://127.0.0.1:8000"):
    r = requests.get(f"{base_url}/api/health", timeout=5)
    assert r.status_code == 200
    j = r.json()
    assert j.get("status") == "ok"


if __name__ == "__main__":
    print("Running smoke test against http://127.0.0.1:8000")
    try:
        test_health()
        print("smoke test passed")
    except Exception as e:
        print("smoke test failed:", e)
        raise
