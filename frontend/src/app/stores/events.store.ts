import { Injectable, effect, inject, signal } from '@angular/core';
import { EventService } from '../services/event.service';

@Injectable({ providedIn: 'root' })
export class EventStore {
  private eventService = inject(EventService);

  events = signal<any[]>([]);
  currentSlide = signal(0); // 🧠 Aktueller Slide wird gemerkt

  constructor() {
    this.checkSessionAndLoadEvents(); // ✅ Nur wenn Session aktiv

    effect(() => {
      const interval = setInterval(() => this.checkSessionAndLoadEvents(), 5000);
      return () => clearInterval(interval);
    });
  }

  private checkSessionAndLoadEvents() {
    fetch('/api/auth/check', { credentials: 'include' })
      .then(res => {
        if (res.ok) {
          this.loadEventsPreserveSlide();
        } else {
          console.warn('[EventStore] Nicht eingeloggt – Events werden nicht geladen.');
        }
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

  loadEventsPreserveSlide(): void {
    const current = this.currentSlide();
    const oldChunks = this.groupIntoChunks(this.events(), 3);
    const oldChunk = oldChunks[current] ?? [];
    const oldIds = oldChunk.map(e => e.eventID).sort().join(',');

    this.eventService.getAllEventsDetailed().subscribe({
      next: (newEvents) => {
        this.events.set(newEvents);

        const newChunks = this.groupIntoChunks(newEvents, 3);
        const foundIndex = newChunks.findIndex(chunk =>
          chunk.map(e => e.eventID).sort().join(',') === oldIds
        );

        if (foundIndex !== -1) {
          this.currentSlide.set(foundIndex); // 🔁 Setze zurück auf vorherigen Slide
        } else {
          this.currentSlide.set(0); // Fallback
        }
      },
      error: (err) => {
        console.error('[EventStore] Fehler beim Nachladen der Events:', err);
      }
    });
  }

  endEvent(eventID: number): void {
    this.eventService.endEvent(eventID).subscribe({
      next: () => {
        console.log(`[EventStore] Event ${eventID} beendet.`);
        this.loadEventsPreserveSlide();
      },
      error: (err) => {
        console.error('[EventStore] Fehler beim Beenden des Events:', err);
      },
    });
  }

  private groupIntoChunks<T>(array: T[], chunkSize: number): T[][] {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }
}
