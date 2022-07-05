import { Test, TestingModule } from '@nestjs/testing';
import { OyPgController } from './oypg.controller';

describe('OyPgService', () => {
  let service: OyPgController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OyPgController],
    }).compile();

    service = module.get<OyPgController>(OyPgController);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
