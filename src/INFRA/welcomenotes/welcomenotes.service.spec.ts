import { Test, TestingModule } from '@nestjs/testing';
import { WelcomenotesService } from './welcomenotes.service';

describe('WelcomenotesService', () => {
  let service: WelcomenotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WelcomenotesService],
    }).compile();

    service = module.get<WelcomenotesService>(WelcomenotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
