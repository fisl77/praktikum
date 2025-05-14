import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}
