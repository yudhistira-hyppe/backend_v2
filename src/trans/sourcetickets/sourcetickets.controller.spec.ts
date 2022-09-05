import { Test, TestingModule } from '@nestjs/testing';
import { SourceticketsController } from './sourcetickets.controller';

describe('SourceticketsController', () => {
  let controller: SourceticketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SourceticketsController],
    }).compile();

    controller = module.get<SourceticketsController>(SourceticketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
