import { Test, TestingModule } from '@nestjs/testing';
import { BoostintervalController } from './boostinterval.controller';

describe('BoostintervalController', () => {
  let controller: BoostintervalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoostintervalController],
    }).compile();

    controller = module.get<BoostintervalController>(BoostintervalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
