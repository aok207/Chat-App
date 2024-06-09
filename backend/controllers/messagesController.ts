import { Request, Response } from "express";
import Friend from "../models/friendModel";
import mongoose from "mongoose";
import User from "../models/userModel";
import Message from "../models/messageModel";
import { ChatResponseType, IUser } from "../types";
import { getFriends, uploadFile } from "../utils/utils";
import cloudinary from "../config/cloudinary";

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
      "recieverId.1": { $exists: false },
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
    const { message, replyingTo }: { message: string; replyingTo: string } =
      req.body;
    const file = req.file;

    if (!receiverId || !userId) {
      return res.status(400).json({ error: "Invalid message!" });
    }

    if (!message && !file) {
      return res.status(400).json({ error: "Message content is needed." });
    }

    // You can't message yourself
    if (userId.toString() === receiverId) {
      return res.status(400).json({ error: "You can't message yourself!" });
    }

    // check if recieverId exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: "Receiver does not exist!" });
    }

    // if this is a reply, check if replying to message exists
    if (replyingTo) {
      const replyingMessage = await Message.findById(replyingTo);
      if (!replyingMessage) {
        return res
          .status(400)
          .json({ error: "You are replying to a message that doesn't exist!" });
      }
    }

    const fileType = file?.mimetype.split("/")[0];
    if (fileType === "video") {
      return res
        .status(400)
        .json({ error: "Video files are currently not supported!" });
    }

    let uploadResult;

    // save the file to cloudinary
    if (file) {
      const b64 = Buffer.from(file.buffer).toString("base64");
      const dataURI = "data:" + file.mimetype + ";base64," + b64;
      if (fileType === "image") {
        uploadResult = await uploadFile(dataURI);
      } else if (fileType === "audio") {
        uploadResult = await uploadFile(dataURI, "video");
      } else {
        uploadResult = await uploadFile(dataURI, "raw");
      }
    }

    // save the message in db
    const newMessage = new Message({
      senderId: userId,
      receiverId: [receiverId],
      replyingTo: replyingTo ? new mongoose.Types.ObjectId(replyingTo) : null,
      content: message ? message : null,
      // save the file info if exists
      file: uploadResult
        ? {
            public_id: uploadResult.public_id,
            name: file?.originalname,
            size: uploadResult.bytes,
            url: uploadResult.secure_url,
          }
        : null,
      status: "sent",
      type: uploadResult ? uploadResult.resource_type : "text",
      mimeType: uploadResult ? file?.mimetype : null,
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

export async function editMessage(req: Request, res: Response) {
  const { id } = req.params;

  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Message is required!" });
  }

  try {
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ error: "Message doesn't exist!" });
    }

    if (message.senderId.toString() !== req.user?._id.toString()) {
      return res
        .status(400)
        .json({ error: "You are not allow to edit this message!" });
    }

    message.content = content;
    message.edited = true;
    await message.save();

    const updatedMessage = await Message.findById(message._id, { __v: 0 });

    return res.status(200).json({ data: updatedMessage });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Something went wrong!" });
  }
}

export async function deleteMessage(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ error: "Message not found!" });
    }

    // only the sender can delete the message
    if (req.user?._id.toString() !== message.senderId.toString()) {
      return res
        .status(401)
        .json({ error: "You are not allowed to delete this message!" });
    }

    // delete file content from cloudinary if any
    if (message.file) {
      await cloudinary.uploader.destroy(message.file.public_id);
    }

    await message.deleteOne();

    return res.sendStatus(204);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Something went wrong!" });
  }
}

// Reactions
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

export async function getReactions(req: Request, res: Response) {
  const { messageId } = req.params;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(400).json({ error: "Message does not exist!" });
    }

    // get all of the users id who reacted the message
    const userIds = [...message.reactions.values()].flatMap((id) => id);

    if (userIds.length === 0) {
      return res.status(200).json({ data: {}, message: "No reactions" });
    }

    // find all of the users with those ids
    const users: IUser[] = await User.find(
      { _id: { $in: userIds } },
      {
        created_at: 0,
        password: 0,
        provider: 0,
        updated_at: 0,
        __v: 0,
      }
    );

    // create a users map for easy lookup
    const usersMap = new Map<string, IUser>();

    users.forEach((user) => {
      usersMap.set(user._id.toString(), user);
    });

    const reactions: {
      [emoji: string]: IUser[];
    } = {};

    for (const [emoji, ids] of message.reactions) {
      if (ids.length > 0) {
        reactions[emoji] = ids
          .map((id) => usersMap.get(id.toString()))
          .filter((user) => user !== undefined);
      }
    }

    res.status(200).json({ data: reactions });
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
        latestMessageType: latestMessage[0].type,
      });
    }

    return res.status(200).json({ data: chats });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Something went wrong! Please try again!" });
  }
}
