import { Test, TestingModule } from '@nestjs/testing';
import { Settings4Controller } from './settings4.controller';
import { Settings4Service } from './settings4.service';

describe('Settings4Controller', () => {
  let controller: Settings4Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Settings4Controller],
      providers: [Settings4Service],
    }).compile();

    controller = module.get<Settings4Controller>(Settings4Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
