import { Test, TestingModule } from '@nestjs/testing';
import { GetcontenteventsService } from './getcontentevents.service';

describe('GetcontenteventsService', () => {
  let service: GetcontenteventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetcontenteventsService],
    }).compile();

    service = module.get<GetcontenteventsService>(GetcontenteventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
