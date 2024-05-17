import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface UiState {
  searchQuery: string;
  currentPage: "chats-list" | "search";
}

const initialState: UiState = JSON.parse(
  localStorage.getItem("ui") || '{"searchQuery": "","currentPage":"chats-list"}'
);

export const UiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      localStorage.setItem("ui", JSON.stringify(state));
    },
    setCurrentPage: (state, action: PayloadAction<"chats-list" | "search">) => {
      state.currentPage = action.payload;
      localStorage.setItem("ui", JSON.stringify(state));
    },
  },
});

export const { setSearchQuery, setCurrentPage } = UiSlice.actions;

export default UiSlice.reducer;
