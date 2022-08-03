import { Test, TestingModule } from '@nestjs/testing';
import { GroupModuleController } from './groupmodule.controller';

describe('GroupModuleController', () => {
  let controller: GroupModuleController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupModuleController],
    }).compile();

    controller = module.get<GroupModuleController>(GroupModuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
