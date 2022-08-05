import { Test, TestingModule } from '@nestjs/testing';
import { AdsplacesService } from './adsplaces.service';

describe('AdsplacesService', () => {
  let service: AdsplacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdsplacesService],
    }).compile();

    service = module.get<AdsplacesService>(AdsplacesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
