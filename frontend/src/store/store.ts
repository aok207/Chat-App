import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/slices/authSlice";
import uiReducer from "@/slices/uiSlice";
import usersReducer from "@/slices/usersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    users: usersReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
