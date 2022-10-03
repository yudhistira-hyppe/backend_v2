import { Test, TestingModule } from '@nestjs/testing';
import { LogapsarasController } from './logapsaras.controller';

describe('LogapsarasController', () => {
  let controller: LogapsarasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogapsarasController],
    }).compile();

    controller = module.get<LogapsarasController>(LogapsarasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
