import { Test, TestingModule } from '@nestjs/testing';
import { MediavideosService } from './mediavideos.service';

describe('MediavideosService', () => {
  let service: MediavideosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediavideosService],
    }).compile();

    service = module.get<MediavideosService>(MediavideosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
