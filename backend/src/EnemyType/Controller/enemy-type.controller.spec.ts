import { Test, TestingModule } from '@nestjs/testing';
import { EnemyTypeController } from './enemy-type.controller';

describe('EnemyTypeController', () => {
  let controller: EnemyTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnemyTypeController],
    }).compile();

    controller = module.get<EnemyTypeController>(EnemyTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
