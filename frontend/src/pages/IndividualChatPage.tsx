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
import ReplyingTo from "@/components/ReplyingTo";

const IndividualChatPage = () => {
  const lastEleRef = useRef<HTMLDivElement | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const isLastEleVisible = useInView(lastEleRef);

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [participants, setParticipants] = useState<UserType[]>([]);
  const [replyingMessage, setReplyingMessage] = useState<MessageType | null>(
    null
  );

  const [isFirstDataFetching, setIsFirstDataFetching] = useState(false);

  const userId = useAppSelector((state) => state.auth.user?._id);

  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);

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
        messageInputTextarea={messageInputRef.current}
        replyingMessage={replyingMessage}
        setReplyingMessage={setReplyingMessage}
      />
      <div className="w-full">
        {replyingMessage && (
          <ReplyingTo
            participents={participants}
            messageReplyingTo={replyingMessage}
            setReplyingMessage={setReplyingMessage}
            messageInputTextarea={messageInputRef.current}
          />
        )}
        <MessageInput
          ref={messageInputRef}
          setMessages={setMessages}
          lastEle={lastEleRef.current}
          messageReplyingTo={replyingMessage}
          setReplyingMessage={setReplyingMessage}
        />
      </div>
    </motion.div>
  );
};

export default IndividualChatPage;
