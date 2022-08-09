import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserAdsDto } from './dto/create-userads.dto';
import { UserAds, UserAdsDocument } from './schemas/userads.schema';

@Injectable()
export class UserAdsService {
    constructor(@InjectModel(UserAds.name, 'SERVER_TRANS')
        private readonly userAdsModel: Model<UserAdsDocument>,
    ) { }

    async createUserAds(CreateUserAdsDto: CreateUserAdsDto): Promise<Object> {
        
        const createUserAdsDto = await this.userAdsModel.create(CreateUserAdsDto);
        return createUserAdsDto;
    }
}
