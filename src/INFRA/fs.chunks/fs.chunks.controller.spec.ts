import { Test, TestingModule } from '@nestjs/testing';
import { FsChunksController } from './fs.chunks.controller';

describe('Fs.ChunksController', () => {
  let controller: FsChunksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FsChunksController],
    }).compile();

    controller = module.get<FsChunksController>(FsChunksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
