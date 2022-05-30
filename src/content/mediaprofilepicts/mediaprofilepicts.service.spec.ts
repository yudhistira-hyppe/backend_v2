import { Test, TestingModule } from '@nestjs/testing';
import { MediaprofilepictsService } from './mediaprofilepicts.service';

describe('MediaprofilepictsService', () => {
  let service: MediaprofilepictsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediaprofilepictsService],
    }).compile();

    service = module.get<MediaprofilepictsService>(MediaprofilepictsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
