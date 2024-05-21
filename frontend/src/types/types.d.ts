export type UserType = {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  isOnline: boolean;
  provider: "google" | "github" | null;
};

export interface IUserAuthInputs {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface IUsernameInput {
  name: string;
}

export interface IResetPasswordInputs {
  password: string;
  confirmPassword: string;
}

export interface IUpdateProfileInputs {
  profilePicture?: FileList;
  email: string;
}

export interface IUpdatePasswordInputs {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

export interface IDeleteAccountInput {
  password: string;
}
