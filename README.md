# ExpenseFlow – Personal Expense Tracker (Google Cloud Ready)

A modern, responsive, full-featured **Expense Management Web Application** built with clean TypeScript, React, Tailwind CSS, Lucide icons, and Chart.js analytics, pre-configured with complete production setups for **Google Cloud Platform (Cloud Run, App Engine, Cloud Storage, and Firebase Hosting)**.

---

## 🌟 Google Cloud Hosting (Quick Start)

This project has been updated with full production-ready Google Cloud deployment configuration:
- `Dockerfile`: Multi-stage build with optimized Alpine Nginx server and dynamic Cloud Run `$PORT` support.
- `nginx.conf`: Production reverse proxy with gzip compression, security headers, and Single Page Application (SPA) fallback routing.
- `cloudbuild.yaml`: Automated Cloud Build CI/CD trigger config using Artifact Registry.
- `app.yaml`: Google App Engine standard environment configuration.
- `firebase.json`: Google Firebase Hosting with global edge CDN caching.
- `.gcloudignore` & `.dockerignore`: Prevents bloating image build contexts.

---

## 🚀 Step-by-Step Guide to Host on Google Cloud

### Method 1: Google Cloud Run (Recommended ⭐)

Google Cloud Run is Google's modern, serverless container platform. It automatically scales from 0 instances, provides automatic HTTPS/SSL, and costs nothing when there is no traffic.

#### Prerequisites
1. Install the [Google Cloud CLI (gcloud)](https://cloud.google.com/sdk/docs/install).
2. Have a Google Cloud account with an active project.

#### Steps:
```bash
# 1. Log in to your Google Cloud account
gcloud auth login

# 2. Set your Google Cloud Project ID
gcloud config set project YOUR_PROJECT_ID

# 3. Enable necessary Google Cloud APIs
gcloud services enable run.googleapis.com \
                       cloudbuild.googleapis.com \
                       artifactregistry.googleapis.com

# 4. Deploy directly from source (Buildpacks or Dockerfile automatically detected)
gcloud run deploy expenseflow-web \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
```
Once completed, Google Cloud will output a live HTTPS URL such as:
`https://expenseflow-web-xyzcompany-uc.a.run.app`

---

### Method 2: Google App Engine (Standard)

If you prefer classic Google Cloud Platform PaaS hosting:

```bash
# 1. Build the production bundle
npm run build

# 2. Deploy to App Engine
gcloud app deploy app.yaml --project=YOUR_PROJECT_ID

# 3. View your live application
gcloud app browse
```

---

### Method 3: Google Cloud Storage + Cloud CDN (Static Bucket)

Ideal for purely static asset distribution with Google Cloud CDN:

```bash
# 1. Build the production distribution
npm run build

# 2. Create a storage bucket
gcloud storage buckets create gs://YOUR_BUCKET_NAME --location=US

# 3. Enable web hosting configuration on the bucket
gcloud storage buckets update gs://YOUR_BUCKET_NAME \
  --web-main-page-suffix=index.html \
  --web-error-page=index.html

# 4. Make bucket objects publicly readable
gcloud storage buckets add-iam-policy-binding gs://YOUR_BUCKET_NAME \
  --member=allUsers \
  --role=roles/storage.objectViewer

# 5. Sync the dist folder
gcloud storage rsync -r dist/ gs://YOUR_BUCKET_NAME
```

---

### Method 4: Firebase Hosting (Google Cloud Ecosystem)

Firebase Hosting uses Google's global CDN edge servers and offers zero-downtime atomic rollbacks:

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Log in and initialize
firebase login
firebase init hosting

# 3. Build & Deploy
npm run build
firebase deploy --only hosting
```

---

## 🔒 Custom Domain & SSL on Google Cloud Run

1. Open **Google Cloud Console** > **Cloud Run** > select `expenseflow-web`.
2. Click **Manage Custom Domains**.
3. Add your custom domain (e.g. `expenses.yourdomain.com`).
4. Update your DNS registrar with the CNAME record provided by Google Cloud.
5. Google Cloud will automatically provision a free Managed SSL certificate within ~15 minutes.
