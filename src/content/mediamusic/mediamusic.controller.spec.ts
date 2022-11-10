import { Test, TestingModule } from '@nestjs/testing';
import { MediamusicController } from './mediamusic.controller';

describe('MediamusicController', () => {
  let controller: MediamusicController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediamusicController],
    }).compile();

    controller = module.get<MediamusicController>(MediamusicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
