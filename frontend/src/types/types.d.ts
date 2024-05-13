export type UserType = {
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
