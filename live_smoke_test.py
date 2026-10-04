import urllib.request
import json
import sys
import time

LIVE_URL = "https://backend-three-theta-89.vercel.app"

def test_endpoint(name, path, method="GET", data=None):
    url = f"{LIVE_URL}{path}"
    try:
        req = urllib.request.Request(url, method=method)
        req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
        if data:
            req.data = json.dumps(data).encode('utf-8')
            req.add_header('Content-Type', 'application/json')
        start = time.time()
        with urllib.request.urlopen(req, timeout=30) as response:
            duration = int((time.time() - start) * 1000)
            status = response.status
            body = response.read().decode('utf-8')
            parsed = None
            try:
                parsed = json.loads(body)
            except Exception:
                pass
            return {"name": name, "url": url, "status": status, "duration_ms": duration, "ok": True, "data": parsed}
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        return {"name": name, "url": url, "status": e.code, "ok": False, "error": body}
    except Exception as e:
        return {"name": name, "url": url, "status": None, "ok": False, "error": str(e)}

print("======================================================================")
print("     REBEL WING COUNCIL - LIVE PRODUCTION SMOKE TEST                  ")
print(f"     Target URL: {LIVE_URL}")
print("======================================================================")

tests = [
    ("Live Health & Supabase DB", "/api/health", "GET", None),
    ("Live Firm Statistics", "/api/stats", "GET", None),
    ("Live Practice Areas", "/api/practice-areas", "GET", None),
    
    # Live End-to-End Data Ingestion Verification
    ("Live Client Consultation Booking", "/api/consultations", "POST", {
        "name": "Live Client Test Director",
        "email": "director.live@acmeglobal.in",
        "phone": "+91 98111 99887",
        "practice_area": "Corporate Law",
        "date": "2026-10-30",
        "time_slot": "03:00 PM - 04:00 PM",
        "mode": "Online Video Call",
        "notes": "Live production verification: Cross-border corporate compliance"
    }),
    ("Live Admin Fetch Consultations", "/api/consultations", "GET", None),

    ("Live Job Application (ATS)", "/api/applications", "POST", {
        "name": "Adv. Meera Sen",
        "email": "meera.sen@livelegal.org",
        "phone": "+91 98222 11223",
        "type": "job",
        "role": "Senior Legal Executive",
        "qualification": "D/7890/2020 (Bar Council of Delhi)",
        "experience": "6 Years Commercial Litigation",
        "resume_notes": "Live production verification: Full-time advocate applicant"
    }),
    ("Live Admin Fetch Job Applications", "/api/applications?type=job", "GET", None),

    ("Live Internship Application (ATS)", "/api/applications", "POST", {
        "name": "Rohan Deshmukh",
        "email": "rohan.d@nlublr.edu",
        "phone": "+91 98333 77889",
        "type": "internship",
        "role": "Legal Internship Program",
        "qualification": "NLSIU Bengaluru - 5th Year B.A. LL.B",
        "experience": "Commercial Arbitration Research Scholar",
        "resume_notes": "Live production verification: Internship candidate"
    }),
    ("Live Admin Fetch Internship Applications", "/api/applications?type=internship", "GET", None),

    ("Live Contact Inquiry", "/api/leads", "POST", {
        "name": "Apex Pharma Logistics",
        "email": "compliance@apexpharma.com",
        "phone": "+91 98444 33221",
        "service": "EPR Environmental Compliance",
        "message": "Live production verification: CPCB regulatory compliance advisory",
        "source": "Website Contact Page"
    }),
    ("Live Admin Fetch Leads", "/api/leads", "GET", None),
    ("Live Submissions Summary", "/api/submissions/summary", "GET", None),
    ("Live Matters Registry", "/api/matters", "GET", None),
    ("Live Deadlines Calendar", "/api/deadlines", "GET", None),
    ("Live Knowledge Base Precedents", "/api/knowledge-base", "GET", None),
    ("Live AI Legal Assistant Triage", "/api/ai/legal-triage", "POST", {
        "query": "What are the compliance procedures for trademark registration in India?"
    }),
]

passed = 0
failed = 0

for name, path, method, data in tests:
    res = test_endpoint(name, path, method, data)
    status_str = f"HTTP {res['status']}" if res['status'] else "FAILED"
    timing = f"{res.get('duration_ms', 0)}ms"
    if res['ok']:
        passed += 1
        print(f"  [PASS] {name:<45} -> {status_str} ({timing})")
        if "data" in res and isinstance(res["data"], dict):
            if "total_consultations" in res["data"]:
                print(f"         > Total: {res['data'].get('total_consultations')} Consultations | {res['data'].get('job_applications')} Jobs | {res['data'].get('internship_applications')} Internships")
            elif "consultations" in res["data"]:
                print(f"         > Live Consultations In DB: {len(res['data']['consultations'])}")
            elif "applications" in res["data"]:
                print(f"         > Live Applications In DB: {len(res['data']['applications'])}")
            elif "ai_analysis" in res["data"]:
                print(f"         > AI Guidance: {res['data']['ai_analysis'].get('category')} | {res['data']['ai_analysis'].get('suggested_advocate')}")
    else:
        failed += 1
        print(f"  [FAIL] {name:<45} -> {status_str} Error: {res.get('error', '')[:80]}")

print("======================================================================")
print(f"LIVE RESULTS: {passed} PASSED | {failed} FAILED | TOTAL: {len(tests)}")
print("======================================================================")

if failed > 0:
    sys.exit(1)
sys.exit(0)
