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
        with urllib.request.urlopen(req, timeout=12) as response:
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
print("     REBEL WING COUNCIL - COMPREHENSIVE END-TO-END SMOKE TEST         ")
print("======================================================================")

tests = [
    # 1. Backend Core & Health
    ("Backend Health & Database Check", "http://localhost:5000/api/health", "GET", None),
    ("Firm Summary Metrics", "http://localhost:5000/api/stats", "GET", None),
    ("Practice Areas Catalog", "http://localhost:5000/api/practice-areas", "GET", None),

    # 2. User Submissions Ingestion Pipeline (The user's core requirement)
    ("User Consultation Booking (Client Request)", "http://localhost:5000/api/consultations", "POST", {
        "name": "Acme Ventures Director",
        "email": "director@acmeventures.com",
        "phone": "+91 98111 22233",
        "practice_area": "Corporate Law",
        "date": "2026-10-20",
        "time_slot": "02:00 PM - 03:00 PM",
        "mode": "Online Video Call",
        "notes": "End-to-end smoke test: High Court corporate restructuring advisory"
    }),
    ("Admin Fetch All Consultations", "http://localhost:5000/api/consultations", "GET", None),

    ("User Job Application (ATS Legal Executive)", "http://localhost:5000/api/applications", "POST", {
        "name": "Adv. Siddharth Kapoor",
        "email": "siddharth.adv@gmail.com",
        "phone": "+91 98222 33344",
        "type": "job",
        "role": "Full-Time Legal Executive",
        "qualification": "D/4567/2021 (Bar Council of Delhi)",
        "experience": "4 Years Commercial Disputes",
        "resume_notes": "End-to-end smoke test: Executive applicant submission"
    }),
    ("Admin Fetch Job Applications (type=job)", "http://localhost:5000/api/applications?type=job", "GET", None),

    ("User Internship Application (ATS)", "http://localhost:5000/api/applications", "POST", {
        "name": "Ananya Sharma",
        "email": "ananya.sharma@nludelhi.ac.in",
        "phone": "+91 98333 44455",
        "type": "internship",
        "role": "Legal Internship Candidate",
        "qualification": "NLU Delhi - 4th Year B.A. LL.B",
        "experience": "Moot Court Winner & Law Review Editor",
        "resume_notes": "End-to-end smoke test: Internship application"
    }),
    ("Admin Fetch Internship Applications (type=internship)", "http://localhost:5000/api/applications?type=internship", "GET", None),

    ("User Contact Inquiry (CRM Ingestion)", "http://localhost:5000/api/leads", "POST", {
        "name": "Vikram Trading Corp",
        "email": "legal@vikramtrading.com",
        "phone": "+91 98444 55566",
        "service": "Trademark Infringement Notice",
        "message": "End-to-end smoke test: Received cease and desist notice",
        "source": "Website Contact Form"
    }),
    ("Admin Fetch All CRM Leads", "http://localhost:5000/api/leads", "GET", None),
    ("Submissions Summary Counter API", "http://localhost:5000/api/submissions/summary", "GET", None),

    # 3. Practice Management & Legal Operations
    ("Matters Registry", "http://localhost:5000/api/matters", "GET", None),
    ("Create Legal Matter API", "http://localhost:5000/api/matters", "POST", {
        "title": "Smoke Test Cross-Border Arbitration",
        "category": "Commercial Law",
        "priority": "High"
    }),
    ("Upcoming Deadlines & Statutory Alerts", "http://localhost:5000/api/deadlines", "GET", None),
    ("Document Checklist Requests", "http://localhost:5000/api/document-requests", "GET", None),
    ("Knowledge Base & Landmark Precedents", "http://localhost:5000/api/knowledge-base", "GET", None),
    ("Legal Research Tasks", "http://localhost:5000/api/research-tasks", "GET", None),
    ("AI Legal Assistant Statutory Triage", "http://localhost:5000/api/ai/legal-triage", "POST", {
        "query": "What are the compliance mandates under the Digital Personal Data Protection Act for corporate enterprises?"
    }),
    ("Admin RBAC Login API", "http://localhost:5000/api/auth/login", "POST", {
        "email": "admin@rebelwingcouncil.com",
        "password": "Admin@RebelWing2026"
    }),

    # 4. Frontend Websites
    ("User App: Landing Page (Port 3000)", "http://localhost:3000", "GET", None),
    ("User App: Client Self-Service Portal (Port 3000)", "http://localhost:3000/portal", "GET", None),
    ("Admin App: Operating System Dashboard (Port 3001)", "http://localhost:3001", "GET", None),
]

passed = 0
failed = 0

for name, url, method, data in tests:
    res = test_endpoint(name, url, method, data)
    status_str = f"HTTP {res['status']}" if res['status'] else "FAILED"
    timing = f"{res.get('duration_ms', 0)}ms"
    if res['ok']:
        passed += 1
        print(f"  [PASS] {name:<50} -> {status_str} ({timing})")
        if "data" in res and isinstance(res["data"], dict):
            if "total_consultations" in res["data"]:
                print(f"         > Submissions: {res['data'].get('total_consultations')} Consultations | {res['data'].get('job_applications')} Jobs | {res['data'].get('internship_applications')} Internships")
            elif "consultations" in res["data"]:
                print(f"         > Active Bookings Count: {len(res['data']['consultations'])}")
            elif "applications" in res["data"]:
                print(f"         > Applications Count: {len(res['data']['applications'])}")
            elif "ai_analysis" in res["data"]:
                print(f"         > AI Triage Category: {res['data']['ai_analysis'].get('category')} | Advocate: {res['data']['ai_analysis'].get('suggested_advocate')}")
    else:
        failed += 1
        print(f"  [FAIL] {name:<50} -> {status_str} Error: {res.get('error', '')[:80]}")

print("======================================================================")
print(f"RESULTS: {passed} PASSED | {failed} FAILED | TOTAL: {len(tests)}")
print("======================================================================")

if failed > 0:
    sys.exit(1)
sys.exit(0)
