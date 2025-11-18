import { createSlice } from "@reduxjs/toolkit";

const initialState = null;

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => action.payload, // Lưu thông tin user
    logout: () => initialState,              // Xóa thông tin khi logout
    updateUser: (state, action) => {
      // Cập nhật thông tin user
      if (state) {
        return { ...state, ...action.payload };
      }
      return action.payload;
    },
  },
});

export const { login, logout, updateUser } = userSlice.actions;
export default userSlice.reducer;