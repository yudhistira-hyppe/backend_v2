import { Test, TestingModule } from '@nestjs/testing';
import { MediavideosadsService } from './mediavideosads.service';

describe('MediavideosadsService', () => {
  let service: MediavideosadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediavideosadsService],
    }).compile();

    service = module.get<MediavideosadsService>(MediavideosadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
