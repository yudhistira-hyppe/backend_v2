import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { newPosts2, Newposts2Document } from './schemas/newPost.schema';
import { UtilsService } from 'src/utils/utils.service';
import { ErrorHandler } from 'src/utils/error.handler';

@Injectable()
export class NewPost2Service {
    constructor(
        @InjectModel(newPosts2.name, 'SERVER_FULL')
        private readonly loaddata: Model<Newposts2Document>,
        private readonly errorHandler: ErrorHandler,

    ){ }

    async findByPostId(id:string)
    {
        return await this.loaddata.findOne({ postID:id }).exec();
    }

    async updateByPostId(id:string, data:newPosts2)
    {
        let result = await this.loaddata.findByIdAndUpdate(
            id,
            data,
            { new: true },
        );
        
        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;        
    }
}
