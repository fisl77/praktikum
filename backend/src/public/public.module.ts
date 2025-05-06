import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PublicController } from './public.controller';
import { BotPublicController } from './bot-public.controller';
import { AdminService } from '../admin/admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Event } from '../Event/event.entity';
import { EventLevel } from '../EventLevel/eventLevel.entity';
import { EventEnemy } from '../EventEnemy/eventEnemy.entity';
import { Enemy } from '../Enemy/enemy.entity';
import { EnemyName } from '../EnemyName/enemyName.entity';
import { EnemyType } from '../EnemyType/enemyType.entity';
import { Level } from '../Level/level.entity';
import { Questionnaire } from '../Questionnaire/questionnaire.entity';
import { Answer } from '../Answer/answer.entity';
import { Voting } from '../Voting/voting.entity';

import { ApiKeyMiddleware } from './api-key.middleware';
import { BotModule } from '../bot/bot.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      EventLevel,
      EventEnemy,
      Enemy,
      EnemyName,
      EnemyType,
      Level,
      Questionnaire,
      Answer,
      Voting,
    ]),
    BotModule,
  ],
  controllers: [PublicController, BotPublicController],
  providers: [AdminService],
})
export class PublicModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes(PublicController);
  }
}
