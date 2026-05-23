# API Documentation — Accounts Backend

Version: v1  
Base URL: /api/v1

---

## 1. API Overview

This document describes the REST APIs exposed by the Accounts Backend.
It is written to help developers integrate with the system safely without violating
core accounting rules.

The backend implements a traditional double-entry accounting model and enforces
financial integrity at the API level.

### Intended Audience

- Frontend and mobile developers
- Integration and automation clients
- Backend engineers onboarding to the accounting system
- QA engineers and auditors

### Versioning

All endpoints are mounted under `/api/v1`.
Breaking changes must be introduced under a new version path.

---

## 2. Authentication & Authorization

### Authentication

- JWT-based access tokens
- Tokens are issued during login
- Token expiry and secrets are controlled via environment variables

### Sending Tokens

```
Authorization: Bearer <ACCESS_TOKEN>
```

### Permission Model

Access control is permission-based.

- Role permissions define base access
- User permissions override role permissions
- Permissions are evaluated using module + action pairs

### Permission Enforcement

The `verifyPermission` middleware checks:

1. User-level permission
2. Role-level permission

If neither allows the requested action, the API returns `403 Forbidden`.

---

## 3. Global Request & Response Format

### Common Headers

```
Content-Type: application/json
Authorization: Bearer <token>
```

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Debit and Credit mismatch",
  "statusCode": 400
}
```

---

## 4. Core API Modules

All endpoints are prefixed with `/api/v1`.

---

### Auth / User

Handles authentication, user management, and profiles.

| Method | Endpoint | Description | Permission |
|------|---------|-------------|------------|
| POST | /user/login-user | Login | Public |
| POST | /user/create-user | Create user | Module.User:create |
| GET | /user/get-profile | Current user | Authenticated |
| GET | /user/get-user-all | List users | Module.User:read |

---

### Role & Permission

Manages roles and permissions.

| Method | Endpoint | Permission |
|------|---------|------------|
| POST | /role/create-role | Module.Role:create |
| GET | /role/get-role-all | Module.Role:read |
| PUT | /role/update-role/:id | Module.Role:update |
| DELETE | /role/delete-role/:id | Module.Role:delete |

---

### Chart of Accounts (Group)

Defines top-level accounting categories.

| Method | Endpoint | Permission |
|------|---------|------------|
| POST | /group/create-group | Module.Group:create |
| GET | /group/get-group-all | Module.Group:read |

---

### Ledger

Manages ledgers under groups.

| Method | Endpoint | Permission |
|------|---------|------------|
| POST | /ledger/create-ledger | Module.Ledger:create |
| GET | /ledger/get-ledger-all | Module.Ledger:read |

---

### Particular

Represents customers, suppliers, and accounts.

| Method | Endpoint | Permission |
|------|---------|------------|
| POST | /particular/create-particular | Module.Particular:create |
| GET | /particular/get-particular-all | Module.Particular:read |

---

### Voucher (Core Accounting)

Vouchers represent journal entries and enforce double-entry rules.

| Method | Endpoint | Permission |
|------|---------|------------|
| POST | /voucher/create-voucher | Module.Voucher:create |
| GET | /voucher/get-voucher-all | Module.Voucher:read |
| PUT | /voucher/update-voucher/:id | Module.Voucher:update |
| DELETE | /voucher/delete-voucher/:id | Module.Voucher:delete |

---

### Purchase & Sales

Domain transactions that generate vouchers automatically.

- /purchase/*
- /sales/*
- /purchase-return/*
- /sales-return/*
- /service/*
- /service-sales/*

All endpoints require appropriate module permissions.

---

### Reports

Read-only financial reports.

| Endpoint | Description |
|---------|-------------|
| /report/trial-balance | Trial Balance |
| /report/balance-sheet | Balance Sheet |
| /report/income-statement | Income Statement |
| /report/profit-and-loss | Profit & Loss |
| /report/general-ledger | General Ledger |
| /report/voucher-ledger | Voucher Ledger |

---

## 5. Core Accounting Rules

- Debit and Credit totals must match
- All postings are branch-isolated
- Ledger and particular balances are updated transactionally
- Voucher updates rollback previous effects
- All changes are audited

---

## 6. Pagination & Filtering

- Pagination: page, size
- Filtering: branchId, fromDate, toDate
- Sorting: sortOrder

---

## 7. Error Codes

| Code | Meaning |
|------|--------|
| 400 | Validation or accounting rule violation |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 500 | Server error |

---

## 8. Developer Notes

- Never update balances directly
- Always use voucher endpoints
- Validate debit/credit client-side before submission
- Respect branch isolation

---

This API documentation exists to protect financial integrity.
