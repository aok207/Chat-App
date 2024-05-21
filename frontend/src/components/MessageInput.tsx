import { Send, Smile } from "lucide-react";
import { useRef } from "react";

const MessageInput = () => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  const sendMessage = () => {
    console.log(textareaRef.current?.value);
    textareaRef.current!.value = "";
    adjustTextareaHeight();
  };

  return (
    <div className="sticky bottom-0 shadow-2xl items-center px-3 py-3 left-0 right-0 bg-white dark:bg-black flex gap-2">
      <textarea
        ref={textareaRef}
        placeholder="Write a message..."
        className="flex-grow no-scrollbar resize-none leading-6 bg-transparent focus:outline-none px-4"
        onInput={adjustTextareaHeight} // Adjust height on input
        style={{ height: "22px" }} // Initial height
        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if (e.key == "Enter") {
            if (!e.shiftKey) {
              e.preventDefault();
              if (e.currentTarget.value === "") {
                return;
              }
              sendMessage();
            }
          }
        }}
      ></textarea>
      <button className="flex-shrink-0">
        <Smile />
      </button>
      <button className="flex-shrink-0" onClick={sendMessage}>
        <Send />
      </button>
    </div>
  );
};

export default MessageInput;
