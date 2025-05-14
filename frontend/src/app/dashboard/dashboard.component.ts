import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { EventService } from '../services/event.service';
import { SurveyService } from '../services/survey.service';
import { NgForOf } from '@angular/common';

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
    private surveyService: SurveyService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.eventService.getEvents().subscribe(events => this.events = events);
    this.surveyService.getAllSurveys().subscribe(surveys => this.surveys = surveys);
  }

  logout() {
    this.authService.logout();
  }

  openEventPopup() {
    alert('Popup Event öffnen (kommt gleich!)');
  }

  openSurveyPopup() {
    alert('Popup Survey öffnen (kommt gleich!)');
  }
}
