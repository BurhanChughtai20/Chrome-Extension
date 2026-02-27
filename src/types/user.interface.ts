export interface IUser {
  uuid: string; 
  dailyTokensUsed: number;
  freeTokensLimit: number;
  subscription?: {
    active: boolean;
    expiresAt?: Date; 
  };
  createdAt: Date;
  updatedAt: Date;
}
