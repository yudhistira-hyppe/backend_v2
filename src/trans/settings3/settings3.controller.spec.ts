import { Test, TestingModule } from '@nestjs/testing';
import { Settings3Controller } from './settings3.controller';
import { Settings3Service } from './settings3.service';

describe('Settings3Controller', () => {
  let controller: Settings3Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Settings3Controller],
      providers: [Settings3Service],
    }).compile();

    controller = module.get<Settings3Controller>(Settings3Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
