---
name: node-express-testing
description: "Standards for API Integration Testing in Node.js/Express. Focuses on Supertest, Database Teardown, and Middleware Auditing."
---

# SKILL: Enterprise Node & Express Testing

## Overview
Standards for **API Integration Testing** in Node.js/Express. Focuses on **Supertest**, **Database Teardown**, and **Middleware Auditing**.

## 1. Integration Testing (Supertest)
- **Pattern**: Spin up a "Test Instance" of the Express app. Use `supertest` to make actual HTTP calls.
- **Success**: Verify Status Codes, Headers, and JSON schemas in a single pipe.

## 2. Database Sandboxing (Teardown)
- **Standard**: Every test run must start with a clean Database.
- **Protocol**: `truncate` all tables in a `beforeEach` or use a fresh `test_db` per run.

## 3. Middleware Security Auditing
- **Standard**: Explicitly test that unauthorized requests are blocked by your `AuthMiddleware`.
- **Pattern**: Test `401 Unauthorized` and `403 Forbidden` scenarios for every route.

## 4. Request Logging & Correlation IDs
- **Standard**: Ensure every test request generates a `request-id` header for tracing.
- **Audit**: Verify that error logs contain the correct context (IP, Method, Path) during failures.

## 5. Graceful Shutdown & Port Safety
- **Standard**: Ensure the test runner closes the server port immediately after tests finish to prevent "EADDRINUSE" errors in CI.

## Skills to Load
- `vitest-unit-testing`
- `api-design-restful`
- `security-authorization-a01`
