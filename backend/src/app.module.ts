import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

// Deine Entitäten importieren
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
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';
import { PublicModule } from './public/public.module';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(
        process.cwd(),
        '..',
        'frontend',
        'dist',
        'frontend',
        'browser',
      ),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),

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
      synchronize: true,
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

    AuthModule,
    PublicModule,
    BotModule,
  ],
  controllers: [AppController, AdminController],
  providers: [AppService, AdminService],
})
export class AppModule {}
