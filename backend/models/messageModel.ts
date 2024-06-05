import { model, Types, Schema, Document, trusted } from "mongoose";
import { FileType } from "../types";

interface IMessage extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId[];
  content: string | null;
  file: FileType | null;
  status: "sent" | "read" | string;
  reactions: Map<string, Types.ObjectId[]>;
  type: string | null;
  mimeType: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema(
  {
    senderId: { type: Types.ObjectId, ref: "User", required: true },
    receiverId: [{ type: Types.ObjectId, ref: "User", required: true }],
    content: { type: String, required: false, default: null },
    file: {
      type: new Schema({
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
      }),
      default: null,
    },
    status: { type: String, required: true, default: "sent" },
    reactions: {
      type: Map,
      of: [Types.ObjectId],
      unique: true,
      default: {},
    },
    type: { type: String, default: null, required: false },
    mimeType: { type: String, default: null, required: false },
  },
  { timestamps: true }
);

const Message = model<IMessage>("Message", messageSchema);

export default Message;
