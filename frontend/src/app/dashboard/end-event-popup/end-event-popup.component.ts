import { Component, EventEmitter, Input, Output } from '@angular/core';

import { EventService } from '../../services/event.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-end-event-popup',
  standalone: true,
  imports: [],
  templateUrl: './end-event-popup.component.html',
  styleUrls: ['./end-event-popup.component.css'],
})
export class EndEventPopupComponent {
  @Input() eventIDToEnd: number | null = null;
  @Input() eventEndTime: string | null = null;
  @Output() close = new EventEmitter<void>();

  showEndConfirm = true;
  originalEndTime: string | null = null;

  constructor(private eventService: EventService, private toastr: ToastrService) {}

  ngOnInit(): void {
    if (this.eventEndTime) {
      this.originalEndTime = new Date(this.eventEndTime).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  cancelEnd() {
    this.showEndConfirm = false;
    this.originalEndTime = null;
    this.close.emit();
  }

  confirmEndNow() {
    if (!this.eventIDToEnd) return;

    this.eventService.endEvent(this.eventIDToEnd).subscribe({
      next: () => {
        this.toastr.success('Event stopped successfully.');
        this.close.emit();
      },
      error: (err) => {
        console.error('Error ending the Event:', err);
        this.toastr.error(err.message || 'Unknown Error');
      },
    });
  }
}
