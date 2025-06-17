import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NgIf } from '@angular/common';
import { SurveyStore } from '../stores/survey.store';
import { EventStore } from '../stores/events.store'; // ✅ hier importieren

@Component({
  selector: 'app-nav',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [NgIf]
})
export class NavComponent {
  readonly isLoggedIn = computed(() => this.authService.isLoggedIn());

  private readonly surveyStore = inject(SurveyStore);
  private readonly eventStore = inject(EventStore); // ✅ injizieren

  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout().subscribe(() => {
      this.surveyStore.currentSlide.set(0);
      this.eventStore.currentSlide.set(0); // ✅ Event-Slide zurücksetzen
      this.router.navigate(['/login']);
    });
  }
}
