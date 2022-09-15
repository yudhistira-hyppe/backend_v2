import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { CreateMediaimageadsDto } from './dto/create-mediaimageads.dto';
import { Mediaimageads, MediaimageadsDocument } from './schemas/mediaimageads.schema';

@Injectable()
export class MediaimageadsService {
    constructor(
        @InjectModel(Mediaimageads.name, 'SERVER_TRANS')
        private readonly mediaimageadsModel: Model<MediaimageadsDocument>

    ) { }

    async create(CreateMediaimageadsDto: CreateMediaimageadsDto): Promise<Mediaimageads> {
        let data = await this.mediaimageadsModel.create(CreateMediaimageadsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async findAll(): Promise<Mediaimageads[]> {
        return this.mediaimageadsModel.find().exec();
    }

    async findOne(id: string): Promise<Mediaimageads> {
        return this.mediaimageadsModel.findOne({ _id: id }).exec();
    }

    async delete(id: string) {
        const deletedCat = await this.mediaimageadsModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deletedCat;
    }

    async update(
        id: string,
        createMediaimageadsDto: CreateMediaimageadsDto,
    ): Promise<Mediaimageads> {
        let data = await this.mediaimageadsModel.findByIdAndUpdate(
            id,
            createMediaimageadsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }
    async updatemediaAds(id: Types.ObjectId, imageId: string): Promise<Object> {
        let data = await this.mediaimageadsModel.updateOne({ "_id": id },
            { $set: { "imageId": imageId } });
        return data;
    }
}
