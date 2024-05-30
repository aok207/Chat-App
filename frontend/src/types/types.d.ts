export type UserType = {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  isOnline: boolean;
  lastOnline: Date | null;
};

export type ChatResponseType = {
  latestMessage: string | null;
  latestTime: Date | null;
  latestMessageStatus: string | null;
  latestMessageSenderId: string;
  otherUser: UserType;
};

export type MessageType = {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
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
