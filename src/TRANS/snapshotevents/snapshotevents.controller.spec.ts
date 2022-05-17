import { Test, TestingModule } from '@nestjs/testing';
import { SnapshoteventsController } from './snapshotevents.controller';

describe('SnapshoteventsController', () => {
  let controller: SnapshoteventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SnapshoteventsController],
    }).compile();

    controller = module.get<SnapshoteventsController>(SnapshoteventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
