import { Test, TestingModule } from '@nestjs/testing';
import { InterestCountService } from './interest_count.service';

describe('InterestCountService', () => {
  let service: InterestCountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InterestCountService],
    }).compile();

    service = module.get<InterestCountService>(InterestCountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
