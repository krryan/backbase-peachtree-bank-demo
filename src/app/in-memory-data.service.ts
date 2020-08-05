import { Injectable } from '@angular/core';
import { InMemoryDbService, RequestInfo } from 'angular-in-memory-web-api';
import { transactionsApiUrlExt, TransactionsForAccount } from '../shared/transactions';
import { transactions as mockData, theOneAccount } from './in-memory-data.mock';
import { TransactionId } from '../shared/brands';
import { UserAccount, userAccountApiUrlExt } from '../shared/user-account';

interface Db {
  [userAccountApiUrlExt]: UserAccount;
  [transactionsApiUrlExt]: TransactionsForAccount[];
}

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {

  createDb(reqInfo?: RequestInfo): Db {
    const transactions = mockData.map(transaction => ({
        ...transaction,
        // cheap hack for the ID
        id: transaction.transactionDate as number as TransactionId,
      }));
    return {
      [userAccountApiUrlExt]: theOneAccount,
      [transactionsApiUrlExt]: [{ id: theOneAccount.accountId, transactions }],
    };
  }
}
