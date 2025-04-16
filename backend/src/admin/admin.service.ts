import { BadRequestException, Injectable } from '@nestjs/common';
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
import { Voting } from '../Voting/voting.entity';
import { EnemyName } from '../EnemyName/enemyName.entity';
import { EnemyType } from '../EnemyType/enemyType.entity';

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

    @InjectRepository(Voting)
    private readonly votingRepo: Repository<Voting>,

    @InjectRepository(EnemyName)
    private readonly enemyNameRepository: Repository<EnemyName>,

    @InjectRepository(EnemyType)
    private readonly enemyTypeRepository: Repository<EnemyType>,
  ) {}

  async createEvent(dto: CreateEventRequestDto) {
    // 1. Gültige Level-IDs aus DB laden
    const validLevels = await this.levelRepo.findByIds(dto.levelIDs);
    if (validLevels.length !== dto.levelIDs.length) {
      throw new BadRequestException('Ungültige LevelID(s) übergeben');
    }

    // 2. Gültige Enemy-IDs aus DB laden
    const enemyIDsFromDto = dto.enemies.map((e) => e.enemyID);
    const validEnemies = await this.enemyRepo.findByIds(enemyIDsFromDto);
    if (validEnemies.length !== enemyIDsFromDto.length) {
      throw new BadRequestException('Ungültige EnemyID(s) übergeben');
    }
    // 3. Event speichern
    const rawEvent = await this.eventRepo.save({
      startTime: dto.startTime,
      endTime: dto.endTime,
    });

    const event = await this.eventRepo.findOneOrFail({
      where: { eventID: rawEvent.eventID },
    });

    // 4. Verknüpfungen speichern
    await this.eventLevelRepo.save(
      dto.levelIDs.map((levelID) => ({
        event: event,
        level: { levelID },
      })),
    );

    await this.eventEnemyRepo.save(
      dto.enemies.map((e) => ({
        event: event,
        enemy: { enemyID: e.enemyID },
        quantity: e.quantity,
      })),
    );

    return { ok: true };
  }

  async createEnemy(dto: CreateEnemyRequestDto) {
    const name = await this.enemyNameRepository.findOneBy({
      nameID: dto.nameID,
    });
    if (!name) throw new Error(`EnemyName mit ID ${dto.nameID} nicht gefunden`);

    const type = await this.enemyTypeRepository.findOneBy({
      typeID: dto.typeID,
    });
    if (!type) throw new Error(`EnemyType mit ID ${dto.typeID} nicht gefunden`);

    const newEnemy = this.enemyRepo.create({
      name,
      type,
      new_scale: dto.new_scale,
      max_count: dto.max_count,
      loners: dto.loners,
    });

    const saved = await this.enemyRepo.save(newEnemy);

    return {
      ok: true,
      message: 'Enemy gespeichert',
      enemyID: saved.enemyID,
    };
  }

  async createQuestionnaire(dto: CreateQuestionnaireRequestDto) {
    const rawQ = await this.questionnaireRepo.save({
      question: dto.question,
      startTime: dto.startTime,
      endTime: dto.endTime,
    });

    const q = await this.questionnaireRepo.findOneOrFail({
      where: { questionnaireID: rawQ.questionnaireID },
    });

    await this.answerRepo.save(
      dto.answers.map((a) => ({
        questionnaire: q,
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

    return await Promise.all(
      questionnaires.map(async (q) => {
        const now = new Date();
        const isLive = now >= q.startTime && now <= q.endTime;

        const answers = await Promise.all(
          q.answers.map(async (a) => {
            const voteCount = await this.votingRepo.count({
              where: { answer: { answerID: a.answerID } },
            });

            return {
              answerID: a.answerID,
              answer: a.answer,
              votes: voteCount,
            };
          }),
        );

        return {
          questionnaireID: q.questionnaireID,
          question: q.question,
          startTime: q.startTime,
          endTime: q.endTime,
          isLive,
          answers,
        };
      }),
    );
  }

  async getEnemies() {
    const enemies = await this.enemyRepo.find({
      relations: ['name', 'type'],
    });

    return enemies.map((enemy) => ({
      name: enemy.name.name,
      path: enemy.name.path,
      type: enemy.type.type,
      max_count: enemy.max_count,
      new_scale: enemy.new_scale,
      loners: enemy.loners,
    }));
  }

  async getEnemyById(id: number) {
    const enemy = await this.enemyRepo.findOne({
      where: { enemyID: id },
      relations: ['name', 'type'],
    });

    if (!enemy) {
      throw new BadRequestException(`Enemy mit ID ${id} nicht gefunden`);
    }

    return {
      path: enemy.name.path,
      max_count: enemy.max_count,
      selected_profile: enemy.type.type,
      new_scale: enemy.new_scale,
      loners: enemy.loners,
    };
  }
}
