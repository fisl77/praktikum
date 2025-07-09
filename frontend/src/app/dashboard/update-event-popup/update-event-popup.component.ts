import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { EventService } from '../../services/event.service';
import { firstValueFrom} from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-update-create.event-popup',
  standalone: true,
  imports: [FormsModule],
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
  nameID: number | null = null;


  typeID: number | null = null;
  levelOptions: any[] = [];
  enemyOptions: any[] = [];
  typeOptions: { typeID: number; type: string }[] = [];

  constructor(private eventService: EventService, private toastr: ToastrService) {}

  async ngOnInit(): Promise<void> {
    this.currentDateTime = new Date().toISOString().slice(0, 16);
    this.loadLevels();

    await Promise.all([
      this.loadEnemyTypes(),
      this.loadEnemieNames()
    ]);

    this.prefillForm();
  }

  async loadEnemieNames(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.eventService.getEnemyNames().subscribe({
        next: (res: any[]) => {
          this.enemyOptions = res.map(n => ({ nameID: n.nameID, name: n.name }));
          resolve();
        },
        error: (err) => {
          console.error('Error loading enemy names:', err);
          reject(err);
        },
      });
    });
  }

  async loadEnemyTypes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.eventService.getEnemyTypes().subscribe({
        next: (res: any[]) => {
          this.typeOptions = res.map(t => ({ typeID: t.typeID, type: t.type }));
          resolve();
        },
        error: (err) => {
          console.error('Error loading enemy types:', err);
          reject(err);
        },
      });
    });
  }

  loadLevels() {
    this.eventService.getLevels().subscribe({
      next: (res) => (this.levelOptions = res),
      error: (err) => console.error('Error loading levels:', err),
    });
  }

  prefillForm() {
    const enemy = this.eventToUpdate.enemies[0];
    this.enemyID = enemy.enemyID;
    this.scale = enemy.new_scale ?? 1.0;
    this.maxCount = enemy.quantity ?? 1;

    // Mapping: type (string) -> typeID
    const matchedType = this.typeOptions.find(t => t.type === enemy.type);
    this.typeID = matchedType ? matchedType.typeID : null;

    // Mapping: name (string) -> nameID
    const matchedName = this.enemyOptions.find(n => n.name === enemy.name);
    this.nameID = matchedName ? matchedName.nameID : null;

    this.levelID = this.eventToUpdate.levels[0].levelID;

    this.startTime = this.toLocalISOString(this.eventToUpdate.startTime);
    this.endTime = this.toLocalISOString(this.eventToUpdate.endTime);
  }

  toLocalISOString(utcDate: string): string {
    const date = new Date(utcDate);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  }

  submitUpdate() {
    if (!this.levelID || !this.nameID || !this.typeID) {
      this.toastr.error('Please select all enemy data and a level.');
      return;
    }
    if (this.scale < 0.1 || this.scale > 1.0) {
      this.toastr.error('Scale must be between 0.1 and 1.0.');
      return;
    }

    if (this.maxCount < 1 || this.maxCount > 10) {
      this.toastr.error('Max Count must be between 1 and 10.');
      return;
    }

    const enemyPayload = {
      nameID: this.nameID,
      typeID: this.typeID,
      new_scale: this.scale,
      max_count: this.maxCount,
    };

    // Erst neuen Enemy erstellen
    this.eventService.updateEnemy(this.enemyID!, enemyPayload).subscribe({
      next: (enemyRes: any) => {
        const payload = {
          eventID: this.eventToUpdate.eventID,
          startTime: new Date(this.startTime).toISOString(),
          endTime: new Date(this.endTime).toISOString(),
          levelIDs: [this.levelID],
          enemies: [
            {
              enemyID: enemyRes.enemyID,
              quantity: this.maxCount,
              type: this.typeID,
            },
          ],
        };

        this.eventService.updateEvent(payload).subscribe({
          next: async () => {
            await this.loadEnemieNames(); // 👈 neu laden
            this.toastr.success('Event updated successfully.');
            this.updated.emit();
            this.close.emit();
          },
          error: (err) => {
            console.error('Update failed:', err);
            this.toastr.error('Error updating event: ' + (err?.error?.message || err.message || 'Unknown error'));
          },
        });
      },
      error: (err) => {
        console.error('Enemy creation failed:', err);
        this.toastr.error('Could not create enemy: ' + (err?.error?.message || err.message || 'Unknown error'));
      }
    });
  }
}
