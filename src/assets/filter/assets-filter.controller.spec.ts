import { Test, TestingModule } from '@nestjs/testing';
import { AssetsFilterController } from './assets-filter.controller';

describe('AssetsFilterController', () => {
  let controller: AssetsFilterController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetsFilterController],
    }).compile();
    controller = module.get<AssetsFilterController>(AssetsFilterController);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
