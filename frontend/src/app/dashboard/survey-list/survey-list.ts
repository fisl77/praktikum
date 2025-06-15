import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyService } from '../../services/survey.service';
import { EndSurveyPopupComponent } from '../end-survey-popup/end-survey-popup.component';
import { SurveyStore } from '../../stores/survey.store';

@Component({
  selector: 'app-survey-list',
  standalone: true,
  imports: [CommonModule, EndSurveyPopupComponent],
  templateUrl: './survey-list.html',
  styleUrls: ['./survey-list.css'],
})
export class SurveyListComponent {
  private store = inject(SurveyStore);
  surveys = this.store.surveys;

  showAllSurveys = signal(false);
  maxVisibleSurveys = signal(3);

  visibleSurveys = computed(() =>
    this.showAllSurveys() ? this.surveys() : this.surveys().slice(0, this.maxVisibleSurveys())
  );

  toggleShowAll() {
    this.showAllSurveys.set(!this.showAllSurveys());
  }

  showEndSurveyPopup = false;
  selectedSurveyID: string | null = null;
  selectedSurveyEndTime: string | null = null;

  openEndSurveyPopup(surveyID: string, endTime: string): void {
    this.selectedSurveyID = surveyID;
    this.selectedSurveyEndTime = endTime;
    this.showEndSurveyPopup = true;
  }

  closeEndSurveyPopup(): void {
    this.showEndSurveyPopup = false;
    this.selectedSurveyID = null;
    this.selectedSurveyEndTime = null;
  }

  isLargeScreen:boolean = window.innerWidth >= 992;

  surveyChunks = computed(() => this.groupIntoChunks(this.surveys(), 3));

  // Neue Logik
  isUpcoming(q: any): boolean {
    const now = new Date();
    return new Date(q.startTime) > now;
  }

  isFinished(q: any): boolean {
    const now = new Date();
    return new Date(q.endTime) < now;
  }

  isCurrentlyLive(q: any): boolean {
    const now = new Date();
    return new Date(q.startTime) <= now && new Date(q.endTime) > now && q.isLive;
  }

  isExpiredOrInactive(q: any): boolean {
    const now = new Date();
    return new Date(q.endTime) < now || !q.isLive;
  }

  calculatePercentage(votes: number, answers: any[]): number {
    const total = answers.reduce((sum, a) => sum + a.totalVotes, 0);
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  }

  getWinner(answers: any[]): string {
    if (!answers?.length) return '';
    const maxVotes = Math.max(...answers.map(a => a.totalVotes));
    const winners = answers.filter(a => a.totalVotes === maxVotes);
    return winners.map(w => w.answer).join(', ');
  }

  isDraw(answers: any[]): boolean {
    if (!answers?.length) return false;
    const maxVotes = Math.max(...answers.map(a => a.totalVotes));
    const winners = answers.filter(a => a.totalVotes === maxVotes);
    return winners.length > 1;
  }

  private groupIntoChunks<T>(array: T[], chunkSize: number): T[][] {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }

  endQuestionnaire(questionnaireID: string): void {
    if (!questionnaireID) return;
    this.store.endQuestionnaire(questionnaireID);
  }
}
