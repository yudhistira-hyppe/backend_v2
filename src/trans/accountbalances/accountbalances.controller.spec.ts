import { Test, TestingModule } from '@nestjs/testing';
import { AccountbalancesController } from './accountbalances.controller';

describe('AccountbalancesController', () => {
  let controller: AccountbalancesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountbalancesController],
    }).compile();

    controller = module.get<AccountbalancesController>(AccountbalancesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
