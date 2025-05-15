import { Component, OnInit } from '@angular/core';
import { EventPopupComponent } from './event-popup/event-popup';
import { SurveyPopupComponent } from './survey-popup/survey-popup';
import { SurveyListComponent } from './survey-list/survey-list';
import { EventListComponent } from './event-list/event-list';
import { NavComponent } from '../nav/nav';
import { NgIf, NgForOf } from '@angular/common'; // <-- beides importieren!
import { EventService } from '../services/event.service';
import { SurveyService } from '../services/survey.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NavComponent,
    EventListComponent,
    SurveyListComponent,
    EventPopupComponent,
    SurveyPopupComponent,
    NgIf,
    NgForOf, // <-- wichtig für *ngFor
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
    this.eventService.getAllEventsDetailed().subscribe(events => {
      this.events = events;
    });

    this.surveyService.getAllSurveys().subscribe(surveys => {
      this.surveys = surveys;
    });
  }

  loadData() {
    this.eventService.getEvents().subscribe(events => {
      console.log('Geladene Events:', events);
      this.events = events;
    });

    this.surveyService.getAllSurveys().subscribe(surveys => {
      console.log('Geladene Surveys:', surveys);
      this.surveys = surveys;
    });

  }


  openEventPopup() {
    this.showEventPopup = true;
  }

  openSurveyPopup() {
    this.showSurveyPopup = true;
  }
}
