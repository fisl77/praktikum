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

  @OneToMany(() => EventLevel, (el) => el.event, { cascade: true })
  eventLevels: EventLevel[];

  @OneToMany(() => EventEnemy, (ee) => ee.event, { cascade: true })
  eventEnemies: EventEnemy[];
}
