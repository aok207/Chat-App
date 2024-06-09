/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { pageVariant } from "@/framerMotion/variants";
import MessageInput from "@/components/chats/MessageInput";
import { MessageType, UserType } from "@/types/types";
import Messages from "@/components/chats/Messages";
import ChatNav from "@/components/chats/ChatNav";
import { useAppSelector } from "@/hooks/useRedux";
import { useNavigate, useParams } from "react-router-dom";
import DetailMode from "@/components/chats/DetailMode";

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

  const [editingMessage, setEditingMessage] = useState<MessageType | null>(
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
        setEditingMessage={setEditingMessage}
      />
      <div className="w-full">
        {(replyingMessage || editingMessage) && (
          <DetailMode
            participents={participants}
            messageReplyingTo={replyingMessage as MessageType}
            setReplyingMessage={setReplyingMessage}
            messageInputTextarea={messageInputRef.current}
            editingMessage={editingMessage}
            setEditingMessage={setEditingMessage}
          />
        )}
        <MessageInput
          ref={messageInputRef}
          setMessages={setMessages}
          lastEle={lastEleRef.current}
          messageReplyingTo={replyingMessage}
          setReplyingMessage={setReplyingMessage}
          editingMessage={editingMessage}
          setEditingMessage={setEditingMessage}
        />
      </div>
    </motion.div>
  );
};

export default IndividualChatPage;
