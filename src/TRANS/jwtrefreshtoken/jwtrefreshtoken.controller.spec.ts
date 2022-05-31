import { Test, TestingModule } from '@nestjs/testing';
import { JwtrefreshtokenController } from './jwtrefreshtoken.controller';

describe('JwtrefreshtokenController', () => {
  let controller: JwtrefreshtokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JwtrefreshtokenController],
    }).compile();

    controller = module.get<JwtrefreshtokenController>(JwtrefreshtokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
