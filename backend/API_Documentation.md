# Comprehensive API Documentation - Accounts Backend System

## Table of Contents

- [Overview](#overview)
- [Authentication & Authorization](#authentication--authorization)
- [Request/Response Format](#requestresponse-format)
- [API Endpoints](#api-endpoints)
- [Modules Overview](#modules-overview)
- [Error Handling](#error-handling)
- [Rate Limiting & Security](#rate-limiting--security)

---

## Overview

**Base URL:** `http://localhost:{PORT}/api/v1` (or your deployed domain)  
**Version:** v1  
**Protocol:** HTTPS/HTTP  
**Content-Type:** `application/json`

This is a comprehensive accounting and business management system with modules for user management, accounting, inventory, HR, and reporting. The system implements role-based access control and branch-level isolation.

---

## Authentication & Authorization

### JWT-Based Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

### Token Management

- **Access Token:** Used for regular API requests (short-lived)
- **Refresh Token:** Used to obtain new access tokens (longer-lived)
- **OTP Token:** Used for temporary verifications (short-lived)

Tokens are configured via environment variables:

- `AUTH_TOKEN` - Secret for access tokens
- `REFRESH_TOKEN` - Secret for refresh tokens
- `OTP_TOKEN` - Secret for OTP tokens

### Permission System

The system implements a dual-layer permission model:

1. **Role-based Permissions:** Base permissions assigned to user roles
2. **User-specific Permissions:** Individual permissions that override role permissions

#### Permission Structure

Each permission consists of:

- **Module:** The functional area (e.g., User, Product, Voucher)
- **Action:** The operation (create, read, update, delete)

#### Available Modules

```
Dashboard, User, Branch, Employee, Designation, Role, Department,
Branch_Assign, Group, Ledger, Particular, Voucher, Category,
SubCategory, Size, Color, Unit, Brand, Product, Product_Variation,
Chart_Of_Account, Purchase, Purchase_Return, Sales, Sales_Return,
Trial_Balance, Profit_And_Loss, General_Ledger, Voucher_Ledger,
Balance_Sheet, Service, Service_Sales, Income_Statement,
Owner_Security, Quotation, Bank, Cheque, Salary_Structure,
Leave_Day_Setup, Leave_Apply, Salary, Audit_Log
```

#### Available Actions

```
create, read, update, delete
```

### Middleware Layers

Each endpoint may use multiple middleware layers:

1. **verifyJwt** - Validates JWT token
2. **verifyPermission** - Checks module/action permissions
3. **verifyBranchPermissionCreate/Get** - Enforces branch-level access
4. **Validation Middleware** - Validates request body/data

---

## Request/Response Format

### Successful Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {}
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "data": null
}
```

### Meta Information (when present)

```json
{
  "meta": {
    "page": 1,
    "size": 10,
    "total": 100,
    "totalPage": 10
  }
}
```

---

## API Endpoints

### AUTHENTICATION & USER MANAGEMENT

#### User Module (`/user`)

| Method | Endpoint                              | Description                 | Requires Auth | Permission  |
| ------ | ------------------------------------- | --------------------------- | ------------- | ----------- |
| POST   | `/user/create-user`                   | Create a new user           | Yes           | User:create |
| POST   | `/user/login-user`                    | User login                  | No            | Public      |
| POST   | `/user/verify-account/:code`          | Verify user account         | No            | Public      |
| POST   | `/user/change-password`               | Change user password        | Yes           | Self only   |
| GET    | `/user/get-profile`                   | Get current user profile    | Yes           | Self only   |
| POST   | `/user/forget-password`               | Initiate password reset     | No            | Public      |
| POST   | `/user/send-verification-link/:email` | Send verification email     | No            | Public      |
| POST   | `/user/send-forget-link/:email`       | Send password reset link    | No            | Public      |
| GET    | `/user/get-user-all`                  | Get all users               | Yes           | User:read   |
| GET    | `/user/get-user/:id`                  | Get user by ID              | Yes           | User:read   |
| PUT    | `/user/update-user/:id`               | Update user                 | Yes           | User:update |
| PUT    | `/user/update-user-status/:id`        | Toggle user status          | Yes           | User:update |
| DELETE | `/user/delete-user/:id`               | Delete user                 | Yes           | User:delete |
| PUT    | `/user/update-profile`                | Update current user profile | Yes           | Self only   |

### ROLE MANAGEMENT

#### Role Module (`/role`)

| Method | Endpoint                | Description       | Requires Auth | Permission  |
| ------ | ----------------------- | ----------------- | ------------- | ----------- |
| POST   | `/role/create-role`     | Create a new role | Yes           | Role:create |
| GET    | `/role/get-role-all`    | Get all roles     | Yes           | Role:read   |
| GET    | `/role/get-role/:id`    | Get role by ID    | Yes           | Role:read   |
| PUT    | `/role/update-role/:id` | Update role       | Yes           | Role:update |
| DELETE | `/role/delete-role/:id` | Delete role       | Yes           | Role:delete |

### PERMISSION MANAGEMENT

#### Permission Module (`/permission`)

| Method | Endpoint                         | Description          | Requires Auth | Permission      |
| ------ | -------------------------------- | -------------------- | ------------- | --------------- |
| GET    | `/permission/get-permission-all` | Get all permissions  | Yes           | Permission:read |
| GET    | `/permission/get-permission/:id` | Get permission by ID | Yes           | Permission:read |

### USER PERMISSIONS

#### User Permission Module (`/user-permission`)

| Method | Endpoint                                      | Description               | Requires Auth | Permission            |
| ------ | --------------------------------------------- | ------------------------- | ------------- | --------------------- |
| POST   | `/user-permission/create-user-permission`     | Create user permission    | Yes           | UserPermission:create |
| GET    | `/user-permission/get-user-permission-all`    | Get all user permissions  | Yes           | UserPermission:read   |
| GET    | `/user-permission/get-user-permission/:id`    | Get user permission by ID | Yes           | UserPermission:read   |
| PUT    | `/user-permission/update-user-permission/:id` | Update user permission    | Yes           | UserPermission:update |
| DELETE | `/user-permission/delete-user-permission/:id` | Delete user permission    | Yes           | UserPermission:delete |

### BRANCH MANAGEMENT

#### Branch Module (`/branch`)

| Method | Endpoint                    | Description         | Requires Auth | Permission    |
| ------ | --------------------------- | ------------------- | ------------- | ------------- |
| POST   | `/branch/create-branch`     | Create a new branch | Yes           | Branch:create |
| GET    | `/branch/get-branch-all`    | Get all branches    | Yes           | Branch:read   |
| GET    | `/branch/get-branch/:id`    | Get branch by ID    | Yes           | Branch:read   |
| PUT    | `/branch/update-branch/:id` | Update branch       | Yes           | Branch:update |
| DELETE | `/branch/delete-branch/:id` | Delete branch       | Yes           | Branch:delete |

### BRANCH ASSIGNMENT

#### User Branch Module (`/branch-assign`)

| Method | Endpoint                                | Description                      | Requires Auth | Permission           |
| ------ | --------------------------------------- | -------------------------------- | ------------- | -------------------- |
| POST   | `/branch-assign/create-user-branch`     | Assign user to branch            | Yes           | Branch_Assign:create |
| GET    | `/branch-assign/get-user-branch-all`    | Get all user-branch assignments  | Yes           | Branch_Assign:read   |
| GET    | `/branch-assign/get-user-branch/:id`    | Get user-branch assignment by ID | Yes           | Branch_Assign:read   |
| PUT    | `/branch-assign/update-user-branch/:id` | Update user-branch assignment    | Yes           | Branch_Assign:update |
| DELETE | `/branch-assign/delete-user-branch/:id` | Delete user-branch assignment    | Yes           | Branch_Assign:delete |

### HUMAN RESOURCES

#### Employee Module (`/employee`)

| Method | Endpoint                               | Description            | Requires Auth | Permission      |
| ------ | -------------------------------------- | ---------------------- | ------------- | --------------- |
| POST   | `/employee/create-employee`            | Create a new employee  | Yes           | Employee:create |
| GET    | `/employee/get-employee-all`           | Get all employees      | Yes           | Employee:read   |
| GET    | `/employee/get-employee/:id`           | Get employee by ID     | Yes           | Employee:read   |
| PUT    | `/employee/update-employee/:id`        | Update employee        | Yes           | Employee:update |
| PUT    | `/employee/update-employee-status/:id` | Toggle employee status | Yes           | Employee:update |
| DELETE | `/employee/delete-employee/:id`        | Delete employee        | Yes           | Employee:delete |

#### Department Module (`/department`)

| Method | Endpoint                            | Description             | Requires Auth | Permission        |
| ------ | ----------------------------------- | ----------------------- | ------------- | ----------------- |
| POST   | `/department/create-department`     | Create a new department | Yes           | Department:create |
| GET    | `/department/get-department-all`    | Get all departments     | Yes           | Department:read   |
| GET    | `/department/get-department/:id`    | Get department by ID    | Yes           | Department:read   |
| PUT    | `/department/update-department/:id` | Update department       | Yes           | Department:update |
| DELETE | `/department/delete-department/:id` | Delete department       | Yes           | Department:delete |

#### Designation Module (`/designation`)

| Method | Endpoint                              | Description              | Requires Auth | Permission         |
| ------ | ------------------------------------- | ------------------------ | ------------- | ------------------ |
| POST   | `/designation/create-designation`     | Create a new designation | Yes           | Designation:create |
| GET    | `/designation/get-designation-all`    | Get all designations     | Yes           | Designation:read   |
| GET    | `/designation/get-designation/:id`    | Get designation by ID    | Yes           | Designation:read   |
| PUT    | `/designation/update-designation/:id` | Update designation       | Yes           | Designation:update |
| DELETE | `/designation/delete-designation/:id` | Delete designation       | Yes           | Designation:delete |

### ACCOUNTING SYSTEM

#### Group Module (`/group`)

| Method | Endpoint                  | Description                | Requires Auth | Permission   |
| ------ | ------------------------- | -------------------------- | ------------- | ------------ |
| POST   | `/group/create-group`     | Create a new account group | Yes           | Group:create |
| GET    | `/group/get-group-all`    | Get all account groups     | Yes           | Group:read   |
| GET    | `/group/get-group/:id`    | Get group by ID            | Yes           | Group:read   |
| PUT    | `/group/update-group/:id` | Update group               | Yes           | Group:update |
| DELETE | `/group/delete-group/:id` | Delete group               | Yes           | Group:delete |

#### Ledger Module (`/ledger`)

| Method | Endpoint                    | Description                 | Requires Auth | Permission    |
| ------ | --------------------------- | --------------------------- | ------------- | ------------- |
| POST   | `/ledger/create-ledger`     | Create a new ledger account | Yes           | Ledger:create |
| GET    | `/ledger/get-ledger-all`    | Get all ledger accounts     | Yes           | Ledger:read   |
| GET    | `/ledger/get-ledger/:id`    | Get ledger by ID            | Yes           | Ledger:read   |
| PUT    | `/ledger/update-ledger/:id` | Update ledger               | Yes           | Ledger:update |
| DELETE | `/ledger/delete-ledger/:id` | Delete ledger               | Yes           | Ledger:delete |

#### Particular Module (`/particular`)

| Method | Endpoint                            | Description                                 | Requires Auth | Permission        |
| ------ | ----------------------------------- | ------------------------------------------- | ------------- | ----------------- |
| POST   | `/particular/create-particular`     | Create a new particular (customer/supplier) | Yes           | Particular:create |
| GET    | `/particular/get-particular-all`    | Get all particulars                         | Yes           | Particular:read   |
| GET    | `/particular/get-particular/:id`    | Get particular by ID                        | Yes           | Particular:read   |
| PUT    | `/particular/update-particular/:id` | Update particular                           | Yes           | Particular:update |
| DELETE | `/particular/delete-particular/:id` | Delete particular                           | Yes           | Particular:delete |

#### Voucher Module (`/voucher`)

| Method | Endpoint                      | Description                          | Requires Auth | Permission     |
| ------ | ----------------------------- | ------------------------------------ | ------------- | -------------- |
| POST   | `/voucher/create-voucher`     | Create a new voucher (journal entry) | Yes           | Voucher:create |
| GET    | `/voucher/get-voucher-all`    | Get all vouchers                     | Yes           | Voucher:read   |
| GET    | `/voucher/get-voucher/:id`    | Get voucher by ID                    | Yes           | Voucher:read   |
| PUT    | `/voucher/update-voucher/:id` | Update voucher                       | Yes           | Voucher:update |
| DELETE | `/voucher/delete-voucher/:id` | Delete voucher                       | Yes           | Voucher:delete |

### INVENTORY & PRODUCTS

#### Category Module (`/category`)

| Method | Endpoint                        | Description           | Requires Auth | Permission      |
| ------ | ------------------------------- | --------------------- | ------------- | --------------- |
| POST   | `/category/create-category`     | Create a new category | Yes           | Category:create |
| GET    | `/category/get-category-all`    | Get all categories    | Yes           | Category:read   |
| GET    | `/category/get-category/:id`    | Get category by ID    | Yes           | Category:read   |
| PUT    | `/category/update-category/:id` | Update category       | Yes           | Category:update |
| DELETE | `/category/delete-category/:id` | Delete category       | Yes           | Category:delete |

#### SubCategory Module (`/subcategory`)

| Method | Endpoint                              | Description              | Requires Auth | Permission         |
| ------ | ------------------------------------- | ------------------------ | ------------- | ------------------ |
| POST   | `/subcategory/create-subcategory`     | Create a new subcategory | Yes           | SubCategory:create |
| GET    | `/subcategory/get-subcategory-all`    | Get all subcategories    | Yes           | SubCategory:read   |
| GET    | `/subcategory/get-subcategory/:id`    | Get subcategory by ID    | Yes           | SubCategory:read   |
| PUT    | `/subcategory/update-subcategory/:id` | Update subcategory       | Yes           | SubCategory:update |
| DELETE | `/subcategory/delete-subcategory/:id` | Delete subcategory       | Yes           | SubCategory:delete |

#### Brand Module (`/brand`)

| Method | Endpoint                  | Description        | Requires Auth | Permission   |
| ------ | ------------------------- | ------------------ | ------------- | ------------ |
| POST   | `/brand/create-brand`     | Create a new brand | Yes           | Brand:create |
| GET    | `/brand/get-brand-all`    | Get all brands     | Yes           | Brand:read   |
| GET    | `/brand/get-brand/:id`    | Get brand by ID    | Yes           | Brand:read   |
| PUT    | `/brand/update-brand/:id` | Update brand       | Yes           | Brand:update |
| DELETE | `/brand/delete-brand/:id` | Delete brand       | Yes           | Brand:delete |

#### Unit Module (`/unit`)

| Method | Endpoint                | Description       | Requires Auth | Permission  |
| ------ | ----------------------- | ----------------- | ------------- | ----------- |
| POST   | `/unit/create-unit`     | Create a new unit | Yes           | Unit:create |
| GET    | `/unit/get-unit-all`    | Get all units     | Yes           | Unit:read   |
| GET    | `/unit/get-unit/:id`    | Get unit by ID    | Yes           | Unit:read   |
| PUT    | `/unit/update-unit/:id` | Update unit       | Yes           | Unit:update |
| DELETE | `/unit/delete-unit/:id` | Delete unit       | Yes           | Unit:delete |

#### Size Module (`/size`)

| Method | Endpoint                | Description       | Requires Auth | Permission  |
| ------ | ----------------------- | ----------------- | ------------- | ----------- |
| POST   | `/size/create-size`     | Create a new size | Yes           | Size:create |
| GET    | `/size/get-size-all`    | Get all sizes     | Yes           | Size:read   |
| GET    | `/size/get-size/:id`    | Get size by ID    | Yes           | Size:read   |
| PUT    | `/size/update-size/:id` | Update size       | Yes           | Size:update |
| DELETE | `/size/delete-size/:id` | Delete size       | Yes           | Size:delete |

#### Color Module (`/color`)

| Method | Endpoint                  | Description        | Requires Auth | Permission   |
| ------ | ------------------------- | ------------------ | ------------- | ------------ |
| POST   | `/color/create-color`     | Create a new color | Yes           | Color:create |
| GET    | `/color/get-color-all`    | Get all colors     | Yes           | Color:read   |
| GET    | `/color/get-color/:id`    | Get color by ID    | Yes           | Color:read   |
| PUT    | `/color/update-color/:id` | Update color       | Yes           | Color:update |
| DELETE | `/color/delete-color/:id` | Delete color       | Yes           | Color:delete |

#### Product Module (`/product`)

| Method | Endpoint                      | Description          | Requires Auth | Permission     |
| ------ | ----------------------------- | -------------------- | ------------- | -------------- |
| POST   | `/product/create-product`     | Create a new product | Yes           | Product:create |
| GET    | `/product/get-product-all`    | Get all products     | Yes           | Product:read   |
| GET    | `/product/get-product/:id`    | Get product by ID    | Yes           | Product:read   |
| PUT    | `/product/update-product/:id` | Update product       | Yes           | Product:update |
| DELETE | `/product/delete-product/:id` | Delete product       | Yes           | Product:delete |

#### Product Variation Module (`/product-variation`)

| Method | Endpoint                                          | Description                    | Requires Auth | Permission               |
| ------ | ------------------------------------------------- | ------------------------------ | ------------- | ------------------------ |
| POST   | `/product-variation/create-product-variation`     | Create a new product variation | Yes           | Product_Variation:create |
| GET    | `/product-variation/get-product-variation-all`    | Get all product variations     | Yes           | Product_Variation:read   |
| GET    | `/product-variation/get-product-variation/:id`    | Get product variation by ID    | Yes           | Product_Variation:read   |
| PUT    | `/product-variation/update-product-variation/:id` | Update product variation       | Yes           | Product_Variation:update |
| DELETE | `/product-variation/delete-product-variation/:id` | Delete product variation       | Yes           | Product_Variation:delete |

### FINANCIAL TRANSACTIONS

#### Purchase Module (`/purchase`)

| Method | Endpoint                             | Description                | Requires Auth | Permission      |
| ------ | ------------------------------------ | -------------------------- | ------------- | --------------- |
| POST   | `/purchase/create-purchase`          | Create a new purchase      | Yes           | Purchase:create |
| GET    | `/purchase/get-purchase-all`         | Get all purchases          | Yes           | Purchase:read   |
| GET    | `/purchase/get-purchase/:id`         | Get purchase by ID         | Yes           | Purchase:read   |
| GET    | `/purchase/get-purchase-invoice/:id` | Get purchase by invoice ID | Yes           | Purchase:read   |
| PUT    | `/purchase/update-purchase/:id`      | Update purchase            | Yes           | Purchase:update |
| DELETE | `/purchase/delete-purchase/:id`      | Delete purchase            | Yes           | Purchase:delete |

#### Purchase Return Module (`/purchase-return`)

| Method | Endpoint                                      | Description                  | Requires Auth | Permission             |
| ------ | --------------------------------------------- | ---------------------------- | ------------- | ---------------------- |
| POST   | `/purchase-return/create-purchase-return`     | Create a new purchase return | Yes           | Purchase_Return:create |
| GET    | `/purchase-return/get-purchase-return-all`    | Get all purchase returns     | Yes           | Purchase_Return:read   |
| GET    | `/purchase-return/get-purchase-return/:id`    | Get purchase return by ID    | Yes           | Purchase_Return:read   |
| PUT    | `/purchase-return/update-purchase-return/:id` | Update purchase return       | Yes           | Purchase_Return:update |
| DELETE | `/purchase-return/delete-purchase-return/:id` | Delete purchase return       | Yes           | Purchase_Return:delete |

#### Sales Module (`/sales`)

| Method | Endpoint                       | Description            | Requires Auth | Permission   |
| ------ | ------------------------------ | ---------------------- | ------------- | ------------ |
| POST   | `/sales/create-sales`          | Create a new sale      | Yes           | Sales:create |
| GET    | `/sales/get-sales-all`         | Get all sales          | Yes           | Sales:read   |
| GET    | `/sales/get-sales/:id`         | Get sale by ID         | Yes           | Sales:read   |
| GET    | `/sales/get-sales-invoice/:id` | Get sale by invoice ID | Yes           | Sales:read   |
| PUT    | `/sales/update-sales/:id`      | Update sale            | Yes           | Sales:update |
| DELETE | `/sales/delete-sales/:id`      | Delete sale            | Yes           | Sales:delete |

#### Sales Return Module (`/sales-return`)

| Method | Endpoint                                | Description               | Requires Auth | Permission          |
| ------ | --------------------------------------- | ------------------------- | ------------- | ------------------- |
| POST   | `/sales-return/create-sales-return`     | Create a new sales return | Yes           | Sales_Return:create |
| GET    | `/sales-return/get-sales-return-all`    | Get all sales returns     | Yes           | Sales_Return:read   |
| GET    | `/sales-return/get-sales-return/:id`    | Get sales return by ID    | Yes           | Sales_Return:read   |
| PUT    | `/sales-return/update-sales-return/:id` | Update sales return       | Yes           | Sales_Return:update |
| DELETE | `/sales-return/delete-sales-return/:id` | Delete sales return       | Yes           | Sales_Return:delete |

#### Service Module (`/service`)

| Method | Endpoint                      | Description          | Requires Auth | Permission     |
| ------ | ----------------------------- | -------------------- | ------------- | -------------- |
| POST   | `/service/create-service`     | Create a new service | Yes           | Service:create |
| GET    | `/service/get-service-all`    | Get all services     | Yes           | Service:read   |
| GET    | `/service/get-service/:id`    | Get service by ID    | Yes           | Service:read   |
| PUT    | `/service/update-service/:id` | Update service       | Yes           | Service:update |
| DELETE | `/service/delete-service/:id` | Delete service       | Yes           | Service:delete |

#### Service Sales Module (`/service-sales`)

| Method | Endpoint                                  | Description               | Requires Auth | Permission           |
| ------ | ----------------------------------------- | ------------------------- | ------------- | -------------------- |
| POST   | `/service-sales/create-service-sales`     | Create a new service sale | Yes           | Service_Sales:create |
| GET    | `/service-sales/get-service-sales-all`    | Get all service sales     | Yes           | Service_Sales:read   |
| GET    | `/service-sales/get-service-sales/:id`    | Get service sale by ID    | Yes           | Service_Sales:read   |
| PUT    | `/service-sales/update-service-sales/:id` | Update service sale       | Yes           | Service_Sales:update |
| DELETE | `/service-sales/delete-service-sales/:id` | Delete service sale       | Yes           | Service_Sales:delete |

#### Quotation Module (`/quotation`)

| Method | Endpoint                          | Description            | Requires Auth | Permission       |
| ------ | --------------------------------- | ---------------------- | ------------- | ---------------- |
| POST   | `/quotation/create-quotation`     | Create a new quotation | Yes           | Quotation:create |
| GET    | `/quotation/get-quotation-all`    | Get all quotations     | Yes           | Quotation:read   |
| GET    | `/quotation/get-quotation/:id`    | Get quotation by ID    | Yes           | Quotation:read   |
| PUT    | `/quotation/update-quotation/:id` | Update quotation       | Yes           | Quotation:update |
| DELETE | `/quotation/delete-quotation/:id` | Delete quotation       | Yes           | Quotation:delete |

### FINANCIAL REPORTS

#### Report Module (`/report`)

| Method | Endpoint                    | Description                   | Requires Auth | Permission            |
| ------ | --------------------------- | ----------------------------- | ------------- | --------------------- |
| GET    | `/report/chart-of-accounts` | Get chart of accounts         | Yes           | Chart_Of_Account:read |
| GET    | `/report/balance-sheet`     | Get balance sheet             | Yes           | Balance_Sheet:read    |
| GET    | `/report/income-statement`  | Get income statement          | Yes           | Income_Statement:read |
| GET    | `/report/owner-security`    | Get owner security report     | Yes           | Owner_Security:read   |
| GET    | `/report/dashboard-statics` | Get dashboard statistics      | Yes           | Dashboard:read        |
| GET    | `/report/voucher-ledger`    | Get voucher ledger            | Yes           | Voucher_Ledger:read   |
| GET    | `/report/general-ledger`    | Get general ledger            | Yes           | General_Ledger:read   |
| GET    | `/report/trial-balance`     | Get trial balance             | Yes           | Trial_Balance:read    |
| GET    | `/report/profit-and-loss`   | Get profit and loss statement | Yes           | Profit_And_Loss:read  |

### BANKING & PAYMENTS

#### Bank Module (`/bank`)

| Method | Endpoint                | Description       | Requires Auth | Permission  |
| ------ | ----------------------- | ----------------- | ------------- | ----------- |
| POST   | `/bank/create-bank`     | Create a new bank | Yes           | Bank:create |
| GET    | `/bank/get-bank-all`    | Get all banks     | Yes           | Bank:read   |
| GET    | `/bank/get-bank/:id`    | Get bank by ID    | Yes           | Bank:read   |
| PUT    | `/bank/update-bank/:id` | Update bank       | Yes           | Bank:update |
| DELETE | `/bank/delete-bank/:id` | Delete bank       | Yes           | Bank:delete |

#### Cheque Module (`/cheque`)

| Method | Endpoint                    | Description         | Requires Auth | Permission    |
| ------ | --------------------------- | ------------------- | ------------- | ------------- |
| POST   | `/cheque/create-cheque`     | Create a new cheque | Yes           | Cheque:create |
| GET    | `/cheque/get-cheque-all`    | Get all cheques     | Yes           | Cheque:read   |
| GET    | `/cheque/get-cheque/:id`    | Get cheque by ID    | Yes           | Cheque:read   |
| PUT    | `/cheque/update-cheque/:id` | Update cheque       | Yes           | Cheque:update |
| DELETE | `/cheque/delete-cheque/:id` | Delete cheque       | Yes           | Cheque:delete |

### HR & PAYROLL

#### Salary Structure Module (`/salary-structure`)

| Method | Endpoint                                        | Description                   | Requires Auth | Permission              |
| ------ | ----------------------------------------------- | ----------------------------- | ------------- | ----------------------- |
| POST   | `/salary-structure/create-salary-structure`     | Create a new salary structure | Yes           | Salary_Structure:create |
| GET    | `/salary-structure/get-salary-structure-all`    | Get all salary structures     | Yes           | Salary_Structure:read   |
| GET    | `/salary-structure/get-salary-structure/:id`    | Get salary structure by ID    | Yes           | Salary_Structure:read   |
| PUT    | `/salary-structure/update-salary-structure/:id` | Update salary structure       | Yes           | Salary_Structure:update |
| DELETE | `/salary-structure/delete-salary-structure/:id` | Delete salary structure       | Yes           | Salary_Structure:delete |

#### Employee Salary Module (`/employee-salary`)

| Method | Endpoint                                      | Description                         | Requires Auth | Permission    |
| ------ | --------------------------------------------- | ----------------------------------- | ------------- | ------------- |
| POST   | `/employee-salary/create-employee-salary`     | Create a new employee salary record | Yes           | Salary:create |
| GET    | `/employee-salary/get-employee-salary-all`    | Get all employee salary records     | Yes           | Salary:read   |
| GET    | `/employee-salary/get-employee-salary/:id`    | Get employee salary by ID           | Yes           | Salary:read   |
| PUT    | `/employee-salary/update-employee-salary/:id` | Update employee salary              | Yes           | Salary:update |
| DELETE | `/employee-salary/delete-employee-salary/:id` | Delete employee salary              | Yes           | Salary:delete |

#### Leave Day Setup Module (`/leave-day-setup`)

| Method | Endpoint                                      | Description                  | Requires Auth | Permission             |
| ------ | --------------------------------------------- | ---------------------------- | ------------- | ---------------------- |
| POST   | `/leave-day-setup/create-leave-day-setup`     | Create a new leave day setup | Yes           | Leave_Day_Setup:create |
| GET    | `/leave-day-setup/get-leave-day-setup-all`    | Get all leave day setups     | Yes           | Leave_Day_Setup:read   |
| GET    | `/leave-day-setup/get-leave-day-setup/:id`    | Get leave day setup by ID    | Yes           | Leave_Day_Setup:read   |
| PUT    | `/leave-day-setup/update-leave-day-setup/:id` | Update leave day setup       | Yes           | Leave_Day_Setup:update |
| DELETE | `/leave-day-setup/delete-leave-day-setup/:id` | Delete leave day setup       | Yes           | Leave_Day_Setup:delete |

#### Leave Apply Module (`/leave-apply`)

| Method | Endpoint                              | Description                    | Requires Auth | Permission         |
| ------ | ------------------------------------- | ------------------------------ | ------------- | ------------------ |
| POST   | `/leave-apply/create-leave-apply`     | Create a new leave application | Yes           | Leave_Apply:create |
| GET    | `/leave-apply/get-leave-apply-all`    | Get all leave applications     | Yes           | Leave_Apply:read   |
| GET    | `/leave-apply/get-leave-apply/:id`    | Get leave application by ID    | Yes           | Leave_Apply:read   |
| PUT    | `/leave-apply/update-leave-apply/:id` | Update leave application       | Yes           | Leave_Apply:update |
| DELETE | `/leave-apply/delete-leave-apply/:id` | Delete leave application       | Yes           | Leave_Apply:delete |

### AUDIT LOGS

#### Activity Log Module (`/audit`)

| Method | Endpoint                               | Description                              | Requires Auth | Permission     |
| ------ | -------------------------------------- | ---------------------------------------- | ------------- | -------------- |
| GET    | `/audit/get-branch-log`                | Get branch activity logs                 | Yes           | Audit_Log:read |
| GET    | `/audit/get-branch-log/:id`            | Get branch activity log by ID            | Yes           | Audit_Log:read |
| GET    | `/audit/get-department-log`            | Get department activity logs             | Yes           | Audit_Log:read |
| GET    | `/audit/get-department-log/:id`        | Get department activity log by ID        | Yes           | Audit_Log:read |
| GET    | `/audit/get-designation-log`           | Get designation activity logs            | Yes           | Audit_Log:read |
| GET    | `/audit/get-designation-log/:id`       | Get designation activity log by ID       | Yes           | Audit_Log:read |
| GET    | `/audit/get-voucher-log`               | Get voucher activity logs                | Yes           | Audit_Log:read |
| GET    | `/audit/get-voucher-log/:id`           | Get voucher activity log by ID           | Yes           | Audit_Log:read |
| GET    | `/audit/get-cheque-log`                | Get cheque activity logs                 | Yes           | Audit_Log:read |
| GET    | `/audit/get-cheque-log/:id`            | Get cheque activity log by ID            | Yes           | Audit_Log:read |
| GET    | `/audit/get-bank-log`                  | Get bank activity logs                   | Yes           | Audit_Log:read |
| GET    | `/audit/get-bank-log/:id`              | Get bank activity log by ID              | Yes           | Audit_Log:read |
| GET    | `/audit/get-employee-log`              | Get employee activity logs               | Yes           | Audit_Log:read |
| GET    | `/audit/get-employee-log/:id`          | Get employee activity log by ID          | Yes           | Audit_Log:read |
| GET    | `/audit/get-role-log`                  | Get role activity logs                   | Yes           | Audit_Log:read |
| GET    | `/audit/get-role-log/:id`              | Get role activity log by ID              | Yes           | Audit_Log:read |
| GET    | `/audit/get-user-log`                  | Get user activity logs                   | Yes           | Audit_Log:read |
| GET    | `/audit/get-user-log/:id`              | Get user activity log by ID              | Yes           | Audit_Log:read |
| GET    | `/audit/get-branch-assign-log`         | Get branch assignment activity logs      | Yes           | Audit_Log:read |
| GET    | `/audit/get-branch-assign-log/:id`     | Get branch assignment activity log by ID | Yes           | Audit_Log:read |
| GET    | `/audit/get-category-log`              | Get category activity logs               | Yes           | Audit_Log:read |
| GET    | `/audit/get-category-log/:id`          | Get category activity log by ID          | Yes           | Audit_Log:read |
| GET    | `/audit/get-subcategory-log`           | Get subcategory activity logs            | Yes           | Audit_Log:read |
| GET    | `/audit/get-subcategory-log/:id`       | Get subcategory activity log by ID       | Yes           | Audit_Log:read |
| GET    | `/audit/get-unit-log`                  | Get unit activity logs                   | Yes           | Audit_Log:read |
| GET    | `/audit/get-unit-log/:id`              | Get unit activity log by ID              | Yes           | Audit_Log:read |
| GET    | `/audit/get-brand-log`                 | Get brand activity logs                  | Yes           | Audit_Log:read |
| GET    | `/audit/get-brand-log/:id`             | Get brand activity log by ID             | Yes           | Audit_Log:read |
| GET    | `/audit/get-product-log`               | Get product activity logs                | Yes           | Audit_Log:read |
| GET    | `/audit/get-product-log/:id`           | Get product activity log by ID           | Yes           | Audit_Log:read |
| GET    | `/audit/get-size-log`                  | Get size activity logs                   | Yes           | Audit_Log:read |
| GET    | `/audit/get-size-log/:id`              | Get size activity log by ID              | Yes           | Audit_Log:read |
| GET    | `/audit/get-color-log`                 | Get color activity logs                  | Yes           | Audit_Log:read |
| GET    | `/audit/get-color-log/:id`             | Get color activity log by ID             | Yes           | Audit_Log:read |
| GET    | `/audit/get-product-variation-log`     | Get product variation activity logs      | Yes           | Audit_Log:read |
| GET    | `/audit/get-product-variation-log/:id` | Get product variation activity log by ID | Yes           | Audit_Log:read |
| GET    | `/audit/get-purchase-log`              | Get purchase activity logs               | Yes           | Audit_Log:read |
| GET    | `/audit/get-purchase-log/:id`          | Get purchase activity log by ID          | Yes           | Audit_Log:read |
| GET    | `/audit/get-purchase-return-log`       | Get purchase return activity logs        | Yes           | Audit_Log:read |
| GET    | `/audit/get-purchase-return-log/:id`   | Get purchase return activity log by ID   | Yes           | Audit_Log:read |
| GET    | `/audit/get-sales-return-log`          | Get sales return activity logs           | Yes           | Audit_Log:read |
| GET    | `/audit/get-sales-return-log/:id`      | Get sales return activity log by ID      | Yes           | Audit_Log:read |
| GET    | `/audit/get-sales-log`                 | Get sales activity logs                  | Yes           | Audit_Log:read |
| GET    | `/audit/get-sales-log/:id`             | Get sales activity log by ID             | Yes           | Audit_Log:read |
| GET    | `/audit/get-quotation-log`             | Get quotation activity logs              | Yes           | Audit_Log:read |
| GET    | `/audit/get-quotation-log/:id`         | Get quotation activity log by ID         | Yes           | Audit_Log:read |
| GET    | `/audit/get-service-log`               | Get service activity logs                | Yes           | Audit_Log:read |
| GET    | `/audit/get-service-log/:id`           | Get service activity log by ID           | Yes           | Audit_Log:read |
| GET    | `/audit/get-service-sales-log`         | Get service sales activity logs          | Yes           | Audit_Log:read |
| GET    | `/audit/get-service-sales-log/:id`     | Get service sales activity log by ID     | Yes           | Audit_Log:read |
| GET    | `/audit/get-leave-apply-log`           | Get leave application activity logs      | Yes           | Audit_Log:read |
| GET    | `/audit/get-leave-apply-log/:id`       | Get leave application activity log by ID | Yes           | Audit_Log:read |
| GET    | `/audit/get-leave-day-setup-log`       | Get leave day setup activity logs        | Yes           | Audit_Log:read |
| GET    | `/audit/get-leave-day-setup-log/:id`   | Get leave day setup activity log by ID   | Yes           | Audit_Log:read |
| GET    | `/audit/get-salary-structure-log`      | Get salary structure activity logs       | Yes           | Audit_Log:read |
| GET    | `/audit/get-salary-structure-log/:id`  | Get salary structure activity log by ID  | Yes           | Audit_Log:read |
| GET    | `/audit/get-salary-log`                | Get employee salary activity logs        | Yes           | Audit_Log:read |
| GET    | `/audit/get-salary-log/:id`            | Get employee salary activity log by ID   | Yes           | Audit_Log:read |

### FILE UPLOAD

#### File Upload Module (`/file`)

| Method | Endpoint       | Description  | Requires Auth | Permission  |
| ------ | -------------- | ------------ | ------------- | ----------- |
| POST   | `/file/upload` | Upload files | Yes           | File:upload |

---

## Modules Overview

### Core Accounting Modules

- **Group:** Top-level account categories (Assets, Liabilities, Equity, Revenue, Expenses)
- **Ledger:** Individual account ledgers under groups
- **Particular:** Customers, suppliers, and third-party accounts
- **Voucher:** Journal entries that record financial transactions

### Business Operations Modules

- **User:** User account management and authentication
- **Employee:** Employee records and profiles
- **Department/Designation:** Organizational structure
- **Branch:** Multi-location support with branch-level data isolation
- **Role:** Role-based access control

### Inventory & Sales Modules

- **Product:** Product catalog management
- **Category/SubCategory:** Product categorization
- **Brand/Unit/Size/Color:** Product attributes
- **Purchase/Sales:** Transaction processing
- **Purchase Return/Sales Return:** Return processing

### Financial Reporting Modules

- **Reports:** Financial statements and analytics
- **Dashboard:** Key performance indicators

### Banking & HR Modules

- **Bank/Cheque:** Banking operations
- **Salary Structure:** Payroll configuration
- **Leave Management:** Time-off tracking

---

## Error Handling

### HTTP Status Codes

| Code | Description                                               |
| ---- | --------------------------------------------------------- |
| 200  | Success                                                   |
| 201  | Created                                                   |
| 400  | Bad Request - Validation error or business rule violation |
| 401  | Unauthorized - Invalid or missing authentication          |
| 403  | Forbidden - Insufficient permissions                      |
| 404  | Not Found - Resource doesn't exist                        |
| 422  | Unprocessable Entity - Validation failed                  |
| 500  | Internal Server Error - Unexpected server error           |

### Common Error Responses

**Authentication Error:**

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Permission Error:**

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Forbidden access permission"
}
```

**Validation Error:**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

**Resource Not Found:**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "User not found"
}
```

---

## Rate Limiting & Security

### Security Features

- Helmet.js for HTTP header security
- CORS configured for cross-origin requests
- Rate limiting to prevent abuse
- Input validation and sanitization
- JWT token security with configurable expiration
- Encrypted password storage (bcrypt)

### Request Limits

- JSON payload: 4MB limit
- URL-encoded: Extended support
- File uploads: Configured via multer

### IP Tracking

- All user actions are logged with IP addresses
- Activity logs maintain audit trails

---

## Query Parameters

Many endpoints support these common query parameters:

| Parameter   | Type    | Description                                   |
| ----------- | ------- | --------------------------------------------- |
| `page`      | Integer | Page number for pagination (default: 1)       |
| `size`      | Integer | Items per page (default: 10)                  |
| `search`    | String  | Search term for filtering                     |
| `branchId`  | Integer | Filter by branch ID                           |
| `sortOrder` | String  | Sort order ('asc' or 'desc', default: 'desc') |
| `fromDate`  | Date    | Filter from date                              |
| `toDate`    | Date    | Filter to date                                |

### Example with Query Parameters

```
GET /api/v1/user/get-user-all?page=1&size=10&search=john&branchId=1&sortOrder=asc
```

---

## Response Meta Information

Paginated responses include metadata:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users retrieved successfully",
  "data": [...],
  "meta": {
    "page": "1",
    "size": 10,
    "total": 100,
    "totalPage": 10
  }
}
```

---

## Development Notes

### Double-Entry Accounting

- All financial transactions must balance debits and credits
- Voucher creation enforces accounting rules
- Ledger balances are maintained automatically

### Branch Isolation

- Data is isolated by branch
- Users can only access data from assigned branches
- Cross-branch operations require special permissions

### Audit Trail

- All changes are logged in user logs
- Activity logs track system events
- Compliance-ready audit trail maintained

---

## Environment Variables

Required environment variables for proper operation:

```
PORT=3000
AUTH_TOKEN=your_jwt_secret
AUTH_TOKEN_EXPIRES_IN=15d
REFRESH_TOKEN=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=30d
OTP_TOKEN=your_otp_token_secret
OTP_TOKEN_EXPIRES_IN=15m
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_SECRET_KEY=your_cloudinary_secret_key
DATABASE_URL=your_database_url
```

---

## API Usage Examples

### Creating a New User

**Request:**

```http
POST /api/v1/user/create-user
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123",
  "employeeId": 1,
  "roleId": 2,
  "isActive": true
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "User Created Successfully",
  "data": {
    "id": 1,
    "email": "john@example.com",
    "employeeId": 1,
    "roleId": 2,
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### User Login

**Request:**

```http
POST /api/v1/user/login-user
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Admin",
    "branches": [
      {
        "id": 1,
        "name": "Main Branch",
        "address": "123 Main St"
      }
    ],
    "permissions": [
      {
        "id": 1,
        "module": "User",
        "action": "create",
        "isAllowed": true
      }
    ]
  }
}
```

### Creating a Product

**Request:**

```http
POST /api/v1/product/create-product
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Laptop",
  "categoryId": 1,
  "brandId": 1,
  "unitId": 1,
  "sellingPrice": 1200,
  "costPrice": 1000,
  "sku": "LAPTOP001"
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Product Created Successfully",
  "data": {
    "id": 1,
    "name": "Laptop",
    "categoryId": 1,
    "brandId": 1,
    "unitId": 1,
    "sellingPrice": 1200,
    "costPrice": 1000,
    "sku": "LAPTOP001",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Getting All Products with Pagination

**Request:**

```http
GET /api/v1/product/get-product-all?page=1&size=10&branchId=1
Authorization: Bearer <JWT_TOKEN>
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Laptop",
      "categoryId": 1,
      "brandId": 1,
      "sellingPrice": 1200
    }
  ],
  "meta": {
    "page": "1",
    "size": 10,
    "total": 25,
    "totalPage": 3
  }
}
```

### Creating a Voucher (Journal Entry)

**Request:**

```http
POST /api/v1/voucher/create-voucher
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "voucherType": "JV", // Journal Voucher
  "date": "2023-01-01",
  "referenceNo": "JV-001",
  "description": "Office supplies purchase",
  "branchId": 1,
  "voucherDetails": [
    {
      "ledgerId": 1,
      "particularId": 1,
      "debitAmount": 500,
      "creditAmount": 0
    },
    {
      "ledgerId": 2,
      "particularId": 2,
      "debitAmount": 0,
      "creditAmount": 500
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Voucher Created Successfully",
  "data": {
    "id": 1,
    "voucherType": "JV",
    "date": "2023-01-01T00:00:00.000Z",
    "referenceNo": "JV-001",
    "description": "Office supplies purchase",
    "branchId": 1,
    "totalDebit": 500,
    "totalCredit": 500,
    "voucherDetails": [
      {
        "id": 1,
        "ledgerId": 1,
        "particularId": 1,
        "debitAmount": 500,
        "creditAmount": 0
      }
    ]
  }
}
```

## SDK and Client Implementation Tips

### JavaScript/Node.js Client Example

```javascript
// Example API client
const axios = require("axios");

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Set auth token
const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

// User login
const login = async (email, password) => {
  try {
    const response = await apiClient.post("/user/login-user", {
      email,
      password,
    });
    const { token } = response.data;
    setAuthToken(token);
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message);
  }
};

// Create product
const createProduct = async (productData) => {
  try {
    const response = await apiClient.post(
      "/product/create-product",
      productData
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.message);
  }
};
```

### Authentication Flow

1. **Login:** Call `/user/login-user` with credentials
2. **Store Token:** Save the JWT token securely (localStorage, secure cookies, etc.)
3. **Set Header:** Include token in Authorization header for protected endpoints
4. **Handle Expiry:** Implement token refresh mechanism when needed
5. **Logout:** Clear stored token

### Error Handling Best Practices

```javascript
// Generic error handler
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    switch (error.response.status) {
      case 400:
        console.error("Validation error:", error.response.data.message);
        break;
      case 401:
        console.error("Authentication required");
        // Redirect to login
        break;
      case 403:
        console.error("Access forbidden");
        break;
      case 404:
        console.error("Resource not found");
        break;
      case 500:
        console.error("Server error");
        break;
      default:
        console.error("Unexpected error:", error.response.data.message);
    }
  } else if (error.request) {
    // Request was made but no response received
    console.error("Network error");
  } else {
    // Something else happened
    console.error("Error:", error.message);
  }
};
```

### Common Integration Patterns

#### 1. User Registration Flow

- Create employee record
- Create user account with employee reference
- Assign to appropriate branch
- Assign role and permissions

#### 2. Product Catalog Management

- Create categories and subcategories
- Add brands and units
- Create products with variations
- Manage inventory levels

#### 3. Financial Transactions

- Create vouchers for all transactions
- Ensure debit/credit balance
- Link to appropriate ledgers and particulars
- Maintain audit trail

---

This comprehensive API documentation provides all the necessary information for developers to integrate with the Accounts Backend System effectively while maintaining security and data integrity.
