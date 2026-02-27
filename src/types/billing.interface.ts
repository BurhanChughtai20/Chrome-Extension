export interface IBilling {
  uuid: string;                // Reference to user
  email: string;               // User email for verification
  verificationToken: string;   // Temporary token sent to email
  verified: boolean;           // Has email been verified
  subscriptionExpiresAt?: Date; // Expiration date after payment
  createdAt: Date;
  updatedAt: Date;
}
