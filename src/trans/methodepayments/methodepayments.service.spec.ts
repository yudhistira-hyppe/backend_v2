import { Test, TestingModule } from '@nestjs/testing';
import { MethodepaymentsService } from './methodepayments.service';

describe('MethodepaymentsService', () => {
  let service: MethodepaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MethodepaymentsService],
    }).compile();

    service = module.get<MethodepaymentsService>(MethodepaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
