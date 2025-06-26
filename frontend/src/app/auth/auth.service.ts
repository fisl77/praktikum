import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiEndpoints } from '../../api.endpoints';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isLoggedIn = signal(false);

  constructor(private http: HttpClient) {
    this.checkLogin().subscribe();
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(
      ApiEndpoints.AUTH_LOGIN,
      { username, password },
      { withCredentials: true }
    ).pipe(
      tap(() => this.isLoggedIn.set(true))
    );
  }

  logout(): Observable<any> {
    return this.http.post(ApiEndpoints.AUTH_LOGOUT, {}, { withCredentials: true }).pipe(
      tap(() => this.isLoggedIn.set(false))
    );
  }

  checkLogin(): Observable<any> {
    return this.http.get(ApiEndpoints.AUTH_CHECK, { withCredentials: true }).pipe(
      tap(() => this.isLoggedIn.set(true)),
      catchError(() => {
        this.isLoggedIn.set(false);
        return of(false);
      })
    );
  }
}
