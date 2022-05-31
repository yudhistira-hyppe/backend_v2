import { Test, TestingModule } from '@nestjs/testing';
import { MediastoriesController } from './mediastories.controller';

describe('MediastoriesController', () => {
  let controller: MediastoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediastoriesController],
    }).compile();

    controller = module.get<MediastoriesController>(MediastoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
