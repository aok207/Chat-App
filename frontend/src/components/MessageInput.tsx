/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendMessage } from "@/api/messages";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { debounce, showToast } from "@/lib/utils";
import { socket } from "@/sockets/sockets";
import { MessageType } from "@/types/types";
import { Paperclip, Send, Smile } from "lucide-react";
import React, { ChangeEvent, useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import EmojiPicker from "./EmojiPicker";
import {
  addMessageInput,
  removeMessageInput,
} from "@/slices/messageInputSlice";
import { v4 as uuidv4 } from "uuid";

const MessageInput = ({
  setMessages,
  lastEle,
}: {
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  lastEle: HTMLDivElement | null;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { id } = useParams();

  const typingMessage = useAppSelector(
    (state) => state.messageInput[id as string]
  );

  const [message, setMessage] = useState<string>(
    typingMessage && typingMessage.length < 2 ? "" : typingMessage
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const userId = useAppSelector((state) => state.auth.user?._id);
  const queryClient = useQueryClient();

  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);

  const dispatch = useAppDispatch();

  const { mutate, isLoading } = useMutation({
    mutationFn: sendMessage,
    onSuccess: (data) => {
      socket.emit("send message", id);
      const message = data.data;
      lastEle?.scrollIntoView({ behavior: "smooth" });
      setMessages((prev) => [...prev.slice(0, prev.length - 1), message]);
      queryClient.invalidateQueries(["chats"]);
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

    if (!message) {
      return;
    }

    socket.emit("stopped typing to", id);

    setMessages((prev) => [
      ...prev,
      {
        _id: uuidv4(),
        content: message,
        status: "sending",
        createdAt: new Date(),
        updatedAt: new Date(),
        receiverId: [id as string],
        senderId: userId,
        type: "text",
        reactions: {},
        file: null,
      } as MessageType,
    ]);

    const formData = new FormData();
    formData.append("message", message);

    mutate({ receiverId: id as string, data: formData });

    setMessage("");

    dispatch(removeMessageInput(id!));

    adjustTextareaHeight();

    lastEle?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInput = () => {
    adjustTextareaHeight();
    setMessage(textareaRef.current!.value);
    const debouncedDispatch = debounce(dispatch, 300);

    if (message === "") {
      socket.emit("stopped typing to", id);

      // remove it from redux
      debouncedDispatch(addMessageInput({ id: id!, message }));
    } else {
      // save it to redux
      debouncedDispatch(addMessageInput({ id: id!, message }));

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
        content: "hi",
        status: "sending",
        createdAt: new Date(),
        updatedAt: new Date(),
        receiverId: [id as string],
        senderId: userId,
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

    mutate({ receiverId: id as string, data: formData });

    e.target.value = "";
  };

  return (
    <div className="sticky bottom-0 shadow-2xl left-0 right-0 bg-white dark:bg-black">
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
          ref={textareaRef}
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
          value={message}
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
              onEmojiClick={(emojiData) => {
                console.log(emojiData);
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
