import { Test, TestingModule } from '@nestjs/testing';
import { EventEnemyController } from './event-enemy.controller';

describe('EventEnemyController', () => {
  let controller: EventEnemyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventEnemyController],
    }).compile();

    controller = module.get<EventEnemyController>(EventEnemyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
