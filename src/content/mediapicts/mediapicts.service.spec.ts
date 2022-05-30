import { Test, TestingModule } from '@nestjs/testing';
import { MediapictsService } from './mediapicts.service';

describe('MediapictsService', () => {
  let service: MediapictsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediapictsService],
    }).compile();

    service = module.get<MediapictsService>(MediapictsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
