import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { UserType } from "@/types/types";

export interface AuthState {
  isAuthenticated: boolean;
  user: null | UserType;
}

const initialState: AuthState = JSON.parse(
  localStorage.getItem("auth") || '{"isAuthenticated":false,"user":null}'
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<UserType>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      localStorage.setItem("auth", JSON.stringify(state));
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem("auth");
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
