import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { CreateEventRequestDto } from '../Event/dto/CreateEventRequestDto';
import { CreateEnemyRequestDto } from '../Enemy/dto/CreateEnemyRequestDto';
import {
  CreateQuestionnaireRequestDto,
  GetQuestionnaireResponseDto,
} from '../Questionnaire/dto/CreateQuestionnaireRequestDto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { SessionAuthGuard } from '../auth/auth/session-auth.guard';

@Controller('admin')
@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Post('event')
  createEvent(@Body() dto: CreateEventRequestDto) {
    return this.adminService.createEvent(dto);
  }

  @UseGuards(SessionAuthGuard)
  @Post('enemy')
  createEnemy(@Body() dto: CreateEnemyRequestDto) {
    return this.adminService.createEnemy(dto);
  }

  @UseGuards(SessionAuthGuard)
  @Get('enemies')
  getEnemies() {
    return this.adminService.getEnemies();
  }

  @UseGuards(SessionAuthGuard)
  @Get('enemy/:id')
  getEnemybyId(@Param('id') id: number) {
    return this.adminService.getEnemyById(id);
  }

  @UseGuards(SessionAuthGuard)
  @Post('questionnaire')
  createQuestionnaire(@Body() dto: CreateQuestionnaireRequestDto) {
    return this.adminService.createQuestionnaire(dto);
  }

  @UseGuards(SessionAuthGuard)
  @Get('events')
  getEventsDetailed() {
    return this.adminService.getAllEventsDetailed();
  }

  @UseGuards(SessionAuthGuard)
  @Get('questionnaires')
  @ApiOkResponse({ type: [GetQuestionnaireResponseDto] })
  getQuestionnairesDetailed() {
    return this.adminService.getAllQuestionnairesDetailed();
  }
}
