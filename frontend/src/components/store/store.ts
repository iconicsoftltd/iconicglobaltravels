import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./api/user/userSlice";
import { apiSlice } from "./rootApi/apiSlice";
import permissionsReducer from "./api/premission/permissionsSlice";
import branchesReducer from "./api/premission/branchesSlice";
import currencyReducer from "./currency/currencySlice";

export const store: any = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    user: userReducer,
    permissions: permissionsReducer,
    branches: branchesReducer,
    currencies: currencyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// Selectors
export const selectUser = (state: RootState) => state.user;
export const selectPermissions = (state: RootState) => state.permissions.list;
export const selectPermissionsLoaded = (state: RootState) => state.permissions.loaded;
export const selectBranches = (state: RootState) => state.branches.list;
export const selectBranchesLoaded = (state: RootState) => state.branches.loaded;
export const selectCurrencies = (state: RootState) => state.currencies.list;
export const selectCurrentCurrency = (state: RootState) => state.currencies.currentCurrency;
export const selectCurrenciesLoaded = (state: RootState) => state.currencies.loaded;
// ✅ নতুন selector
export const selectDatePermission = (state: RootState) => 
  state.permissions.datePermission;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
