import { Test, TestingModule } from '@nestjs/testing';
import { EventLevelService } from './event-level.service';

describe('EventLevelService', () => {
  let service: EventLevelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventLevelService],
    }).compile();

    service = module.get<EventLevelService>(EventLevelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
