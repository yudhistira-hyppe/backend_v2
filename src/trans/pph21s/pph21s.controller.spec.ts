import { Test, TestingModule } from '@nestjs/testing';
import { Pph21sController } from './pph21s.controller';

describe('Pph21sController', () => {
  let controller: Pph21sController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Pph21sController],
    }).compile();

    controller = module.get<Pph21sController>(Pph21sController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
