import os
import sys
import psycopg2
import urllib.request

# Ensure UTF-8 output on Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def check_supabase():
    print("=" * 60)
    print("REBEL WING COUNCIL - SUPABASE & DATABASE HEALTH CHECK")
    print("=" * 60)
    
    # 1. Test PostgreSQL Connection
    print("\n[1/2] Connecting to PostgreSQL (Supabase Pooler)...")
    try:
        conn = psycopg2.connect(
            host=os.environ.get("DB_HOST", "aws-0-ap-northeast-1.pooler.supabase.com"),
            port=int(os.environ.get("DB_PORT", "5432")),
            dbname=os.environ.get("DB_NAME", "postgres"),
            user=os.environ.get("DB_USER", "postgres.tauzepmapcywrzoqgeyp"),
            password=os.environ.get("DB_PASSWORD"),
            connect_timeout=10
        )
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()[0]
        print("  [OK] Connected to PostgreSQL Database!")
        print(f"  [OK] Engine: {version[:45]}")
        
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = [r[0] for r in cur.fetchall()]
        print(f"  [OK] Active Tables in 'public' schema: {tables if tables else 'None (Clean Database ready)'}")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"  [FAIL] PostgreSQL Connection Failed: {e}")
        return False

    # 2. Test Supabase REST API with Secret Key
    print("\n[2/2] Connecting to Supabase Management REST API...")
    try:
        secret_key = os.environ.get("SUPABASE_SECRET_KEY", "placeholder_key")
        url = "https://tauzepmapcywrzoqgeyp.supabase.co/rest/v1/"
        req = urllib.request.Request(url, headers={
            "apikey": secret_key,
            "Authorization": f"Bearer {secret_key}"
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                print("  [OK] Supabase REST API authenticated (HTTP 200 OK)")
            else:
                print(f"  [WARN] Status: {resp.status}")
    except Exception as e:
        print(f"  [FAIL] Supabase REST API Failed: {e}")
        return False

    print("\n" + "=" * 60)
    print("ALL SUPABASE SERVICES OPERATIONAL & CONNECTED!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = check_supabase()
    sys.exit(0 if success else 1)
