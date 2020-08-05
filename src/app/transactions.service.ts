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
import { ModalService } from './modal.service';

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
    private modalService: ModalService,
  ) { }

  private handleError<T>(
    operation: string,
    defaultResult: T,
    toMessage: (error: any) => string = () => `Error during ${operation}.`,
  ): (error: any) => Observable<T> {
    return error => {
      console.error(toMessage(error), error);

      return this.modalService.show({ text: toMessage(error), confirm: 'OK' })
        .pipe(
          map(() => defaultResult),
        );
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
    merchant: string | null,
    amount: Dollars | null,
  ): Observable<boolean> {

    if (merchant === null || merchant.length <= 0) {
      return throwError('You must specify who the beneficiary of the transaction will be.')
        .pipe(
          catchError(this.handleError('addNewTransaction', false,
            error => error,
          )),
        );
    }

    if (amount === null || amount <= 0) {
      return throwError('You must specify a number of dollars to include in the transaction.')
        .pipe(
          catchError(this.handleError('addNewTransaction', false,
            error => error,
          )),
        );
    }

    const transaction = identifyTransaction(account, {
      merchant,
      amount,
      categoryCode: toRandomCategoryCode(),
      transactionDate: toMillisecondsNow(),
      transactionType: 'Transaction',
    });

    return this.modalService.show({
      text: `Transfer ${formatDollars(amount)} to ${merchant}?`,
      cancel: 'Cancel',
      confirm: 'Transfer',
    })
      .pipe(
        mergeMap(isConfirmed => isConfirmed
          ? this.userAccountService.deductUserFunds(amount)
            .pipe(
              mergeMap(() => this.putTransaction(transaction)),
              catchError(this.handleError('addNewTransaction', undefined, error => error)),
              map(() => true),
            )
          : of(false),
        ),
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
