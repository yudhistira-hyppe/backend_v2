import { Test, TestingModule } from '@nestjs/testing';
import { MediapictsController } from './mediapicts.controller';

describe('MediapictsController', () => {
  let controller: MediapictsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediapictsController],
    }).compile();

    controller = module.get<MediapictsController>(MediapictsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
