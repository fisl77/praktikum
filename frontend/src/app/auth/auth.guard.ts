import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { ApiEndpoints } from '../../api.endpoints';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private http: HttpClient) {}

  canActivate() {
    return this.http.get(ApiEndpoints.AUTH_CHECK, { withCredentials: true }).pipe(
      map(() => true),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
