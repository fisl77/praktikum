import { Component, OnInit } from '@angular/core';
import { EventPopupComponent } from './event-popup/event-popup';
import { SurveyPopupComponent } from './survey-popup/survey-popup';
import { SurveyListComponent } from './survey-list/survey-list';
import { EventListComponent } from './event-list/event-list';
import { NavComponent } from '../nav/navbar.component';
import { NgIf, NgForOf } from '@angular/common'; // <-- beides importieren!
import { EventService } from '../services/event.service';
import { SurveyService } from '../services/survey.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    EventListComponent,
    SurveyListComponent,
    EventPopupComponent,
    SurveyPopupComponent,
    NgIf,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  events: any[] = [];
  surveys: any[] = [];

  showEventPopup = false;
  showSurveyPopup = false;

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private surveyService: SurveyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Lädt Events und Surveys vom Server
   */
  loadData(): void {
    this.eventService.getAllEventsDetailed().subscribe({
      next: (events) => {
        console.log('Geladene Events:', events);
        this.events = events;
      },
      error: (err) => console.error('Fehler beim Laden der Events:', err),
    });

    this.surveyService.getAllSurveys().subscribe({
      next: (surveys) => {
        console.log('Geladene Surveys:', surveys);
        this.surveys = surveys;
      },
      error: (err) => console.error('Fehler beim Laden der Surveys:', err),
    });

  }

  openEventPopup(): void {
    this.showEventPopup = true;
  }

  closeEventPopup(): void {
    this.showEventPopup = false;
    this.loadData(); // ✨ Popup geschlossen ➔ Neu laden
  }

  openSurveyPopup(): void {
    this.showSurveyPopup = true;
  }

  closeSurveyPopup(): void {
    this.showSurveyPopup = false;
    this.loadData(); // ✨ Popup geschlossen ➔ Neu laden
  }
}
