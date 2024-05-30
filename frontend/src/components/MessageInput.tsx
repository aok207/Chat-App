import { sendMessage } from "@/api/messages";
import { useAppSelector } from "@/hooks/hooks";
import { showToast } from "@/lib/utils";
import { socket } from "@/sockets/sockets";
import { MessageType } from "@/types/types";
import { Send, Smile } from "lucide-react";
import React, { useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import EmojiPicker from "./EmojiPicker";

const MessageInput = ({
  setMessages,
  lastEle,
}: {
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  lastEle: HTMLDivElement | null;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { id } = useParams();
  const userId = useAppSelector((state) => state.auth.user?._id);
  const queryClient = useQueryClient();

  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);

  const { mutate, isLoading } = useMutation({
    mutationFn: sendMessage,
    onSuccess: (data) => {
      socket.emit("send message", id);
      const message = data.data;

      setMessages((prev) => [...prev.slice(0, prev.length - 1), message]);
      queryClient.invalidateQueries(["chats"]);

      lastEle?.scrollIntoView({ behavior: "smooth" });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      setMessages((prev) => [
        ...prev.slice(0, prev.length - 1),
        { ...prev[prev.length - 1], status: "error" },
      ]);
      console.log(err);
      showToast("error", err.response.data.error || err.message);
    },
  });

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      if (textarea.value === "" || textarea.scrollHeight < 48) {
        textarea.style.height = "22px";
        return;
      }
      textarea.style.height = "auto"; // Reset the height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set the height to the scroll height
    }
  };

  const handleSendMessage = () => {
    setIsEmojiPickerVisible(false);

    const content = textareaRef.current?.value;

    if (!content) {
      return;
    }

    socket.emit("stopped typing to", id);

    setMessages((prev) => [
      ...prev,
      {
        _id: "temp",
        content,
        status: "sending",
        createdAt: new Date(),
        updatedAt: new Date(),
        receiverId: id,
        senderId: userId,
      } as MessageType,
    ]);

    mutate({ receiverId: id as string, content });

    textareaRef.current!.value = "";
    adjustTextareaHeight();
  };

  const handleInput = () => {
    adjustTextareaHeight();

    if (textareaRef.current?.value === "") {
      socket.emit("stopped typing to", id);
    } else {
      socket.emit("typing to", id);
    }
  };

  return (
    <div className="sticky bottom-0 shadow-2xl left-0 right-0 bg-white dark:bg-black">
      <div className="w-full items-center px-3 py-3 flex gap-2 relative">
        <textarea
          ref={textareaRef}
          placeholder="Write a message..."
          className="flex-grow no-scrollbar resize-none leading-6 bg-transparent focus:outline-none px-4"
          onInput={handleInput} // Adjust height on input
          style={{ height: "22px" }} // Initial height
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter") {
              if (!e.shiftKey) {
                e.preventDefault();
                if (e.currentTarget.value === "") {
                  return;
                }
                handleSendMessage();
              }
            }
          }}
        ></textarea>
        <button
          className="flex-shrink-0"
          onClick={() => setIsEmojiPickerVisible((prv) => !prv)}
        >
          <Smile />
        </button>

        <button
          className="flex-shrink-0"
          onClick={handleSendMessage}
          disabled={isLoading}
        >
          <Send />
        </button>

        {/* Emoji picker */}
        {isEmojiPickerVisible && (
          <div className="absolute bottom-full right-10">
            <EmojiPicker
              isReaction={false}
              onClick={(emojiData) => {
                textareaRef.current!.value += emojiData.emoji;
                textareaRef.current?.focus();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
