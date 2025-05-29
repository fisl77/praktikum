import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-popup',
  standalone: true,
  imports: [NgForOf, FormsModule],
  templateUrl: './event-popup.html',
  styleUrls: ['./event-popup.css'],
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

  constructor(private eventService: EventService) {}

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
      error: (err) => console.error('Fehler beim Laden der Namen:', err),
    });
  }

  loadEnemyTypes(): void {
    this.eventService.getEnemyTypes().subscribe({
      next: (res: any[]) => {
        this.typeOptions = res.map(t => ({ typeID: t.typeID, type: t.type }));
      },
      error: (err) => console.error('Fehler beim Laden der Typen:', err),
    });
  }

  loadLevels(): void {
    this.eventService.getLevels().subscribe({
      next: (res: any[]) => {
        this.levelOptions = res.map(l => ({ levelID: l.levelID, name: l.name }));
      },
      error: (err) => console.error('Fehler beim Laden der Levels:', err),
    });
  }

  createEnemyAndEvent(): void {
    if (!this.nameID || !this.typeID || !this.levelID) {
      alert('Bitte Name, Typ und Level auswählen.');
      return;
    }

    if (!this.startTime || !this.endTime) {
      alert('Bitte Start- und Endzeit angeben.');
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
            this.close.emit();
          },
          error: (err) => {
            console.error('Fehler beim Erstellen des Events:', err);
            alert('Fehler beim Erstellen des Events');
          },
        });
      },
      error: (err) => {
        console.error('Fehler beim Erstellen des Enemys:', err);
        alert('Fehler beim Erstellen des Enemys');
      },
    });
  }
}
