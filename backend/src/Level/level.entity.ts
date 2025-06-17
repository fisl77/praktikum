import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EventLevel } from '../EventLevel/eventLevel.entity';

@Entity()
export class Level {
  @PrimaryGeneratedColumn()
  levelID: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  imagePath: string; // z. B. "cave.png"

  @Column({ nullable: true, type: 'text' })
  lore: string; // Optionaler Beschreibungstext

  @OneToMany(() => EventLevel, (eventLevel: EventLevel) => eventLevel.level)
  eventLevels: EventLevel[];
}
