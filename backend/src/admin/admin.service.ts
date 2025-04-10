import { Injectable } from '@nestjs/common';
import { CreateEventRequestDto } from '../Event/dto/CreateEventRequestDto';
import { CreateEnemyRequestDto } from '../Enemy/dto/CreateEnemyRequestDto';
import { CreateQuestionnaireRequestDto } from '../Questionnaire/dto/CreateQuestionnaireRequestDto';

@Injectable()
export class AdminService {
  createEvent(dto: CreateEventRequestDto) {
    // TODO: mit TypeORM speichern
    return { ok: true, message: 'Event gespeichert', dto };
  }

  createEnemy(dto: CreateEnemyRequestDto) {
    return { ok: true, message: 'Enemy gespeichert', dto };
  }

  createQuestionnaire(dto: CreateQuestionnaireRequestDto) {
    return { ok: true, message: 'Umfrage gespeichert', dto };
  }
}
