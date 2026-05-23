import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PermissionState {
  list: any[];
  loaded: boolean;
  datePermission: DatePermission; // ✅ নতুন
}
interface DatePermission {
  read: boolean;
  create: boolean;
}
const initialState: PermissionState = {
  list: [],
  loaded: false,
  datePermission: { read: false, create: false }, // ✅ নতুন
};

const permissionSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    setPermissions(state, action: PayloadAction<any[]>) {
      state.list = action.payload;
      state.loaded = true;
    },
    clearPermissions(state) {
      state.list = [];
      state.loaded = false;
            state.datePermission = { read: false, create: false };
    },
      // ✅ নতুন reducer
    setDatePermission(state, action: PayloadAction<DatePermission>) {
      state.datePermission = action.payload;
    },
  },
});

export const { setPermissions, clearPermissions, setDatePermission } = permissionSlice.actions;
export default permissionSlice.reducer;
