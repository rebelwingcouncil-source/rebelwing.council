import os
import sys
import psycopg2

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def run_migration():
    migration_file = os.path.join(os.path.dirname(__file__), "migrations", "001_initial_schema.sql")
    print(f"Reading migration file: {migration_file}...")
    with open(migration_file, "r", encoding="utf-8") as f:
        sql = f.read()

    print("Connecting to Supabase PostgreSQL Database...")
    conn = psycopg2.connect(
        host=os.environ.get("DB_HOST", "aws-0-ap-northeast-1.pooler.supabase.com"),
        port=int(os.environ.get("DB_PORT", "5432")),
        dbname=os.environ.get("DB_NAME", "postgres"),
        user=os.environ.get("DB_USER", "postgres.tauzepmapcywrzoqgeyp"),
        password=os.environ.get("DB_PASSWORD"),
        connect_timeout=15
    )
    conn.autocommit = True
    cur = conn.cursor()

    print("Applying migration 001_initial_schema.sql...")
    cur.execute(sql)
    print("[SUCCESS] Schema migration applied successfully!")

    # Verify tables
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
    """)
    tables = [r[0] for r in cur.fetchall()]
    print(f"\n[OK] Current tables in 'public' schema ({len(tables)}):")
    for t in tables:
        cur.execute(f"SELECT COUNT(*) FROM {t};")
        cnt = cur.fetchone()[0]
        print(f"  - {t:22} ({cnt} rows)")

    cur.close()
    conn.close()

if __name__ == "__main__":
    try:
        run_migration()
    except Exception as e:
        print("[ERROR] Migration failed:", e)
        sys.exit(1)
