// Neue Komponente: Event-Detail-Popup
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-detail-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-detail-popup.component.html',
  styleUrls: ['./event-detail-popup.component.css']
})
export class EventDetailPopupComponent implements OnInit {
  @Input() event: any;
  @Output() close = new EventEmitter<void>();

  levelImages: { name: string; imagePath: string | null; lore: string | null }[] = [];

  enemyImageUrl: string = '';
  loreText: string = '';

  ngOnInit(): void {
    if (this.event?.enemies?.length > 0) {
      const enemy = this.event.enemies[0];
      this.enemyImageUrl = `/enemy-images/${enemy.name.toLowerCase()}.png`;
      this.loreText = enemy.lore || 'No lore available.';
    }
    if (this.event?.levels?.length > 0) {
      this.levelImages = this.event.levels.map((level: any) => ({
        name: level.name,
        imagePath: level.imagePath ? `/level-images/${level.imagePath}` : null,
        lore: level.lore ?? null,
      }));
    }
  }

  closePopup(): void {
    this.close.emit();
  }

  get levelNames(): string {
    if (!this.event?.levels) return '';
    return this.event.levels.map((l: any) => l.name).join(', ');
  }
}
