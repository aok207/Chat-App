/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { pageVariant } from "@/framerMotion/variants";
import MessageInput from "@/components/MessageInput";
import { MessageType, UserType } from "@/types/types";
import Messages from "@/components/Messages";
import ChatNav from "@/components/ChatNav";

const IndividualChatPage = () => {
  const lastEleRef = useRef<HTMLDivElement | null>(null);

  const isLastEleVisible = useInView(lastEleRef);

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [participants, setParticipants] = useState<UserType[]>([]);

  const [isFirstDataFetching, setIsFirstDataFetching] = useState(false);

  useEffect(() => {
    lastEleRef.current?.scrollIntoView();
  }, [isFirstDataFetching]);

  // useEffect(() => {
  //   if (isLastEleVisible) {
  //     lastEleRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, []);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageVariant}
      className="w-full h-full flex flex-col"
    >
      <ChatNav isLoading={isLoading} otherUser={participants[0]} />

      {/* Messages */}
      <Messages
        setIsLoading={setIsLoading}
        setIsFirstDataFetching={setIsFirstDataFetching}
        setMessages={setMessages}
        messages={messages}
        isFirstDataFetching={isFirstDataFetching}
        isLastEleVisible={isLastEleVisible}
        lastEleRef={lastEleRef}
        isGroupChat={false}
        participants={participants}
        setParticipants={setParticipants}
      />

      <MessageInput setMessages={setMessages} lastEle={lastEleRef.current} />
    </motion.div>
  );
};

export default IndividualChatPage;
