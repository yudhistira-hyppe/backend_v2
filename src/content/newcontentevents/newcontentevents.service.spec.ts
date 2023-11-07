import { Test, TestingModule } from '@nestjs/testing';
import { NewcontenteventsService } from './newcontentevents.service';

describe('NewcontenteventsService', () => {
  let service: NewcontenteventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewcontenteventsService],
    }).compile();

    service = module.get<NewcontenteventsService>(NewcontenteventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
