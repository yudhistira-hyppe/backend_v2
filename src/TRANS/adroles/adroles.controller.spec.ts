import { Test, TestingModule } from '@nestjs/testing';
import { AdrolesController } from './adroles.controller';

describe('AdrolesController', () => {
  let controller: AdrolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdrolesController],
    }).compile();

    controller = module.get<AdrolesController>(AdrolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
