import { Test, TestingModule } from '@nestjs/testing';
import { StickerCategoryController } from './stickercategory.controller';
import { StickerCategoryService } from './stickercategory.service';

describe('StickerCategoryController', () => {
  let controller: StickerCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StickerCategoryController],
      providers: [StickerCategoryService],
    }).compile();

    controller = module.get<StickerCategoryController>(StickerCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
