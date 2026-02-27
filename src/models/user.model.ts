import { Schema, model } from "mongoose";
import type { IUser } from "../types/user.interface.ts";

const userSchema = new Schema<IUser>({
  uuid: { type: String, required: true, unique: true },
  dailyTokensUsed: { type: Number, default: 0 },
  freeTokensLimit: { type: Number, default: 500 },
  subscription: {
    active: { type: Boolean, default: false },
    expiresAt: { type: Date }
  },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() }
});

export const UserModel = model<IUser>("User", userSchema);
