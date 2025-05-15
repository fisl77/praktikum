import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-event-popup',
  standalone: true,
  templateUrl: './event-popup.html',
  styleUrls: ['./event-popup.css']
})
export class EventPopupComponent {
  @Output() close = new EventEmitter<void>();

  closePopup() {
    this.close.emit();
  }
}
