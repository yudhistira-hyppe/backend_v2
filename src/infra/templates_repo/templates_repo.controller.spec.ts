import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesRepoController } from './templates_repo.controller';

describe('TemplatesRepoController', () => {
  let controller: TemplatesRepoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplatesRepoController],
    }).compile();

    controller = module.get<TemplatesRepoController>(TemplatesRepoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
