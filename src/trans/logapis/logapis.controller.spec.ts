import { Test, TestingModule } from '@nestjs/testing';
import { LogapisController } from './logapis.controller';
import { LogapisService } from './logapis.service';

describe('LogapisController', () => {
  let controller: LogapisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogapisController],
      providers: [LogapisService],
    }).compile();

    controller = module.get<LogapisController>(LogapisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
