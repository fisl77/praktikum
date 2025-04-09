import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EventLevel } from '../EventLevel/eventLevel.entity';

@Entity()
export class Level {
  @PrimaryGeneratedColumn()
  levelID: number;

  @Column()
  name: string;

  @OneToMany(() => EventLevel, (eventLevel: EventLevel) => eventLevel.level)
  eventLevels: EventLevel[];
}
