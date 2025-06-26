import {Component, ElementRef, EventEmitter, Output, QueryList, ViewChild, ViewChildren} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { SurveyService } from '../../services/survey.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-survey-popup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './survey-popup.component.html',
  styleUrls: ['./survey-popup.component.css'],
})
export class SurveyPopupComponent {
  @Output() close = new EventEmitter<void>();

  @ViewChild('questionInput') questionInput!: ElementRef<HTMLInputElement>;
  @ViewChildren('answerInput') answerInputs!: QueryList<ElementRef<HTMLInputElement>>;

  question: string = '';
  answers: { text: string }[] = [{ text: '' }];
  startTime: string = '';
  endTime: string = '';
  minDateTime: string = '';

  constructor(private surveyService: SurveyService, private toastr: ToastrService) {
    this.minDateTime = this.getMinDateTime();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.questionInput?.nativeElement.focus();
    }, 50);
  }

  private getMinDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  submitSurvey() {
    if (!this.question) {
      this.toastr.error('The Question cannot be empty!')
      return;
    }

    if (!this.answers.length || this.answers.some(a => !a.text.trim())) {
      this.toastr.error('Each answer must be filled out!');
      return;
    }

    if (!this.startTime || !this.endTime) {
      this.toastr.error('Please select start and end time.')
      return;
    }


    const payload = {
      question: this.question,
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date(this.endTime).toISOString(),
      answers: this.answers.map(a => ({ answer: a.text })),
      channelId: '1364918839699046400',
    };

    console.log('POST to Bot:', payload);

    this.surveyService.startSurvey(payload).subscribe({
      next: (response) => {
        console.log('Survey created successfully', response);
        this.toastr.success('Survey created successfully')
        this.close.emit();
      },
      error: (error) => {
        console.error('Error creating the survey', error);
        this.toastr.error('Error creating the survey');
      }
    });
  }

  addAnswer() {
    this.answers.push({ text: '' });
    setTimeout(() => {this.focusLastAnswerInput();}, 50);
  }

  private focusLastAnswerInput() {
    const inputs = this.answerInputs.toArray();
    if (inputs.length > 0) {
      inputs[inputs.length - 1].nativeElement.focus();
    }
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
