import { useQuery } from "react-query";
import {
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { getReactions } from "@/api/messages";
import Spinner from "./ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import Chat from "./Chat";
import { UserType } from "@/types/types";
import { useAppSelector } from "@/hooks/hooks";

const Reaction = ({ user, emoji }: { user: UserType; emoji: string }) => {
  const userId = useAppSelector((state) => state.auth.user?._id);

  return (
    <DialogClose asChild className="w-full h-fit">
      <div className="w-full h-fit relative">
        <Chat
          name={userId === user._id ? `${user.name} (You)` : user.name}
          avatar={user.avatar}
          chatId={user._id}
          isOnline={user.isOnline}
          latestMessage={null}
          latestMessageSenderId={null}
          latestMessageStatus={null}
          latestTime={null}
        />
        <div className="absolute top-1/3 right-3 flex items-center justify-center">
          <Emoji unified={emoji} size={23} emojiStyle={EmojiStyle.FACEBOOK} />
        </div>
      </div>
    </DialogClose>
  );
};

const ReactionsList = ({ id }: { id: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["message", id, "reactions"],
    queryFn: () => getReactions({ messageId: id }),
  });

  return (
    <DialogContent>
      <DialogHeader className="text-zinc-800 dark:text-zinc-200">
        <DialogTitle className=" text-center w-full">
          Message reactions
        </DialogTitle>
      </DialogHeader>
      <div
        className={`${
          isLoading ? "items-center justify-center" : ""
        } flex w-full h-full`}
      >
        {isLoading && !data ? (
          <Spinner />
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full flex mb-4">
              <TabsTrigger value="all" className="flex-grow">
                All {Object.values(data!.data).flatMap((ele) => ele).length}
              </TabsTrigger>
              {Object.keys(data!.data).map((emoji) => {
                return (
                  <TabsTrigger
                    value={emoji}
                    className="flex items-center gap-1 flex-grow"
                  >
                    <Emoji
                      unified={emoji}
                      emojiStyle={EmojiStyle.FACEBOOK}
                      size={20}
                    />
                    <span>{data?.data[emoji].length}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <TabsContent value="all">
              {Object.values(data!.data)
                .flatMap((ele) => ele)
                .map((user) => (
                  <Reaction
                    key={user._id}
                    user={user}
                    emoji={
                      Object.keys(data!.data).find((emoji) =>
                        data!.data[emoji]?.includes(user)
                      ) as string
                    }
                  />
                ))}
            </TabsContent>
            {Object.keys(data!.data).map((emoji) => {
              return (
                <TabsContent value={emoji}>
                  {data!.data[emoji]?.map((user) => (
                    <Reaction key={user._id} user={user} emoji={emoji} />
                  ))}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>
    </DialogContent>
  );
};

export default ReactionsList;
