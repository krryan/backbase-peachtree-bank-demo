import { Dollars, EncodedImage, Milliseconds, Hexadecimal, TransactionId, AccountId } from './brands';

export const transactionsApiUrlExt = 'transactions';
export const transactionsApiQueryParamAccountId = 'accountId';

// Uncalled anonymous function just for type-checking,
// ensures the param constant actually is a property on
// IdedTransaction.
// tslint:disable-next-line: no-unused-expression
((): keyof IdedTransaction => transactionsApiQueryParamAccountId);

export interface IdedTransaction extends Transaction {
  readonly id: TransactionId;
  readonly accountId: AccountId;
}

export interface Transaction {
  readonly amount: Dollars;
  readonly categoryCode: Hexadecimal;
  readonly merchant: string;
  readonly merchantLogo?: EncodedImage;
  readonly transactionDate: Milliseconds;
  readonly transactionType: 'Card Payment' | 'Online Transfer' | 'Transaction';
}

export function identifyTransaction(accountId: AccountId, transaction: Transaction): IdedTransaction {
  return {
    ...transaction,
    accountId,
    id: transaction.transactionDate as number as TransactionId,
  };
}

export function toMillisecondsNow(): Milliseconds {
  return new Date().getTime() as Milliseconds;
}

export function toRandomCategoryCode(): Hexadecimal {
  return '#' + Math.floor(Math.random() * 16777215).toString(16) as Hexadecimal;
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
