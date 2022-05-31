import { Test, TestingModule } from '@nestjs/testing';
import { InterestsRepoController } from './interests_repo.controller';

describe('InterestsRepoController', () => {
  let controller: InterestsRepoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterestsRepoController],
    }).compile();

    controller = module.get<InterestsRepoController>(InterestsRepoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
