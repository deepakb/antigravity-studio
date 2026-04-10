---
name: azure-deployment
description: "Hardened Azure and GCP deployment standards. Focuses on App Service/Cloud Run, Managed Databases, and Regional Availability."
---

# SKILL: Enterprise Azure/GCP Deployment

## Overview
Hardened **Azure** and **GCP** deployment standards. Focuses on **App Service/Cloud Run**, **Managed Databases**, and **Regional Availability**.

## 1. Managed Service Governance
- **Azure App Service**: Use **Container-based Deployment** for predictability. Enable **Deployment Slots** to allow zero-downtime swaps.
- **GCP Cloud Run**: Leverage **Direct VPC Egress** for secure communication with internal databases (Cloud SQL).

## 2. Managed Database Lifecycle (SQL/NoSQL)
- **Azure SQL**: Enable **Transparent Data Encryption (TDE)** and **Multi-Factor Auth (MFA)** for all DB logins.
- **Cloud SQL**: Use the **Cloud SQL Auth Proxy** instead of exposing the database over a public IP.

## 3. High Availability (HA) & Scaling
- **Autoscaling**: Configure rules based on CPU/Memory/Request count to handle demand spikes.
- **Regions**: Deploy artifacts to regional registries (ACR/GCR) closest to the compute resource.

## 4. Cost Management & FinOps
- **Standard**: Automate resource cleanup for dev/test environments after hours.
- **Check**: Use Azure Cost Management or GCP Billing to set hard budgets.

## Skills to Load
- `cloud-infrastructure-governance`
- `container-orchestration`
- `security-authorization-a01`
