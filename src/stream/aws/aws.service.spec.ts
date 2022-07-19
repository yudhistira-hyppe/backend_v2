import { Test, TestingModule } from '@nestjs/testing';
import { AwsController } from './aws.controller';

describe('AwsService', () => {
  let service: AwsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AwsController],
    }).compile();

    service = module.get<AwsController>(AwsController);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
