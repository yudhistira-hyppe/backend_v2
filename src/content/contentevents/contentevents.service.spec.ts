import { Test, TestingModule } from '@nestjs/testing';
import { ContenteventsService } from './contentevents.service';

describe('ContenteventsService', () => {
  let service: ContenteventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContenteventsService],
    }).compile();

    service = module.get<ContenteventsService>(ContenteventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
