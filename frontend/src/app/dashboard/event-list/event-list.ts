import { Component, Input } from '@angular/core';
import {DatePipe, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-event-list',
  standalone: true,
  templateUrl: './event-list.html',
  styleUrls: ['./event-list.css'],
  imports: [NgForOf, DatePipe, NgIf]
})
export class EventListComponent {
  @Input() events: any[] = []; // <-- Daten kommen vom Dashboard!
}
