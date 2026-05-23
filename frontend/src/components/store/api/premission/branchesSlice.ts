import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BranchesState {
  list: any[];
  loaded: boolean;
}

const initialState: BranchesState = {
  list: [],
  loaded: false,
};

const branchesSlice = createSlice({
  name: "branches",
  initialState,
  reducers: {
    setBranches(state, action: PayloadAction<any[]>) {
      state.list = action.payload;
      state.loaded = true;
    },
    clearBranches(state) {
      state.list = [];
      state.loaded = false;
    },
  },
});

export const { setBranches, clearBranches } = branchesSlice.actions;
export default branchesSlice.reducer;
