import { Test, TestingModule } from '@nestjs/testing';
import { ContentqmaticController } from './contentqmatic.controller';

describe('ContentqmaticController', () => {
  let controller: ContentqmaticController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentqmaticController],
    }).compile();

    controller = module.get<ContentqmaticController>(ContentqmaticController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
