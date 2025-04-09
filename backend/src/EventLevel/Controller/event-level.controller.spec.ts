import { Test, TestingModule } from '@nestjs/testing';
import { EventLevelController } from './event-level.controller';

describe('EventLevelController', () => {
  let controller: EventLevelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventLevelController],
    }).compile();

    controller = module.get<EventLevelController>(EventLevelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
