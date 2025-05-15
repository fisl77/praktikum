import { Component, Input } from '@angular/core';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-survey-list',
  standalone: true,
  templateUrl: './survey-list.html',
  styleUrls: ['./survey-list.css'],
  imports: [NgForOf]
})
export class SurveyListComponent {
  @Input() surveys: any[] = []; // <-- Daten kommen vom Dashboard!
}
