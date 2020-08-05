import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import {
  Transaction, transactionsApiUrlExt,
  formatMilliseconds, formatDollars, IdedTransaction, identifyTransaction,
  toRandomCategoryCode, toMillisecondsNow, transactionsApiQueryParamAccountId,
} from '../shared/transactions';
import { Sorting } from '../shared/sorting';
import { impossible } from '../shared/utils';
import { AccountId, Dollars } from '../shared/brands';
import { UserAccountService } from './user-account.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {

  private readonly transactionsUrl = `/api/${transactionsApiUrlExt}`;

  private cache: IdedTransaction[] | undefined;
  private transactions = new BehaviorSubject<IdedTransaction[]>([]);

  constructor (
    private http: HttpClient,
    private userAccountService: UserAccountService,
  ) { }

  private handleError<T>(
    operation: string,
    defaultResult: T,
    message = `Error during ${operation}.`,
  ): (error: any) => Observable<T> {
    return error => {
      console.error(message, error);

      // TODO: show something to user

      return of(defaultResult);
    };
  }

  // The in-memory-web-api PUT method doesn't seem to work,
  // so just working with our own cache.
  private putTransaction(transaction: IdedTransaction): Observable<undefined> {
    if (this.cache === undefined) {
      // If that cache doesn't exist, we can do nothing.
      return throwError('Cache must be set to add new transactions.');
    }
    const index = this.cache.findIndex(({ id }) => id === transaction.id);
    if (index < 0) {
      this.cache.push(transaction);
    }
    else {
      this.cache[index] = transaction;
    }

    this.transactions.next(this.cache);
    return of(undefined);
  }

  addNewTransaction(
    account: AccountId,
    merchant: string,
    amount: Dollars,
  ): Observable<unknown> {

    const transaction = identifyTransaction(account, {
      merchant,
      amount,
      categoryCode: toRandomCategoryCode(),
      transactionDate: toMillisecondsNow(),
      transactionType: 'Transaction',
    });

    return this.userAccountService.deductUserFunds(amount)
      .pipe(
        mergeMap(() => this.putTransaction(transaction)),
        catchError(this.handleError('addNewTransaction', undefined)),
      );
  }

  getTransactions(
    account: AccountId,
    sorting?: Sorting,
    filtering?: string,
  ): Observable<Transaction[]> {
    const { cache, http, transactionsUrl, handleError } = this;

    const url = `${transactionsUrl}?${transactionsApiQueryParamAccountId}=^${account}$`;
    let result = cache === undefined
      ? http.get<IdedTransaction[]>(url)
        .pipe(
          catchError(handleError<IdedTransaction[]>('getTransactions', [])),
          mergeMap(transactions => {
            this.cache = transactions;
            this.transactions.next(this.cache);
            return this.transactions.asObservable();
          }),
        )
      : this.transactions.asObservable();

    if (sorting !== undefined) {
      const compare = toTransactionComparison(sorting);
      result = result
        .pipe(
          map(transactions => transactions.sort(compare)),
        );
    }

    if (filtering !== undefined) {
      const filteringCleaned = filtering.trim().toLocaleLowerCase();
      if (filteringCleaned.length > 0) {
        function includesFilter(candidate: string): boolean {
          return candidate.toLocaleLowerCase().includes(filteringCleaned);
        }
        result = result
          .pipe(
            map(transactions => transactions.filter(
              ({ transactionDate, merchant, amount }) => {
                return includesFilter(merchant)
                  || includesFilter(formatDollars(amount))
                  || includesFilter(formatMilliseconds(transactionDate));
              },
            )),
          );
      }
    }

    return result;
  }
}

function toTransactionComparison(
  sorting: Sorting,
): (a: Transaction, b: Transaction) => number {
  const directionFactor = sorting.direction === 'ascending' ? +1 : -1;

  switch (sorting.column) {

    case 'date': return ({ transactionDate: a }, { transactionDate: b }) =>
      (a - b) * directionFactor;

    case 'beneficiary': return ({ merchant: a }, { merchant: b }) =>
      a.localeCompare(b) * directionFactor;

    case 'amount': return ({ amount: a }, { amount: b }) =>
      // "inverted" because payments are displayed as negative numbers
      (b - a) * directionFactor;

    default: return impossible(sorting.column);
  }
}
