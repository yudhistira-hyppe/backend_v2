import { Test, TestingModule } from '@nestjs/testing';
import { Fs.ChunksService } from './fs.chunks.service';

describe('Fs.ChunksService', () => {
  let service: Fs.ChunksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Fs.ChunksService],
    }).compile();

    service = module.get<Fs.ChunksService>(Fs.ChunksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
