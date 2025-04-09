import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { EnemyName } from '../EnemyName/enemyName.entity';
import { EnemyType } from '../EnemyType/enemyType.entity';
import { EventEnemy } from '../EventEnemy/eventEnemy.entity';

@Entity()
export class Enemy {
  @PrimaryGeneratedColumn()
  enemyID: number;

  @ManyToOne(() => EnemyName, (name: EnemyName) => name.enemies)
  name: EnemyName;

  @ManyToOne(() => EnemyType, (type: EnemyType) => type.enemies)
  type: EnemyType;

  @OneToMany(() => EventEnemy, (ee: EventEnemy) => ee.enemy)
  eventEnemies: EventEnemy[];
}
