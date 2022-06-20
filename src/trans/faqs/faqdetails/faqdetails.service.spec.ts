import { Test, TestingModule } from '@nestjs/testing';
import { FaqdetailsService } from './faqdetails.service';

describe('FaqdetailsService', () => {
  let service: FaqdetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FaqdetailsService],
    }).compile();

    service = module.get<FaqdetailsService>(FaqdetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
