# Defect Register

---

## 1. Overview & Policy
In accordance with SEN381 Assessment Area E, defects discovered during Milestone 3 construction, integration, and verification are formally recorded, classified, analyzed for root cause, and tracked to verified resolution. Testing is not presented as "defect-free"; authentic defects demonstrate rigorous quality control, boundary verification, and regression protection.

---

## 2. Defect Classification Scale
* **Critical (P1)**: Total crash, data corruption, or blockage of the core reporting workflow.
* **High (P2)**: Feature malfunction, access-control bypass, or security vulnerability.
* **Medium (P3)**: Incorrect behavior, schema mismatch, or tooling failure with an engineering workaround.
* **Low (P4)**: Minor cosmetic or non-functional defect.

---

## 3. Defect Records

### DEF-01: PowerShell UTF-8 Byte Order Mark (BOM) in JSON Fixtures and Configs
* **Defect ID**: `DEF-01`
* **Severity / Priority**: Medium (P3) / High
* **Date Discovered**: 2026-10-13
* **Stage Discovered**: Local Scripting & Seed Generation
* **Component**: Test runner scripts, configuration files, and seed data (`scripts/seed.json`, `.env` templates)
* **Description / Symptoms**:  
  When test runner scripts and JSON configuration files were generated on Windows using PowerShell's default redirection (`>`), Node.js crashed with: `SyntaxError: Unexpected token '﻿', "﻿{..." is not valid JSON`.
* **Root Cause**:  
  Windows PowerShell 5.1 outputs UTF-8 files with a 3-byte Byte Order Mark (`0xEF, 0xBB, 0xBF`) by default. Node.js native `JSON.parse()` conforms strictly to RFC 8259, which forbids leading BOM characters at index 0.
* **Resolution / Fix Applied**:  
  1. Standardized file output on PowerShell Core / modern redirection (`Out-File -Encoding utf8NoBOM`) and native Node.js scripts.  
  2. Added a defensive sanitization utility in config and fixture loaders that strips leading BOM markers (`str.replace(/^\uFEFF/, '')`) prior to calling `JSON.parse()`.
* **Regression Verification Evidence**: Automated JSON schema and config loader tests pass on Linux CI runners.
* **Status**: **RESOLVED / CLOSED**

---

### DEF-02: Vite Client TSConfig Settings Contaminating API Build
* **Defect ID**: `DEF-02`
* **Severity / Priority**: High (P2) / High
* **Date Discovered**: 2026-10-13
* **Stage Discovered**: Step 3 CI Quality Gate (`npm run build`)
* **Component**: `apps/api/tsconfig.json` & Monorepo Build Scripts
* **Description / Symptoms**:  
  Running `npm run build` failed in `apps/api` with compilation errors: `Cannot find module 'vite/client' or its corresponding type declarations`.
* **Root Cause**:  
  `apps/api/tsconfig.json` had inherited frontend Vite compiler settings (`jsx: "react-jsx"`, `types: ["vite/client"]`) from the root workspace, causing backend Node compilation to fail under strict TypeScript type-checking.
* **Resolution / Fix Applied**:  
  Updated `apps/api/tsconfig.json` compiler options to clean Node targets: set `rootDir: "src"`, `outDir: "dist"`, and `types: ["node"]`, removing all browser/Vite compiler options.
* **Regression Verification Evidence**: `npm run build` completes with exit code 0 in GitHub Actions CI across both workspaces.
* **Status**: **RESOLVED / CLOSED**

---

### DEF-03: Prisma Multi-Client Export & Connection Pool Collision
* **Defect ID**: `DEF-03`
* **Severity / Priority**: Medium (P3) / Medium
* **Date Discovered**: 2026-10-13
* **Stage Discovered**: Service Integration & Parallel Test Execution
* **Component**: Database Client (`apps/api/src/db/prisma.ts`)
* **Description / Symptoms**:  
  During parallel Vitest execution, the runner warned of 10+ open `PrismaClient` instances, triggering PostgreSQL connection starvation and unhandled open handle warnings.
* **Root Cause**:  
  Individual service modules called `new PrismaClient()` independently upon import rather than sharing a cached singleton client.
* **Resolution / Fix Applied**:  
  Refactored `src/db/prisma.ts` to export a shared singleton `prisma` client instance, ensuring lazy initialization and clean teardown in test environments.
* **Regression Verification Evidence**: Vitest test suites execute in parallel with 0 open handle warnings.
* **Status**: **RESOLVED / CLOSED**

---

### DEF-04: Unhandled Login Exception Mapped to HTTP 500
* **Defect ID**: `DEF-04`
* **Severity / Priority**: High (P2) / High
* **Date Discovered**: 2026-10-13
* **Stage Discovered**: Step 5 Black-Box Verification (`tests/blackbox.test.ts` > `BB-08`)
* **Component**: Central Error Handling Middleware (`apps/api/src/middleware/errorHandler.ts`)
* **Description / Symptoms**:  
  Submitting invalid credentials or querying an unmapped user account threw `Unhandled internal server error: Error: Invalid email or password`, returning HTTP 500 instead of HTTP 401.
* **Root Cause**:  
  `errorHandler.ts` checked for transition and forbidden errors, but lacked an explicit branch matching the authentication domain error string `"Invalid email or password"`.
* **Resolution / Fix Applied**:  
  Added an explicit error mapping in `errorHandler.ts`:
  ```typescript
  if (err.message === "Invalid email or password") {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: err.message } });
    return;
  }