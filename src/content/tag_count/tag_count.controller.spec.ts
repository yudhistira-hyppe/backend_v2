import { Test, TestingModule } from '@nestjs/testing';
import { TagCountController } from './tag_count.controller';

describe('TagCountController', () => {
  let controller: TagCountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagCountController],
    }).compile();

    controller = module.get<TagCountController>(TagCountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
