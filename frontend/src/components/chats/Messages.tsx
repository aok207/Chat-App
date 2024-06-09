/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setCurrentPage, setSearchQuery } from "@/store/slices/uiSlice";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowDown } from "lucide-react";
import Message from "@/components/chats/Message";
import { useInfiniteQuery, useMutation, useQueryClient } from "react-query";
import { getMessages, markAsRead } from "@/api/messages";
import Spinner from "@/components/ui/spinner";
import { MessageType, UserType } from "@/types/types";
import { socket } from "@/sockets/sockets";
import TypingIndicator from "@/components/chats/TypingIndicator";
import { formatSentDate } from "@/lib/utils";

type MessagesProps = {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setParticipants: React.Dispatch<React.SetStateAction<UserType[]>>;
  setIsFirstDataFetching: React.Dispatch<React.SetStateAction<boolean>>;
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  messages: MessageType[];
  participants: UserType[];
  lastEleRef: React.MutableRefObject<HTMLDivElement | null>;
  isLastEleVisible: boolean;
  isFirstDataFetching: boolean;
  isGroupChat: boolean;
  messageInputTextarea: HTMLTextAreaElement | null;
  setReplyingMessage: React.Dispatch<React.SetStateAction<MessageType | null>>;
  replyingMessage: MessageType | null;
  setEditingMessage: React.Dispatch<React.SetStateAction<MessageType | null>>;
};

const Messages = ({
  setIsLoading,
  setParticipants,
  setIsFirstDataFetching,
  setMessages,
  messages,
  participants,
  isFirstDataFetching,
  lastEleRef,
  isLastEleVisible,
  isGroupChat,
  messageInputTextarea,
  setReplyingMessage,
  replyingMessage,
  setEditingMessage,
}: MessagesProps) => {
  const currentUser = useAppSelector((state) => state.auth.user);

  // Group id in group-chat page, other user id in normal chat page
  const { id } = useParams();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const queryClient = useQueryClient();

  const [typingUserId, setTypingUserId] = useState<string[]>([]);

  // query to get messages
  const { fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["messages", id],
      queryFn: ({ pageParam }) => getMessages({ pageParam, id }),
      getNextPageParam: (previousPage) => previousPage.nextPage,
      refetchOnWindowFocus: false,

      onError: (err: any) => {
        console.log(err);
        setIsLoading(false);
        navigate("/");
      },

      onSuccess: (data) => {
        if (!isGroupChat && !participants.length) {
          const otherUserData = data.pages.flatMap(
            (data) => data?.data.otherUser
          )[0];

          if (otherUserData) {
            setParticipants([otherUserData]);
          }
        }

        const messagesData = data.pages
          .flatMap((data) => data.data.messages)
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

        setMessages([...messagesData]);

        setIsLoading(false);

        if (!isFirstDataFetching) {
          setIsFirstDataFetching(true);
        }
      },
      retry: false,
    });

  // mutation to mark messages as read
  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onError: (err: any) => {
      console.log(err);
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["chats"]);
    },
    retry: false,
  });

  // things to do when component mount
  useEffect(() => {
    dispatch(setCurrentPage("single-chat"));
    dispatch(setSearchQuery(""));

    setIsLoading(true);

    markAsReadMutation.mutate(id as string);
    // socket.io events
    socket.emit("message read", id);

    socket.on("user online", (otherUserId: string) => {
      setParticipants((prevParticipants) =>
        prevParticipants.map((user) =>
          user._id === otherUserId ? { ...user, isOnline: true } : user
        )
      );
    });

    socket.on("user offline", (otherUserId: string) => {
      setParticipants((prevParticipants) =>
        prevParticipants.map((user) =>
          user._id === otherUserId
            ? { ...user, isOnline: false, lastOnline: new Date() }
            : user
        )
      );
    });

    socket.on("other user is typing", (otherUserId: string) => {
      if (!isGroupChat) {
        if (id === otherUserId) {
          setTypingUserId([otherUserId]);
          if (isLastEleVisible) {
            lastEleRef.current?.scrollIntoView({ behavior: "smooth" });
          }
        }
      } else {
        setTypingUserId((prev) => [...prev, otherUserId]);
        if (isLastEleVisible) {
          lastEleRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    });

    socket.on("other user stopped typing", (otherUserId: string) => {
      if (!isGroupChat) {
        if (id === otherUserId) {
          setTypingUserId((prev) => prev.filter((id) => id !== otherUserId));
        }
      } else {
        setTypingUserId((prev) => prev.filter((id) => id !== otherUserId));
      }
    });

    // changes in message event
    socket.on("messages changed", (otherUserId: string) => {
      if (id === otherUserId) {
        queryClient.invalidateQueries(["messages", id]);
        setTimeout(() => {
          queryClient.invalidateQueries(["chats"]);
        }, 3000);

        if (isLastEleVisible) {
          lastEleRef.current?.scrollIntoView({ behavior: "smooth" });
        }

        markAsReadMutation.mutate(id);
        socket.emit("message read", id);
      }
    });

    // The other user has read the message event
    socket.on("other has read message", (otherUserId: string) => {
      if (id === otherUserId) {
        setTimeout(() => {
          queryClient.invalidateQueries(["messages", id]);
          queryClient.invalidateQueries(["chats"]);
        }, 3000);
      }
    });

    return () => {
      socket.off("user online");
      socket.off("user offline");
      socket.off("other user is typing");
      socket.off("other user stopped typing");
      socket.off("receive message");
      socket.off("other has read message");
    };
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0) {
      if (hasNextPage) {
        fetchNextPage();
      }
    }
  };

  return (
    <ScrollArea
      className="w-full h-full flex flex-col z-10"
      onScroll={handleScroll}
    >
      <div className="p-2 py-8 pt-10 px-4 flex flex-col gap-4 w-screen lg:w-full h-full items-center relative">
        {(isLoading || isFetchingNextPage) && (
          <Spinner width={10} height={10} />
        )}
        {messages.length !== 0 &&
          messages?.map((message, index) => {
            const prvMsgSentTime = new Date(
              messages[index === 0 ? 0 : index - 1].createdAt
            );
            const currentMessageSentTime = new Date(message.createdAt);
            const today = new Date();

            prvMsgSentTime.setHours(0, 0, 0, 0);
            currentMessageSentTime.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);

            const user = participants.find(
              (participant) => participant._id === message.senderId
            );

            return (
              <div
                className={"w-full text-center z-10"}
                key={`${index}-${message._id}`}
              >
                {index === 0 ? (
                  <p className="font-medium mb-3 text-sm text-slate-600 dark:text-slate-200">
                    {formatSentDate(message.createdAt)}
                  </p>
                ) : (
                  prvMsgSentTime.getTime() !==
                    currentMessageSentTime.getTime() && (
                    <p className="font-medium mb-3 text-sm text-slate-600 dark:text-slate-200">
                      {today.getTime() === currentMessageSentTime.getTime()
                        ? "Today"
                        : formatSentDate(message.createdAt)}
                    </p>
                  )
                )}
                <Message
                  setMessages={setMessages}
                  message={message}
                  repliedMessage={
                    message.replyingTo
                      ? messages.find((m) => m._id === message.replyingTo)
                      : null
                  }
                  repliedMessageSender={
                    message.replyingTo
                      ? participants.find(
                          (p) =>
                            p._id ===
                            messages.find((m) => m._id === message.replyingTo)
                              ?.senderId
                        )
                      : null
                  }
                  avatar={
                    message.senderId === currentUser?._id
                      ? (currentUser?.avatar as string)
                      : (user?.avatar as string)
                  }
                  name={
                    message.senderId === currentUser?._id
                      ? (currentUser?.name as string)
                      : (user?.name as string)
                  }
                  previousSenderId={
                    index === 0 ? null : messages[index - 1].senderId
                  }
                  messageInputTextarea={messageInputTextarea}
                  replyingMessage={replyingMessage}
                  setReplyingMessage={setReplyingMessage}
                  setEditingMessage={setEditingMessage}
                />
              </div>
            );
          })}
        <AnimatePresence>
          {typingUserId.length > 0 &&
            typingUserId.map((userId) => {
              const user = participants.find(
                (participant) => participant._id === userId
              );

              return (
                <motion.div
                  className="w-full z-10"
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    type: "tween",
                    ease: "easeInOut",
                  }}
                  exit={{ opacity: 0, y: 100 }}
                >
                  <TypingIndicator
                    avatar={user?.avatar as string}
                    name={user?.name as string}
                  />
                </motion.div>
              );
            })}
        </AnimatePresence>

        <AnimatePresence>
          {!isLastEleVisible && (
            <motion.button
              onClick={() => {
                lastEleRef.current?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              className="fixed z-50 right-10 bottom-20 p-2 rounded-full dark:bg-slate-800 dark:text-white bg-zinc-500 text-white"
            >
              <ArrowDown className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        <div ref={lastEleRef} />
      </div>
    </ScrollArea>
  );
};

export default Messages;
