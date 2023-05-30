import { Test, TestingModule } from '@nestjs/testing';
import { UserchallengesController } from './userchallenges.controller';

describe('UserchallengesController', () => {
  let controller: UserchallengesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserchallengesController],
    }).compile();

    controller = module.get<UserchallengesController>(UserchallengesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
