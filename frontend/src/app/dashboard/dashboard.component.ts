import { Component, OnInit } from '@angular/core';
import { EventPopupComponent } from './event-popup/event-popup.component';
import { SurveyPopupComponent } from './survey-popup/survey-popup.component';
import { SurveyListComponent } from './survey-list/survey-list.component';
import { EventListComponent } from './event-list/event-list.component';
import { EventDetailPopupComponent } from './event-detail-popup/event-detail-popup.component';
import { NavComponent } from '../nav/navbar.component';

import { EventService } from '../services/event.service';
import { SurveyService } from '../services/survey.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { EndEventPopupComponent } from './end-event-popup/end-event-popup.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    EventListComponent,
    SurveyListComponent,
    EventPopupComponent,
    SurveyPopupComponent,
    EventDetailPopupComponent,
    EndEventPopupComponent
],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  events: any[] = [];
  surveys: any[] = [];
  showEventPopup = false;
  showSurveyPopup = false;
  showEndEventPopup = false;
  showEventDetailPopup = false;
  selectedEvent: any = null;
  selectedEventID: number | null = null;
  selectedEndTime: string | null = null;

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private surveyService: SurveyService,
    private router: Router
  ) {}

  surveyChunks: any[][] = [];
  eventChunks: any[][] = [];
  maxVisibleEvents = 3;
  showAllEvents = false;
  maxVisibleSurveys = 3;
  showAllSurveys = false;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.eventService.getAllEventsDetailed().subscribe({
      next: (events) => {
        this.events = events;
        this.eventChunks = this.groupIntoChunks(this.events, 3);
      },
      error: (err) => console.error('Error loading the Events:', err),
    });

    this.surveyService.getAllSurveys().subscribe({
      next: (surveys) => {
        this.surveys = surveys;
        this.surveyChunks = this.groupIntoChunks(this.surveys, 3);
      },
      error: (err) => console.error('Error loading the Surveys:', err),
    });
  }

  groupIntoChunks<T>(array: T[], chunkSize: number): T[][] {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }

  openEventPopup(): void {
    this.showEventPopup = true;
  }

  closeEventPopup(): void {
    this.showEventPopup = false;
    this.loadData();
  }

  openSurveyPopup(): void {
    this.showSurveyPopup = true;
  }

  closeSurveyPopup(): void {
    this.showSurveyPopup = false;
    this.loadData();
  }

  openEndPopup(eventID: number, endTime: string) {
    this.selectedEventID = eventID;
    this.selectedEndTime = endTime;
    this.showEndEventPopup = true;
  }

  closeEndPopup() {
    this.showEndEventPopup = false;
    this.selectedEventID = null;
    this.selectedEndTime = null;
  }

  openDetailPopup(event: any): void {
    this.selectedEvent = event;
    this.showEventDetailPopup = true;
  }

  closeDetailPopup(): void {
    this.selectedEvent = null;
    this.showEventDetailPopup = false;
  }

  get visibleSurveys() {
    return this.showAllSurveys ? this.surveys : this.surveys.slice(0, this.maxVisibleSurveys);
  }

  get visibleEvents() {
    return this.showAllEvents ? this.events : this.events.slice(0, this.maxVisibleEvents);
  }

  toggleShowAll() {
    this.showAllSurveys = !this.showAllSurveys;
  }

  toggleShowAllEvents() {
    this.showAllEvents = !this.showAllEvents;
  }
}
