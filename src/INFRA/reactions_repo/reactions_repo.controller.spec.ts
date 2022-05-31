import { Test, TestingModule } from '@nestjs/testing';
import { ReactionsRepoController } from './reactions_repo.controller';

describe('ReactionsRepoController', () => {
  let controller: ReactionsRepoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReactionsRepoController],
    }).compile();

    controller = module.get<ReactionsRepoController>(ReactionsRepoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
