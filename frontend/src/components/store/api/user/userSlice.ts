import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  id: string | null;
  email: string | null;
  role: string | null;
  branchId: number | null;
  address: string | null;
  phone:string | null;
  name: string | null;
  image: string | null; 
}

const initialState: UserState = {
  id: null,
  email: null,
  role: null,
  branchId: null,
  address: null,
  name: null,
  image:null,
  phone:null
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state: UserState, action: PayloadAction<UserState>) => {
      state.id = action.payload.id;
      state.role = action.payload.role;
      state.branchId = action.payload.branchId;
      state.email = action.payload.email;
      state.address = action.payload.address;
      state.name = action.payload.name;
      state.image=action.payload.image;
      state.phone=action.payload.phone;
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
