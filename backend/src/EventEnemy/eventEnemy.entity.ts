import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Event } from '../Event/event.entity';
import { Enemy } from '../Enemy/enemy.entity';

@Entity()
export class EventEnemy {
  @PrimaryColumn()
  eventID: number;

  @PrimaryColumn()
  enemyID: number;

  @Column()
  quantity: number;

  @ManyToOne(() => Event, (event: Event) => event.eventEnemies)
  event: Event;

  @ManyToOne(() => Enemy, (enemy: Enemy) => enemy.eventEnemies)
  enemy: Enemy;
}
