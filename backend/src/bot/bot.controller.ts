// src/public/bot.controller.ts
import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { BotService } from './bot.service';
import { CreateQuestionnaireRequestDto } from '../Questionnaire/dto/CreateQuestionnaireRequestDto';
import { SessionAuthGuard } from '../auth/auth/session-auth.guard';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MarkQuestionnaireEndedRequestDto } from '../Questionnaire/dto/MarkQuestionnaireEndedRequestDto';
import { GetAllQuestionnairesResponseDto } from '../Questionnaire/dto/get-all-questionnaires-response';

@ApiTags('Discord-Bot')
@Controller('discord-bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @UseGuards(SessionAuthGuard)
  @Post('startQuestionnaire')
  async startPoll(@Body() dto: CreateQuestionnaireRequestDto) {
    return this.botService.startAndTrackQuestionnaire(dto);
  }

  @Post('endQuestionnaire')
  markQuestionnaireEnded(@Body() dto: MarkQuestionnaireEndedRequestDto) {
    return this.botService.handleQuestionnaireEnd(dto);
  }

  @UseGuards(SessionAuthGuard)
  @Get('allQuestionnaires')
  @ApiOkResponse({ type: [GetAllQuestionnairesResponseDto] })
  async getAllQuestionnaires(): Promise<GetAllQuestionnairesResponseDto[]> {
    return this.botService.getAllQuestionnaires();
  }

  @UseGuards(SessionAuthGuard)
  @Get('results/:questionnaireID')
  async getResults(@Param('questionnaireID') id: number) {
    return this.botService.getResults(id);
  }
}
