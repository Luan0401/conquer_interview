import { createSlice } from "@reduxjs/toolkit";

const initialState = null;

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => action.payload, // Lưu thông tin user
    logout: () => initialState,              // Xóa thông tin khi logout
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;