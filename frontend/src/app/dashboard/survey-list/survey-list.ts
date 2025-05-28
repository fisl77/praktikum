import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyService} from '../../services/survey.service';

@Component({
  selector: 'app-survey-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './survey-list.html',
  styleUrls: ['./survey-list.css']
})
export class SurveyListComponent {
  @Input() surveys: any[] = [];
  @Input() showAllSurveys = false;
  @Input() maxVisibleSurveys = 3;

  constructor(private surveyService: SurveyService) {}

  surveyChunks: any[][] = [];
  isLargeScreen = window.innerWidth >= 992;

  ngOnChanges() {
    if (this.surveys) {
      this.surveyChunks = this.groupIntoChunks(this.surveys, 3);
    }
  }

  get visibleSurveys() {
    return this.showAllSurveys ? this.surveys : this.surveys.slice(0, this.maxVisibleSurveys);
  }

  toggleShowAll() {
    this.showAllSurveys = !this.showAllSurveys;
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
    console.log('Ende Anfrage für Umfrage ID:', questionnaireID); // ← hinzufügen
    if (!questionnaireID) {
      console.error('Keine gültige ID übergeben!');
      return;
    }
    this.surveyService.endQuestionnaire(questionnaireID).subscribe({
      next: () => {
        console.log('Umfrage wurde erfolgreich beendet');
        this.loadData();
      },
      error: (err) => console.error('Fehler beim Beenden der Umfrage:', err),
    });
  }

  private loadData() {
    this.surveyService.getAllSurveys().subscribe({
      next: (surveys) => {
        console.log('Geladene Surveys:', surveys);
        this.surveys = surveys;
        this.surveyChunks = this.groupIntoChunks(this.surveys, 3);
      },
      error: (err) => console.error('Fehler beim Laden der Surveys:', err),
    });
  }
}
