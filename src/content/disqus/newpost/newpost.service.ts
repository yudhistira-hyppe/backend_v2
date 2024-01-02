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
    async getPostByDate(startdate: string) {
        var before = new Date(startdate).toISOString().split("T")[0];
        var input = new Date();
        input.setDate(input.getDate() + 1);
        var today = new Date(input).toISOString().split("T")[0];
        //kalo error, coba ganti jadi set dan jadi object
        var query = await this.PostsModel.aggregate([
            {
                "$match":
                {
                    createdAt:
                    {
                        "$gte": before,
                        "$lte": today
                    },
                }
            },
            {
                "$project":
                {
                    createdAt:
                    {
                        "$substr":
                            [
                                "$createdAt", 0, 10
                            ]
                    }
                }
            },
            {
                "$group":
                {
                    _id:
                    {
                        "$dateFromString":
                        {
                            "format": "%Y-%m-%d",
                            "dateString": "$createdAt"

                        }
                    },
                    totalperhari:
                    {
                        "$sum": 1
                    }
                }
            },
            {
                "$project":
                {
                    _id: 1,
                    totalperhari: 1
                }
            },
            {
                "$unwind":
                {
                    path: "$_id"
                }
            },
            {
                "$sort":
                {
                    _id: 1
                }
            },
            {
                "$group":
                {
                    _id: null,
                    total:
                    {
                        "$sum": "$totalperhari"
                    },
                    resultdata:
                    {
                        "$push":
                        {
                            _id:
                            {
                                "$substr":
                                    [
                                        {
                                            "$toString": "$_id"
                                        }, 0, 10
                                    ]
                            },
                            totaldata: "$totalperhari"
                        }
                    }
                }
            }
        ]);

        return query;
    }


}
