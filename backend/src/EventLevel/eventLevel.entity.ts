import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Event } from '../Event/event.entity';
import { Level } from '../Level/level.entity';

@Entity()
export class EventLevel {
  @PrimaryColumn()
  eventID: number;

  @PrimaryColumn()
  levelID: number;

  @ManyToOne(() => Event, (event: Event) => event.eventLevels)
  event: Event;

  @ManyToOne(() => Level, (level: Level) => level.eventLevels)
  level: Level;
}
