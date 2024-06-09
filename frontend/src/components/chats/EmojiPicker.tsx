import ReactEmojiPicker, {
  Theme,
  EmojiStyle,
  EmojiClickData,
} from "emoji-picker-react";
import { useTheme } from "../shared/theme-provider";

const EmojiPicker = ({
  isReaction,
  onEmojiClick,
  onReactionClick,
  className,
  width,
}: {
  isReaction: boolean;
  onEmojiClick?: (emojiData: EmojiClickData, event: MouseEvent) => void;
  onReactionClick?: (emojiData: EmojiClickData, event: MouseEvent) => void;
  className?: string;
  width?: number;
}) => {
  const appTheme = useTheme().theme;

  const theme: Theme =
    appTheme === "system"
      ? Theme.AUTO
      : appTheme === "dark"
      ? Theme.DARK
      : Theme.LIGHT;

  return (
    <ReactEmojiPicker
      theme={theme}
      width={width || 350}
      emojiStyle={EmojiStyle.FACEBOOK}
      onEmojiClick={onEmojiClick && onEmojiClick}
      onReactionClick={onReactionClick && onReactionClick}
      reactionsDefaultOpen={isReaction}
      reactions={["1f44d", "1f606", "1f622", "1f62e", "1f621", "2764-fe0f"]}
      className={className || ""}
      lazyLoadEmojis={true}
    />
  );
};

export default EmojiPicker;
