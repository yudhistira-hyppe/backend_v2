import { Test, TestingModule } from '@nestjs/testing';
import { LevelticketsService } from './leveltickets.service';

describe('LevelticketsService', () => {
  let service: LevelticketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LevelticketsService],
    }).compile();

    service = module.get<LevelticketsService>(LevelticketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
