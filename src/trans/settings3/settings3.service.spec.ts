import { Test, TestingModule } from '@nestjs/testing';
import { Settings3Service } from './settings3.service';

describe('Settings3Service', () => {
  let service: Settings3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Settings3Service],
    }).compile();

    service = module.get<Settings3Service>(Settings3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
