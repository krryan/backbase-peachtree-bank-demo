import { Dollars, EncodedImage, Milliseconds, Hexadecimal, TransactionId } from './brands';

export interface Transaction {
  readonly id: TransactionId;
  readonly amount: Dollars;
  readonly categoryCode: Hexadecimal;
  readonly merchant: string;
  readonly merchantLogo: EncodedImage;
  readonly transactionDate: Milliseconds;
  readonly transactionType: 'Card Payment' | 'Online Transfer' | 'Transaction';
}
