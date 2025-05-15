import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, map, Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const user = { username, password };
    return this.http.post('/auth/login', user, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post('/auth/logout', {}, { withCredentials: true });
  }

  checkLoginStatus() {
    return this.http.get('/auth/check', { withCredentials: true }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
