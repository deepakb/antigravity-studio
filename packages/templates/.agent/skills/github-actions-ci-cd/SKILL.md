---
name: github-actions-ci-cd
description: "Hardened GitHub Actions workflows for enterprise-grade automated delivery. Focuses on OIDC Authentication, Environment Protection, and Matrix Testing."
---

# SKILL: Enterprise GitHub Actions CI/CD

## Overview
Hardened **GitHub Actions** workflows for enterprise-grade automated delivery. Focuses on **OIDC Authentication**, **Environment Protection**, and **Matrix Testing**.

## 1. OIDC (Zero-Secret Authentication)
Avoid long-lived cloud credentials (AWS Access Keys, Google Service Account JSONs) in GitHub Secrets.
- **Protocol**: Use **OpenID Connect (OIDC)** to request temporary session tokens from providers like AWS, Azure, or Google Cloud.
- **Benefit**: No secrets to rotate; identity is verified via GitHub's OIDC provider.

## 2. Environment Protection & Approval Gates
- **Environments**: Define `Production`, `Staging`, and `Development` environments in GitHub.
- **Required Reviewers**: Enforce a manual "Approval" for production deployments to ensure cross-functional sign-off.

## 3. Workflow Hardening (Least Privilege)
Restrict the `GITHUB_TOKEN` permissions in every workflow file.
```yaml
permissions:
  contents: read # Default to read-only
  id-token: write # Required for OIDC
  deployments: write # For deployment status
```

## 4. Matrix Testing & Parallelism
- **Pattern**: Run tests across multiple Node.js versions or OS types in parallel using `strategy.matrix`.
- **Fail-Fast**: Use `fail-fast: true` to abort all parallel jobs if one fails, saving CI minutes.

## 5. Caching & Artifacts
- **Caching**: Use `actions/cache` for `node_modules` and Turborepo artifacts.
- **Artifacts**: Upload build summaries and test reports (`vitest`, `playwright`) for easy review of failures.

## Skills to Load
- `github-oidc-security`
- `automated-deployment-strategies`
- `turborepo-ci-optimization`

---

## Verification Scripts (MANDATORY)

- **Security Scan**: `studio run security-scan`
- **License Audit**: `studio run license-audit`
