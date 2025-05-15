import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-nav',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [
    NgIf
  ]
})
export class NavComponent {
  constructor(public authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout erfolgreich!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Fehler beim Logout:', err);
      }
    });
  }
}
