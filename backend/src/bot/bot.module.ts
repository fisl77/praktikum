// src/bot/bot.module.ts
import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Questionnaire } from '../Questionnaire/questionnaire.entity';
import { Answer } from '../Answer/answer.entity';
import { Voting } from '../Voting/voting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Questionnaire, Answer, Voting])],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
