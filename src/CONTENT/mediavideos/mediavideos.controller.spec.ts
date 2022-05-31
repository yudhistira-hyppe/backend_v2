import { Test, TestingModule } from '@nestjs/testing';
import { MediavideosController } from './mediavideos.controller';

describe('MediavideosController', () => {
  let controller: MediavideosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediavideosController],
    }).compile();

    controller = module.get<MediavideosController>(MediavideosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
