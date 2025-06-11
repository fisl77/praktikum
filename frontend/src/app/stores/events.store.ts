import { Injectable, effect, inject, signal } from '@angular/core';
import { EventService } from '../services/event.service';

@Injectable({ providedIn: 'root' })
export class EventStore {
  private eventService = inject(EventService);

  events = signal<any[]>([]);

  constructor() {
    this.loadEvents();

    effect(() => {
      const interval = setInterval(() => this.loadEvents(), 5000);
      return () => clearInterval(interval);
    });
  }

  loadEvents(): void {
    this.eventService.getAllEventsDetailed().subscribe({
      next: (data) => {
        console.log('[EventStore] Events vom Server:', data);
        this.events.set(data);
      },
      error: (err) => {
        console.error('[EventStore] Fehler beim Laden der Events:', err);
      },
    });
  }

  endEvent(eventID: number): void {
    this.eventService.endEvent(eventID).subscribe({
      next: () => {
        console.log(`[EventStore] Event ${eventID} beendet.`);
        this.loadEvents();
      },
      error: (err) => {
        console.error('[EventStore] Fehler beim Beenden des Events:', err);
      },
    });
  }
}
