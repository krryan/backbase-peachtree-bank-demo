import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Transaction, transactionsApiUrlExt } from '../shared/transactions';

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

  getTransactions(): Observable<Transaction[]> {
    const { http, transactionsUrl, handleError } = this;
    return http.get<Transaction[]>(transactionsUrl)
      .pipe(
        catchError(handleError('getTransactions', [])),
      );
  }
}
