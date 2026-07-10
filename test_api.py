# -*- coding: utf-8 -*-
"""
KMP API Test Suite
Requires: server running on localhost:8000 AND demo data seeded (python seed_demo.py)
Run: python test_api.py
"""
import urllib.request, urllib.parse, urllib.error, json, sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # type: ignore

BASE = 'http://localhost:8000'
PASS = True

def post_json(path, payload, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(
        f'{BASE}{path}',
        data=json.dumps(payload).encode(),
        headers=headers, method='POST'
    )
    try:
        r = urllib.request.urlopen(req, timeout=30)
        return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())
    except Exception as e:
        return 'ERR', str(e)

def put_json(path, payload, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(
        f'{BASE}{path}',
        data=json.dumps(payload).encode(),
        headers=headers, method='PUT'
    )
    try:
        r = urllib.request.urlopen(req, timeout=15)
        return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())
    except Exception as e:
        return 'ERR', str(e)

def get(path, token=None):
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(f'{BASE}{path}', headers=headers)
    try:
        r = urllib.request.urlopen(req, timeout=30)
        return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()
    except Exception as e:
        return 'ERR', str(e).encode()

def check(label, status, body, expect_status=200):
    global PASS
    ok = (status == expect_status)
    symbol = "[OK]" if ok else "[FAIL]"
    if not ok:
        PASS = False
    body_text = str(body)
    preview = body_text[:80].replace("\n", " ")  # type: ignore
    print(f"  {symbol} {label}: HTTP {status} | {preview}")
    return ok

print()
print("=" * 55)
print("  KMP API Test Suite")
print("  Requires: server on :8000 + demo data seeded")
print("=" * 55)

# ── 1. Pages ──────────────────────────────────────────────
print("\n[1] Page Routes")
check("GET /login",     *get('/login'))
check("GET /dashboard", *get('/dashboard'))

# ── 2. Register new user (unique email) ───────────────────
print("\n[2] Auth - Register")
c, b = post_json('/api/auth/register', {'email': 'newtest@kmp.edu', 'password': 'test123', 'role': 'student'})
check("Register new user", c, b)
# Duplicate should return 400
c2, b2 = post_json('/api/auth/register', {'email': 'newtest@kmp.edu', 'password': 'test123', 'role': 'student'})
check("Duplicate register (expect 400)", c2, b2, expect_status=400)

# ── 3. Login (use seeded admin account) ───────────────────
print("\n[3] Auth - Login")
fd = urllib.parse.urlencode({'username': 'admin@kmp.edu', 'password': 'admin123'}).encode()
req = urllib.request.Request(
    f'{BASE}/api/auth/login', data=fd,
    headers={'Content-Type': 'application/x-www-form-urlencoded'}, method='POST'
)
token = None
try:
    r = urllib.request.urlopen(req, timeout=10)
    data = json.loads(r.read())
    token = data['access_token']
    print(f"  [OK] Login admin@kmp.edu: HTTP 200 | Token: {token[:30]}...")
except urllib.error.HTTPError as e:
    print(f"  [FAIL] Login: HTTP {e.code} | {e.read().decode('utf-8', errors='ignore')[:80]}")  # type: ignore
    PASS = False
except Exception as e:
    print(f"  [FAIL] Login error: {e}")
    PASS = False

# ── 4. Auth endpoints ─────────────────────────────────────
print("\n[4] Auth - Protected Endpoints")
if token:
    check("GET /api/auth/me",      *get('/api/auth/me', token))

# ── 5. Categories ─────────────────────────────────────────
print("\n[5] Categories")
if token:
    check("GET /api/categories/",  *get('/api/categories/', token))

# ── 6. Documents ──────────────────────────────────────────
print("\n[6] Documents")
if token:
    check("GET /api/documents/",        *get('/api/documents/', token))
    check("GET /api/documents/trending", *get('/api/documents/trending', token))
    check("GET /api/documents/pending",  *get('/api/documents/pending', token))

# ── 7. Search ─────────────────────────────────────────────
print("\n[7] Search")
if token:
    check("GET /api/documents/search", *get('/api/documents/search?query=machine+learning', token))

# ── 8. Analytics (admin only) ─────────────────────────────
print("\n[8] Analytics (Admin)")
if token:
    check("GET /api/analytics/overview",      *get('/api/analytics/overview', token))
    check("GET /api/analytics/top-docs",      *get('/api/analytics/top-docs', token))
    check("GET /api/analytics/search-trends", *get('/api/analytics/search-trends', token))
    check("GET /api/analytics/knowledge-gaps",*get('/api/analytics/knowledge-gaps', token))
    check("GET /api/analytics/knowledge-graph",*get('/api/analytics/knowledge-graph', token))

# ── 9. Notifications ──────────────────────────────────────
print("\n[9] Notifications")
if token:
    check("GET /api/notifications/", *get('/api/notifications/', token))
    c, b = post_json('/api/notifications/read', {}, token)
    check("POST /api/notifications/read", c, b)

# ── 10. Profile ───────────────────────────────────────────
print("\n[10] Profile")
if token:
    check("GET /api/profile/", *get('/api/profile/', token))
    c, b = put_json('/api/profile/', {'full_name': 'Test Admin', 'department': 'IT', 'bio': 'Test bio'}, token)
    check("PUT /api/profile/", c, b, expect_status=200)

# ── 11. Chatbot ───────────────────────────────────────────
print("\n[11] Chatbot")
if token:
    c, b = post_json('/api/chatbot/ask', {'query': 'What is the attendance policy?'}, token)
    check("POST /api/chatbot/ask", c, b)

# ── Result ────────────────────────────────────────────────
print()
print("=" * 55)
if PASS:
    print("  ALL TESTS PASSED")
else:
    print("  SOME TESTS FAILED - check above")
print("=" * 55)
print()
