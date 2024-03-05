import { Test, TestingModule } from '@nestjs/testing';
import { MonetizationController } from './monetization.controller';
import { MonetizationService } from './monetization.service';

describe('MonetizationController', () => {
  let controller: MonetizationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonetizationController],
      providers: [MonetizationService],
    }).compile();

    controller = module.get<MonetizationController>(MonetizationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
