import { Test, TestingModule } from '@nestjs/testing';
import { TagCountService } from './tag_count.service';

describe('TagCountService', () => {
  let service: TagCountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TagCountService],
    }).compile();

    service = module.get<TagCountService>(TagCountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
