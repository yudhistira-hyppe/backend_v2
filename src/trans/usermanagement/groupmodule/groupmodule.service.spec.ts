import { Test, TestingModule } from '@nestjs/testing';
import { GroupModuleService } from './groupmodule.service';

describe('GroupModuleService', () => {
  let service: GroupModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupModuleService],
    }).compile();

    service = module.get<GroupModuleService>(GroupModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
