import { Test, TestingModule } from '@nestjs/testing';
import { UserbankaccountsController } from './userbankaccounts.controller';

describe('UserbankaccountsController', () => {
  let controller: UserbankaccountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserbankaccountsController],
    }).compile();

    controller = module.get<UserbankaccountsController>(UserbankaccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
