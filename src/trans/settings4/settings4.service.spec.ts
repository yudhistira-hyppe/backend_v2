import { Test, TestingModule } from '@nestjs/testing';
import { Settings4Service } from './settings4.service';

describe('Settings4Service', () => {
  let service: Settings4Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Settings4Service],
    }).compile();

    service = module.get<Settings4Service>(Settings4Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
