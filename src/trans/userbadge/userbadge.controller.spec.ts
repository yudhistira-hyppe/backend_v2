import { Test, TestingModule } from '@nestjs/testing';
import { UserbadgeController } from './userbadge.controller';

describe('UserbadgeController', () => {
  let controller: UserbadgeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserbadgeController],
    }).compile();

    controller = module.get<UserbadgeController>(UserbadgeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
