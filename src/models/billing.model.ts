import { Schema, model, Document } from "mongoose";
import type { IBilling } from "../types/billing.interface.ts";

interface IBillingDoc extends IBilling, Document {}

const billingSchema = new Schema<IBillingDoc>(
  {
    uuid: { type: String, required: true },
    email: { type: String, required: true },
    verificationToken: { type: String, required: true },
    verified: { type: Boolean, default: false },
    subscriptionExpiresAt: { type: Date },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
  },
  { versionKey: false }
);

billingSchema.pre("save", function (this: IBillingDoc) {
  this.updatedAt = new Date();
});

export const BillingModel = model<IBillingDoc>("Billing", billingSchema);
