import { Test, TestingModule } from '@nestjs/testing';
import { FsfilesController } from './fsfiles.controller';

describe('FsfilesController', () => {
  let controller: FsfilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FsfilesController],
    }).compile();

    controller = module.get<FsfilesController>(FsfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
