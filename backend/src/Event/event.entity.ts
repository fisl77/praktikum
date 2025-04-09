import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EventLevel } from '../EventLevel/eventLevel.entity';
import { EventEnemy } from '../EventEnemy/eventEnemy.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  eventID: number;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @OneToMany(() => EventLevel, (eventLevel: EventLevel) => eventLevel.event)
  eventLevels: EventLevel[];

  @OneToMany(() => EventEnemy, (eventEnemy: EventEnemy) => eventEnemy.event)
  eventEnemies: EventEnemy[];
}
