import { Test, TestingModule } from '@nestjs/testing';
import { CategoryticketsController } from './categorytickets.controller';

describe('CategoryticketsController', () => {
  let controller: CategoryticketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryticketsController],
    }).compile();

    controller = module.get<CategoryticketsController>(CategoryticketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
