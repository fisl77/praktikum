import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AdminService } from './admin.service';
import { SessionAuthGuard } from '../auth/auth/session-auth.guard';

import { CreateEventRequestDto } from '../Event/dto/CreateEventRequestDto';
import { UpdateEventRequestDto } from '../Event/dto/UpdateEventRequestDto';
import { CreateEnemyRequestDto } from '../Enemy/dto/CreateEnemyRequestDto';
import {
  CreateQuestionnaireRequestDto,
  GetQuestionnaireResponseDto,
} from '../Questionnaire/dto/CreateQuestionnaireRequestDto';

@Controller('admin')
@ApiTags('Admin')
@UseGuards(SessionAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('event')
  @ApiOkResponse({ description: 'Erstellt ein neues Event' })
  createEvent(@Body() dto: CreateEventRequestDto) {
    return this.adminService.createEvent(dto);
  }

  @Patch('event')
  @ApiOkResponse({ description: 'Aktualisiert ein bestehendes Event' })
  updateEvent(@Body() dto: UpdateEventRequestDto) {
    return this.adminService.updateEvent(dto);
  }

  @Post('enemy')
  @ApiOkResponse({ description: 'Erstellt einen neuen Gegner' })
  createEnemy(@Body() dto: CreateEnemyRequestDto) {
    return this.adminService.createEnemy(dto);
  }

  @Get('enemies')
  @ApiOkResponse({ description: 'Gibt alle Gegner zurück' })
  getEnemies() {
    return this.adminService.getEnemies();
  }

  @Get('enemy/:id')
  @ApiOkResponse({ description: 'Gibt einen Gegner anhand der ID zurück' })
  getEnemybyId(@Param('id') id: number) {
    return this.adminService.getEnemyById(id);
  }

  @Post('questionnaire')
  @ApiOkResponse({ description: 'Erstellt ein neues Umfrageformular' })
  createQuestionnaire(@Body() dto: CreateQuestionnaireRequestDto) {
    return this.adminService.createQuestionnaire(dto);
  }

  @Get('events')
  @ApiOkResponse({ description: 'Gibt alle Events inkl. Details zurück' })
  getEventsDetailed() {
    return this.adminService.getAllEventsDetailed();
  }

  @Get('questionnaires')
  @ApiOkResponse({
    type: [GetQuestionnaireResponseDto],
    description: 'Gibt alle Umfragen inkl. Votes zurück',
  })
  getQuestionnairesDetailed() {
    return this.adminService.getAllQuestionnairesDetailed();
  }
}
