import { Test, TestingModule } from '@nestjs/testing';
import { MediamusicService } from './mediamusic.service';

describe('MediamusicService', () => {
  let service: MediamusicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediamusicService],
    }).compile();

    service = module.get<MediamusicService>(MediamusicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
