import { Schema, model } from "mongoose";
import type { IUsageLog } from "../types/usage.interface.ts";

const usageSchema = new Schema<IUsageLog>(
  {
    uuid: { type: String, required: true },
    date: { type: Date, default: () => new Date() },
    tokensUsed: { type: Number, required: true },
    apiEndpoint: { type: String, required: true },
  },
  { versionKey: false }
);

export const UsageLogModel = model<IUsageLog>("UsageLog", usageSchema);
