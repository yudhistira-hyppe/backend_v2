import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newpost, NewpostDocument } from '..//../disqus/newpost/schemas/newpost.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NewpostService {
    private readonly logger = new Logger(NewpostService.name);
    constructor(
        @InjectModel(Newpost.name, 'SERVER_FULL')
        private readonly PostsModel: Model<NewpostDocument>,
        private readonly configService: ConfigService,
    ) { }

    async findByPostId(postID: string): Promise<Newpost> {
        return this.PostsModel.findOne({ postID: postID }).exec();
    }

    async findid(id: string): Promise<Newpost> {
        return this.PostsModel.findOne({ _id: id }).exec();
    }
    async updateCommentPlus(postID: string) {
        this.PostsModel.updateOne(
            {
                postID: postID,
            },
            { $inc: { comments: 1 } },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }


}
