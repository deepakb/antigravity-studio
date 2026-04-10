---
name: aws-deployment
description: "Standards for multi-cloud enterprise deployment. Focuses on IAC (Infrastructure as Code), Least Privilege, and Regional Resilience."
---

# SKILL: Enterprise Cloud Deployment (AWS/Azure/GCP)

## Overview
Standards for multi-cloud enterprise deployment. Focuses on **IAC (Infrastructure as Code)**, **Least Privilege**, and **Regional Resilience**.

## 1. IAC Governance (Terraform/CDK)
Never click in the console. Every resource must be defined in code.
- **Pattern**: Use `Terraform` or `AWS CDK` for reproducible infrastructure.
- **State**: Store the state file in a remote, locked, and versioned bucket (S3/GCS).

## 2. Shared Responsibility Model
- **Platform**: The cloud provider handles physical security.
- **Customer**: You handle the OS, Application, and Data security (Identity, Encryption).

## 3. Least Privilege (IAM)
- **Role-based**: Use IAM Roles for EC2/Lambdas; never use long-lived Access Keys.
- **Scoping**: Grant the minimum necessary permissions to every service (e.g., `s3:GetObject` only for a specific bucket, not all).

## 4. Multi-Region Resilience
- **Strategy**: For critical apps, deploy across multiple Availability Zones (AZs) or Regions.
- **Health**: Use Route53 or CloudFront to automatically failover if a region goes down.

## 5. Cost Governance (FinOps)
- **Tagging**: Every resource MUST be tagged with `Project`, `Environment`, and `Owner`.
- **Alerts**: Set up budget alerts at 50%, 80%, and 100% of the monthly forecast.

## Skills to Load
- `terraform-iac-patterns`
- `iam-security-hardening`
- `cloud-monitoring-observability`
