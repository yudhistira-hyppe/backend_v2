import { Test, TestingModule } from '@nestjs/testing';
import { NewPost2Service } from './new_post2.service';

describe('NewPost2Service', () => {
  let service: NewPost2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewPost2Service],
    }).compile();

    service = module.get<NewPost2Service>(NewPost2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
