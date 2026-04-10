---
name: input-validation-sanitization
description: "Hardened Input Validation and Data Sanitization patterns using Zod. Focuses on Schema Composition, Type Extraction, and Hostile Input Defense."
---

# SKILL: Enterprise Input Validation (Zod)

## Overview
Hardened **Input Validation** and **Data Sanitization** patterns using **Zod**. Focuses on **Schema Composition**, **Type Extraction**, and **Hostile Input Defense**.

## 1. Schema Composition & DRY
Avoid duplicating validation logic across the API and UI.
- **Pattern**: Define base schemas and extend them using `.extend()`, `.pick()`, and `.omit()`.
- **Benefit**: Changing the validation in one place updates the entire system boundary.

## 2. Advanced Custom Refinements
Use `.refine()` and `.superRefine()` for cross-field validation.
- **Example**: Ensure "Confirm Password" matches "Password".
- **Example**: Ensure an "End Date" is always after the "Start Date".

## 3. Hostile Input Defense (Sanitization)
Treat all text as HTML/JS by default.
- **Pattern**: Use `.trim()`, `.toLowerCase()`, and custom `.transform()` to strip HTML tags using a whitelist.
- **Reason**: Prevent XSS (Cross-Site Scripting) and SQL Injection at the entry point.

## 4. Runtime Type Extraction
- **Standard**: Use `z.infer<typeof schema>` to generate your TypeScript interfaces automatically.
- **Benefit**: Guaranteed synchronization between the validation logic and the code's type definitions.

## 5. Error Mapping (UX Compatibility)
- **Flattened Errors**: Use `.flatten()` to provide a simple key-value object of errors for UI components.
- **Internationalization (i18n)**: Use Zod's `errorMap` to provide translated error messages based on the user's locale.

## Skills to Load
- `zod-validation-patterns`
- `application-security-a03`
- `form-handling-integration`
