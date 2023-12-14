import { Test, TestingModule } from '@nestjs/testing';
import { FiltercategoryService } from './filtercategory.service';

describe('FiltercategoryService', () => {
  let service: FiltercategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FiltercategoryService],
    }).compile();

    service = module.get<FiltercategoryService>(FiltercategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
