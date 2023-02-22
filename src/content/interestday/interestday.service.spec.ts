import { Test, TestingModule } from '@nestjs/testing';
import { InterestdayService } from './interestday.service';

describe('InterestdayService', () => {
  let service: InterestdayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InterestdayService],
    }).compile();

    service = module.get<InterestdayService>(InterestdayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
