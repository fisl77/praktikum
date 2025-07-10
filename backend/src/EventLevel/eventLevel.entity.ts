import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Event } from '../Event/event.entity';
import { Level } from '../Level/level.entity';

@Entity()
export class EventLevel {
  @PrimaryColumn()
  eventID: number;

  @PrimaryColumn()
  levelID: number;

  @ManyToOne(() => Event, (event) => event.eventLevels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventID' })  // <<< das hier ist entscheidend
  event: Event;

  @ManyToOne(() => Level, (level) => level.eventLevels)
  @JoinColumn({ name: 'levelID' })  // <<< und das hier auch
  level: Level;

}
