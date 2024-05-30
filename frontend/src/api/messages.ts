import { ChatResponseType, MessageType, UserType } from "@/types/types";
import api from "./api";

export function getChatsForUser(): Promise<{
  data: ChatResponseType[];
  message?: string | null;
}> {
  return api.get("/messages").then((res) => res.data);
}

export function sendMessage(data: {
  receiverId: string;
  content: string;
}): Promise<{ data: MessageType }> {
  return api
    .post(`/messages/${data.receiverId}`, { message: data.content })
    .then((res) => res.data);
}

export function getMessages({
  pageParam = 1,
  id,
}: {
  pageParam: number;
  id: string | undefined;
}): Promise<{
  data: { messages: MessageType[]; otherUser: null | UserType };
  nextPage: number | null;
}> {
  return api.get(`/messages/${id}?page=${pageParam}`).then((res) => res.data);
}

export function markAsRead(id: string) {
  return api.patch(`/messages/${id}/mark-as-read`).then((res) => res.data);
}
