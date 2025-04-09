import { Test, TestingModule } from '@nestjs/testing';
import { EnemyNameService } from './enemy-name.service';

describe('EnemyNameService', () => {
  let service: EnemyNameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnemyNameService],
    }).compile();

    service = module.get<EnemyNameService>(EnemyNameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
