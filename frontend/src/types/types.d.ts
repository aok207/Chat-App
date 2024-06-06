declare global {
  interface Window {
    cloudinary: unknown;
  }
}

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
  latestMessageType: string;
};

export type MessageType = {
  _id: string;
  senderId: string;
  receiverId: string[];
  replyingTo: string | null;
  content: string | null;
  file: FileType | null;
  status: string;
  reactions: {
    [emojiId: string]: string[];
  };
  type: string | null;
  mimeType: string | null;
  edited: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ReactionsResponseType = {
  data: {
    [emoji: string]: UserType[];
  };
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

export type FileType = {
  url: string;
  name: string;
  size: number;
};
