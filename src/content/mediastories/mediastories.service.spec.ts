import { Test, TestingModule } from '@nestjs/testing';
import { MediastoriesService } from './mediastories.service';

describe('MediastoriesService', () => {
  let service: MediastoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediastoriesService],
    }).compile();

    service = module.get<MediastoriesService>(MediastoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
