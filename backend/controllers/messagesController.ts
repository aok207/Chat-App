import { Request, Response } from "express";
import Friend from "../models/friendModel";
import mongoose from "mongoose";
import User from "../models/userModel";
import Message from "../models/messageModel";
import { ChatResponseType, IUser } from "../types";
import { getFriends } from "../utils/utils";

export async function getMessages(req: Request, res: Response) {
  const userId = req.user?._id;
  try {
    const otherUser = await User.findById(req.params?.receiverId, {
      _id: 1,
      name: 1,
      email: 1,
      avatar: 1,
      isOnline: 1,
      lastOnline: 1,
    });

    // Check if the user exists
    if (!otherUser) {
      return res.status(404).json({ error: "User doesn't exist" });
    }

    let page: any = req.query.page;

    // The following code makes sure that when the page query param is
    // - not a number
    // - less than or equal to 0
    // - not included
    // it will default to 1

    if (!page) {
      page = 1;
    } else {
      page = parseInt(page);
      if (Number.isNaN(page)) {
        page = 1;
      }
      if (page <= 0) {
        page = 1;
      }
    }

    // amount of message to return in each request
    const amount = 10;

    const totalMessagesCount = await Message.countDocuments({
      $or: [
        { senderId: userId, receiverId: otherUser._id },
        { senderId: otherUser._id, receiverId: userId },
      ],
    });

    if (totalMessagesCount === 0) {
      return res
        .status(200)
        .json({ data: { messages: [], otherUser }, nextPage: null });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUser._id },
        { senderId: otherUser._id, receiverId: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(amount * (page - 1))
      .limit(amount);

    const hasNextPage = totalMessagesCount - (amount * (page - 1) + amount) > 0;

    return res.status(200).json({
      data: { messages, otherUser: page === 1 ? otherUser : null },
      nextPage: hasNextPage ? page + 1 : null,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Something went wrong! Please try again!" });
  }
}

export async function markAsRead(req: Request, res: Response) {
  const userId = req.user?._id;
  const { otherId } = req.params;

  try {
    const otherUser = await User.findById(otherId);

    if (!otherUser) {
      return res.status(404).json({ error: "User doesn't exist" });
    }

    const messages = await Message.find({
      senderId: otherUser._id,
      receiverId: userId,
    });

    if (messages.length === 0) {
      return res.sendStatus(200);
    }

    for (const message of messages) {
      if (message.status !== "read") {
        message.status = "read";
        await message.save();
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Something went wrong! Please try again!" });
  }
}

export async function sendMessage(req: Request, res: Response) {
  try {
    const { receiverId } = req.params;
    const userId = req.user?._id;
    const { message } = req.body;

    if (!receiverId || !userId || !message) {
      return res.status(400).json({ error: "Invalid message!" });
    }

    // check if recieverId exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: "Receiver does not exist!" });
    }

    // save the message in db
    const newMessage = new Message({
      senderId: userId,
      receiverId: [receiverId],
      content: message,
      status: "sent",
      type: "text",
    });

    await newMessage.save();

    const isAlreadyFriend = await Friend.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          friendsId: new mongoose.Types.ObjectId(receiverId),
        },
      },
    ]);

    // if not already friends, add to friend list in both user and receiver
    if (isAlreadyFriend.length === 0) {
      const user = await getFriends(userId);
      const receiver = await getFriends(receiverId);

      const recieverID = new mongoose.Types.ObjectId(receiverId);
      const userID = new mongoose.Types.ObjectId(req.user?._id);

      if (user) {
        user.friendsId.push(recieverID);
        await user.save();
      } else {
        await Friend.create({ userId, friendsId: [recieverID] });
      }

      if (receiver) {
        receiver.friendsId.push(userID);
        await receiver.save();
      } else {
        await Friend.create({ userId: receiverId, friendsId: [userID] });
      }
    }

    res.status(201).json({ data: newMessage });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      error:
        "Something went wrong while sending the message, please try again!",
    });
  }
}

export async function addReaction(req: Request, res: Response) {
  const { messageId } = req.params;
  const { emoji } = req.body;
  const userId = req.user?._id as mongoose.Types.ObjectId;

  if (!emoji) {
    return res.status(400).json({ error: "Emoji is required!" });
  }

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message doesn't exist!" });
    }

    if (!message.reactions.get(emoji)) {
      message.reactions.set(emoji, []);
    }

    let originalReaction: string | null = null;

    for (const reaction of message.reactions.keys()) {
      if (message.reactions.get(reaction)?.includes(userId)) {
        if (reaction === emoji) {
          return res.status(400).json({ error: "Already gave reaction!" });
        } else {
          message.reactions.set(
            reaction,
            message.reactions
              .get(reaction)!
              .filter((id) => id.toString() !== userId.toString())
          );
          originalReaction = reaction;
          break;
        }
      }
    }

    message.reactions.get(emoji)!.push(userId);
    await message.save();

    return res.status(200).json({
      data: {
        reaction: emoji,
        originalReaction,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      error:
        "Something went wrong while sending the message, please try again!",
    });
  }
}

export async function removeReaction(req: Request, res: Response) {
  const { messageId } = req.params;
  const { emoji } = req.query;
  const userId = req.user?._id as mongoose.Types.ObjectId;

  if (!emoji) {
    return res.status(400).json({ error: "Emoji is required!" });
  }

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message doesn't exist!" });
    }

    const existingReaction = message.reactions.get(emoji as string);

    if (!existingReaction) {
      return res.status(400).json({ error: "No reaction to remove!" });
    }

    message.reactions.set(
      emoji as string,
      existingReaction.filter((id) => id.toString() !== userId.toString())
    );

    await message.save();

    return res.status(200).json({ data: { emoji } });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      error:
        "Something went wrong while sending the message, please try again!",
    });
  }
}

export async function getChats(req: Request, res: Response) {
  try {
    const userId = req.user?._id;

    let chats: ChatResponseType[] = [];

    const friends = await getFriends(new mongoose.Types.ObjectId(userId));

    if (!friends) {
      return res
        .status(200)
        .json({ data: chats, message: "You currently have no chats!" });
    }

    for (const id of friends.friendsId) {
      const latestMessage = await Message.find({
        $or: [
          { senderId: userId, receiverId: id },
          { senderId: id, receiverId: userId },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(1);

      const friend = await User.findById(id, {
        _id: 1,
        name: 1,
        email: 1,
        avatar: 1,
        isOnline: 1,
        lastOnline: 1,
      });

      chats.push({
        latestMessage: latestMessage[0].content,
        latestTime: latestMessage[0].createdAt,
        otherUser: friend as IUser,
        latestMessageStatus: latestMessage[0].status,
        latestMessageSenderId: latestMessage[0].senderId,
      });
    }

    return res.status(200).json({ data: chats });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Something went wrong! Please try again!" });
  }
}
