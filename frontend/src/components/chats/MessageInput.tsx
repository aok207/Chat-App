/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendMessage, updateMessage } from "@/api/messages";
import { useAppSelector } from "@/hooks/useRedux";
import { showToast } from "@/lib/utils";
import { socket } from "@/sockets/sockets";
import { MessageType } from "@/types/types";
import { Check, Paperclip, Send, Smile } from "lucide-react";
import React, { ChangeEvent, forwardRef, useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import EmojiPicker from "./EmojiPicker";
import { v4 as uuidv4 } from "uuid";
import { ScrollArea } from "../ui/scroll-area";
import useSound from "@/hooks/useSound";

type MessageInputProps = {
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  lastEle: HTMLDivElement | null;
  messageReplyingTo: MessageType | null;
  setReplyingMessage: React.Dispatch<React.SetStateAction<MessageType | null>>;
  editingMessage: MessageType | null;
  setEditingMessage: React.Dispatch<React.SetStateAction<MessageType | null>>;
};

const MessageInput = forwardRef<HTMLTextAreaElement | null, MessageInputProps>(
  (
    {
      setMessages,
      lastEle,
      messageReplyingTo,
      setReplyingMessage,
      editingMessage,
      setEditingMessage,
    },
    messageInputRef
  ) => {
    const { id } = useParams();

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const userId = useAppSelector((state) => state.auth.user?._id);
    const queryClient = useQueryClient();

    const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);

    // sounds
    const sentSound = useSound("/sounds/message-sent.mp3");

    // function to safely get the current value of the ref
    const getTextareaValue = () => {
      if (typeof messageInputRef === "function") {
        return null;
      } else {
        return messageInputRef!.current;
      }
    };

    const { mutate, isLoading } = useMutation({
      mutationFn: sendMessage,
      onSuccess: (data) => {
        sentSound.play();
        socket.emit("changed messages", id);
        const message = data.data;
        lastEle?.scrollIntoView({ behavior: "smooth" });
        setMessages((prev) => [...prev.slice(0, prev.length - 1), message]);
        queryClient.invalidateQueries(["chats"]);
      },
      onError: (err: any) => {
        setMessages((prev) => [
          ...prev.slice(0, prev.length - 1),
          { ...prev[prev.length - 1], status: "error" },
        ]);
        console.log(err);
        showToast("error", err.response.data.error || err.message);
      },
    });

    const editMessageMutation = useMutation({
      mutationFn: updateMessage,

      onSuccess: (data) => {
        const message = data.data;
        socket.emit("changed messages", id);
        setMessages((prv) =>
          prv.map((m) => {
            if (m._id === message._id) {
              return message;
            } else {
              return m;
            }
          })
        );

        queryClient.invalidateQueries(["chats"]);
      },

      onError: (err: any) => {
        console.log(err);
        showToast("error", err.response.data.error || err.message);
      },
    });

    const adjustTextareaHeight = () => {
      const textarea = getTextareaValue();
      if (textarea) {
        if (textarea.scrollHeight > 128) {
          textarea.style.height = "128px";
          return;
        }

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

      if (
        !getTextareaValue()?.value ||
        isLoading ||
        editMessageMutation.isLoading
      ) {
        return;
      }

      socket.emit("stopped typing to", id);

      if (editingMessage === null) {
        setMessages((prev) => [
          ...prev,
          {
            _id: uuidv4(),
            content: getTextareaValue()?.value,
            status: "sending",
            createdAt: new Date(),
            updatedAt: new Date(),
            receiverId: [id as string],
            edited: false,
            replyingTo: messageReplyingTo?._id,
            senderId: userId,
            type: "text",
            reactions: {},
            file: null,
          } as MessageType,
        ]);

        const formData = new FormData();

        formData.append("message", getTextareaValue()!.value);

        if (messageReplyingTo) {
          formData.append("replyingTo", messageReplyingTo._id);
        }

        mutate({ receiverId: id as string, data: formData });
      } else {
        editMessageMutation.mutate({
          id: editingMessage._id,
          content: getTextareaValue()!.value,
        });
      }

      getTextareaValue()!.value = "";

      adjustTextareaHeight();

      lastEle?.scrollIntoView({ behavior: "smooth" });

      // cleanups
      setReplyingMessage(null);
      setEditingMessage(null);
      getTextareaValue()!.placeholder = "Write a message...";
    };

    const handleInput = () => {
      adjustTextareaHeight();
      const message = getTextareaValue()?.value;

      if (message === "") {
        socket.emit("stopped typing to", id);
      } else {
        socket.emit("typing to", id);
      }
    };

    // handle file upload
    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
      const uploadedFile = e.target.files![0];

      if (!uploadedFile) return;

      setMessages((prev) => [
        ...prev,
        {
          _id: uuidv4(),
          content: null,
          status: "sending",
          createdAt: new Date(),
          updatedAt: new Date(),
          receiverId: [id as string],
          senderId: userId,
          replyingTo: messageReplyingTo?._id,
          type: uploadedFile.type.split("/")[0],
          reactions: {},
          file: {
            name: uploadedFile.name,
            size: uploadedFile.size,
            url: URL.createObjectURL(uploadedFile),
          },
        } as MessageType,
      ]);

      const formData = new FormData();
      formData.append("file", uploadedFile, uploadedFile.name);

      if (messageReplyingTo) {
        formData.append("replyingTo", messageReplyingTo._id);
      }

      mutate({ receiverId: id as string, data: formData });

      e.target.value = "";

      setReplyingMessage(null);
      getTextareaValue()!.placeholder = "Write a message...";
    };

    return (
      <div className="sticky z-50 bottom-0 shadow-2xl left-0 right-0 bg-white dark:bg-black">
        <div className="w-full items-center px-3 py-3 flex gap-4 relative">
          {/* File Input */}
          <input
            type="file"
            name="file"
            ref={fileInputRef}
            hidden
            onChange={handleFileUpload}
          />
          <button onClick={() => fileInputRef.current?.click()}>
            <Paperclip />
          </button>

          {/* Input field */}
          <textarea
            ref={messageInputRef}
            placeholder="Write a message..."
            className="flex-grow no-scrollbar resize-none leading-6 bg-transparent focus:outline-none pr-4 pl-2"
            onChange={handleInput}
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
            disabled={isLoading || editMessageMutation.isLoading}
          >
            {editingMessage ? <Check /> : <Send />}
          </button>

          {/* Emoji picker */}
          {isEmojiPickerVisible && (
            <div className="absolute bottom-full right-10 z-50">
              <EmojiPicker
                isReaction={false}
                onEmojiClick={(emojiData) => {
                  console.log(emojiData);
                  getTextareaValue()!.value += emojiData.emoji;
                  getTextareaValue()?.focus();
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default MessageInput;
