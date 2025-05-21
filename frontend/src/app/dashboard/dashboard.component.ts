import {Component, HostListener, OnInit} from '@angular/core';
import { EventPopupComponent } from './event-popup/event-popup';
import { SurveyPopupComponent} from './survey-popup/survey-popup';
import { SurveyListComponent } from './survey-list/survey-list';
import { EventListComponent } from './event-list/event-list';
import { NavComponent } from '../nav/navbar.component';
import {NgIf, NgForOf, DatePipe, CommonModule} from '@angular/common';
import { EventService } from '../services/event.service';
import { SurveyService } from '../services/survey.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NavComponent,
    EventListComponent,
    SurveyListComponent,
    EventPopupComponent,
    SurveyPopupComponent,
    NgIf,
    NgForOf,
    DatePipe
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

  surveyChunks: any[][] = [];
  eventChunks: any[][] = [];
  maxVisibleEvents = 3;
  showAllEvents = false;

  groupIntoChunks<T>(array: T[], chunkSize: number): T[][] {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }

  isLargeScreen = window.innerWidth >= 992;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.eventService.getAllEventsDetailed().subscribe({
      next: (events) => {
        console.log('Geladene Events:', events);
        this.events = events;
        this.eventChunks = this.groupIntoChunks(this.events, 3)
      },
      error: (err) => console.error('Fehler beim Laden der Events:', err),
    });

    this.surveyService.getAllSurveys().subscribe({
      next: (surveys) => {
        console.log('Geladene Surveys:', surveys);
        this.surveys = surveys;
        this.surveyChunks = this.groupIntoChunks(this.surveys, 3);
      },
      error: (err) => console.error('Fehler beim Laden der Surveys:', err),
    });

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

  calculatePercentage(votes: number, answers: any[]): number {
    const total = answers.reduce((sum, a) => sum + a.totalVotes, 0);
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  }

  getWinner(answers: any[]): string {
    if (!answers?.length) return '';
    return answers.reduce((a, b) => (a.totalVotes > b.totalVotes ? a : b)).answer;
  }

  isLastEnemy(enemy: any, enemies: any[]): boolean {
    return enemies.indexOf(enemy) === enemies.length - 1;
  }

  getLevelNames(event: any): string {
    if (!event || !Array.isArray(event.levels)) return '';
    return event.levels.map((l: any) => l.name).join(', ');
  }

  @HostListener('window:resize')
  onResize() {
    this.isLargeScreen = window.innerWidth >= 992;
  }

  maxVisibleSurveys = 3;
  showAllSurveys = false;

  get visibleSurveys() {
    return this.showAllSurveys ? this.surveys : this.surveys.slice(0, this.maxVisibleSurveys);
  }

  toggleShowAll() {
    this.showAllSurveys = !this.showAllSurveys;
  }

  get visibleEvents() {
    return this.showAllEvents ? this.events : this.events.slice(0, this.maxVisibleEvents);
  }

  toggleShowAllEvents() {
    this.showAllEvents = !this.showAllEvents;
  }
}
