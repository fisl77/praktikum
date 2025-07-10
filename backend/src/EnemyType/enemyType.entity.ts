import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Enemy } from '../Enemy/enemy.entity';

@Entity()
export class EnemyType {
  @PrimaryGeneratedColumn()
  typeID: number;

  @Column()
  type: string;

  @OneToMany(() => Enemy, (enemy: Enemy) => enemy.type)
  enemies: Enemy[];
}
