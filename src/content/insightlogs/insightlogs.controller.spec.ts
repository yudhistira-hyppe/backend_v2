import { Test, TestingModule } from '@nestjs/testing';
import { InsightlogsController } from './insightlogs.controller';

describe('InsightlogsController', () => {
  let controller: InsightlogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsightlogsController],
    }).compile();

    controller = module.get<InsightlogsController>(InsightlogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
