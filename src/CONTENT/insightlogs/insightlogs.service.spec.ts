import { Test, TestingModule } from '@nestjs/testing';
import { InsightlogsService } from './insightlogs.service';

describe('InsightlogsService', () => {
  let service: InsightlogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InsightlogsService],
    }).compile();

    service = module.get<InsightlogsService>(InsightlogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
