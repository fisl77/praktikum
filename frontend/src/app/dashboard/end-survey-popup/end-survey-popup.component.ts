import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-end-survey-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './end-survey-popup.component.html',
  styleUrls: ['./end-survey-popup.component.css'],
})
export class EndSurveyPopupComponent implements OnInit {
  @Input() surveyIDToEnd: string | null = null;
  @Input() surveyEndTime: string | null = null;
  @Output() close = new EventEmitter<void>();

  originalEndTime: string | null = null;

  constructor(private surveyService: SurveyService) {}

  ngOnInit(): void {
    if (this.surveyEndTime) {
      this.originalEndTime = new Date(this.surveyEndTime).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  cancelEnd() {
    this.close.emit();
  }

  confirmEndNow() {
    if (!this.surveyIDToEnd) return;

    this.surveyService.endQuestionnaire(this.surveyIDToEnd).subscribe({
      next: () => {
        //alert('Survey wurde erfolgreich beendet!');
        this.close.emit();
      },
      error: (err) => {
        console.error('Fehler beim Beenden der Survey:', err);
        //alert('Fehler beim Beenden');
      },
    });
  }
}
