import { Test, TestingModule } from '@nestjs/testing';
import { JwtrefreshtokenService } from './jwtrefreshtoken.service';

describe('JwtrefreshtokenService', () => {
  let service: JwtrefreshtokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtrefreshtokenService],
    }).compile();

    service = module.get<JwtrefreshtokenService>(JwtrefreshtokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
