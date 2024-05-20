import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface UiState {
  searchQuery: string;
  currentPage: "chats-list" | "search" | "settings" | "single-chat";
}

const initialState: UiState = JSON.parse(
  localStorage.getItem("ui") || '{"searchQuery": "","currentPage":"chats-list"}'
);

/* 
This slice is mostly for the ui in mobile
- if chats-list , we'll show the list of chats
- if search , we'll show the search component
- if settings , we'll show the settings
- if single-chat , we'll show the individual chat page
in the layout component
We'll show things normally in the bigger screen size
*/

export const UiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      localStorage.setItem("ui", JSON.stringify(state));
    },
    setCurrentPage: (
      state,
      action: PayloadAction<
        "chats-list" | "search" | "settings" | "single-chat"
      >
    ) => {
      state.currentPage = action.payload;
      localStorage.setItem("ui", JSON.stringify(state));
    },
  },
});

export const { setSearchQuery, setCurrentPage } = UiSlice.actions;

export default UiSlice.reducer;
