import { Test, TestingModule } from '@nestjs/testing';
import { EnemyTypeService } from './enemy-type.service';

describe('EnemyTypeService', () => {
  let service: EnemyTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnemyTypeService],
    }).compile();

    service = module.get<EnemyTypeService>(EnemyTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
