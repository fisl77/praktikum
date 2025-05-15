import { Component, EventEmitter, Output } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-event-popup',
  standalone: true,
  imports: [NgIf, NgForOf, FormsModule],
  templateUrl: './event-popup.html',
  styleUrls: ['./event-popup.css']
})
export class EventPopupComponent {
  @Output() close = new EventEmitter<void>();

  enemies = ['Slime', 'Fly', 'Hide'];
  selectedEnemy = '';
  selectedType = '';
  scale = 1.0;
  maxCount = 1;
  loners = false;
  startTime = '';
  endTime = '';

  createEvent() {
    console.log('Event erstellen mit:', {
      selectedEnemy: this.selectedEnemy,
      selectedType: this.selectedType,
      scale: this.scale,
      maxCount: this.maxCount,
      loners: this.loners,
      startTime: this.startTime,
      endTime: this.endTime,
    });
    this.close.emit();
  }
}
