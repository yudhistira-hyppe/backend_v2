import { Test, TestingModule } from '@nestjs/testing';
import { DevicelogService } from './devicelog.service';

describe('DevicelogService', () => {
  let service: DevicelogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DevicelogService],
    }).compile();

    service = module.get<DevicelogService>(DevicelogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
