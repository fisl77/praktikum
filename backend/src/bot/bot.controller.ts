// src/public/bot.controller.ts
import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { BotService } from './bot.service';
import { CreateQuestionnaireRequestDto } from '../Questionnaire/dto/CreateQuestionnaireRequestDto';
import { SessionAuthGuard } from '../auth/auth/session-auth.guard';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MarkVoteEndedRequestDto } from '../Questionnaire/dto/MarkVoteEndedRequestDto';
import { GetAllQuestionnairesResponseDto } from '../Questionnaire/dto/get-all-questionnaires-response';

@ApiTags('Discord-Bot')
@Controller('discord-bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @UseGuards(SessionAuthGuard)
  @Post('startQuestionnaires')
  async startPoll(@Body() dto: CreateQuestionnaireRequestDto) {
    return this.botService.startAndTrackVote(dto);
  }

  @UseGuards(SessionAuthGuard)
  @Get('results/:questionnaireID')
  async getResults(@Param('questionnaireID') id: number) {
    return this.botService.getResults(id);
  }
  @Post('endQuestionnaires')
  markVoteEnded(@Body() dto: MarkVoteEndedRequestDto) {
    return this.botService.handleVoteEnd(dto);
  }

  @UseGuards(SessionAuthGuard)
  @Get('allQuestionnaires')
  @ApiOkResponse({ type: [GetAllQuestionnairesResponseDto] })
  async getAllQuestionnaires(): Promise<GetAllQuestionnairesResponseDto[]> {
    return this.botService.getAllQuestionnaires();
  }
}
