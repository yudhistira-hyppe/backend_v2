import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { CreateMediavodeosadsDto } from './dto/create-mediavideosads.dto';
import { Mediavideosads, MediavideosadsDocument } from './schemas/mediavideosads.schema';
import { SeaweedfsService } from '../../stream/seaweedfs/seaweedfs.service'; 

@Injectable()
export class MediavideosadsService {

    constructor(
        @InjectModel(Mediavideosads.name, 'SERVER_TRANS')
        private readonly mediavideosadsModel: Model<MediavideosadsDocument>,
        private seaweedfsService: SeaweedfsService,

    ) { }
    async create(CreateMediavodeosadsDto: CreateMediavodeosadsDto): Promise<Mediavideosads> {
        let data = await this.mediavideosadsModel.create(CreateMediavodeosadsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async findAll(): Promise<Mediavideosads[]> {
        return this.mediavideosadsModel.find().exec();
    }

    async findOne(id: string): Promise<Mediavideosads> {
        return this.mediavideosadsModel.findOne({ _id: id }).exec();
    }

    async findOne_(id: string) {
        var data_ads = await this.mediavideosadsModel.findOne({ _id: id }).exec();
        // console.log(id)
        // console.log(data_ads)
        var data = await this.seaweedfsService.read(data_ads.fsSourceUri.replace('/localrepo', ''));
        console.log(data)
        if (data != null) {
            return data;
        }
    }

    async delete(id: string) {
        const deletedCat = await this.mediavideosadsModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deletedCat;
    }

    async update(
        id: string,
        createMediavodeosadsDto: CreateMediavodeosadsDto,
    ): Promise<Mediavideosads> {
        let data = await this.mediavideosadsModel.findByIdAndUpdate(
            id,
            createMediavodeosadsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }


}
