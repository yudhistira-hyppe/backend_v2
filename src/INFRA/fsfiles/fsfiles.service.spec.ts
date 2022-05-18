import { Test, TestingModule } from '@nestjs/testing';
import { FsfilesService } from './fsfiles.service';

describe('FsfilesService', () => {
  let service: FsfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FsfilesService],
    }).compile();

    service = module.get<FsfilesService>(FsfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
