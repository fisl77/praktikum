import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/module/jwt-auth.guard';
import { AdminGuard } from '../auth/module/admin.guard';
import { CreateEventRequestDto } from '../Event/dto/CreateEventRequestDto';
import { CreateEnemyRequestDto } from '../Enemy/dto/CreateEnemyRequestDto';
import { CreateQuestionnaireRequestDto } from '../Questionnaire/dto/CreateQuestionnaireRequestDto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('admin')
@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  @Post('event')
  createEvent(@Body() dto: CreateEventRequestDto) {
    // TODO: call EventService
    return { ok: true, message: 'Event erstellt' };
  }

  @Post('enemy')
  createEnemy(@Body() dto: CreateEnemyRequestDto) {
    // TODO: call EnemyService
    return { ok: true, message: 'Enemy erstellt' };
  }

  @Post('questionnaire')
  createQuestionnaire(@Body() dto: CreateQuestionnaireRequestDto) {
    // TODO: call QuestionnaireService
    return { ok: true, message: 'Umfrage erstellt' };
  }
}