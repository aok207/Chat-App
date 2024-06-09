import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface UsersState {
  friends: [
    {
      id: string;
      chatId: string;
    }
  ];
}

const initialState: UsersState = JSON.parse(
  localStorage.getItem("users") || "null"
) || { friends: [] };

/*
  Once the user finds and click on another user, a new chat will be created on the server 
  and they will added to the friends.
  These friends are used to make sure that the user doesn't create a new chat 
  with the same user twice, in the frontend.
*/

export const UsersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    addFriends: (
      state,
      action: PayloadAction<{
        id: string;
        chatId: string;
      }>
    ) => {
      state.friends.push(action.payload);
      localStorage.setItem("users", JSON.stringify(state));
    },
  },
});

export const { addFriends } = UsersSlice.actions;

export default UsersSlice.reducer;
