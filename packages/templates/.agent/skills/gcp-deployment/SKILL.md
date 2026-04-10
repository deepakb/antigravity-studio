---
name: gcp-deployment
description: "Hardened Google Cloud Platform (GCP) deployment standards. Focuses on Cloud Run, Artifact Registry, and Managed Identity."
---

# SKILL: Enterprise GCP Deployment

## Overview
Hardened **Google Cloud Platform (GCP)** deployment standards. Focuses on **Cloud Run**, **Artifact Registry**, and **Managed Identity**.

## 1. Cloud Run (Serverless) Architecture
- **Standard**: Deploy as stateless containers. Use **Direct VPC Egress** to connect to private resources.
- **Concurrency**: Set a reasonable `concurrency` (request-limit) per container instance to optimize cold starts and cost.

## 2. Artifact Registry & Security
- **Scanning**: Enable **Vulnerability Scanning** in GCR/AR.
- **Governance**: Only allow deployments from images signed by your CI/CD pipeline (Binary Authorization).

## 3. Cloud SQL & Private IP
- **Network**: Never use public IPs for databases. Connect via **Private IP** and use the **Cloud SQL Auth Proxy** for developer access.
- **Encryption**: Enable **Customer-Managed Encryption Keys (CMEK)** for highly sensitive data volumes.

## 4. Secrets Management (Secret Manager)
- **Protocol**: Inject secrets as environment variables or volume mounts at runtime. Never include `.env` files in your Docker image.

## 5. IAM & Service Accounts
- **Rule**: Each application should have its own **Identity (Service Account)** with the absolute minimum permissions (Least Privilege).

## Skills to Load
- `cloud-infrastructure-governance`
- `container-security-hardening`
- `micro-segmentation-networking`
