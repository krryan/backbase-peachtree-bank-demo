import { Injectable } from '@angular/core';
import { InMemoryDbService, RequestInfo } from 'angular-in-memory-web-api';
import { Transaction, transactionsApiUrlExt } from '../shared/transactions';
import { transactions as mockData } from './in-memory-data.mock';
import { TransactionId } from '../shared/brands';

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {

  createDb(reqInfo?: RequestInfo): { [transactionsApiUrlExt]: Transaction[]; } {
    const transactions = mockData.map(transaction => ({
      ...transaction,
      // cheap hack for the ID
      id: transaction.transactionDate as number as TransactionId,
    }));
    return { [transactionsApiUrlExt]: transactions };
  }
}
