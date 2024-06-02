/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { pageVariant } from "@/framerMotion/variants";
import MessageInput from "@/components/MessageInput";
import { MessageType, UserType } from "@/types/types";
import Messages from "@/components/Messages";
import ChatNav from "@/components/ChatNav";
import { useAppSelector } from "@/hooks/hooks";
import { useNavigate, useParams } from "react-router-dom";

const IndividualChatPage = () => {
  const lastEleRef = useRef<HTMLDivElement | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const isLastEleVisible = useInView(lastEleRef);

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [participants, setParticipants] = useState<UserType[]>([]);

  const [isFirstDataFetching, setIsFirstDataFetching] = useState(false);

  const userId = useAppSelector((state) => state.auth.user?._id);

  useEffect(() => {
    lastEleRef.current?.scrollIntoView();
  }, [isFirstDataFetching]);

  useEffect(() => {
    if (userId === id) {
      navigate("/");
    }
  }, []);

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
