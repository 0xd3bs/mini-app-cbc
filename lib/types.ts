export interface PredictionResponse {
  prediction: 'positive' | 'negative';
  tokenToBuy: string | null;
}
