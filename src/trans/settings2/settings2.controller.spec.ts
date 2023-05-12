import { Test, TestingModule } from '@nestjs/testing';
import { Settings2Controller } from './settings2.controller';
import { Settings2Service } from './settings2.service';

describe('Settings2Controller', () => {
  let controller: Settings2Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Settings2Controller],
      providers: [Settings2Service],
    }).compile();

    controller = module.get<Settings2Controller>(Settings2Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
