# Accounts Backend

An enterprise-ready accounting system backend designed for multi-branch organizations.
This system implements a traditional, auditable accounting model and exposes it via a secure REST API.

The documentation is intentionally written for future developers so that business rules,
accounting logic, and architectural decisions are clearly understood before modifying
financially sensitive code.

---

## 1. Project Overview

Accounts Backend provides the core accounting engine required to manage financial data
across multiple branches, users, and roles.

The system follows a classic accounting hierarchy:

**Chart of Accounts (Groups) → Ledgers → Particulars → Vouchers**

All financial operations (sales, purchases, salaries, payments, receipts, cheques) are
posted through vouchers with strict **double-entry enforcement** and **full auditability**.

### Business Problems Solved

- Maintain Chart of Accounts, ledgers, and sub-ledgers
- Enforce debit/credit equality during transaction posting
- Track customers, suppliers, income, expenses, bank and cheque operations
- Generate standard financial reports
- Support multi-branch operations with role and permission controls
- Preserve immutable audit logs for all financial changes

### Primary Users

- Admins
- Accountants
- Managers
- Auditors
- Branch users

### Accounting Scope

- Chart of Accounts (COA)
- Ledger & sub-ledger management
- Voucher system (Payment, Receipt, Contra, Journal, Sales, Purchase)
- Journal entry rules (Debit / Credit)
- Sales, purchases, returns, services, salary payments
- Bank & cheque management
- Financial reports (Trial Balance, Balance Sheet, Profit & Loss, Income Statement, General Ledger, Voucher Ledger)
- Audit logs & transaction safeguards

### Architectural Approach

The backend is built with **TypeScript and Express** and follows a **feature-based modular architecture**.

Each accounting domain (voucher, ledger, report, purchase, sales, etc.) is implemented as a
self-contained module with its own router, controller, validation, and database access
layer powered by Prisma.

---

## 2. Key Accounting Features

- JWT authentication with role & permission enforcement
- Chart of Accounts hierarchy (Group → Ledger → Particular)
- Voucher lifecycle with transactional balance handling
- Strict debit/credit validation
- Sales, purchase, return and service accounting
- Bank & cheque lifecycle tracking
- Date-range based financial reporting
- Immutable audit logging

---

## 3. Tech Stack

| Layer       | Tool               |
| ----------- | ------------------ |
| Language    | TypeScript         |
| Framework   | Express            |
| Database    | MySQL              |
| ORM         | Prisma             |
| Auth        | JWT                |
| Validation  | Zod                |
| Logging     | morgan             |
| Security    | helmet, CORS       |
| File Upload | multer, Cloudinary |

---

## 4. Folder Structure

```
src/
 ├── app.ts
 ├── index.ts
 ├── router.ts
 ├── config/
 ├── middleware/
 ├── module/
 │    ├── voucher/
 │    ├── ledger/
 │    ├── group/
 │    ├── particular/
 │    ├── report/
 │    └── ...
 └── prisma/
```

---

## 5. Environment Setup

```bash
npm install
npm run dev
```

---

## 6. Database Seeding

This project includes a comprehensive seeding system that creates initial data for the application.

### Initial Setup

1. Make sure your database is connected and migrated:

   ```bash
   npm run prisma:migrate
   ```

2. Run the seed script to create initial data:
   ```bash
   npm run seed
   ```

### Seeded Data

The seeding process creates:

- Main branch (ID: 1)
- Predefined roles: SuperAdmin, Admin, Manager, Employee
- Super Admin user with email: `superadmin@company.com` and password: `admin123`
- Admin user with email: `admin@company.com` and password: `admin123`
- Default accounting groups (Assets, Liabilities, Equity, Income, Expenses)
- Default ledgers (Cash, Bank, Sales)
- Default customer and supplier particulars
- All system permissions with role-based access
- Default categories, units, and brands

### Super Admin Credentials

- **Email:** `superadmin@company.com`
- **Password:** `admin123`

### Admin Credentials

- **Email:** `admin@company.com`
- **Password:** `admin123`

> Note: After the initial setup, you should change these default passwords for security reasons.

---
