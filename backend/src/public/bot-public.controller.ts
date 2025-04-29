import { Body, Controller, Post } from '@nestjs/common';
import { BotPublicService } from './bot-public.service';
import { CreateQuestionnaireRequestDto } from '../Questionnaire/dto/CreateQuestionnaireRequestDto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Discord-Bot')
@ApiSecurity('API-KEY')
@Controller('public')
export class BotPublicController {
  constructor(private readonly publicService: BotPublicService) {}

  @Post('questionnaire')
  async startPoll(@Body() dto: CreateQuestionnaireRequestDto) {
    return this.publicService.startAndTrackPoll(dto);
  }
}
