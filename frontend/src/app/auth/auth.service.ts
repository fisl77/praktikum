import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post('http://localhost:3000/auth/login', { username, password }, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post('http://localhost:3000/auth/logout', {}, { withCredentials: true });
  }
}
