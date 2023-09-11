import { Test, TestingModule } from '@nestjs/testing';
import { MediastikerController } from './mediastiker.controller';

describe('MediastikerController', () => {
  let controller: MediastikerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediastikerController],
    }).compile();

    controller = module.get<MediastikerController>(MediastikerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
