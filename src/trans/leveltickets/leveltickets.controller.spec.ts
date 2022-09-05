import { Test, TestingModule } from '@nestjs/testing';
import { LevelticketsController } from './leveltickets.controller';

describe('LevelticketsController', () => {
  let controller: LevelticketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LevelticketsController],
    }).compile();

    controller = module.get<LevelticketsController>(LevelticketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
