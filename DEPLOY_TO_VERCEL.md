# 🚀 Deploying Rebel Wing Council on Vercel

The Rebel Wing Council repository contains three interconnected microservices that can be deployed to Vercel in 3 simple steps:

```
rebelwing/
├── backend/   -> REST API (Express on Vercel Serverless Functions)
├── admin/     -> Law Firm Operating System (Next.js App Router)
└── user/      -> Public Luxury Website & Client Portal (Next.js App Router)
```

---

## ⚡ Deployment Sequence: Deploy Backend First

Because `user` and `admin` communicate with the `backend` REST API, deploy **Backend** first to obtain its production URL (e.g. `https://rebelwing-api.vercel.app`).

---

### Step 1: Deploy `backend/` (Express REST API)

1. Go to your **[Vercel Dashboard](https://vercel.com/new)** and click **"Add New Project"**.
2. Select your repository: `rebelwingcouncil-source/rebelwing.council`.
3. In **Project Configuration**:
   - **Project Name**: `rebelwing-api` (or your preferred name)
   - **Framework Preset**: Select **"Other"**
   - **Root Directory**: Click *Edit* and select **`backend`**
4. Under **Environment Variables**, add the following Supabase keys:
   | Variable Name | Value |
   | :--- | :--- |
   | `PORT` | `5000` |
   | `DB_HOST` | `aws-0-ap-northeast-1.pooler.supabase.com` |
   | `DB_PORT` | `5432` |
   | `DB_NAME` | `postgres` |
   | `DB_USER` | `postgres.tauzepmapcywrzoqgeyp` |
   | `DB_PASSWORD` | `<your-database-password>` |
   | `SUPABASE_URL` | `https://tauzepmapcywrzoqgeyp.supabase.co` |
   | `SUPABASE_SECRET_KEY` | `<your-supabase-service-role-secret-key>` |
   | `SUPABASE_ANON_KEY` | `<your-supabase-anon-key>` |
5. Click **"Deploy"**.
6. Once deployed, copy your API URL (e.g., `https://rebelwing-api.vercel.app`). Verify by visiting `https://rebelwing-api.vercel.app/api/health`.

---

### Step 2: Deploy `user/` (Public Website & Client Portal)

1. Go to **[Vercel Dashboard](https://vercel.com/new)** and click **"Add New Project"**.
2. Select the same repository: `rebelwingcouncil-source/rebelwing.council`.
3. In **Project Configuration**:
   - **Project Name**: `rebelwing-portal`
   - **Framework Preset**: **Next.js** (auto-detected)
   - **Root Directory**: Click *Edit* and select **`user`**
4. Under **Environment Variables**, add:
   | Variable Name | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://rebelwing-api.vercel.app` *(paste your backend URL from Step 1)* |
5. Click **"Deploy"**.
6. Your public luxury legal website and client self-service portal are live!

---

### Step 3: Deploy `admin/` (Law Firm Operating System)

1. Go to **[Vercel Dashboard](https://vercel.com/new)** and click **"Add New Project"**.
2. Select the same repository: `rebelwingcouncil-source/rebelwing.council`.
3. In **Project Configuration**:
   - **Project Name**: `rebelwing-admin`
   - **Framework Preset**: **Next.js** (auto-detected)
   - **Root Directory**: Click *Edit* and select **`admin`**
4. Under **Environment Variables**, add:
   | Variable Name | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://rebelwing-api.vercel.app` *(paste your backend URL from Step 1)* |
5. Click **"Deploy"**.
6. Your Law Firm Operating System is live with Super Admin, Lawyer, Paralegal, and Intern workspaces!

---

## 🔐 Credentials for Admin Operating System on Vercel:

- **Managing Partner (Super Admin)**: `admin@rebelwingcouncil.com` / `Admin@RebelWing2026`
- **Senior Corporate Partner**: `priya.d@rebelwingcouncil.com` / `Lawyer@RebelWing2026`
- **Head of Litigation**: `vikram.r@rebelwingcouncil.com` / `Lawyer@RebelWing2026`
- **Senior Legal Executive**: `neha.v@rebelwingcouncil.com` / `Paralegal@RebelWing2026`
- **Legal Research Intern**: `arjun.m@rebelwingcouncil.com` / `Intern@RebelWing2026`
