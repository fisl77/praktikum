// src/bot/bot.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BotService } from './bot.service';
import { Questionnaire } from '../Questionnaire/questionnaire.entity';
import { Answer } from '../Answer/answer.entity';
import { Voting } from '../Voting/voting.entity';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(), // ✅ Hier ist die Korrektur!
    HttpModule,
    TypeOrmModule.forFeature([Questionnaire, Answer, Voting]),
  ],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
