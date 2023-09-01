import { Test, TestingModule } from '@nestjs/testing';
import { MediastikerService } from './mediastiker.service';

describe('MediastikerService', () => {
  let service: MediastikerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediastikerService],
    }).compile();

    service = module.get<MediastikerService>(MediastikerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
