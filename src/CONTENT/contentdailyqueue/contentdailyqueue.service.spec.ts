import { Test, TestingModule } from '@nestjs/testing';
import { ContentdailyqueueService } from './contentdailyqueue.service';

describe('ContentdailyqueueService', () => {
  let service: ContentdailyqueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentdailyqueueService],
    }).compile();

    service = module.get<ContentdailyqueueService>(ContentdailyqueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
