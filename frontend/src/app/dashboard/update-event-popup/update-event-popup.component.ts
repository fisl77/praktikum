import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';
import { firstValueFrom} from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-update-event-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-event-popup.component.html',
  styleUrls: ['./update-event-popup.component.css'],
})
export class UpdateEventPopupComponent implements OnInit {
  @Input() eventToUpdate: any;
  @Output() close:EventEmitter<void > = new EventEmitter<void>();
  @Output() updated:EventEmitter<void > = new EventEmitter<void>();


  levelID: number | null = null;
  enemyID: number | null = null;
  scale: number = 1.0;
  maxCount: number = 1;
  startTime: string = '';
  endTime: string = '';
  currentDateTime: string = '';

  levelOptions: any[] = [];
  enemyOptions: any[] = [];

  constructor(private eventService: EventService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.currentDateTime = new Date().toISOString().slice(0, 16);
    this.loadLevels();
    this.loadEnemies().then(() => {
      this.prefillForm();
    });
  }

  async loadEnemies() {
    try {
      const enemies = await firstValueFrom(this.eventService.getEnemies());
      this.enemyOptions = enemies;
    } catch (err) {
      console.error('Error loading enemies:', err);
    }
  }

  loadLevels() {
    this.eventService.getLevels().subscribe({
      next: (res) => (this.levelOptions = res),
      error: (err) => console.error('Error loading levels:', err),
    });
  }

  prefillForm() {
    const enemy = this.eventToUpdate.enemies[0];
    this.levelID = this.eventToUpdate.levels[0].levelID;
    this.enemyID = enemy.enemyID;
    this.scale = enemy.new_scale ?? 1.0;
    this.maxCount = enemy.quantity ?? 1;

    this.startTime = this.toLocalISOString(this.eventToUpdate.startTime);
    this.endTime = this.toLocalISOString(this.eventToUpdate.endTime);
  }

  toLocalISOString(utcDate: string): string {
    const date = new Date(utcDate);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  }

  submitUpdate() {
    if (!this.levelID || !this.enemyID) {
      this.toastr.error('Please select level and enemy data.');
      return;
    }

    const payload = {
      eventID: this.eventToUpdate.eventID,
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date(this.endTime).toISOString(),
      levelIDs: [this.levelID],
      enemies: [
        {
          enemyID: this.enemyID,
          quantity: this.maxCount,
        },
      ],
    };

    this.eventService.updateEvent(payload).subscribe({
      next: () => {
        this.updated.emit();
        this.close.emit();
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.toastr.error('Error updating event: ' + (err?.error?.message || err.message || 'Unknown error'));
      },
    });
  }
}
