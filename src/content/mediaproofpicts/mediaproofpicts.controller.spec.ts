import { Test, TestingModule } from '@nestjs/testing';
import { MediaproofpictsController } from './mediaproofpicts.controller';

describe('MediaproofpictsController', () => {
  let controller: MediaproofpictsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaproofpictsController],
    }).compile();

    controller = module.get<MediaproofpictsController>(MediaproofpictsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
