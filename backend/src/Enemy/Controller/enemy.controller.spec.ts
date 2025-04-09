import { Test, TestingModule } from '@nestjs/testing';
import { EnemyController } from './enemy.controller';

describe('EnemyController', () => {
  let controller: EnemyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnemyController],
    }).compile();

    controller = module.get<EnemyController>(EnemyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
