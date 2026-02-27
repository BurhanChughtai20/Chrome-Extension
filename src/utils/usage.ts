import { UserModel } from "../models/user.model.ts";

export async function getUserUsage(uuid: string): Promise<{
  dailyTokensUsed: number;
  freeTokensLimit: number;
  subscriptionActive: boolean;
}> {
  let user = await UserModel.findOne({ uuid });

  const now = new Date();

  if (!user) {
    user = await UserModel.create({
      uuid,
      dailyTokensUsed: 0,
      freeTokensLimit: 500,
      subscription: { active: false },
      createdAt: now,
      updatedAt: now,
    });
  }

  const lastUpdate = user.updatedAt || user.createdAt;
  if (!isSameDay(now, lastUpdate)) {
    user.dailyTokensUsed = 0;
    user.updatedAt = now;
    await user.save();
  }

  return {
    dailyTokensUsed: user.dailyTokensUsed,
    freeTokensLimit: user.freeTokensLimit,
    subscriptionActive: user.subscription?.active ?? false,
  };
}

export async function incrementUserUsage(uuid: string, tokens: number): Promise<void> {
  const user = await UserModel.findOne({ uuid });
  if (!user) throw new Error("User not found");

  const now = new Date();
  if (!isSameDay(now, user.updatedAt)) {
    user.dailyTokensUsed = 0;
  }

  user.dailyTokensUsed += tokens;
  user.updatedAt = now;

  await user.save();
}
function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}
