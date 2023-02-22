import { Test, TestingModule } from '@nestjs/testing';
import { InterestdayController } from './interestday.controller';

describe('InterestdayController', () => {
  let controller: InterestdayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterestdayController],
    }).compile();

    controller = module.get<InterestdayController>(InterestdayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
