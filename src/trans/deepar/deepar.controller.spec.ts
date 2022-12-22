import { Test, TestingModule } from '@nestjs/testing';
import { DeepArController } from './deepar.controller';

describe('DeepArController', () => {
  let controller: DeepArController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeepArController],
    }).compile();

    controller = module.get<DeepArController>(DeepArController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
