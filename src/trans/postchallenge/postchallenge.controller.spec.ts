import { Test, TestingModule } from '@nestjs/testing';
import { PostchallengeController } from './postchallenge.controller';

describe('PostchallengeController', () => {
  let controller: PostchallengeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostchallengeController],
    }).compile();

    controller = module.get<PostchallengeController>(PostchallengeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
