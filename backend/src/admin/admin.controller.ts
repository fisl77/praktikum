import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/module/jwt-auth.guard';
import { AdminGuard } from '../auth/module/admin.guard';
import { CreateEventRequestDto } from '../Event/dto/CreateEventRequestDto';
import { CreateEnemyRequestDto } from '../Enemy/dto/CreateEnemyRequestDto';
import { CreateQuestionnaireRequestDto } from '../Questionnaire/dto/CreateQuestionnaireRequestDto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@Controller('admin')
@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Post('event')
  createEvent(@Body() dto: CreateEventRequestDto) {
    return this.adminService.createEvent(dto);
  }

  @Post('enemy')
  createEnemy(@Body() dto: CreateEnemyRequestDto) {
    return this.adminService.createEnemy(dto);
  }

  @Post('questionnaire')
  createQuestionnaire(@Body() dto: CreateQuestionnaireRequestDto) {
    return this.adminService.createQuestionnaire(dto);
  }

  @Get('events')
  getEventsDetailed() {
    return this.adminService.getAllEventsDetailed();
  }

  @Get('questionnaires')
  getQuestionnairesDetailed() {
    return this.adminService.getAllQuestionnairesDetailed();
  }

  @Patch('questionnaire/:id/close')
  closeQuestionnaire(@Param('id') id: number) {
    return this.adminService.closeQuestionnaire(id);
  }
}
