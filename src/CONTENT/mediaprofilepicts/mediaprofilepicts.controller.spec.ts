import { Test, TestingModule } from '@nestjs/testing';
import { MediaprofilepictsController } from './mediaprofilepicts.controller';

describe('MediaprofilepictsController', () => {
  let controller: MediaprofilepictsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaprofilepictsController],
    }).compile();

    controller = module.get<MediaprofilepictsController>(MediaprofilepictsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
