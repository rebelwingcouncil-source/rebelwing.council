import urllib.request
import json
import sys
import time

def test_endpoint(name, url, method="GET", data=None):
    try:
        req = urllib.request.Request(url, method=method)
        if data:
            req.data = json.dumps(data).encode('utf-8')
            req.add_header('Content-Type', 'application/json')
        start = time.time()
        with urllib.request.urlopen(req, timeout=10) as response:
            duration = int((time.time() - start) * 1000)
            status = response.status
            body = response.read().decode('utf-8')
            parsed = None
            try:
                parsed = json.loads(body)
            except Exception:
                pass
            return {"name": name, "url": url, "status": status, "duration_ms": duration, "ok": True, "data": parsed, "raw": body[:200]}
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        return {"name": name, "url": url, "status": e.code, "ok": False, "error": body}
    except Exception as e:
        return {"name": name, "url": url, "status": None, "ok": False, "error": str(e)}

print("======================================================================")
print("     REBEL WING COUNCIL - END-TO-END SMOKE TEST SUITE                ")
print("======================================================================")

tests = [
    # 1. Backend REST API
    ("Backend Health Check", "http://localhost:5000/api/health", "GET", None),
    ("Firm Statistics", "http://localhost:5000/api/stats", "GET", None),
    ("Practice Areas Catalog", "http://localhost:5000/api/practice-areas", "GET", None),
    ("Matters Registry", "http://localhost:5000/api/matters", "GET", None),
    ("Single Matter Detail (RWC-2026-0001)", "http://localhost:5000/api/matters/RWC-2026-0001", "GET", None),
    ("Upcoming Deadlines & Statutory Alerts", "http://localhost:5000/api/deadlines", "GET", None),
    ("Document Checklist Requests", "http://localhost:5000/api/document-requests", "GET", None),
    ("Legal Precedents & Knowledge Base", "http://localhost:5000/api/knowledge-base", "GET", None),
    ("Legal Research Tasks", "http://localhost:5000/api/research-tasks", "GET", None),
    ("AI Legal Triage Endpoint", "http://localhost:5000/api/ai/legal-triage", "POST", {
        "query": "We have an ongoing NCLT Section 7 corporate insolvency dispute involving 18 crore debt default. What are the key precedents and timelines?",
        "practice_area": "Corporate Insolvency & Bankruptcy"
    }),
    ("Consultation Booking API", "http://localhost:5000/api/consultations", "POST", {
        "client_name": "Smoke Test Corporate Client",
        "client_email": "smoketest@acmeholdings.com",
        "client_phone": "+91 98765 43210",
        "practice_area": "Corporate Restructuring",
        "preferred_date": "2026-10-15",
        "preferred_time": "14:00",
        "notes": "Automated smoke test verification for consultation booking"
    }),
    ("Create Legal Matter API", "http://localhost:5000/api/matters", "POST", {
        "title": "Smoke Test Trademark Defense Action",
        "category": "Intellectual Property Rights",
        "priority": "High"
    }),
    ("Assign Legal Research Task API", "http://localhost:5000/api/research-tasks", "POST", {
        "research_question": "Test Question: Injunction standards under Commercial Courts Act 2015",
        "relevant_legislation": "Commercial Courts Act, 2015",
        "jurisdiction": "High Court of Bombay"
    }),
    ("Intern Daily Log Submission API", "http://localhost:5000/api/intern/daily-updates", "POST", {
        "hours_logged": 8.0,
        "tasks_completed": "Smoke test automated work log: verified Indian Kanoon and Supreme Court precedents."
    }),
    ("Career ATS Application API", "http://localhost:5000/api/careers", "POST", {
        "name": "Test Candidate Advocate",
        "email": "candidate@lawtest.com",
        "phone": "+91 99887 76655",
        "role": "Senior Legal Associate",
        "experience": "5 Years PQE Commercial Litigation",
        "resume_notes": "Submitted via automated test suite"
    }),

    # 2. Frontend Applications
    ("User App: Landing Page (Port 3000)", "http://localhost:3000", "GET", None),
    ("User App: Client Self-Service Portal (Port 3000)", "http://localhost:3000/portal", "GET", None),
    ("Admin App: Operating System (Port 3001)", "http://localhost:3001", "GET", None),
]

passed = 0
failed = 0

for name, url, method, data in tests:
    res = test_endpoint(name, url, method, data)
    status_str = f"HTTP {res['status']}" if res['status'] else "FAILED"
    timing = f"{res.get('duration_ms', 0)}ms"
    if res['ok']:
        passed += 1
        print(f"  [PASS] {name:<45} -> {status_str} ({timing})")
        if "data" in res and isinstance(res["data"], dict) and "ai_analysis" in res["data"]:
            category = res['data']['ai_analysis'].get('category', 'Legal Advisory')
            advocate = res['data']['ai_analysis'].get('suggested_advocate', 'Partner')
            print(f"         > AI Triage: {category} | Suggested Counsel: {advocate}")
        elif "data" in res and isinstance(res["data"], dict) and "firm_name" in res["data"]:
            print(f"         > DB Status: {res['data']['database']['status']} | Active Matters: {res['data']['stats']['active_matters']}")
    else:
        failed += 1
        print(f"  [FAIL] {name:<45} -> {status_str} Error: {res.get('error')[:80]}")

print("======================================================================")
print(f"RESULTS: {passed} PASSED | {failed} FAILED | TOTAL: {len(tests)}")
print("======================================================================")

if failed > 0:
    sys.exit(1)
sys.exit(0)
