import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { UserAccount, userAccountApiUrlExt } from '../shared/user-account';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserAccountService {

  private readonly userAccountUrl = `/api/${userAccountApiUrlExt}`;

  constructor (
    private http: HttpClient,
  ) { }

  getUserAccount(): Observable<UserAccount | undefined> {
    const { http, userAccountUrl } = this;
    return http.get<UserAccount | undefined>(userAccountUrl)
      .pipe(
        catchError(err => {
          console.error(err);
          return of(undefined);
        }),
      );
  }
}
