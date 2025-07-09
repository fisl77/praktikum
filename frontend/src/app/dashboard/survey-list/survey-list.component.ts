import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyService } from '../../services/survey.service';
import { EndSurveyPopupComponent } from '../end-survey-popup/end-survey-popup.component';
import { SurveyStore } from '../../stores/survey.store';
import { CarouselModule} from 'primeng/carousel';

@Component({
  selector: 'app-survey-list',
  standalone: true,
  imports: [CommonModule, EndSurveyPopupComponent, CarouselModule],
  templateUrl: './survey-list.component.html',
  styleUrls: ['./survey-list.component.css'],
})
export class SurveyListComponent {
  private store = inject(SurveyStore);
  surveys = this.store.surveys;

  responsiveOptions = [
    { breakpoint: '1024px', numVisible: 3, numScroll: 1 },
    { breakpoint: '768px', numVisible: 2, numScroll: 1 },
    { breakpoint: '576px', numVisible: 1, numScroll: 1 }
  ];


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

  isUpcoming(q: any): boolean {
    const now = new Date();
    return new Date(q.startTime) > now && new Date(q.endTime) > now;
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

  endQuestionnaire(questionnaireID: string): void {
    if (!questionnaireID) return;
    this.store.endQuestionnaire(questionnaireID);
  }
}
