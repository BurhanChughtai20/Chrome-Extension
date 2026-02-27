export interface IUsageLog {
  uuid: string;                // Reference to user
  date: Date;                  // Date of usage
  tokensUsed: number;          // Tokens consumed in this session
  apiEndpoint: string;         // e.g., '/format/clean'
}
