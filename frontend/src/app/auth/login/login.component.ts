import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
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

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        console.log('Login erfolgreich!');

        // ⏳  Kleiner Timeout bevor wir navigieren:
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 300); // 100 ms reicht aus!
      },
      error: () => {
        this.errorMessage = 'Login fehlgeschlagen!';
      }
    });
  }
}
