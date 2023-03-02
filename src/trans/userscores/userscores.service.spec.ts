import { Test, TestingModule } from '@nestjs/testing';
import { UserscoresService } from './userscores.service';

describe('UserscoresService', () => {
  let service: UserscoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserscoresService],
    }).compile();

    service = module.get<UserscoresService>(UserscoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
