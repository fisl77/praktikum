import { Component, EventEmitter, Output } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-survey-popup',
  standalone: true,
  imports: [NgIf, NgForOf, FormsModule],
  templateUrl: './survey-popup.html',
  styleUrls: ['./survey-popup.css'],
})
export class SurveyPopupComponent {
  @Output() close = new EventEmitter<void>();

  question: string = '';
  answers: { text: string }[] = [{ text: '' }];
  startTime: string = '';
  endTime: string = '';
  minDateTime: string = '';

  constructor(private http: HttpClient) {
    this.minDateTime = this.getMinDateTime();
  }

  private getMinDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Korrektur wegen UTC
    return now.toISOString().slice(0, 16);
  }

  submitSurvey() {
    const payload = {
      question: this.question,
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date(this.endTime).toISOString(),
      answers: this.answers.map(a => ({ answer: a.text })),
      channelId: '1364918839699046400',
    };

    console.log('POST an Bot:', payload);

    this.http.post('/discord-bot/startQuestionnaire', payload, { withCredentials: true })
      .subscribe({
        next: (response) => {
          console.log('Umfrage erfolgreich gestartet:', response);
          this.close.emit();
        },
        error: (error) => {
          console.error('Fehler beim Starten der Umfrage:', error);
          alert('Fehler beim Erstellen der Umfrage');
        }
      });
  }

  addAnswer() {
    this.answers.push({ text: '' });
  }

  removeAnswer(index: number) {
    if (this.answers.length > 1) {
      this.answers.splice(index, 1);
    }
  }

  closePopup() {
    this.close.emit();
  }
}
