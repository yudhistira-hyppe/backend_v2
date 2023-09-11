import { Test, TestingModule } from '@nestjs/testing';
import { StickerCategoryService } from './stickercategory.service';

describe('StickerCategoryService', () => {
  let service: StickerCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StickerCategoryService],
    }).compile();

    service = module.get<StickerCategoryService>(StickerCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
