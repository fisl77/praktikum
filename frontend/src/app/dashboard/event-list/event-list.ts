import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EndEventPopupComponent } from '../end-event-popup/end-event-popup.component';
import { UpdateEventPopupComponent } from '../update-event-popup/update-event-popup.component';
import { EventStore } from '../../stores/events.store';
import {EventDetailPopupComponent} from '../event-detail-popup/event-detail-popup.component';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, EndEventPopupComponent, UpdateEventPopupComponent, EventDetailPopupComponent],
  templateUrl: './event-list.html',
  styleUrls: ['./event-list.css']
})
export class EventListComponent {
  private store = inject(EventStore);
  events = this.store.events;
  currentSlide = this.store.currentSlide; // 👈 hinzugefügt

  showAllEvents = signal(false);
  maxVisibleEvents = signal(3);

  visibleEvents = computed(() =>
    this.showAllEvents() ? this.events() : this.events().slice(0, this.maxVisibleEvents())
  );

  eventChunks = computed(() => this.groupIntoChunks(this.events(), 3));
  isLargeScreen = window.innerWidth >= 992;

  showEndEventPopup = false;
  selectedEventID: number | null = null;
  selectedEndTime: string | null = null;
  showUpdatePopup = false;
  eventToUpdate: any = null;
  selectedEvent: any = null;
  showEventDetailPopup = false;

  toggleShowAllEvents() {
    this.showAllEvents.set(!this.showAllEvents());
  }

  isLastEnemy(enemy: any, enemies: any[]): boolean {
    return enemies.indexOf(enemy) === enemies.length - 1;
  }

  getLevelNames(event: any): string {
    if (!event || !Array.isArray(event.levels)) return '';
    return event.levels.map((l: any) => l.name).join(', ');
  }

  isBeforeEnd(endTime: string): boolean {
    return new Date(endTime).getTime() > Date.now();
  }

  openEndPopup(eventID: number, endTime: string): void {
    this.selectedEventID = eventID;
    this.selectedEndTime = endTime;
    this.showEndEventPopup = true;
  }

  closeEndPopup(): void {
    this.showEndEventPopup = false;
    this.selectedEventID = null;
    this.selectedEndTime = null;
  }

  openUpdatePopup(event: any): void {
    this.eventToUpdate = event;
    this.showUpdatePopup = true;
  }

  closeUpdatePopup(): void {
    this.showUpdatePopup = false;
    this.eventToUpdate = null;
  }

  openDetailPopup(event: any) {
    this.selectedEvent = event;
    this.showEventDetailPopup = true;
  }

  closeDetailPopup() {
    this.showEventDetailPopup = false;
  }


  isUpcoming(event: any): boolean {
    return new Date(event.startTime) > new Date();
  }

  isFinished(event: any): boolean {
    return new Date(event.endTime) < new Date();
  }

  isCurrentlyLive(event: any): boolean {
    const now = new Date();
    return new Date(event.startTime) <= now && new Date(event.endTime) > now && event.isLive;
  }

  prevSlide() {
    const total = this.eventChunks().length;
    const current = this.currentSlide();
    this.currentSlide.set((current - 1 + total) % total);
  }

  nextSlide() {
    const total = this.eventChunks().length;
    const current = this.currentSlide();
    this.currentSlide.set((current + 1) % total);
  }

  private groupIntoChunks<T>(array: T[], chunkSize: number): T[][] {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }

  endEvent(id: number): void {
    this.store.endEvent(id);
  }

}
