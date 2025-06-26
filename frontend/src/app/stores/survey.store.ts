import { inject, signal, computed, effect } from '@angular/core';
import { SurveyService } from '../services/survey.service';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SurveyStore {
  private surveyService = inject(SurveyService);

  surveys = signal<any[]>([]);
  currentSlide = signal(0);

  constructor() {
    this.loadSurveys();

    effect(() => {
      const interval = setInterval(() => this.loadSurveysPreserveSlide(), 5000);
      return () => clearInterval(interval);
    });
  }

  loadSurveys() {
    this.surveyService.getAllSurveys().subscribe({
      next: (data) => {
        this.surveys.set(data);
      },
      error: (err) => console.error('Error loading all Questionnaires', err),
    });
  }

  loadSurveysPreserveSlide() {
    const current = this.currentSlide();
    const oldChunks = this.groupIntoChunks(this.surveys(), 3);
    const oldChunk = oldChunks[current] ?? [];

    const oldIds = oldChunk.map(q => q.questionnaireID).sort().join(',');

    this.surveyService.getAllSurveys().subscribe({
      next: (newSurveys) => {
        this.surveys.set(newSurveys);

        const newChunks = this.groupIntoChunks(newSurveys, 3);
        const foundIndex = newChunks.findIndex(chunk =>
          chunk.map(q => q.questionnaireID).sort().join(',') === oldIds
        );

        if (foundIndex !== -1) {
          this.currentSlide.set(foundIndex);
        } else {
          this.currentSlide.set(0);
        }
      },
      error: (err) => console.error('Error reloading Questionnaires', err)
    });
  }

  endQuestionnaire(questionnaireID: string) {
    this.surveyService.endQuestionnaire(questionnaireID).subscribe({
      next: () => {
        console.log('[SurveyStore] Questionnaire ended successfully:', questionnaireID);
        this.loadSurveysPreserveSlide();
      },
      error: (err) => {
        console.error('[SurveyStore] Error ending the Questionnaire:', err);
      }
    });
  }

  private groupIntoChunks<T>(array: T[], chunkSize: number): T[][] {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }
}
