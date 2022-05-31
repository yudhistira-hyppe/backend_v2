import { Test, TestingModule } from '@nestjs/testing';
import { UserauthsController } from './userauths.controller';

describe('UserauthsController', () => {
  let controller: UserauthsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserauthsController],
    }).compile();

    controller = module.get<UserauthsController>(UserauthsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
