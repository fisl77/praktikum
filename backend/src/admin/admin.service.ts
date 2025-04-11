import { Injectable } from '@nestjs/common';
import { CreateEventRequestDto } from '../Event/dto/CreateEventRequestDto';
import { CreateEnemyRequestDto } from '../Enemy/dto/CreateEnemyRequestDto';
import { CreateQuestionnaireRequestDto } from '../Questionnaire/dto/CreateQuestionnaireRequestDto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventLevel } from '../EventLevel/eventLevel.entity';
import { EventEnemy } from '../EventEnemy/eventEnemy.entity';
import { Questionnaire } from '../Questionnaire/questionnaire.entity';
import { Answer } from '../Answer/answer.entity';
import { Event } from '../Event/event.entity';
import { Enemy } from '../Enemy/enemy.entity';
import { Level } from '../Level/level.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,

    @InjectRepository(EventLevel)
    private readonly eventLevelRepo: Repository<EventLevel>,

    @InjectRepository(EventEnemy)
    private readonly eventEnemyRepo: Repository<EventEnemy>,

    @InjectRepository(Questionnaire)
    private readonly questionnaireRepo: Repository<Questionnaire>,

    @InjectRepository(Answer)
    private readonly answerRepo: Repository<Answer>,

    @InjectRepository(Enemy)
    private readonly enemyRepo: Repository<Enemy>,

    @InjectRepository(Level)
    private readonly levelRepo: Repository<Level>,
  ) {}

  async createEvent(dto: CreateEventRequestDto) {
    const rawEvent = await this.eventRepo.save({
      startTime: dto.startTime,
      endTime: dto.endTime,
    });

    const event = rawEvent as Event;

    const all = await this.questionnaireRepo.find();
    console.log(all);
    await this.eventLevelRepo.save(
      dto.levelIDs.map((levelID) => ({ eventID: event.eventID, levelID })),
    );

    await this.eventEnemyRepo.save(
      dto.enemies.map((e) => ({
        eventID: event.eventID,
        enemyID: e.enemyID,
        quantity: e.quantity,
      })),
    );

    return { ok: true };
  }

  createEnemy(dto: CreateEnemyRequestDto) {
    return { ok: true, message: 'Enemy gespeichert', dto };
  }

  async createQuestionnaire(dto: CreateQuestionnaireRequestDto) {
    const q = await this.questionnaireRepo.save({
      question: dto.question,
      startTime: dto.startTime,
      endTime: dto.endTime,
    });

    await this.answerRepo.save(
      dto.answers.map((a) => ({
        questionnaireID: q.questionnaireID,
        answer: a.answer,
        number: a.number,
      })),
    );

    return { ok: true };
  }

  async getAllEventsDetailed() {
    const events = await this.eventRepo.find({
      relations: [
        'eventLevels',
        'eventLevels.level',
        'eventEnemies',
        'eventEnemies.enemy',
        'eventEnemies.enemy.name',
        'eventEnemies.enemy.type',
      ],
    });

    return events.map((event) => ({
      eventID: event.eventID,
      startTime: event.startTime,
      endTime: event.endTime,
      levels: event.eventLevels.map((el) => ({
        levelID: el.level.levelID,
        name: el.level.name,
      })),
      enemies: event.eventEnemies.map((ee) => ({
        enemyID: ee.enemy.enemyID,
        name: ee.enemy.name.name,
        type: ee.enemy.type.type,
        quantity: ee.quantity,
      })),
    }));
  }

  async getAllQuestionnairesDetailed() {
    const questionnaires = await this.questionnaireRepo.find({
      relations: ['answers'],
    });

    return questionnaires.map((q) => ({
      questionnaireID: q.questionnaireID,
      question: q.question,
      startTime: q.startTime,
      endTime: q.endTime,
      answers: q.answers.map((a) => ({
        answerID: a.answerID,
        answer: a.answer,
        number: a.number,
      })),
    }));
  }
}
