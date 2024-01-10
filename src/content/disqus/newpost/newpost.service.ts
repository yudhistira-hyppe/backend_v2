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

    async updatePostviewer(postid: string, email: string) {
        return await this.PostsModel.updateOne({ postID: postid }, { $push: { viewer: email } }).exec();
    }
    
    async updateView(email: string, email_target: string, postID: string, guestMode:boolean) {
        var getdata = await this.PostsModel.findOne({ postID:postID }).exec();
        var setinput = {};
        if(guestMode == true)
        {
            var setguesttemp = getdata.tempView;
            setguesttemp.push(email_target);
            setinput["$set"] = 
            {
                "tempView":setguesttemp
            } 
        }
        else
        {
            setinput['$inc'] = {
                views:1
            };
            var setCEViewer = getdata.userView;
            setCEViewer.push(email_target);
            setinput["$set"] = {
                "userView":setCEViewer
            } 
        }

        this.PostsModel.updateOne(
            {
                email: email,
                postID: postID,
            },
            setinput,
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }

    async updateLike(email: string, email_target:string, postID: string, guestMode:boolean) {
        var getdata = await this.PostsModel.findOne({ postID:postID }).exec();
        var setinput = {};
        if(guestMode == true)
        {
            var setguesttemp = getdata.tempLike;
            setguesttemp.push(email_target);
            setinput["$set"] = 
            {
                "tempLike":setguesttemp
            } 
        }
        else
        {
            setinput['$inc'] = {
                likes:1
            };
            var setCELike = getdata.userLike;
            setCELike.push(email_target);
            setinput["$set"] = {
                "userLike":setCELike
            } 
        }
        
        this.PostsModel.updateOne(
            {
                email: email,
                postID: postID,
            },
            setinput,
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }

    async updateReaction(email: string, postID: string) {
        this.PostsModel.updateOne(
            {
                email: email,
                postID: postID,
            },
            { $inc: { reactions: 1 } },
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }

    async updateUnLike(email: string, email_target:string, postID: string, guestMode:boolean) {
        var getdata = await this.PostsModel.findOne({ postID:postID }).exec();
        var setinput = {};
        if(guestMode == true)
        {
            var setguesttemp = getdata.tempLike;
            var filterdata = setguesttemp.filter(emaildata => emaildata != email_target);
            setinput["$set"] = 
            {
                "tempLike":filterdata
            } 
        }
        else
        {
            setinput['$inc'] = {
                likes:-1
            };
            var setCELike = getdata.userLike;
            var filterdata = setCELike.filter(emaildata => emaildata != email_target);
            setinput["$set"] = {
                "userLike":filterdata
            } 
        }
        
        this.PostsModel.updateOne(
            {
                email: email,
                postID: postID,
            },
            setinput,
            function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            },
        );
    }

    async findOnepostID3(post: Newpost): Promise<Object> {
        var datacontent = null;
        if (post.postType == 'vid') {
          datacontent = 'mediavideos';
        } else if (post.postType == 'pict') {
          datacontent = 'mediapicts';
        } else if (post.postType == 'diary') {
          datacontent = 'mediadiaries';
        } else if (post.postType == 'story') {
          datacontent = 'mediastories';
        }
    
        const query = await this.PostsModel.aggregate([
          {
            $match: {
              postID: post.postID
            }
          },
          {
            $lookup: {
              from: datacontent,
              localField: "postID",
              foreignField: "postID",
              as: "datacontent"
            }
          },
        ]);
        return query;
      }


}
