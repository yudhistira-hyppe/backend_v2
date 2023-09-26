import { Test, TestingModule } from '@nestjs/testing';
import { NewPostService } from './new_post.service';

describe('NewPostService', () => {
  let service: NewPostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewPostService],
    }).compile();

    service = module.get<NewPostService>(NewPostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
