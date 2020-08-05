import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { UserAccount, userAccountApiUrlExt } from '../shared/user-account';
import { catchError, mergeMap } from 'rxjs/operators';
import { Dollars } from '../shared/brands';

@Injectable({
  providedIn: 'root',
})
export class UserAccountService {

  private readonly userAccountUrl = `/api/${userAccountApiUrlExt}`;

  private cache: UserAccount | undefined;
  private userAccount = new BehaviorSubject<UserAccount | undefined>(undefined);

  constructor (
    private http: HttpClient,
  ) { }

  deductUserFunds(amount: Dollars): Observable<undefined> {
    if (this.cache === undefined) {
      return throwError('Cache must be set to deduct user funds.');
    }

    const { cache: { availableFunds } } = this;
    if (availableFunds - amount < -500) {
      return throwError('Insufficient funds: cannot overdraft more than $500.');
    }

    this.cache = {
      ...this.cache,
      availableFunds: availableFunds - amount as Dollars,
    };
    this.userAccount.next(this.cache);
    return of(undefined);
  }

  getUserAccount(): Observable<UserAccount | undefined> {
    const { cache, http, userAccountUrl } = this;
    return cache === undefined
      ? http.get<UserAccount | undefined>(userAccountUrl)
        .pipe(
          catchError(err => {
            console.error(err);
            return of(undefined);
          }),
          mergeMap(userAccount => {
            this.cache = userAccount;
            this.userAccount.next(userAccount);
            return this.userAccount.asObservable();
          }),
        )
      : this.userAccount.asObservable();
  }
}
