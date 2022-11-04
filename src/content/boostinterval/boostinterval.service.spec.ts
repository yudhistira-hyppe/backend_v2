import { Test, TestingModule } from '@nestjs/testing';
import { BoostintervalService } from './boostinterval.service';

describe('InsightsService', () => {
  let service: BoostintervalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoostintervalService],
    }).compile();

    service = module.get<BoostintervalService>(BoostintervalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
