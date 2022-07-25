import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';

describe('MediaService', () => {
  let service: MediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediaController],
    }).compile();

    service = module.get<MediaController>(MediaController);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
