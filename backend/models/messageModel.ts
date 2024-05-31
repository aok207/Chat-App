import { model, Types, Schema, Document } from "mongoose";

interface IMessage extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId[];
  content: string;
  status: "sent" | "read" | string;
  reactions: Map<string, Types.ObjectId[]>;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema(
  {
    senderId: { type: Types.ObjectId, ref: "User", required: true },
    receiverId: [{ type: Types.ObjectId, ref: "User", required: true }],
    content: { type: String, required: true },
    status: { type: String, required: true, default: "sent" },
    reactions: {
      type: Map,
      of: [Types.ObjectId],
      unique: true,
      default: {},
    },
    type: String,
  },
  { timestamps: true }
);

const Message = model<IMessage>("Message", messageSchema);

export default Message;
