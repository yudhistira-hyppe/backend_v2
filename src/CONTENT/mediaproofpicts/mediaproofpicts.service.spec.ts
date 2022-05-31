import { Test, TestingModule } from '@nestjs/testing';
import { MediaproofpictsService } from './mediaproofpicts.service';

describe('MediaproofpictsService', () => {
  let service: MediaproofpictsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediaproofpictsService],
    }).compile();

    service = module.get<MediaproofpictsService>(MediaproofpictsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
