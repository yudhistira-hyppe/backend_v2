import { Test, TestingModule } from '@nestjs/testing';
import { EulasController } from './eulas.controller';

describe('EulasController', () => {
  let controller: EulasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EulasController],
    }).compile();

    controller = module.get<EulasController>(EulasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
