import { Dollars, EncodedImage, Milliseconds, Hexadecimal, TransactionId } from './brands';

export const transactionsApiUrlExt = 'transactions';

export interface Transaction {
  readonly id: TransactionId;
  readonly amount: Dollars;
  readonly categoryCode: Hexadecimal;
  readonly merchant: string;
  readonly merchantLogo: EncodedImage;
  readonly transactionDate: Milliseconds;
  readonly transactionType: 'Card Payment' | 'Online Transfer' | 'Transaction';
}

export type TransactionFormatted = {
  readonly [P in keyof Transaction]: (
    Transaction[P] extends Dollars ? string :
    Transaction[P] extends Milliseconds ? string :
    Transaction[P]
  );
};
