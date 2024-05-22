import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { pageVariant } from "@/framerMotion/variants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppDispatch } from "@/hooks/hooks";
import { setCurrentPage } from "@/slices/uiSlice";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowLeft, PanelRight } from "lucide-react";
import MessageInput from "@/components/MessageInput";
import Message from "@/components/Message";

const sampleData = [
  {
    userId: "user1",
    senderId: "user1",
    message: "Hey! How are you?",
    sentTime: "10:00 AM",
    status: "sent",
    previousSenderId: "user2",
  },
  {
    userId: "user1",
    senderId: "user2",
    message: "I'm good, thanks! And you?",
    sentTime: "10:02 AM",
    status: undefined,
    previousSenderId: "user1",
  },
  {
    userId: "user1",
    senderId: "user1",
    message: "I'm doing great, just working on a project.",
    sentTime: "10:05 AM",
    status: "read",
    previousSenderId: "user2",
  },
  {
    userId: "user1",
    senderId: "user2",
    message: "That sounds interesting!",
    sentTime: "10:07 AM",
    status: undefined,
    previousSenderId: "user1",
  },
  {
    userId: "user1",
    senderId: "user1",
    message: "Yeah, it really is.",
    sentTime: "10:10 AM",
    status: "sending",
    previousSenderId: "user2",
  },
  {
    userId: "user1",
    senderId: "user1",
    message: "But it's also quite challenging.",
    sentTime: "10:12 AM",
    status: "error",
    previousSenderId: "user1",
  },
  {
    userId: "user1",
    senderId: "user2",
    message: "I believe you'll manage it well.",
    sentTime: "10:15 AM",
    status: undefined,
    previousSenderId: "user1",
  },
  {
    userId: "user1",
    senderId: "user2",
    message: "Do you need any help with it?",
    sentTime: "10:20 AM",
    status: undefined,
    previousSenderId: "user1",
  },
  {
    userId: "user1",
    senderId: "user1",
    message: "Thank you! I might need some assistance later.",
    sentTime: "10:25 AM",
    status: "sending",
    previousSenderId: "user2",
  },
  {
    userId: "user1",
    senderId: "user2",
    message: "Sure, just let me know.",
    sentTime: "10:30 AM",
    status: undefined,
    previousSenderId: "user1",
  },
];

const IndividualChatPage = () => {
  const dispatch = useAppDispatch();
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const isLastMessageVisible = useInView(lastMessageRef);

  useEffect(() => {
    dispatch(setCurrentPage("single-chat"));
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageVariant}
      className="w-full h-full flex flex-col"
    >
      <nav className="flex justify-between items-center bg-white dark:bg-black w-full py-2 px-4 ">
        <div className="flex gap-4 items-center">
          <Link to={"/"}>
            <ArrowLeft />
          </Link>
          <div className="flex flex-col">
            <p className="text-sm font-medium">Myo Min Khant</p>
            <span className="text-xs">last seen 10 hours ago</span>
          </div>
        </div>
        <div>
          <button>
            <PanelRight className="w-5 h-5" />
          </button>
        </div>
      </nav>
      <ScrollArea className="w-full h-full flex flex-col">
        <div className="p-2 pb-8 px-4 flex flex-col gap-2 w-full h-full justify-end relative">
          {sampleData.map((message, index) => {
            if (index === sampleData.length - 1) {
              return (
                <Message
                  key={index}
                  message={message.message}
                  userId={message.userId}
                  senderId={message.senderId}
                  previousSenderId={message.previousSenderId}
                  sentTime={message.sentTime}
                  status={message.status}
                  ref={lastMessageRef}
                />
              );
            }
            return (
              <Message
                key={index}
                message={message.message}
                userId={message.userId}
                senderId={message.senderId}
                previousSenderId={message.previousSenderId}
                sentTime={message.sentTime}
                status={message.status}
              />
            );
          })}
          <AnimatePresence>
            {!isLastMessageVisible && (
              <motion.button
                onClick={() =>
                  lastMessageRef.current?.scrollIntoView({ behavior: "smooth" })
                }
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                className="absolute right-10 bottom-40 p-2 rounded-full dark:bg-slate-950 dark:text-white bg-zinc-500 text-white"
              >
                <ArrowDown className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
      <MessageInput />
    </motion.div>
  );
};

export default IndividualChatPage;
