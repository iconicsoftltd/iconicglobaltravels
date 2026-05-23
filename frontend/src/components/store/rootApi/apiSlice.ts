import { appConfiguration } from "@/utils/constant/appConfiguration";
import { shareWithCookies } from "@/utils/helper/shareWithCookies";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = appConfiguration.baseUrl2 || appConfiguration.baseUrl;
const customBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders(headers) {
    headers.set(
      "Authorization",
      `Bearer ${shareWithCookies("get", `${appConfiguration.appCode}token`)}`
    );
    return headers;
  },
});

export const API_TAG_TYPES = [
  "permission",
  "file",
  "branch",
  "role",
  "employee",
  "user",
  "userPermission",
  "department",
  "designation",
  "branchAssign",
  "group",
  "ledger",
  "voucher",
  "particular",
  "brand",
  "unit",
  "category",
  "subcategory",
  "product",
  "size",
  "color",
  "productVariation",
  "BalanceSheet",
  "chartOfAccounts",
  "purchase",
  "purchase-return",
  "sales",
  "incomeStatement",
  "ownerSecurity",
  "sales-return",
  "quotation",
  "salary-structure",
  "leave-day-setup",
  "leave-apply",
  "employee-salary",
  "service",
  "service-sales",
  "bank",
  "cheque",
  "auditLog",
  "dashboardStatics",
  "employeeSalary",
];

export const apiSlice = createApi({
  reducerPath: "apiSlice",
  baseQuery: customBaseQuery,
  endpoints: () => ({}),
  tagTypes: API_TAG_TYPES,
});
