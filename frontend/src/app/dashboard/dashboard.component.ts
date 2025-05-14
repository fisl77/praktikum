import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { EventService } from '../services/event.service';
import { SurveyService } from '../services/survey.service';
import { NgForOf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgForOf],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  events: any[] = [];
  surveys: any[] = [];

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private surveyService: SurveyService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.eventService.getEvents().subscribe(events => this.events = events);
    this.surveyService.getAllSurveys().subscribe(surveys => this.surveys = surveys);
  }

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

  openEventPopup() {
    alert('Popup Event öffnen (kommt gleich!)');
  }

  openSurveyPopup() {
    alert('Popup Survey öffnen (kommt gleich!)');
  }
}
