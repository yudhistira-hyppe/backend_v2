import { Test, TestingModule } from '@nestjs/testing';
import { ReportreasonsController } from './reportreasons.controller';

describe('ReportreasonsController', () => {
  let controller: ReportreasonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportreasonsController],
    }).compile();

    controller = module.get<ReportreasonsController>(ReportreasonsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
