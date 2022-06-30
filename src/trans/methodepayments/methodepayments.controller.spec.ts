import { Test, TestingModule } from '@nestjs/testing';
import { MethodepaymentsController } from './methodepayments.controller';

describe('MethodepaymentsController', () => {
  let controller: MethodepaymentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MethodepaymentsController],
    }).compile();

    controller = module.get<MethodepaymentsController>(MethodepaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
