import { Test, TestingModule } from '@nestjs/testing';
import { MediavideosadsController } from './mediavideosads.controller';

describe('MediavideosadsController', () => {
  let controller: MediavideosadsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediavideosadsController],
    }).compile();

    controller = module.get<MediavideosadsController>(MediavideosadsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
