import { useAppSelector } from "@/hooks/useRedux";
import { MessageType, UserType } from "@/types/types";
import { X } from "lucide-react";
import React from "react";

type ReplyingToProps = {
  messageReplyingTo: MessageType;
  participents: UserType[];
  setReplyingMessage: React.Dispatch<React.SetStateAction<MessageType | null>>;
  messageInputTextarea: HTMLTextAreaElement | null;
  editingMessage: MessageType | null;
  setEditingMessage: React.Dispatch<React.SetStateAction<MessageType | null>>;
};

const DetailMode = ({
  messageReplyingTo,
  participents,
  setReplyingMessage,
  messageInputTextarea,
  editingMessage,
  setEditingMessage,
}: ReplyingToProps) => {
  const user = useAppSelector((state) => state.auth.user);

  const replyingMessageSender = participents.find(
    (user) => user._id === messageReplyingTo?.senderId
  );

  const exitState = () => {
    if (editingMessage) {
      setEditingMessage(null);
    } else {
      setReplyingMessage(null);
    }
    messageInputTextarea!.placeholder = "Write a message...";
    messageInputTextarea!.value = "";
  };

  if (editingMessage) {
    return (
      <div className="w-full py-2 px-2 flex items-center justify-between bg-zinc-300 dark:bg-gray-700">
        <span className="text-sm font-semibold">Edit Message</span>
        <button onClick={exitState}>
          <X />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full py-1.5 px-2 flex justify-between bg-zinc-300 dark:bg-gray-700">
      <div className="flex gap-2 w-[70%]">
        {messageReplyingTo?.type === "image" && (
          <img className="w-[80px]" src={messageReplyingTo?.file?.url} />
        )}
        <div className="w-full flex flex-col gap-1">
          <strong className="text-sm">
            {replyingMessageSender?.name || user?.name}
          </strong>
          <i className="truncate w-full">
            {messageReplyingTo?.type === "text"
              ? messageReplyingTo?.content
              : messageReplyingTo?.type === "video"
              ? "Audio Message"
              : `${
                  messageReplyingTo!.type![0]!.toUpperCase() +
                  messageReplyingTo!.type!.slice(1)
                } Message`}
          </i>
        </div>
      </div>
      <button onClick={exitState}>
        <X />
      </button>
    </div>
  );
};

export default DetailMode;
