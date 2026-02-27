import { HydratedDocument } from "mongoose";
import { IUser } from "../types/user.interface.ts";

export function enforceDailyUsageLimit(user: HydratedDocument<IUser>, text: string) {
  const isFreeUser = !user.subscription?.active;
  const remainingTokens = user.freeTokensLimit - user.dailyTokensUsed;

  const estimatedTokens = Math.ceil(text.length / 4) + 250;

  if (isFreeUser && remainingTokens < estimatedTokens) {
    const error: any = new Error("Not enough remaining tokens for this request");
    error.statusCode = 429;
    throw error;
  }
}