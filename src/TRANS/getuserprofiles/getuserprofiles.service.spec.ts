import { Test, TestingModule } from '@nestjs/testing';
import { GetuserprofilesService } from './getuserprofiles.service';

describe('GetuserprofilesService', () => {
  let service: GetuserprofilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetuserprofilesService],
    }).compile();

    service = module.get<GetuserprofilesService>(GetuserprofilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
