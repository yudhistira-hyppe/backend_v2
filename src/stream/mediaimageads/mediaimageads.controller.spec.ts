import { Test, TestingModule } from '@nestjs/testing';
import { MediaimageadsController } from './mediaimageads.controller';

describe('MediaimageadsController', () => {
  let controller: MediaimageadsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaimageadsController],
    }).compile();

    controller = module.get<MediaimageadsController>(MediaimageadsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
