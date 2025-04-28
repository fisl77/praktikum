import { Body, Controller, Post, Req } from '@nestjs/common';
import { BotPublicService } from './bot-public.service';
import { CreateQuestionnaireRequestDto } from '../Questionnaire/dto/CreateQuestionnaireRequestDto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Discord-Bot')
@Controller('public')
export class BotPublicController {
  constructor(private readonly publicService: BotPublicService) {}

  @ApiSecurity('API-KEY')
  @Post('start-poll')
  async startPoll(@Body() dto: CreateQuestionnaireRequestDto) {
    return this.publicService.startAndTrackPoll(dto);
  }
}
