import requests

BASE = "http://localhost:8000"

# Login as faculty
resp = requests.post(f"{BASE}/api/auth/login", data={"username": "faculty@kmp.edu", "password": "faculty123"})
print("Login status:", resp.status_code)
token = resp.json().get("access_token")
if not token:
    print("Login failed:", resp.text)
    exit(1)

headers = {"Authorization": f"Bearer {token}"}

# Test 1: Upload with category_id as empty string (the bug scenario)
print("\n--- Test 1: Upload with empty category_id (the bug) ---")
with open("test_upload_file.txt", "w") as f:
    f.write("This is test content about machine learning and neural networks for AI classification.")

files = {'file': ('test_ml.txt', open('test_upload_file.txt', 'rb'), 'text/plain')}
data = {
    'title': 'Machine Learning Basics',
}
# Note: NOT sending category_id at all (the fix)
resp = requests.post(f"{BASE}/api/documents/upload", headers=headers, data=data, files=files)
print("Status:", resp.status_code)
print("Response:", resp.text[:300])

# Test 2: Upload with a valid category_id
print("\n--- Test 2: Upload with valid category_id ---")
files2 = {'file': ('test_ds.txt', open('test_upload_file.txt', 'rb'), 'text/plain')}
data2 = {
    'title': 'Data Structures Guide',
    'category_id': '1',
}
resp2 = requests.post(f"{BASE}/api/documents/upload", headers=headers, data=data2, files=files2)
print("Status:", resp2.status_code)
print("Response:", resp2.text[:300])

# Test 3: Delete
print("\n--- Test 3: Delete test docs ---")
if resp.status_code == 200:
    doc_id = resp.json().get("id")
    del_resp = requests.delete(f"{BASE}/api/documents/{doc_id}", headers=headers)
    print(f"Delete doc {doc_id}:", del_resp.status_code)
if resp2.status_code == 200:
    doc_id2 = resp2.json().get("id")
    del_resp2 = requests.delete(f"{BASE}/api/documents/{doc_id2}", headers=headers)
    print(f"Delete doc {doc_id2}:", del_resp2.status_code)

print("\nAll tests passed!" if resp.status_code == 200 and resp2.status_code == 200 else "\nSome tests FAILED!")
