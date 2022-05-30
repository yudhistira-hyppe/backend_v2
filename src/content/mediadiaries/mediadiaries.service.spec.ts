import { Test, TestingModule } from '@nestjs/testing';
import { MediadiariesService } from './mediadiaries.service';

describe('MediadiariesService', () => {
  let service: MediadiariesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediadiariesService],
    }).compile();

    service = module.get<MediadiariesService>(MediadiariesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
