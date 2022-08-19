import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Model, Types } from 'mongoose';
import { CreateUserAdsDto } from './dto/create-userads.dto';
import { UserAds, UserAdsDocument } from './schemas/userads.schema';

@Injectable()
export class UserAdsService {
    constructor(@InjectModel(UserAds.name, 'SERVER_TRANS')
    private readonly userAdsModel: Model<UserAdsDocument>,
    ) { }

    async create(CreateUserAdsDto: CreateUserAdsDto): Promise<UserAds> {
        const createUserbasicDto = await this.userAdsModel.create(
            CreateUserAdsDto,
        );
        return createUserbasicDto;
    }

    async findAll(): Promise<UserAds[]> {
        return this.userAdsModel.find().exec();
    }

    async findOne(id: string): Promise<UserAds> {
        return this.userAdsModel.findOne({ _id: id }).exec();
    }

    async findAdsid(adsID: ObjectId): Promise<UserAds> {
        return this.userAdsModel.findOne({ adsID: adsID }).exec();
    }
    async update(
        adsID: string,
        createUserAdsDto: CreateUserAdsDto,
    ): Promise<UserAds> {
        let data = await this.userAdsModel.findByIdAndUpdate(
            adsID,
            createUserAdsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }
    async updatesdata(adsID: Types.ObjectId, createUserAdsDto: CreateUserAdsDto): Promise<Object> {
        let data = await this.userAdsModel.updateOne({ "adsID": adsID },
            { $set: { "statusClick": createUserAdsDto.statusClick, "statusView": createUserAdsDto.statusView, "viewAt": createUserAdsDto.viewAt, "viewed": createUserAdsDto.viewed, "clickAt": createUserAdsDto.clickAt } });
        return data;
    }


}
