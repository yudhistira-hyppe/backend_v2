import { Test, TestingModule } from '@nestjs/testing';
import { Settings2Service } from './settings2.service';

describe('Settings2Service', () => {
  let service: Settings2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Settings2Service],
    }).compile();

    service = module.get<Settings2Service>(Settings2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
