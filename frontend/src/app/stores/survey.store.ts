import { inject, signal, computed, effect } from '@angular/core';
import { SurveyService } from '../services/survey.service';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SurveyStore {
  private surveyService = inject(SurveyService);

  surveys = signal<any[]>([]);
  currentSlide = signal(0); // 👈 merken des aktuellen Slides

  constructor() {
    this.loadSurveys();

    effect(() => {
      const interval = setInterval(() => this.loadSurveysPreserveSlide(), 5000);
      return () => clearInterval(interval);
    });
  }

  // ⏳ Normales initiales Laden (z. B. beim Start)
  loadSurveys() {
    this.surveyService.getAllSurveys().subscribe({
      next: (data) => {
        this.surveys.set(data);
      },
      error: (err) => console.error('Fehler beim Laden der Surveys', err),
    });
  }

  // 🧠 Nachladen mit Slide-Erhalt
  loadSurveysPreserveSlide() {
    const current = this.currentSlide();
    const oldChunks = this.groupIntoChunks(this.surveys(), 3);
    const oldChunk = oldChunks[current] ?? [];

    // Merke dir die IDs der aktuell sichtbaren Umfragen im aktiven Chunk
    const oldIds = oldChunk.map(q => q.questionnaireID).sort().join(',');

    this.surveyService.getAllSurveys().subscribe({
      next: (newSurveys) => {
        this.surveys.set(newSurveys);

        const newChunks = this.groupIntoChunks(newSurveys, 3);
        const foundIndex = newChunks.findIndex(chunk =>
          chunk.map(q => q.questionnaireID).sort().join(',') === oldIds
        );

        if (foundIndex !== -1) {
          this.currentSlide.set(foundIndex); // 🧠 setze zurück auf vorherigen Slide
        } else {
          this.currentSlide.set(0); // Fallback
        }
      },
      error: (err) => console.error('Fehler beim Nachladen der Surveys', err)
    });
  }

  endQuestionnaire(questionnaireID: string) {
    this.surveyService.endQuestionnaire(questionnaireID).subscribe({
      next: () => {
        console.log('[SurveyStore] Umfrage erfolgreich beendet:', questionnaireID);
        this.loadSurveysPreserveSlide();
      },
      error: (err) => {
        console.error('[SurveyStore] Fehler beim Beenden der Umfrage:', err);
      }
    });
  }

  // 🧩 Nutze dieselbe Chunk-Methode wie im Component
  private groupIntoChunks<T>(array: T[], chunkSize: number): T[][] {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }
}
