import { inject, signal } from '@angular/core';
import { SurveyService } from '../services/survey.service';
import { effect } from '@angular/core';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SurveyStore {
  private surveyService = inject(SurveyService);

  surveys = signal<any[]>([]);

  constructor() {
    this.loadSurveys();

    effect(() => {
      const interval = setInterval(() => this.loadSurveys(), 5000);
      return () => clearInterval(interval);
    });
  }

  loadSurveys() {
    this.surveyService.getAllSurveys().subscribe({
      next: (data) => {
        console.log('[SurveyStore] Neue Surveys geladen:', data);
        this.surveys.set(data);
      },
      error: (err) => console.error('Fehler beim Laden der Surveys', err),
    });
  }

  endQuestionnaire(questionnaireID: string) {
    this.surveyService.endQuestionnaire(questionnaireID).subscribe({
      next: () => {
        console.log('[SurveyStore] Umfrage erfolgreich beendet:', questionnaireID);
        this.loadSurveys();
      },
      error: (err) => {
        console.error('[SurveyStore] Fehler beim Beenden der Umfrage:', err);
      }
    });
  }
}
