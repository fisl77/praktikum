import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './Event/event.entity';
import { EventEnemy } from './EventEnemy/eventEnemy.entity';
import { Enemy } from './Enemy/enemy.entity';
import { EnemyName } from './EnemyName/enemyName.entity';
import { EnemyType } from './EnemyType/enemyType.entity';
import { EventLevel } from './EventLevel/eventLevel.entity';
import { Level } from './Level/level.entity';
import { Questionnaire } from './Questionnaire/questionnaire.entity';
import { Answer } from './Answer/answer.entity';
import { Voting } from './Voting/voting.entity';
import { AuthModule } from './auth/module/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './database-tmp/database',
      entities: [
        Event,
        EventEnemy,
        Enemy,
        EnemyName,
        EnemyType,
        EventLevel,
        Level,
        Questionnaire,
        Answer,
        Voting,
      ],
      synchronize: true, // DEV only
    }),
    TypeOrmModule.forFeature([
      Event,
      EventEnemy,
      Enemy,
      EnemyName,
      EnemyType,
      EventLevel,
      Level,
      Questionnaire,
      Answer,
      Voting,
    ]),
    AuthModule, // <== Modul einbinden
  ],
})
export class AppModule {}
