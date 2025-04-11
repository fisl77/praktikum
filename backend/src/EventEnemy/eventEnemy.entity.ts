import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
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

  @ManyToOne(() => Event, (event) => event.eventEnemies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventID' })
  event: Event;

  @ManyToOne(() => Enemy, (enemy) => enemy.eventEnemies)
  @JoinColumn({ name: 'enemyID' })
  enemy: Enemy;

}
