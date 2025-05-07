// src/public/bot-public.controller.ts
import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { BotService } from '../bot/bot.service';
import { CreateQuestionnaireRequestDto } from '../Questionnaire/dto/CreateQuestionnaireRequestDto';
import { SessionAuthGuard } from '../auth/auth/session-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { MarkVoteEndedRequestDto } from '../Questionnaire/dto/MarkVoteEndedRequestDto';

@ApiTags('Discord-Bot')
@Controller('public')
export class BotPublicController {
  constructor(private readonly botService: BotService) {}

  @UseGuards(SessionAuthGuard)
  @Post('StartVoting')
  async startPoll(@Body() dto: CreateQuestionnaireRequestDto) {
    return this.botService.startAndTrackVote(dto);
  }

  @Get('results/:questionnaireID')
  async getResults(@Param('questionnaireID') id: number) {
    return this.botService.getResults(id);
  }
  @Post('vote-end')
  markVoteEnded(@Body() dto: MarkVoteEndedRequestDto) {
    return this.botService.handleVoteEnd(dto);
  }
}
