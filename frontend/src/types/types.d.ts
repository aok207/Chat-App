export type UserType = {
  name: string;
  email: string;
  avatar: string | null;
  isOnline: boolean;
};

export interface IUserAuthInputs {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
}
