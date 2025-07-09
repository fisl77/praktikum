import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { SurveyService } from '../../services/survey.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-end-create.questionnaire-popup',
  standalone: true,
  imports: [],
  templateUrl: './end-questionnaire-popup.component.html',
  styleUrls: ['./end-questionnaire-popup.component.css'],
})
export class EndQuestionnairePopupComponent implements OnInit {
  @Input() surveyIDToEnd: string | null = null;
  @Input() surveyEndTime: string | null = null;
  @Output() close = new EventEmitter<void>();

  originalEndTime: string | null = null;

  constructor(private surveyService: SurveyService, private toastr: ToastrService) {}

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
        this.toastr.success('Survey stopped successfully.');
        this.close.emit();
      },
      error: (err) => {
        this.toastr.error(err.message || 'Unknown Error');
        console.error('Error ending the Survey:', err);
      },
    });
  }
}
