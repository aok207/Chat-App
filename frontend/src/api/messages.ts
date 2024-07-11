import {
  ChatResponseType,
  MessageType,
  ReactionsResponseType,
  UserType,
} from "@/types/types";
import api from ".";

export function getChatsForUser(): Promise<{
  data: ChatResponseType[];
  message?: string | null;
}> {
  return api.get("/messages").then((res) => res.data);
}

export function sendMessage({
  receiverId,
  data,
}: {
  receiverId: string;
  data: FormData;
}): Promise<{ data: MessageType }> {
  return api
    .post(`/messages/${receiverId}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
}

export function updateMessage({
  id,
  content,
}: {
  id: string;
  content: string;
}): Promise<{ data: MessageType }> {
  return api.patch(`/messages/${id}`, { content }).then((res) => res.data);
}

export function deleteMessage(id: string) {
  return api.delete(`/messages/${id}`).then((res) => res.data);
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

export function addReaction({
  messageId,
  emoji,
}: {
  messageId: string;
  emoji: string;
}): Promise<{ data: { reaction: string; originalReaction: string } }> {
  return api
    .patch(`/messages/${messageId}/add-reaction`, { emoji })
    .then((res) => res.data);
}

export function removeReaction({
  messageId,
  emoji,
}: {
  messageId: string;
  emoji: string;
}): Promise<{
  data: {
    emoji: string;
  };
}> {
  return api
    .delete(`/messages/${messageId}/remove-reaction?emoji=${emoji}`)
    .then((res) => res.data);
}

export function getReactions({
  messageId,
}: {
  messageId: string;
}): Promise<ReactionsResponseType> {
  return api.get(`/messages/${messageId}/reactions`).then((res) => res.data);
}
