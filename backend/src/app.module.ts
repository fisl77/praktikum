import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // <-- NEU

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
    // ⬇️ .env laden
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ⬇️ Redis-Caching
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        store: redisStore,
        host: 'localhost',
        port: 6379,
        ttl: 0,
      }),
    }),

    // ⬇️ Datenbankverbindung
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
      synchronize: true, // Nur für DEV!
    }),

    // ⬇️ TypeORM-Entities verfügbar machen
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

    // ⬇️ Eigene Module
    AuthModule,
    PublicModule,
    BotModule,
  ],
  controllers: [AppController, AdminController],
  providers: [AppService, AdminService],
})
export class AppModule {}
