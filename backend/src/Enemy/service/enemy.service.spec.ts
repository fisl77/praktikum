import { Test, TestingModule } from '@nestjs/testing';
import { EnemyService } from './enemy.service';

describe('EnemyService', () => {
  let service: EnemyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnemyService],
    }).compile();

    service = module.get<EnemyService>(EnemyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
