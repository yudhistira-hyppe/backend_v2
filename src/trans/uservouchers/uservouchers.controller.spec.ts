import { Test, TestingModule } from '@nestjs/testing';
import { UservouchersController } from './uservouchers.controller';

describe('UservouchersController', () => {
  let controller: UservouchersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UservouchersController],
    }).compile();

    controller = module.get<UservouchersController>(UservouchersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
