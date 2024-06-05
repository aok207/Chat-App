import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// This slice is used to store the message if the user go to another route

export interface MessageInputState {
  [id: string]: string;
}

const initialState: MessageInputState =
  JSON.parse(localStorage.getItem("messageInput") || "null") || {};

export const messageInputSlice = createSlice({
  name: "messageInput",
  initialState,
  reducers: {
    addMessageInput: (
      state,
      action: PayloadAction<{
        id: string;
        message: string;
      }>
    ) => {
      state[action.payload.id] = action.payload.message;
      localStorage.setItem("messageInput", JSON.stringify(state));
    },
    removeMessageInput: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
      localStorage.setItem("messageInput", JSON.stringify(state));
    },
  },
});

export const { addMessageInput, removeMessageInput } =
  messageInputSlice.actions;

export default messageInputSlice.reducer;
