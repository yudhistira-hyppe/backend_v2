import { Test, TestingModule } from '@nestjs/testing';
import { NewPost2Controller } from './new_post2.controller';
import { NewPost2Service } from './new_post2.service';

describe('NewPost2Controller', () => {
  let controller: NewPost2Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewPost2Controller],
      providers: [NewPost2Service],
    }).compile();

    controller = module.get<NewPost2Controller>(NewPost2Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
