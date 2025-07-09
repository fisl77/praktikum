import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EndEventPopupComponent } from '../end-event-popup/end-event-popup.component';
import { UpdateEventPopupComponent } from '../update-event-popup/update-event-popup.component';
import { EventDetailPopupComponent } from '../event-detail-popup/event-detail-popup.component';
import { EventStore } from '../../stores/events.store';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    EndEventPopupComponent,
    UpdateEventPopupComponent,
    EventDetailPopupComponent,
    CarouselModule
  ],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent {
  private store = inject(EventStore);
  events = this.store.events;

  showAllEvents = signal(false);



  responsiveOptions = [
    { breakpoint: '1024px', numVisible: 3, numScroll: 1 },
    { breakpoint: '768px', numVisible: 2, numScroll: 1 },
    { breakpoint: '576px', numVisible: 1, numScroll: 1 }
  ];

  showEndEventPopup = false;
  selectedEventID: number | null = null;
  selectedEndTime: string | null = null;
  showUpdatePopup = false;
  eventToUpdate: any = null;
  selectedEvent: any = null;
  showEventDetailPopup = false;


  getLevelNames(event: any): string {
    if (!event || !Array.isArray(event.levels)) return '';
    return event.levels.map((l: any) => l.name).join(', ');
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
    const now = new Date();
    return new Date(event.startTime) > now && new Date(event.endTime) > now;
  }

  isFinished(event: any): boolean {
    return new Date(event.endTime) < new Date();
  }

  isCurrentlyLive(event: any): boolean {
    const now = new Date();
    return new Date(event.startTime) <= now && new Date(event.endTime) > now && event.isLive;
  }

  endEvent(id: number): void {
    this.store.endEvent(id);
  }
}
