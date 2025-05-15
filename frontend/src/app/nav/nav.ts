import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service'; // Pfad anpassen!

@Component({
  selector: 'app-nav',
  standalone: true,
  templateUrl: './nav.html',
  styleUrls: ['./nav.css'],
})
export class NavComponent {
  constructor(private authService: AuthService, private router: Router) {}

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
