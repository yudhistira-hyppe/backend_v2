import { Test, TestingModule } from '@nestjs/testing';
import { SagasController } from './sagas.controller';

describe('SagasController', () => {
  let controller: SagasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SagasController],
    }).compile();

    controller = module.get<SagasController>(SagasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
