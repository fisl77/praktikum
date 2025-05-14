import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = document.cookie.includes('connect.sid'); // prüft auf Session-Cookie
    if (!isLoggedIn) {
      console.log('Nicht eingeloggt -> Weiterleitung zu Login');
      this.router.navigate(['/login']);
      return false;
    }
    console.log('Benutzer eingeloggt -> Zugriff erlaubt');
    return true;
  }
}
