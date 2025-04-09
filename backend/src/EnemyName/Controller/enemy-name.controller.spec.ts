import { Test, TestingModule } from '@nestjs/testing';
import { EnemyNameController } from './enemy-name.controller';

describe('EnemyNameController', () => {
  let controller: EnemyNameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnemyNameController],
    }).compile();

    controller = module.get<EnemyNameController>(EnemyNameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
