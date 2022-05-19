import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesRepoService } from './templates_repo.service';

describe('TemplatesRepoService', () => {
  let service: TemplatesRepoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplatesRepoService],
    }).compile();

    service = module.get<TemplatesRepoService>(TemplatesRepoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
