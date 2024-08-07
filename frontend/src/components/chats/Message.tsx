/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CheckCheck,
  CircleX,
  CornerDownRight,
  Download,
  EllipsisVertical,
  FileMinus,
  Forward,
  Pencil,
  Reply,
  Smile,
  Trash2,
} from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";
import Avatar from "../shared/Avatar";
import {
  convertFileSize,
  downloadFile,
  formatTime,
  showToast,
} from "@/lib/utils";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import EmojiPicker from "./EmojiPicker";
// import ToolTip from "./ToolTip";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { addReaction, deleteMessage, removeReaction } from "@/api/messages";
import { EmojiClickData } from "emoji-picker-react";
import { Dialog, DialogTrigger } from "../ui/dialog";
import ReactionsList from "./ReactionsList";
import { socket } from "@/sockets/sockets";
import { useParams } from "react-router-dom";
import { MessageType, UserType } from "@/types/types";
import ToolTip from "../shared/ToolTip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ForwardMessage from "./ForwardMessage";

type MessageProps = {
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  message: MessageType;
  repliedMessage: MessageType | null | undefined;
  repliedMessageSender: UserType | null | undefined;
  name: string;
  avatar: string | null | undefined;
  previousSenderId: string | null;
  messageInputTextarea: HTMLTextAreaElement | null;
  replyingMessage: MessageType | null;
  setReplyingMessage: React.Dispatch<React.SetStateAction<MessageType | null>>;
  setEditingMessage: React.Dispatch<React.SetStateAction<MessageType | null>>;
};

const Message = ({
  setMessages,
  message,
  repliedMessage,
  repliedMessageSender,
  previousSenderId,
  avatar,
  name,
  messageInputTextarea,
  replyingMessage,
  setReplyingMessage,
  setEditingMessage,
}: MessageProps) => {
  const { id } = useParams();

  const user = useAppSelector((state) => state.auth.user) as UserType;
  const [isReactionsVisible, setIsReactionsVisible] = useState(false);
  const reactionsButtonRef = useRef<HTMLButtonElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const [reactions, setReactions] = useState<{ [emojiId: string]: string[] }>(
    message.reactions
  );
  const queryClient = useQueryClient();
  const chatId = useParams().id;

  // mutations
  const addReactionMutation = useMutation({
    mutationFn: addReaction,

    onSuccess: (data) => {
      addReactionInState(
        data.data.originalReaction,
        data.data.reaction,
        user._id
      );

      // emit a give reaction socket event
      socket.emit(
        "give reaction",
        data.data.originalReaction,
        data.data.reaction,
        chatId,
        message._id
      );

      queryClient.invalidateQueries(["message", message._id, "reactions"]);
    },

    onError: (error: any) => {
      console.log(error);
      showToast("error", error.response.data.error || error.message);
    },
  });

  const removeReactionMutation = useMutation({
    mutationFn: removeReaction,

    onSuccess: (data) => {
      removeReactionInState(data.data.emoji, user._id);

      // emit a remove reaction socket event
      socket.emit("remove reaction", data.data.emoji, chatId, message._id);

      queryClient.invalidateQueries(["message", message._id, "reactions"]);
    },

    onError: (error: any) => {
      console.log(error);
      showToast("error", error.response.data.error || error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMessage,

    onSuccess: () => {
      setMessages((prv) => prv.filter((m) => m._id !== message._id));
      socket.emit("changed messages", id);
      showToast("success", "Message deleted successfully!");
    },

    onError: (error: any) => {
      console.log(error);
      showToast("error", error.response.data.error || error.message);
    },
  });

  // Close reactions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        reactionsButtonRef.current &&
        !reactionsButtonRef.current.contains(target) &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(target) &&
        target.getAttribute("title") !== "Show all Emojis"
      ) {
        setIsReactionsVisible(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // to handle the highlight of selected emoji
  useEffect(() => {
    const reaction = Object.keys(reactions).find((reaction) => {
      return reactions[reaction].includes(user._id);
    });

    if (reaction && isReactionsVisible) {
      const emojiEle = document.querySelector(
        `li > button.epr-btn[data-unified='${reaction}']`
      ) as HTMLButtonElement;

      if (emojiEle) {
        emojiEle.style.backgroundColor = "#363636f6";
      }
    }
  }, [reactions, isReactionsVisible]);

  // handle adding and removing reactions
  const addReactionInState = (
    ogReaction: string,
    reaction: string,
    userId: string
  ) => {
    setReactions((prev) => {
      const originalReaction = prev[ogReaction] || [];
      const newReaction = prev[reaction] || [];
      return {
        ...prev,
        [ogReaction]: originalReaction.filter((id) => id !== userId),
        [reaction]: [...newReaction, user._id],
      };
    });
  };

  const removeReactionInState = (emoji: string, userId: string) => {
    setReactions((prev) => {
      return {
        ...prev,
        [emoji]: prev[emoji].filter((id) => {
          return id !== userId;
        }),
      };
    });
  };

  const handleReaction = (emojiData: EmojiClickData) => {
    setIsReactionsVisible(false);

    if (
      reactions[emojiData.unified] &&
      reactions[emojiData.unified].includes(user?._id as string)
    ) {
      removeReactionMutation.mutate({
        messageId: message._id,
        emoji: emojiData.unified,
      });
      return;
    }

    addReactionMutation.mutate({
      messageId: message._id,
      emoji: emojiData.unified,
    });
  };

  const handleReply = () => {
    messageInputTextarea?.focus();
    messageInputTextarea!.placeholder = "Reply...";
    setReplyingMessage(message);
  };

  const changeToEditState = () => {
    if (!message.content) {
      return;
    }
    messageInputTextarea?.focus();
    messageInputTextarea!.placeholder = "Edit...";
    messageInputTextarea!.value = message.content;
    setEditingMessage(message);
  };

  const handleDeleteMessage = () => {
    if (message.senderId !== user._id) {
      return;
    }

    if (deleteMutation.isLoading) {
      return;
    }

    deleteMutation.mutate(message._id);
  };

  // socket.io events for reactions
  useEffect(() => {
    socket.on(
      "reaction added",
      (
        targetId: string,
        originalEmoji: string,
        emoji: string,
        messageId: string
      ) => {
        if (messageId === message._id) {
          addReactionInState(originalEmoji, emoji, targetId);

          queryClient.invalidateQueries(["message", message._id, "reactions"]);
        }
      }
    );

    socket.on(
      "reaction removed",
      (targetId: string, emoji: string, messageId: string) => {
        if (messageId === message._id) {
          removeReactionInState(emoji, targetId);

          queryClient.invalidateQueries(["message", message._id, "reactions"]);
        }
      }
    );
  }, []);

  return (
    <article
      className={`w-full h-fit flex group relative ${
        user._id === message.senderId ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`w-[95%] sm:w-[70%] lg:w-[80%] relative flex flex-col gap-2 ${
          user._id === message.senderId
            ? "flex-row-reverse items-end"
            : "flex-row items-start"
        }`}
      >
        {/* Message */}
        <div
          className={`flex w-full gap-2 items-center z-10 ${
            user._id === message.senderId ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <div className="h-full w-fit">
            <Avatar name={name} image={`${avatar}`} isOnline={false} />
          </div>
          <div
            className={`${message.type === "text" ? "pb-1" : "object-cover"} ${
              message.status !== "error"
                ? message.type === "text" || message.type === "raw"
                  ? "bg-gray-200 dark:bg-gray-700"
                  : "bg-transparent"
                : "bg-red-600"
            } ${
              message.senderId === previousSenderId
                ? "rounded-lg"
                : message.senderId === user._id
                ? "rounded-xl rounded-tr-none pb-2"
                : "rounded-xl rounded-tl-none"
            } ${
              message.mimeType?.split("/")[0] === "audio" ? "w-full" : "w-fit"
            } ${
              replyingMessage?._id === message._id
                ? "border-2 border-purple-700"
                : ""
            }
            relative flex flex-col gap-1.5 h-fit items-end`}
          >
            {/* Replying message indicator */}
            {replyingMessage?._id === message._id && (
              <div className="bg-purple-600 w-full h-full absolute inset-0 bg-opacity-20" />
            )}

            {/* preview of the message that this message replied to */}
            {repliedMessage && (
              <div className="w-full py-1.5 px-2 rounded-tl-xl flex justify-center items-center bg-zinc-300 dark:bg-gray-500">
                <div className="flex justify-center items-center gap-2 w-full">
                  <CornerDownRight className="flex-shrink-0 w-4 h-4" />
                  {repliedMessage?.type === "image" && (
                    <img
                      className="w-[40px] aspect-auto hidden sm:block lg:w-[50px]"
                      src={repliedMessage?.file?.url}
                    />
                  )}
                  <div className="w-[90%] flex flex-col gap-1">
                    <strong className="text-sm">
                      {repliedMessageSender?.name || user?.name}
                    </strong>
                    <i
                      className={`${
                        repliedMessage?.type === "text" ? "truncate" : ""
                      } w-[90%]`}
                    >
                      {repliedMessage?.type === "text" ? (
                        message?.type === "image" ? (
                          repliedMessage?.content
                        ) : (
                          repliedMessage?.content?.slice(0, 15)
                        )
                      ) : repliedMessage?.type === "video" ? (
                        "Audio Message"
                      ) : repliedMessage?.type === "raw" ? (
                        <div className="flex gap-0.5">
                          <FileMinus /> {repliedMessage.file?.name}
                        </div>
                      ) : (
                        `${
                          repliedMessage!.type![0]!.toUpperCase() +
                          repliedMessage!.type!.slice(1)
                        } Message`
                      )}
                    </i>
                  </div>
                </div>
              </div>
            )}

            {message.type === "text" ? (
              <pre className="px-2 py-2 text-[1rem] w-fit text-wrap font-normal font-sans text-gray-900 dark:text-white text-left">
                {message.content}
              </pre>
            ) : message.type === "image" ? (
              <img
                src={message.file?.url}
                alt={message.file?.name}
                className="object-cover"
                loading="lazy"
              />
            ) : message.type === "video" ? (
              <div className="w-full h-fit">
                <audio controls style={{ width: "100%" }}>
                  <source
                    src={`${message.file?.url}`}
                    type={message.mimeType as string}
                  />
                  Your browser does not support the audio element.
                </audio>
              </div>
            ) : (
              <div className="flex gap-4 p-2">
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1">
                    <FileMinus />
                    <h1>{message.file?.name}</h1>
                  </div>
                  <div className="flex gap-2 text-gray-500 font-semibold">
                    <span>{convertFileSize(message.file?.size as number)}</span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    downloadFile(
                      message.file?.url as string,
                      message.file?.name as string
                    )
                  }
                  className="rounded-lg p-2 h-fit hover:bg-gray-500 transition-colors"
                >
                  <Download />
                </button>
              </div>
            )}

            {/* Status */}
            <div
              className={`mx-2 mb-1 w-fit h-full flex-shrink-0 ${
                message.type?.split("/")[0] === "text" ? "" : "mr-2"
              }`}
            >
              {message.senderId === user._id && message.status === "read" && (
                <CheckCheck className="text-purple-500 w-3.5 h-3.5 flex-shrink-0" />
              )}
              {message.senderId === user._id &&
                message.status === "sending" && (
                  <div className="text-xs font-normal text-gray-400">
                    Sending...
                  </div>
                )}
              {message.senderId === user._id && message.status === "sent" && (
                <CheckCheck className="w-3.5 h-3.5" />
              )}
              {message.senderId === user._id && message.status === "error" && (
                <span className="text-xs font-semibold flex gap-1">
                  <CircleX className="w-4 h-4 text-white" /> Couldn't sent
                </span>
              )}
            </div>

            {/* Reactions */}
            {Object.values(reactions).flatMap((id) => id).length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <div
                    className={`absolute flex gap-1 ${
                      message.senderId === user._id
                        ? "left-0 top-full flex-row-reverse"
                        : "right-0 top-full flex-row"
                    }  p-1 dark:bg-slate-200/30 bg-white/50 backdrop-blur-sm rounded-full cursor-pointer`}
                  >
                    {Object.keys(reactions).map((reaction) => {
                      if (reactions[reaction].length > 0) {
                        return (
                          <Emoji
                            unified={reaction}
                            emojiStyle={EmojiStyle.FACEBOOK}
                            size={15}
                          />
                        );
                      }
                    })}
                    {Object.values(reactions).flatMap((id) => id).length >
                      1 && (
                      <span className="text-xs font-semibold">
                        {Object.values(reactions).flatMap((id) => id).length}
                      </span>
                    )}
                  </div>
                </DialogTrigger>
                <ReactionsList id={message._id} />
              </Dialog>
            )}
          </div>

          <div
            className={`relative h-fit flex gap-2 items-center ${
              message.senderId === user._id ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Add reaction btn */}
            <ToolTip text="Reactions">
              <button
                ref={reactionsButtonRef}
                onClick={() => setIsReactionsVisible((prev) => !prev)}
                className="text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-150 ease-linear"
              >
                <Smile className="w-4 h-4" />
              </button>
            </ToolTip>
            <ToolTip text="Reply">
              <button
                className="text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-150 ease-linear"
                onClick={handleReply}
              >
                <Reply className="w-5 h-5" />
              </button>
            </ToolTip>

            {/* Dropdown */}
            <Dialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button>
                    <EllipsisVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DialogTrigger className="w-full">
                    <DropdownMenuItem
                      className="flex gap-2 cursor-pointer"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Forward className="w-4" /> Forward
                    </DropdownMenuItem>
                  </DialogTrigger>

                  {message.senderId === user._id && (
                    <>
                      {message.type == "text" && (
                        <DropdownMenuItem
                          onClick={changeToEditState}
                          className="flex gap-2 cursor-pointer"
                        >
                          <Pencil className="w-4" /> Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={handleDeleteMessage}
                        className="flex gap-2 cursor-pointer"
                      >
                        <Trash2 className="w-4" /> Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <ForwardMessage message={message} />
            </Dialog>

            {/* Reactions Picker */}

            {isReactionsVisible && (
              <div
                ref={emojiPickerRef}
                className={`absolute bottom-full z-40 ${
                  user._id === message.senderId ? "-right-16" : "-left-full"
                }`}
              >
                <EmojiPicker
                  isReaction={true}
                  onReactionClick={handleReaction}
                  onEmojiClick={handleReaction}
                  width={300}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <span className="block text-xs font-medium z-10 dark:text-slate-300 text-slate-800">
            {formatTime(
              new Date(message.createdAt).toLocaleString(navigator.language, {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })
            )}
          </span>
          {message.edited && (
            <span className="block text-xs font-medium z-10 dark:text-slate-300 text-slate-800">
              Edited
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default Message;
