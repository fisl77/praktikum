import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service'; // <-- Service benutzen

@Component({
  selector: 'app-event-popup',
  standalone: true,
  imports: [NgForOf, FormsModule],
  templateUrl: './event-popup.html',
  styleUrls: ['./event-popup.css'],
})
export class EventPopupComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  enemies: any[] = [];
  selectedEnemyId: number | null = null;
  selectedType = '';
  scale = 1.0;
  maxCount = 1;
  startTime = '';
  endTime = '';

  constructor(private eventService: EventService) {} // <-- nur Service benutzen!

  ngOnInit() {
    this.loadEnemies();
  }

  loadEnemies() {
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.enemies = data;
      },
      error: (err) => {
        console.error('Fehler beim Laden der Gegner:', err);
      },
    });
  }

  createEvent() {
    const payload = {
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date(this.endTime).toISOString(),
      levelIDs: [1],
      enemies: [
        {
          enemyID: this.selectedEnemyId,
          quantity: 1,
        },
      ],
    };

    console.log('POST Event:', payload);

    this.eventService.createEvent(payload).subscribe({
      next: (response) => {
        console.log('Event erfolgreich gestartet!', response);
        this.close.emit();
      },
      error: (err) => {
        console.error('Fehler beim Erstellen des Events:', err);
        alert('Fehler beim Erstellen des Events');
      },
    });
  }
}
