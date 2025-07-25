import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  Login(): void {
    console.log(this.username, this.password);
    if (!this.username || !this.password) {
      this.errorMessage = 'Username and Password cannot be empty.';
      return;
    }

    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        console.log('Login successful!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Login failed!';
      },
    });
  }
}
