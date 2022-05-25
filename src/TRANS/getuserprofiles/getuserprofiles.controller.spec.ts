import { Test, TestingModule } from '@nestjs/testing';
import { GetuserprofilesController } from './getuserprofiles.controller';

describe('GetuserprofilesController', () => {
  let controller: GetuserprofilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetuserprofilesController],
    }).compile();

    controller = module.get<GetuserprofilesController>(GetuserprofilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
