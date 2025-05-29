import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {EndEventPopupComponent} from '../end-event-popup/end-event-popup.component';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, EndEventPopupComponent],
  templateUrl: './event-list.html',
  styleUrls: ['./event-list.css']
})
export class EventListComponent {
  @Input() events: any[] = [];
  @Input() showAllEvents = false;
  @Input() maxVisibleEvents = 3;

  eventChunks: any[][] = [];
  isLargeScreen = window.innerWidth >= 992;

  showEndEventPopup = false;
  selectedEventID: number | null = null;
  selectedEndTime: string | null = null;

  ngOnChanges() {
    if (this.events) {
      this.eventChunks = this.groupIntoChunks(this.events, 3);
    }
  }

  get visibleEvents() {
    return this.showAllEvents ? this.events : this.events.slice(0, this.maxVisibleEvents);
  }

  toggleShowAllEvents() {
    this.showAllEvents = !this.showAllEvents;
  }

  isLastEnemy(enemy: any, enemies: any[]): boolean {
    return enemies.indexOf(enemy) === enemies.length - 1;
  }

  getLevelNames(event: any): string {
    if (!event || !Array.isArray(event.levels)) return '';
    return event.levels.map((l: any) => l.name).join(', ');
  }

  private groupIntoChunks<T>(array: T[], chunkSize: number): T[][] {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
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
}
