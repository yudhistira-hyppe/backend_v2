import { Test, TestingModule } from '@nestjs/testing';
import { FiltercategoryController } from './filtercategory.controller';

describe('FiltercategoryController', () => {
  let controller: FiltercategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FiltercategoryController],
    }).compile();

    controller = module.get<FiltercategoryController>(FiltercategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
