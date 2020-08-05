import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Transaction, transactionsApiUrlExt } from '../shared/transactions';
import { Sorting } from '../shared/sorting';
import { impossible } from '../shared/utils';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {

  private transactionsUrl = `/api/${transactionsApiUrlExt}`;

  private readonly httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  } as const;

  constructor(
    private http: HttpClient,
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

  addTransaction(transaction: Transaction): Observable<unknown> {
    const { http, transactionsUrl, httpOptions, handleError } = this;
    return http.put(transactionsUrl, transaction, httpOptions)
      .pipe(
        catchError(handleError('addTransaction', undefined)),
      );
  }

  getTransactions(
    sorting?: Sorting,
  ): Observable<Transaction[]> {
    const { http, transactionsUrl, handleError } = this;
    let result = http.get<Transaction[]>(transactionsUrl)
      .pipe(
        catchError(handleError<Transaction[]>('getTransactions', [])),
      );

    if (sorting !== undefined) {
      const compare = toTransactionComparison(sorting);
      result = result
        .pipe(
          map(transactions => transactions.sort(compare)),
        );
    }

    return result;
  }
}

function toTransactionComparison(sorting: Sorting): (a: Transaction, b: Transaction) => number {
  const directionFactor = sorting.direction === 'ascending' ? +1 : -1;
  switch (sorting.column) {
    case 'date': return ({ transactionDate: a }, { transactionDate: b }) =>
      (a - b) * directionFactor;
    case 'beneficiary': return ({ merchant: a }, {merchant: b }) =>
      a.localeCompare(b) * directionFactor;
    case 'amount': return ({ amount: a }, { amount: b }) =>
      // "inverted" because payments are displayed as negative numbers
      (b - a) * directionFactor;
    default: return impossible(sorting.column);
  }
}
