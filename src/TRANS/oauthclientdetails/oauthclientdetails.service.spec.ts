import { Test, TestingModule } from '@nestjs/testing';
import { OauthclientdetailsService } from './oauthclientdetails.service';

describe('OauthclientdetailsService', () => {
  let service: OauthclientdetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OauthclientdetailsService],
    }).compile();

    service = module.get<OauthclientdetailsService>(OauthclientdetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
