# SKILL: GCP Deployment

## Overview
Production-grade deployment patterns for TypeScript/Next.js applications on **Google Cloud Platform (GCP)** — Cloud Run, Cloud Build, Firebase Hosting, and Artifact Registry.

## Option A: Cloud Run (Best for Node.js APIs + Next.js)
Cloud Run runs Docker containers on fully managed serverless infrastructure — scales to zero, no cluster to manage.

```bash
# Initial project setup
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com

# Create Artifact Registry repository
gcloud artifacts repositories create app-docker \
  --repository-format=docker \
  --location=us-central1 \
  --description="App Docker images"
```

### Cloud Run Deployment (CLI)
```bash
# Build and push image
gcloud builds submit --tag us-central1-docker.pkg.dev/PROJECT_ID/app-docker/api:latest

# Deploy to Cloud Run
gcloud run deploy api-app \
  --image us-central1-docker.pkg.dev/PROJECT_ID/app-docker/api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \           # Scale to zero (cost saving)
  --max-instances 100 \
  --set-secrets DATABASE_URL=DATABASE_URL:latest \
  --set-env-vars NODE_ENV=production
```

### Cloud Build Pipeline (cloudbuild.yaml)
```yaml
# cloudbuild.yaml — triggers on push/tag
steps:
  # Step 1: Install and test
  - name: node:22-alpine
    entrypoint: npm
    args: ['ci']

  - name: node:22-alpine
    entrypoint: npm
    args: ['run', 'test']

  - name: node:22-alpine
    entrypoint: npm
    args: ['run', 'typecheck']

  # Step 2: Build Docker image
  - name: gcr.io/cloud-builders/docker
    args:
      - build
      - -t
      - us-central1-docker.pkg.dev/$PROJECT_ID/app-docker/api:$COMMIT_SHA
      - -t
      - us-central1-docker.pkg.dev/$PROJECT_ID/app-docker/api:latest
      - .

  # Step 3: Push to Artifact Registry
  - name: gcr.io/cloud-builders/docker
    args: ['push', '--all-tags', 'us-central1-docker.pkg.dev/$PROJECT_ID/app-docker/api']

  # Step 4: Deploy to Cloud Run
  - name: gcr.io/google.com/cloudsdktool/cloud-sdk
    entrypoint: gcloud
    args:
      - run
      - deploy
      - api-app
      - --image=us-central1-docker.pkg.dev/$PROJECT_ID/app-docker/api:$COMMIT_SHA
      - --region=us-central1
      - --platform=managed

images:
  - us-central1-docker.pkg.dev/$PROJECT_ID/app-docker/api:$COMMIT_SHA

options:
  logging: CLOUD_LOGGING_ONLY
  machineType: E2_HIGHCPU_8  # Faster builds
```

## Option B: Firebase Hosting (Next.js Static / SSR)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting

# For Next.js with SSR (App Router):
npm install -D @apphosting/adapter-nextjs  # Firebase App Hosting adapter

# OR deploy pre-rendered static export:
# next.config.ts: output: 'export'
npm run build
firebase deploy --only hosting
```

```json
// firebase.json
{
  "hosting": {
    "public": "out",  // Static export directory
    "cleanUrls": true,
    "rewrites": [
      { "source": "**", "destination": "/index.html" }  // SPA mode
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|woff2)",
        "headers": [{ "key": "Cache-Control", "value": "max-age=31536000,immutable" }]
      }
    ]
  }
}
```

## GitHub Actions → GCP Cloud Run (Workload Identity Federation)
```yaml
# .github/workflows/gcp-deploy.yml
name: Deploy to GCP Cloud Run

on:
  push:
    branches: [main]

permissions:
  id-token: write    # Required for Workload Identity Federation
  contents: read

env:
  PROJECT_ID: my-gcp-project
  REGION: us-central1
  REPO: app-docker
  SERVICE: api-app

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Authenticate to GCP (Workload Identity — no service account keys!)
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: 'projects/123456/locations/global/workloadIdentityPools/github/providers/github'
          service_account: 'deploy@my-gcp-project.iam.gserviceaccount.com'

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker
        run: gcloud auth configure-docker ${{ env.REGION }}-docker.pkg.dev

      - name: Build and push
        run: |
          IMAGE="${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPO }}/${{ env.SERVICE }}:${{ github.sha }}"
          docker build -t $IMAGE .
          docker push $IMAGE
          echo "IMAGE=$IMAGE" >> $GITHUB_ENV

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE }} \
            --image=$IMAGE \
            --region=${{ env.REGION }} \
            --platform=managed \
            --quiet
```

## Secret Manager Integration
```typescript
// lib/secrets.ts — Fetch secrets at startup (not per-request)
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

export async function getSecret(secretName: string): Promise<string> {
  const [version] = await client.accessSecretVersion({
    name: `projects/${process.env['GOOGLE_CLOUD_PROJECT']}/secrets/${secretName}/versions/latest`,
  });
  return version.payload!.data!.toString();
}

// Cache at startup
export async function loadSecrets() {
  if (process.env['NODE_ENV'] === 'production') {
    process.env['DATABASE_URL'] = await getSecret('DATABASE_URL');
    process.env['NEXTAUTH_SECRET'] = await getSecret('NEXTAUTH_SECRET');
  }
}
```

## GCP Cost Tips
- Cloud Run scales to 0 — no idle costs (unlike always-on VMs)
- Use Committed Use Discounts for predictable traffic (minimum CPU commitment)
- Artifact Registry lifecycle policies to delete old images automatically
- Cloud Build is 120 free build-minutes/day — very generous for CI/CD
