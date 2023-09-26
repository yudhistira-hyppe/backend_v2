import { Test, TestingModule } from '@nestjs/testing';
import { NewPostController } from './new_post.controller';
import { NewPostService } from './new_post.service';

describe('NewPostController', () => {
  let controller: NewPostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewPostController],
      providers: [NewPostService],
    }).compile();

    controller = module.get<NewPostController>(NewPostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
