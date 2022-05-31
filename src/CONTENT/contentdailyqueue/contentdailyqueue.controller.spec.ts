import { Test, TestingModule } from '@nestjs/testing';
import { ContentdailyqueueController } from './contentdailyqueue.controller';

describe('ContentdailyqueueController', () => {
  let controller: ContentdailyqueueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentdailyqueueController],
    }).compile();

    controller = module.get<ContentdailyqueueController>(ContentdailyqueueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
