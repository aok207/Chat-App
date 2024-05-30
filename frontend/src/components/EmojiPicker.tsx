import ReactEmojiPicker, {
  Theme,
  EmojiStyle,
  EmojiClickData,
} from "emoji-picker-react";
import { useTheme } from "./theme-provider";

const EmojiPicker = ({
  isReaction,
  onClick,
}: {
  isReaction: boolean;
  onClick: (emojiData: EmojiClickData, event: MouseEvent) => void;
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
      emojiStyle={EmojiStyle.FACEBOOK}
      onEmojiClick={onClick}
      reactionsDefaultOpen={isReaction}
    />
  );
};

export default EmojiPicker;
