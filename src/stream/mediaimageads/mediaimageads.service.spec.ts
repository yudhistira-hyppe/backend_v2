import { Test, TestingModule } from '@nestjs/testing';
import { MediaimageadsService } from './mediaimageads.service';

describe('MediaimageadsService', () => {
  let service: MediaimageadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediaimageadsService],
    }).compile();

    service = module.get<MediaimageadsService>(MediaimageadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
