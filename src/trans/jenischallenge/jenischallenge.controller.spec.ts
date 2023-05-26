import { Test, TestingModule } from '@nestjs/testing';
import { JenischallengeController } from './jenischallenge.controller';
import { JenischallengeService } from './jenischallenge.service';

describe('JenischallengeController', () => {
  let controller: JenischallengeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JenischallengeController],
      providers: [JenischallengeService],
    }).compile();

    controller = module.get<JenischallengeController>(JenischallengeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
