import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiEndpoints } from '../../api.endpoints';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(
      ApiEndpoints.AUTH_LOGIN,
      { username, password },
      { withCredentials: true }
    );
  }

  logout(): Observable<any> {
    return this.http.post(ApiEndpoints.AUTH_LOGOUT, {}, { withCredentials: true });
  }

  checkLogin(): Observable<any> {
    return this.http.get(ApiEndpoints.AUTH_CHECK, { withCredentials: true });
  }
}
