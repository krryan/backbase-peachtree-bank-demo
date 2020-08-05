import { Dollars, EncodedImage, Milliseconds, Hexadecimal, TransactionId, AccountId } from './brands';

export const transactionsApiUrlExt = 'transactions';
export const transactionsApiQueryParamAccount = 'account';

export interface TransactionsForAccount {
  readonly id: AccountId;
  readonly transactions: Transaction[];
}

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

export function formatTransactions(transactions: Transaction[]): TransactionFormatted[] {
  return transactions.map(
    ({ amount, transactionDate, ...rest }) => ({
      ...rest,
      amount: formatDollars(-amount as Dollars),
      transactionDate: formatMilliseconds(transactionDate),
    }),
  );
}

export function formatDollars(amount: Dollars): string {
  return (amount < 0 ? '-' : '') + '$' + Math.abs(amount).toFixed(2);
}

const dateFormat = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
});
export function formatMilliseconds(ms: Milliseconds): string {
  const date = new Date(ms);
  return dateFormat.format(date);
}
