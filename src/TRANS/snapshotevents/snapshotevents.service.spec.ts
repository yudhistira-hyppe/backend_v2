import { Test, TestingModule } from '@nestjs/testing';
import { SnapshoteventsService } from './snapshotevents.service';

describe('SnapshoteventsService', () => {
  let service: SnapshoteventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SnapshoteventsService],
    }).compile();

    service = module.get<SnapshoteventsService>(SnapshoteventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
