import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NgIf } from '@angular/common';
import { SurveyStore } from '../stores/survey.store'; // 👈 ggf. Pfad anpassen!

@Component({
  selector: 'app-nav',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [NgIf]
})
export class NavComponent {
  readonly isLoggedIn = computed(() => this.authService.isLoggedIn());

  private readonly surveyStore = inject(SurveyStore); // 👈 Store injizieren

  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout().subscribe(() => {
      this.surveyStore.currentSlide.set(0); // ✅ Slide-Index zurücksetzen
      this.router.navigate(['/login']);
    });
  }
}
