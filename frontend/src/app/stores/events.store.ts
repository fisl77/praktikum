import { Injectable, inject, signal } from '@angular/core';
import { EventService } from '../services/event.service';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class EventStore {
  private eventService = inject(EventService);
  private http = inject(HttpClient);

  events = signal<any[]>([]);
  currentSlide = signal(0); // 🧠 Aktueller Slide wird gemerkt

  constructor() {
    this.waitForSessionAndStart();
  }

  private waitForSessionAndStart() {
    const interval = setInterval(() => {
      this.http.get('/api/auth/check', { withCredentials: true }).subscribe({
        next: () => {
          clearInterval(interval);
          this.loadEvents();
          this.setupAutoReload();
        },
        error: () => {
          console.warn('[EventStore] Not logged in – Events are not loading.');
        }
      });
    }, 500);
  }

  private setupAutoReload() {
    setInterval(() => this.loadEventsPreserveSlide(), 5000);
  }

  loadEvents(): void {
    this.eventService.getAllEventsDetailed().subscribe({
      next: (data) => {
        console.log('[EventStore] Events from the Server:', data);
        this.events.set(data);
      },
      error: (err) => {
        console.error('[EventStore] Error loading the Events:', err);
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

        this.currentSlide.set(foundIndex !== -1 ? foundIndex : 0);
      },
      error: (err) => {
        console.error('[EventStore] Error reloading Events:', err);
      }
    });
  }

  endEvent(eventID: number): void {
    this.eventService.endEvent(eventID).subscribe({
      next: () => {
        console.log(`[EventStore] Event ${eventID} ended.`);
        this.loadEventsPreserveSlide();
      },
      error: (err) => {
        console.error('[EventStore] Error ending the Event:', err);
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
