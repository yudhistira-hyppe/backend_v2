import { Test, TestingModule } from '@nestjs/testing';
import { AdstypesController } from './adstypes.controller';

describe('AdstypesController', () => {
  let controller: AdstypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdstypesController],
    }).compile();

    controller = module.get<AdstypesController>(AdstypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
