import { Test, TestingModule } from '@nestjs/testing';
import { MediadiariesController } from './mediadiaries.controller';

describe('MediadiariesController', () => {
  let controller: MediadiariesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediadiariesController],
    }).compile();

    controller = module.get<MediadiariesController>(MediadiariesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
