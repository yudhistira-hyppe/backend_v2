import { Test, TestingModule } from '@nestjs/testing';
import { LogticketsController } from './logtickets.controller';

describe('LogticketsController', () => {
  let controller: LogticketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogticketsController],
    }).compile();

    controller = module.get<LogticketsController>(LogticketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
