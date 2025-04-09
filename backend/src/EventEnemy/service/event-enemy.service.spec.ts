import { Test, TestingModule } from '@nestjs/testing';
import { EventEnemyService } from './event-enemy.service';

describe('EventEnemyService', () => {
  let service: EventEnemyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventEnemyService],
    }).compile();

    service = module.get<EventEnemyService>(EventEnemyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
