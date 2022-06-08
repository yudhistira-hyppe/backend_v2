import { Test, TestingModule } from '@nestjs/testing';
import { UserticketsController } from './usertickets.controller';

describe('UserticketsController', () => {
  let controller: UserticketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserticketsController],
    }).compile();

    controller = module.get<UserticketsController>(UserticketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
