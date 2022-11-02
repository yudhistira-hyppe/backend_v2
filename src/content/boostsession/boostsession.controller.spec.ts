import { Test, TestingModule } from '@nestjs/testing';
import { BoostsessionController } from './boostsession.controller';

describe('BoostsessionController', () => {
  let controller: BoostsessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoostsessionController],
    }).compile();

    controller = module.get<BoostsessionController>(BoostsessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
