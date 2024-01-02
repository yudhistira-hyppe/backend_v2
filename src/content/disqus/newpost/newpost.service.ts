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

    async analiticPost(startdate: string, enddate: string) {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();

            var dt = dateend.substring(0, 10);
        } catch (e) {
            dt = "";
        }
        var query = await this.PostsModel.aggregate(
            [
                {
                    "$match":
                    {
                        createdAt:
                        {
                            "$gte": startdate,
                            "$lte": dt
                        },
                        postType:
                        {
                            "$in": ["pict", "vid", "diary", "story"]
                        }
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
                        },
                        postType: 1
                    }
                },

                {
                    "$group":
                    {
                        _id: "$createdAt",
                        pict:
                        {
                            "$sum":
                            {
                                "$switch":
                                {
                                    branches:
                                        [
                                            {
                                                "case":
                                                {
                                                    "$eq": ["$postType", "pict"]
                                                },
                                                "then": 1
                                            }
                                        ],
                                    "default": 0
                                }
                            }
                        },
                        vid:
                        {
                            "$sum":
                            {
                                "$switch":
                                {
                                    branches:
                                        [
                                            {
                                                "case":
                                                {
                                                    "$eq": ["$postType", "vid"]
                                                },
                                                "then": 1
                                            }
                                        ],
                                    "default": 0
                                }
                            }
                        },
                        story:
                        {
                            "$sum":
                            {
                                "$switch":
                                {
                                    branches:
                                        [
                                            {
                                                "case":
                                                {
                                                    "$eq": ["$postType", "story"]
                                                },
                                                "then": 1
                                            }
                                        ],
                                    "default": 0
                                }
                            }
                        },
                        diary:
                        {
                            "$sum":
                            {
                                "$switch":
                                {
                                    branches:
                                        [
                                            {
                                                "case":
                                                {
                                                    "$eq": ["$postType", "diary"]
                                                },
                                                "then": 1
                                            }
                                        ],
                                    "default": 0
                                }
                            }
                        },
                    }
                },

                {
                    $project: {
                        _id: 0,
                        date: "$_id",
                        diary: "$diary",
                        pict: "$pict",
                        vid: "$vid",
                        story: "$story"
                    }
                },

                {
                    "$sort":
                    {
                        date: 1
                    }
                }
            ]
        );
        return query;

    }


}
