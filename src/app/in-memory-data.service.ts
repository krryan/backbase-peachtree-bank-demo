import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { transactionsApiUrlExt, IdedTransaction, identifyTransaction } from '../shared/transactions';
import { transactions as mockData, theOneAccount } from './in-memory-data.mock';
import { UserAccount, userAccountApiUrlExt } from '../shared/user-account';

interface Db {
  [userAccountApiUrlExt]: UserAccount;
  [transactionsApiUrlExt]: IdedTransaction[];
}

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {

  private transactions = mockData.map(transaction => identifyTransaction(
    theOneAccount.accountId,
    transaction,
  ));

  createDb(): Db {
    return {
      [userAccountApiUrlExt]: theOneAccount,
      [transactionsApiUrlExt]: this.transactions,
    };
  }
}
