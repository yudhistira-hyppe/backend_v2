import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { TagCountDto } from './dto/create-tag_count.dto';
import { TagCount, TagCountDocument } from './schemas/tag_count.schema';

@Injectable()
export class TagCountService {
    constructor(
        @InjectModel(TagCount.name, 'SERVER_FULL')
        private readonly tagcountModel: Model<TagCountDocument>,
    ) { }

    async create(
        TagCountDto: TagCountDto,
    ): Promise<TagCount> {
        const tagCountDto = await this.tagcountModel.create(
            TagCountDto,
        );
        return tagCountDto;
    }

    async findAll(): Promise<TagCount[]> {
        return this.tagcountModel.find().exec();
    }

    async findOneById(id: string): Promise<TagCount> {
        return this.tagcountModel
            .findOne({ _id: id })
            .exec();
    }

    async update(
        id: string,
        tagCountDto: TagCountDto,
    ): Promise<TagCount> {
        let data = await this.tagcountModel.findByIdAndUpdate(
            id,
            tagCountDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async detailtag() {
        var pipeline = [];
    }

}
