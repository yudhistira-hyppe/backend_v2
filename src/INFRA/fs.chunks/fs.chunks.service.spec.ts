import { Test, TestingModule } from '@nestjs/testing';
import { FsChunksService } from './fs.chunks.service';

describe('Fs.ChunksService', () => {
  let service: FsChunksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FsChunksService],
    }).compile();

    service = module.get<FsChunksService>(FsChunksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
