import { Test, TestingModule } from '@nestjs/testing';
import { RemovedreasonsController } from './removedreasons.controller';

describe('RemovedreasonsController', () => {
  let controller: RemovedreasonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemovedreasonsController],
    }).compile();

    controller = module.get<RemovedreasonsController>(RemovedreasonsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
