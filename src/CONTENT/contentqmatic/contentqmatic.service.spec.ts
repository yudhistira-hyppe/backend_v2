import { Test, TestingModule } from '@nestjs/testing';
import { ContentqmaticService } from './contentqmatic.service';

describe('ContentqmaticService', () => {
  let service: ContentqmaticService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentqmaticService],
    }).compile();

    service = module.get<ContentqmaticService>(ContentqmaticService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
