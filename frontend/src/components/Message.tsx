/* eslint-disable @typescript-eslint/no-explicit-any */
import { CheckCheck, CircleX, Smile } from "lucide-react";
import { useAppSelector } from "@/hooks/hooks";
import Avatar from "./Avatar";
import { formatTime, showToast } from "@/lib/utils";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import EmojiPicker from "./EmojiPicker";
// import ToolTip from "./ToolTip";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { addReaction, removeReaction } from "@/api/messages";
import { EmojiClickData } from "emoji-picker-react";
import { Dialog, DialogTrigger } from "./ui/dialog";
import ReactionsList from "./ReactionsList";
import { socket } from "@/sockets/sockets";
import { useParams } from "react-router-dom";

type MessageProps = {
  id: string;
  senderId: string;
  message: string;
  avatar: string | null | undefined;
  sentTime: Date;
  status?: "sent" | "sending" | "read" | "error" | string;
  previousSenderId: string | null;
  name: string;
  type: string;
  initialReactions: {
    [emojiId: string]: string[];
  };
};

const Message = ({
  id,
  senderId,
  message,
  sentTime,
  status,
  previousSenderId,
  avatar,
  name,
  type,
  initialReactions,
}: MessageProps) => {
  const userId = useAppSelector((state) => state.auth.user?._id) as string;
  const [isReactionsVisible, setIsReactionsVisible] = useState(false);
  const reactionsButtonRef = useRef<HTMLButtonElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const [reactions, setReactions] = useState<{ [emojiId: string]: string[] }>(
    initialReactions
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
        userId
      );

      // emit a give reaction socket event
      socket.emit(
        "give reaction",
        data.data.originalReaction,
        data.data.reaction,
        chatId,
        id
      );

      queryClient.invalidateQueries(["message", id, "reactions"]);
    },

    onError: (error: any) => {
      console.log(error);
      showToast("error", error.response.data.error || error.message);
    },
  });

  const removeReactionMutation = useMutation({
    mutationFn: removeReaction,

    onSuccess: (data) => {
      removeReactionInState(data.data.emoji, userId);

      // emit a remove reaction socket event
      socket.emit("remove reaction", data.data.emoji, chatId, id);

      queryClient.invalidateQueries(["message", id, "reactions"]);
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
      return reactions[reaction].includes(userId);
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
        [reaction]: [...newReaction, userId],
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
      reactions[emojiData.unified].includes(userId)
    ) {
      removeReactionMutation.mutate({
        messageId: id,
        emoji: emojiData.unified,
      });
      return;
    }

    addReactionMutation.mutate({ messageId: id, emoji: emojiData.unified });
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
        if (messageId === id) {
          addReactionInState(originalEmoji, emoji, targetId);

          queryClient.invalidateQueries(["message", id, "reactions"]);
        }
      }
    );

    socket.on(
      "reaction removed",
      (targetId: string, emoji: string, messageId: string) => {
        if (messageId === id) {
          removeReactionInState(emoji, targetId);

          queryClient.invalidateQueries(["message", id, "reactions"]);
        }
      }
    );
  }, []);

  return (
    <div
      className={`w-full h-fit flex group relative ${
        userId === senderId ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`w-[45%] relative flex flex-col gap-2 ${
          userId === senderId
            ? "flex-row-reverse items-end"
            : "flex-row items-start"
        }`}
      >
        {/* Message */}
        <div
          className={`flex w-full gap-2 items-center z-10 ${
            userId === senderId ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <Avatar name={name} image={`${avatar}`} isOnline={false} />
          <div
            className={`px-2 py-1 relative ${
              status !== "error" ? "bg-gray-200 dark:bg-gray-700" : "bg-red-600"
            } flex flex-col h-fit items-end ${
              senderId === previousSenderId
                ? "rounded-lg"
                : senderId === userId
                ? "rounded-xl rounded-tr-none"
                : "rounded-xl rounded-tl-none"
            }`}
          >
            {type === "text" && (
              <pre className="text-[1rem] font-normal font-sans text-gray-900 dark:text-white text-left">
                {message}
              </pre>
            )}
            {/* Status */}
            <div className="w-fit h-full flex-shrink-0">
              {senderId === userId && status === "read" && (
                <CheckCheck className="text-purple-500 w-3.5 h-3.5 flex-shrink-0" />
              )}
              {senderId === userId && status === "sending" && (
                <div className="text-xs font-normal text-gray-400">
                  Sending...
                </div>
              )}
              {senderId === userId && status === "sent" && (
                <CheckCheck className="w-3.5 h-3.5" />
              )}
              {senderId === userId && status === "error" && (
                <span className="text-xs font-semibold flex gap-1">
                  <CircleX className="w-4 h-4 text-red-600" /> Couldn't sent
                </span>
              )}
            </div>

            {/* Reactions */}
            {Object.values(reactions).flatMap((id) => id).length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <div
                    className={`absolute flex gap-1 ${
                      senderId === userId
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
                <ReactionsList id={id} />
              </Dialog>
            )}
          </div>

          {/* Add reaction btn */}
          <div className={`flex gap-2 items-center`}>
            <button
              ref={reactionsButtonRef}
              onClick={() => setIsReactionsVisible((prev) => !prev)}
              className="text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-150 ease-linear"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reactions Picker */}

        {isReactionsVisible && (
          <div
            ref={emojiPickerRef}
            className={`absolute -top-10 z-40 ${
              userId === senderId ? "right-1/3" : "left-2/3"
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

        <span className="text-xs font-medium z-10 dark:text-slate-300 text-slate-800">
          {formatTime(
            new Date(sentTime).toLocaleString(navigator.language, {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })
          )}
        </span>
      </div>
    </div>
  );
};

export default Message;
