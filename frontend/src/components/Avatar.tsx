import { makeFallbackAvatar } from "@/lib/utils";
import {
  AvatarImage,
  AvatarFallback,
  Avatar as ShadcnAvatar,
} from "./ui/avatar";

const Avatar = ({
  name,
  image,
  isOnline,
}: {
  name: string;
  image: string;
  isOnline: boolean;
}) => {
  return (
    <div className="relative">
      <ShadcnAvatar>
        <AvatarImage src={image} alt={`profile of ${name}`} />
        <AvatarFallback>{makeFallbackAvatar(name)}</AvatarFallback>
      </ShadcnAvatar>
      {isOnline && (
        <div className="w-3 h-3 bg-green-600 absolute right-0 bottom-0 rounded-full" />
      )}
    </div>
  );
};

export default Avatar;
