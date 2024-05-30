import { motion } from "framer-motion";
import Avatar from "./Avatar";

const TypingIndicator = ({
  avatar,
  name,
}: {
  avatar: string | null;
  name: string;
}) => {
  return (
    <div className="w-full flex gap-2 items-center">
      <Avatar name={name} image={`${avatar}`} isOnline={false} />
      <motion.div className="flex space-x-0.5 w-fit h-fit justify-start px-2 py-3 rounded-lg rounded-tl-none bg-gray-100 dark:bg-gray-700">
        <span className="sr-only">Loading...</span>
        <div className="h-1.5 w-1.5 bg-black dark:bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-1.5 w-1.5 bg-black dark:bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-1.5 w-1.5 bg-black dark:bg-white rounded-full animate-bounce"></div>
      </motion.div>
    </div>
  );
};

export default TypingIndicator;
