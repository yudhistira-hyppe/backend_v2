import { Test, TestingModule } from '@nestjs/testing';
import { InterestCountController } from './interest_count.controller';

describe('InterestCountController', () => {
  let controller: InterestCountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterestCountController],
    }).compile();

    controller = module.get<InterestCountController>(InterestCountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
