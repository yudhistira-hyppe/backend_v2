import { Test, TestingModule } from '@nestjs/testing';
import { ContenteventsController } from './contentevents.controller';

describe('ContenteventsController', () => {
  let controller: ContenteventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContenteventsController],
    }).compile();

    controller = module.get<ContenteventsController>(ContenteventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
