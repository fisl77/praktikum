import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [FormsModule],
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        console.log('Login erfolgreich, Weiterleitung zum Dashboard');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login fehlgeschlagen:', err);
        alert('Login fehlgeschlagen!');
      }
    });
  }
}
