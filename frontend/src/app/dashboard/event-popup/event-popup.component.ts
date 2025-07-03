import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-event-popup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './event-popup.component.html',
  styleUrls: ['./event-popup.component.css'],
})
export class EventPopupComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  nameID: number | null = null;
  typeID: number | null = null;
  levelID: number | null = null;
  scale: number = 1.0;
  maxCount: number = 1;
  startTime: string = '';
  endTime: string = '';

  nameOptions: { nameID: number; name: string }[] = [];
  typeOptions: { typeID: number; type: string }[] = [];
  levelOptions: { levelID: number; name: string }[] = [];

  constructor(private eventService: EventService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadEnemyNames();
    this.loadEnemyTypes();
    this.loadLevels();
  }

  loadEnemyNames(): void {
    this.eventService.getEnemyNames().subscribe({
      next: (res: any[]) => {
        this.nameOptions = res.map(n => ({ nameID: n.nameID, name: n.name }));
      },
      error: (err) => console.error('Error loading enemy names:', err),
    });
  }

  loadEnemyTypes(): void {
    this.eventService.getEnemyTypes().subscribe({
      next: (res: any[]) => {
        this.typeOptions = res.map(t => ({ typeID: t.typeID, type: t.type }));
      },
      error: (err) => console.error('Error loading enemy types:', err),
    });
  }

  loadLevels(): void {
    this.eventService.getLevels().subscribe({
      next: (res: any[]) => {
        this.levelOptions = res.map(l => ({ levelID: l.levelID, name: l.name }));
      },
      error: (err) => console.error('Error loading levels:', err),
    });
  }

  createEnemyAndEvent(): void {
    if (!this.nameID || !this.typeID || !this.levelID) {
      this.toastr.error('Please select level, enemy and type.')
      return;
    }

    if (!this.scale || !this.maxCount) {
      this.toastr.error('Please select scale and maxCount.')
      return;
    }

    if (!this.startTime || !this.endTime) {
      this.toastr.error('Please select start and end time.')
      return;
    }

    const enemyPayload = {
      nameID: this.nameID,
      typeID: this.typeID,
      new_scale: this.scale,
      max_count: this.maxCount,
    };

    this.eventService.createEnemy(enemyPayload).subscribe({
      next: (enemyRes) => {
        const eventPayload = {
          startTime: new Date(this.startTime).toISOString(),
          endTime: new Date(this.endTime).toISOString(),
          levelIDs: [this.levelID!],
          enemies: [
            {
              enemyID: enemyRes.enemyID,
              quantity: this.maxCount,
            },
          ],
        };

        this.eventService.createEvent(eventPayload).subscribe({
          next: () => {
            this.toastr.success('Event created successfully.');
            this.close.emit();
          },
          error: (err) => {
            console.error('Error creating event:', err);
            this.toastr.error('Error creating event: ' + (err?.error?.message || err.message || 'Unknown Error'));
          },
        });
      },
      error: (err) => {
        console.error('Error creating enemy:', err);
        this.toastr.error('Error creating enemy: ' + (err?.error?.message || err.message || 'Unknown Error'));
      },
    });
  }
}
