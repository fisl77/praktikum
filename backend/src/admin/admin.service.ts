import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEventRequestDto } from '../Event/dto/CreateEventRequestDto';
import { CreateEnemyRequestDto } from '../Enemy/dto/CreateEnemyRequestDto';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
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
import { UpdateEventRequestDto } from '../Event/dto/UpdateEventRequestDto';
import { Cron, CronExpression } from '@nestjs/schedule';

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
    const now = new Date();
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (isNaN(startTime.getTime())) {
      throw new BadRequestException('Invalid start time provided.');
    }
    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time.');
    }
    if (startTime < now) {
      throw new BadRequestException('Start time must not be in the past.');
    }

    const overlappingEvent = await this.eventRepo
      .createQueryBuilder('event')
      .where('event.startTime < :endTime AND event.endTime > :startTime', {
        startTime,
        endTime,
      })
      .getOne();

    console.log('Found overlapping event:', overlappingEvent);

    if (overlappingEvent) {
      throw new BadRequestException(
        'There is already an active event in the selected time range.',
      );
    }

    const validLevels = await this.levelRepo.findByIds(dto.levelIDs);
    if (validLevels.length !== dto.levelIDs.length) {
      throw new BadRequestException(
        'One or more provided level IDs are invalid.',
      );
    }

    const enemyIDsFromDto = dto.enemies.map((e) => e.enemyID);
    const validEnemies = await this.enemyRepo.findByIds(enemyIDsFromDto);
    if (validEnemies.length !== enemyIDsFromDto.length) {
      throw new BadRequestException(
        'One or more provided enemy IDs are invalid.',
      );
    }

    const isLiveNow =
      now >= new Date(dto.startTime) && now <= new Date(dto.endTime);

    const rawEvent = await this.eventRepo.save({
      startTime: dto.startTime,
      endTime: dto.endTime,
      isLive: isLiveNow,
    });

    const event = await this.eventRepo.findOneOrFail({
      where: { eventID: rawEvent.eventID },
    });

    await this.eventLevelRepo.save(
      dto.levelIDs.map((levelID) => ({
        event,
        level: { levelID },
      })),
    );

    await this.eventEnemyRepo.save(
      dto.enemies.map((e) => ({
        event,
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
    if (!name) throw new Error(`EnemyName with ID ${dto.nameID} not found`);

    const type = await this.enemyTypeRepository.findOneBy({
      typeID: dto.typeID,
    });
    if (!type) throw new Error(`EnemyType with ID ${dto.typeID} not found`);

    const isLoner = name.name.toLowerCase() === 'hide';

    const newEnemy = this.enemyRepo.create({
      name,
      type,
      new_scale: dto.new_scale,
      max_count: dto.max_count,
      loners: isLoner,
    });

    const saved = await this.enemyRepo.save(newEnemy);

    return {
      ok: true,
      message: 'Enemy saved',
      enemyID: saved.enemyID,
    };
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

    const now = new Date();

    return events
      .map((event) => {
        const isLive = now >= event.startTime && now <= event.endTime;

        return {
          eventID: event.eventID,
          startTime: event.startTime,
          endTime: event.endTime,
          isLive,
          levels: event.eventLevels.map((el) => ({
            levelID: el.level.levelID,
            name: el.level.name,
            imagePath: el.level.imagePath,
            lore: el.level.lore,
          })),
          enemies: event.eventEnemies.map((ee) => ({
            enemyID: ee.enemy.enemyID,
            name: ee.enemy.name.name,
            type: ee.enemy.type.type,
            quantity: ee.quantity,
            new_scale: ee.enemy.new_scale,
            max_count: ee.enemy.max_count,
            loners: ee.enemy.loners,
            lore: ee.enemy.name.lore,
            imageUrl: ee.enemy.name.imageUrl,
          })),
        };
      })
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      );
  }

  async updateEvent(dto: UpdateEventRequestDto) {
    const now = new Date();
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time.');
    }

    const event = await this.eventRepo.findOne({
      where: { eventID: dto.eventID },
    });

    if (!event) {
      throw new BadRequestException(`Event with ID ${dto.eventID} not found.`);
    }

    const validLevels = await this.levelRepo.findByIds(dto.levelIDs);
    if (validLevels.length !== dto.levelIDs.length) {
      throw new BadRequestException('At least one level ID is invalid.');
    }

    const overlappingEvent = await this.eventRepo
      .createQueryBuilder('event')
      .where(
        'event.startTime < :endTime AND event.endTime > :startTime AND event.eventID != :eventID',
        {
          startTime,
          endTime,
          eventID: dto.eventID,
        },
      )
      .getOne();

    if (overlappingEvent) {
      throw new BadRequestException(
        'There is already an active event in the selected time range.',
      );
    }

    event.startTime = dto.startTime;
    event.endTime = dto.endTime;
    event.isLive =
      now >= new Date(dto.startTime) && now <= new Date(dto.endTime);

    await this.eventRepo.save(event);

    await this.eventLevelRepo.delete({ event: { eventID: dto.eventID } });
    await this.eventEnemyRepo.delete({ event: { eventID: dto.eventID } });

    await this.eventLevelRepo.save(
      dto.levelIDs.map((levelID) => ({
        event: { eventID: dto.eventID },
        level: { levelID },
      })),
    );

    await this.eventEnemyRepo.save(
      dto.enemies.map((e) => ({
        event: { eventID: dto.eventID },
        enemy: { enemyID: e.enemyID },
        quantity: e.quantity,
      })),
    );

    return {
      ok: true,
      message: `Event ${dto.eventID} updated successfully.`,
    };
  }

  async getEnemies() {
    const enemies = await this.enemyRepo.find({ relations: ['name', 'type'] });

    return enemies.map((enemy) => ({
      id: enemy.enemyID,
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
      throw new BadRequestException(`Enemy with ID ${id} not found`);
    }

    return {
      path: enemy.name.path,
      max_count: enemy.max_count,
      selected_profile: enemy.type.type,
      new_scale: enemy.new_scale,
      loners: enemy.loners,
    };
  }

  async getActiveEnemies() {
    const now = new Date();
    const activeEvent = await this.eventRepo.findOne({
      where: {
        startTime: LessThanOrEqual(now),
        endTime: MoreThanOrEqual(now),
      },
      relations: [
        'eventEnemies',
        'eventEnemies.enemy',
        'eventEnemies.enemy.name',
        'eventEnemies.enemy.type',
      ],
    });

    if (!activeEvent) return [];

    return activeEvent.eventEnemies.map((ee) => ({
      name: ee.enemy.name.name,
      path: ee.enemy.name.path,
      selected_profile: ee.enemy.type.type,
      max_count: ee.enemy.max_count,
      new_scale: ee.enemy.new_scale,
      loners: ee.enemy.loners,
    }));
  }

  @Cron(CronExpression.EVERY_SECOND)
  async updateLiveStatus() {
    const now = new Date();
    const events = await this.eventRepo.find();

    for (const event of events) {
      const shouldBeLive = now >= event.startTime && now <= event.endTime;
      if (event.isLive !== shouldBeLive) {
        event.isLive = shouldBeLive;
        await this.eventRepo.save(event);
      }
    }
  }

  async getEnemyTypes() {
    return await this.enemyTypeRepository.find();
  }

  async getEnemyNames() {
    const names = await this.enemyNameRepository.find();

    return names.map((name) => ({
      nameID: name.nameID,
      name: name.name,
      path: name.path,
      imageUrl: name.imageUrl ?? null,
      lore: name.lore ?? null,
    }));
  }

  async getLevels() {
    const levels = await this.levelRepo.find();
    return levels.map((level) => ({
      levelID: level.levelID,
      name: level.name,
      imagePath: level.imagePath ?? null,
      lore: level.lore ?? null,
    }));
  }

  async endEvent(eventID: number): Promise<{ ok: boolean; message: string }> {
    const event = await this.eventRepo.findOne({ where: { eventID } });
    if (!event) {
      throw new BadRequestException(`Event with ID ${eventID} not found.`);
    }

    event.endTime = new Date();
    event.isLive = false;
    await this.eventRepo.save(event);

    return {
      ok: true,
      message: `Event ${eventID} has been successfully ended.`,
    };
  }

  async getEventByID(eventID: number) {
    const event = await this.eventRepo.findOne({
      where: { eventID },
      relations: [
        'eventLevels',
        'eventLevels.level',
        'eventEnemies',
        'eventEnemies.enemy',
        'eventEnemies.enemy.name',
        'eventEnemies.enemy.type',
      ],
    });

    if (!event) {
      throw new BadRequestException(`Event with ID ${eventID} not found.`);
    }

    return {
      eventID: event.eventID,
      startTime: event.startTime,
      endTime: event.endTime,
      levels: event.eventLevels.map((el) => ({
        levelID: el.level.levelID,
        name: el.level.name,
        imagePath: el.level.imagePath,
        lore: el.level.lore,
      })),
      enemies: event.eventEnemies.map((ee) => ({
        enemyID: ee.enemy.enemyID,
        name: ee.enemy.name.name,
        type: ee.enemy.type.type,
        quantity: ee.quantity,
        new_scale: ee.enemy.new_scale,
      })),
    };
  }
}
