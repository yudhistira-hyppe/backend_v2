import { Test, TestingModule } from '@nestjs/testing';
import { DomaineventsController } from './domainevents.controller';

describe('DomaineventsController', () => {
  let controller: DomaineventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DomaineventsController],
    }).compile();

    controller = module.get<DomaineventsController>(DomaineventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
