import { Schema, model, Document, Types } from "mongoose";

export interface IFriend extends Document {
  userId: Types.ObjectId;
  friendsId: Types.ObjectId[];
}

const friendSchema = new Schema({
  userId: { type: Types.ObjectId, unique: true },
  friendsId: [
    {
      type: Types.ObjectId,
    },
  ],
});

const Friend = model<IFriend>("Friend", friendSchema);

export default Friend;
