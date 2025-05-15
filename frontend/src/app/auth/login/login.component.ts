import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // <-- RouterModule importieren
import { CommonModule } from '@angular/common'; // <-- CommonModule importieren
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule], // <-- ALLES wichtige importieren!
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Bitte Username und Passwort eingeben.';
      return;
    }

    if (this.username !== 'admin' || this.password !== 'admin123') {
      this.errorMessage = 'Benutzername oder Passwort ist falsch.';
      return;
    }

    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        console.log('Login erfolgreich!');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 300);
      },
      error: () => {
        this.errorMessage = 'Login fehlgeschlagen!';
      },
    });
  }
}
