import { Test, TestingModule } from '@nestjs/testing';
import { UserAdsService } from './userads.service';

describe('SagasService', () => {
    let service: UserAdsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UserAdsService],
        }).compile();

        service = module.get<UserAdsService>(UserAdsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
