import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Enemy } from '../Enemy/enemy.entity';

@Entity()
export class EnemyName {
  @PrimaryGeneratedColumn()
  nameID: number;

  @Column()
  name: string;

  @OneToMany(() => Enemy, (enemy: Enemy) => enemy.name)
  enemies: Enemy[];

  @Column()
  path: string;
}
