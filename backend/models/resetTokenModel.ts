import { Schema, model, Document } from "mongoose";

export interface IResetToken extends Document {
  email: string;
  token: string;
  expiresAt: Date;
}

const resetTokenSchema = new Schema({
  email: {
    type: String,
    unique: true,
  },
  token: {
    type: String,
    unique: true,
  },
  expiresAt: Date,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const ResetToken = model<IResetToken>("Reset Token", resetTokenSchema);

export default ResetToken;
