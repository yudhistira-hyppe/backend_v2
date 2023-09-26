import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { newPosts, NewpostsDocument } from './schemas/newPost.schema';

@Injectable()
export class NewPostService {
    constructor(
        @InjectModel(newPosts.name, 'SERVER_FULL')
        private readonly loaddata: Model<NewpostsDocument>,
    ) { }
}
