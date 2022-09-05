import { Logger, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DBRef, Long, ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { CreatePostResponse, CreatePostsDto, PostResponseApps } from './dto/create-posts.dto';
import { Posts, PostsDocument } from './schemas/posts.schema';
import { GetuserprofilesService } from '../../trans/getuserprofiles/getuserprofiles.service';
import { UserbasicsService } from 'src/trans/userbasics/userbasics.service';
import { GlobalResponse } from 'src/utils/data/globalResponse';
import { Mediavideos, MediavideosDocument } from '../mediavideos/schemas/mediavideos.schema';
import { UtilsService } from 'src/utils/utils.service';
import { InterestsService } from 'src/infra/interests/interests.service';
import { UserauthsService } from 'src/trans/userauths/userauths.service';
import { MediavideosService } from '../mediavideos/mediavideos.service';
import { InsightsService } from '../insights/insights.service';
import { Insights } from '../insights/schemas/insights.schema';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import {createWriteStream, unlink} from 'fs'
import { QueryDiscusDto } from '../disqus/dto/create-disqus.dto';
import { Userbasic } from 'src/trans/userbasics/schemas/userbasic.schema';
import { ContenteventsService } from '../contentevents/contentevents.service';
import { Contentevents } from '../contentevents/schemas/contentevents.schema';


@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectModel(Posts.name, 'SERVER_CONTENT')
    private readonly PostsModel: Model<PostsDocument>,
    private getuserprofilesService: GetuserprofilesService,
    private userService: UserbasicsService,
    private utilService: UtilsService,
    private interestService: InterestsService,
    private userAuthService: UserauthsService,
    private videoService: MediavideosService,
    private insightService: InsightsService,
    private contentEventService: ContenteventsService,
    private readonly configService: ConfigService,
  ) { }

  async create(CreatePostsDto: CreatePostsDto): Promise<Posts> {
    const createPostsDto = await this.PostsModel.create(CreatePostsDto);
    return createPostsDto;
  }

  async findAll(): Promise<Posts[]> {
    return this.PostsModel.find().exec();
  }

  async findid(id: string): Promise<Posts> {
    return this.PostsModel.findOne({ _id: id }).exec();
  }
  async findOne(email: string): Promise<Posts> {
    return this.PostsModel.findOne({ email: email }).exec();
  }
  async findOnepostID(postID: string): Promise<Object> {
    var datacontent = null;
    var CreatePostsDto_ = await this.PostsModel.findOne({ postID: postID }).exec();
    if (CreatePostsDto_.postType =='vid'){
      datacontent = 'mediavideos';
    } else if (CreatePostsDto_.postType == 'pict') {
      datacontent = 'mediapicts';
    } else if (CreatePostsDto_.postType == 'diary') {
      datacontent = 'mediadiaries';
    } else if (CreatePostsDto_.postType == 'story') {
      datacontent = 'mediastories';
    }
    
    //Ceck User Userbasics
    const datauserbasicsService = await this.getuserprofilesService.findUserDetailbyEmail(
      CreatePostsDto_.email.toString()
    );
    
    const query = await this.PostsModel.aggregate([
      {
        $match: {
          postID: postID
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
    Object.assign(query[0], { datauser: datauserbasicsService });
    return query;
  }
  async updateemail(id: string, email: string, iduser: {
    "$oid": string
  }): Promise<Object> {
    let data = await this.PostsModel.updateOne({ "_id": id },
      {
        $set: {
          "email": email, "userProfile": {
            "$ref": "userbasics",
            "$id": iduser,
            "$db": "hyppe_trans_db"
          },
          "metadata.email": email
        }
      });
    return data;
  }

  async updatesalelike(id: string): Promise<Object> {
    let data = await this.PostsModel.updateOne({ "_id": id },
      {
        $set: {
          "salelike": 0
        }
      });
    return data;
  }

  async updatesaleview(id: string): Promise<Object> {
    let data = await this.PostsModel.updateOne({ "_id": id },
      {
        $set: {
          "saleview": 0
        }
      });
    return data;
  }

  async updateprice(id: string, saleAmount: number): Promise<Object> {
    let data = await this.PostsModel.updateOne({ "_id": id },
      {
        $set: {
          "saleAmount": saleAmount
        }
      });
    return data;
  }

  async updateTag(id: string, tagPeople: []): Promise<Object> {
    let data = await this.PostsModel.updateOne({ "_id": id },
      {
        $set: {
          "tagPeople": tagPeople
        }
      });

    return data;
  }

  async updateNoneActive(email: string) {
    this.PostsModel.updateMany(
      {
        email: email,
      },
      { 
        $set: { 
          "active": false,
          "email": email + '_noneactive'
        } 
      },
      function (err, docs) {
        if (err) {
          //console.log(err);
        } else {
          //console.log(docs);
        }
      },
    );
  }


  async updateTags(id: string, idauth: Types.ObjectId) {



    let data = await this.PostsModel.updateOne({ "_id": id }, {
      $pull: {
        "tagPeople": { "$in": [{ "$ref": "userauths", "$id": idauth, "$db": "hyppe_trans_db" }] }
      }
    });
    return data;
  }

  async delete(id: string) {
    const deletedCat = await this.PostsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  async MonetizeByYear(year: number): Promise<Object> {
    var currentTime = new Date();
    var year_param = 0;
    if (year != undefined) {
      year_param = year;
    } else {
      year_param = currentTime.getFullYear();
    }
    const monthsArray = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    var GetCount = this.PostsModel.aggregate([
      {
        $sort: { createdAt: 1 },
      },
      {
        $project: {
          isCertified: '$isCertified',
          createdAt: '$createdAt',
          YearcreatedAt: { $toInt: { $substrCP: ['$createdAt', 0, 4] } },
          year_param: { $toInt: year_param.toString() },
        },
      },
      {
        $match: {
          isCertified: { $ne: null },
          YearcreatedAt: year_param,
        },
      },
      {
        $group: {
          _id: {
            year_month: { $substrCP: ['$createdAt', 0, 7] },
            isCertified_data: '$isCertified',
          },
          isCertified_data_count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.year_month',
          log: {
            $push: {
              isCertified_data: '$_id.isCertified_data',
              isCertified_data_count_: '$isCertified_data_count',
            },
          },
          count: { $sum: '$isCertified_data_count' },
        },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          month_int: { $toInt: { $substrCP: ['$_id', 5, 2] } },
          month_: { $substrCP: ['$_id', 5, 2] },
          monet: '$log',
          month_name_: {
            $arrayElemAt: [
              monthsArray,
              {
                $subtract: [{ $toInt: { $substrCP: ['$_id', 5, 2] } }, 1],
              },
            ],
          },
          year_: { $substrCP: ['$_id', 0, 4] },
        },
      },
      {
        $sort: { month_int: 1 },
      },
      {
        $project: {
          _id: 0,
          month_name: '$month_name_',
          month: '$month_',
          year: { $toInt: '$year_' },
          monitize: '$monet',
          count_all: { $sum: '$monet.isCertified_data_count_' },
        },
      },
    ]).exec();
    return GetCount;
  }

  async findpost() {
    const query = await this.PostsModel.aggregate([

      {
        $lookup: {
          from: 'posts',
          localField: 'posts.$id',
          foreignField: '_id',
          as: 'roless',
        },
      }, {
        $out: {
          db: 'hyppe_trans_db',
          coll: 'posts2'
        }
      },

    ]);
    return query;
  }

  async regcontenMonetize(): Promise<Object> {
    var GetCount = this.PostsModel.aggregate([
      {
        $addFields: {
          contentMedias_id: '$contentMedias.$id',
          contentMedias_ref: { $arrayElemAt: ['$contentMedias.$ref', 0] },
          metadata_duration: '$metadata.duration',
          metadata_duration_second: {
            $floor: {
              $mod: ['$metadata.duration', 60],
            },
          },
          metadata_duration_minute: {
            $floor: {
              $divide: [
                {
                  $mod: [{ $mod: ['$metadata.duration', 60] }, 3600],
                },
                60,
              ],
            },
          },
          metadata_duration_hour: {
            $floor: {
              $divide: [
                {
                  $mod: [{ $mod: ['$metadata.duration', 60] }, 86400],
                },
                3600,
              ],
            },
          },
        },
      },
      {
        $sort: { createdAt: 1 },
      },
      {
        $match: {
          isCertified: false,
          active: true,
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'contentMedias_id',
          foreignField: '_id',
          as: 'contentMedias_mediavideos',
        },
      },
      {
        $lookup: {
          from: 'mediapicts',
          localField: 'contentMedias_id',
          foreignField: '_id',
          as: 'contentMedias_mediapicts',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'contentMedias_id',
          foreignField: '_id',
          as: 'contentMedias_mediadiaries',
        },
      },
      {
        $lookup: {
          from: 'mediastories',
          localField: 'contentMedias_id',
          foreignField: '_id',
          as: 'contentMedias_mediastories',
        },
      },
      {
        $group: {
          _id: '$isCertified',
          log: {
            $push: {
              email: '$email',
              postType: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ['$postType', 'vid'] },
                      then: 'HyppeVid',
                    },
                    {
                      case: { $eq: ['$postType', 'pic'] },
                      then: 'HyppePic',
                    },
                    {
                      case: { $eq: ['$postType', 'diary'] },
                      then: 'HyppeDiary',
                    },
                    {
                      case: { $eq: ['$postType', 'story'] },
                      then: 'HyppeStory',
                    },
                  ],
                  default: [],
                },
              },
              duration: {
                $cond: {
                  if: { $ne: ['$metadata_duration_hour', 0] },
                  then: {
                    $cond: {
                      if: { $lt: ['$metadata_duration_minute', 10] },
                      then: {
                        $cond: {
                          if: { $lt: ['$metadata_duration_second', 10] },
                          then: {
                            $concat: [
                              {
                                $toString: '$metadata_duration_hour',
                              },
                              ':',
                              '0',
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              '0',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                          else: {
                            $concat: [
                              {
                                $toString: '$metadata_duration_hour',
                              },
                              ':',
                              '0',
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                        },
                      },
                      else: {
                        $cond: {
                          if: { $lt: ['$metadata_duration_second', 10] },
                          then: {
                            $concat: [
                              {
                                $toString: '$metadata_duration_hour',
                              },
                              ':',
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              '0',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                          else: {
                            $concat: [
                              {
                                $toString: '$metadata_duration_hour',
                              },
                              ':',
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                        },
                      },
                    },
                  },
                  else: {
                    $cond: {
                      if: { $lt: ['$metadata_duration_minute', 10] },
                      then: {
                        $cond: {
                          if: { $lt: ['$metadata_duration_second', 10] },
                          then: {
                            $concat: [
                              '0',
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              '0',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                          else: {
                            $concat: [
                              '0',
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                        },
                      },
                      else: {
                        $cond: {
                          if: { $lt: ['$metadata_duration_second', 10] },
                          then: {
                            $concat: [
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              '0',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                          else: {
                            $concat: [
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                        },
                      },
                    },
                  },
                },
              },
              description: '$description',
              visibility: '$visibility',
              tags: '$tags',
              allowComments: '$allowComments',
              metadata: '$metadata',
              likes: '$likes',
              views: '$views',
              shares: '$shares',
              comments: '$comments',
              reactions: '$reactions',
              // contentMedias_ref: '$contentMedias_ref',
              // contentMedias_id: '$contentMedias_id',
              // contentMedias_ref: '$customfield',
              // contentMedias_mediavideos: '$contentMedias_mediavideos',
              // contentMedias_mediapicts: '$contentMedias_mediavideos',
              // contentMedias_mediadiaries: '$contentMedias_mediavideos',
              // contentMedias_mediastories: '$contentMedias_mediastories',
              contentMedias: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ['$contentMedias_ref', 'mediavideos'] },
                      then: '$contentMedias_mediavideos',
                    },
                    {
                      case: { $eq: ['$contentMedias_ref', 'mediapicts'] },
                      then: '$contentMedias_mediapicts',
                    },
                    {
                      case: { $eq: ['$contentMedias_ref', 'mediadiaries'] },
                      then: '$contentMedias_mediadiaries',
                    },
                    {
                      case: { $eq: ['$contentMedias_ref', 'mediastories'] },
                      then: '$contentMedias_mediastories',
                    },
                  ],
                  default: [],
                },
              },
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          count: '$count',
          content: '$log',
        },
      },
    ]).exec();
    return GetCount;
  }

  async newcontenMonetize(): Promise<Object> {
    var GetCount = this.PostsModel.aggregate([
      {
        $addFields: {
          contentMedias_id: '$contentMedias.$id',
          contentMedias_ref: { $arrayElemAt: ['$contentMedias.$ref', 0] },
          metadata_duration: '$metadata.duration',
          metadata_duration_second: {
            $floor: {
              $mod: ['$metadata.duration', 60],
            },
          },
          metadata_duration_minute: {
            $floor: {
              $divide: [
                {
                  $mod: [{ $mod: ['$metadata.duration', 60] }, 3600],
                },
                60,
              ],
            },
          },
          metadata_duration_hour: {
            $floor: {
              $divide: [
                {
                  $mod: [{ $mod: ['$metadata.duration', 60] }, 86400],
                },
                3600,
              ],
            },
          },
        },
      },
      {
        $sort: { createdAt: 1 },
      },
      {
        $match: {
          isCertified: true,
          active: true,
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'contentMedias_id',
          foreignField: '_id',
          as: 'contentMedias_mediavideos',
        },
      },
      {
        $lookup: {
          from: 'mediapicts',
          localField: 'contentMedias_id',
          foreignField: '_id',
          as: 'contentMedias_mediapicts',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'contentMedias_id',
          foreignField: '_id',
          as: 'contentMedias_mediadiaries',
        },
      },
      {
        $lookup: {
          from: 'mediastories',
          localField: 'contentMedias_id',
          foreignField: '_id',
          as: 'contentMedias_mediastories',
        },
      },
      {
        $group: {
          _id: '$isCertified',
          log: {
            $push: {
              email: '$email',
              postType: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ['$postType', 'vid'] },
                      then: 'HyppeVid',
                    },
                    {
                      case: { $eq: ['$postType', 'pic'] },
                      then: 'HyppePic',
                    },
                    {
                      case: { $eq: ['$postType', 'diary'] },
                      then: 'HyppeDiary',
                    },
                    {
                      case: { $eq: ['$postType', 'story'] },
                      then: 'HyppeStory',
                    },
                  ],
                  default: [],
                },
              },
              duration: {
                $cond: {
                  if: { $ne: ['$metadata_duration_hour', 0] },
                  then: {
                    $cond: {
                      if: { $lt: ['$metadata_duration_minute', 10] },
                      then: {
                        $cond: {
                          if: { $lt: ['$metadata_duration_second', 10] },
                          then: {
                            $concat: [
                              {
                                $toString: '$metadata_duration_hour',
                              },
                              ':',
                              '0',
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              '0',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                          else: {
                            $concat: [
                              {
                                $toString: '$metadata_duration_hour',
                              },
                              ':',
                              '0',
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                        },
                      },
                      else: {
                        $cond: {
                          if: { $lt: ['$metadata_duration_second', 10] },
                          then: {
                            $concat: [
                              {
                                $toString: '$metadata_duration_hour',
                              },
                              ':',
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              '0',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                          else: {
                            $concat: [
                              {
                                $toString: '$metadata_duration_hour',
                              },
                              ':',
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                        },
                      },
                    },
                  },
                  else: {
                    $cond: {
                      if: { $lt: ['$metadata_duration_minute', 10] },
                      then: {
                        $cond: {
                          if: { $lt: ['$metadata_duration_second', 10] },
                          then: {
                            $concat: [
                              '0',
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              '0',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                          else: {
                            $concat: [
                              '0',
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                        },
                      },
                      else: {
                        $cond: {
                          if: { $lt: ['$metadata_duration_second', 10] },
                          then: {
                            $concat: [
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              '0',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                          else: {
                            $concat: [
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                        },
                      },
                    },
                  },
                },
              },
              description: '$description',
              visibility: '$visibility',
              tags: '$tags',
              allowComments: '$allowComments',
              metadata: '$metadata',
              likes: '$likes',
              views: '$views',
              shares: '$shares',
              comments: '$comments',
              reactions: '$reactions',
              // contentMedias_ref: '$contentMedias_ref',
              // contentMedias_id: '$contentMedias_id',
              // contentMedias_ref: '$customfield',
              // contentMedias_mediavideos: '$contentMedias_mediavideos',
              // contentMedias_mediapicts: '$contentMedias_mediavideos',
              // contentMedias_mediadiaries: '$contentMedias_mediavideos',
              // contentMedias_mediastories: '$contentMedias_mediastories',
              contentMedias: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ['$contentMedias_ref', 'mediavideos'] },
                      then: '$contentMedias_mediavideos',
                    },
                    {
                      case: { $eq: ['$contentMedias_ref', 'mediapicts'] },
                      then: '$contentMedias_mediapicts',
                    },
                    {
                      case: { $eq: ['$contentMedias_ref', 'mediadiaries'] },
                      then: '$contentMedias_mediadiaries',
                    },
                    {
                      case: { $eq: ['$contentMedias_ref', 'mediastories'] },
                      then: '$contentMedias_mediastories',
                    },
                  ],
                  default: [],
                },
              },
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          count: '$count',
          content: '$log',
        },
      },
    ]).exec();
    return GetCount;
  }

  async getContent(email: string, type: string): Promise<Object> {
    var GetCount = this.PostsModel.aggregate([
      {
        $addFields: {
          contentMedias_id: '$contentMedias.$id',
          contentMedias_ref: { $arrayElemAt: ['$contentMedias.$ref', 0] },
          metadata_duration: '$metadata.duration',
          metadata_duration_second: {
            $floor: {
              $mod: ['$metadata.duration', 60],
            },
          },
          metadata_duration_minute: {
            $floor: {
              $divide: [
                {
                  $mod: [{ $mod: ['$metadata.duration', 60] }, 3600],
                },
                60,
              ],
            },
          },
          metadata_duration_hour: {
            $floor: {
              $divide: [
                {
                  $mod: [{ $mod: ['$metadata.duration', 60] }, 86400],
                },
                3600,
              ],
            },
          },
        },
      },
      {
        $sort: { createdAt: 1 },
      },
      {
        $match: {
          email: email,
          //isCertified: false,
          //active: true,
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'contentMedias_id',
          foreignField: '_id',
          as: 'contentMedias_mediavideos',
        },
      },
      {
        $lookup: {
          from: 'mediapicts',
          localField: 'contentMedias_id',
          foreignField: '_id',
          as: 'contentMedias_mediapicts',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'contentMedias_id',
          foreignField: '_id',
          as: 'contentMedias_mediadiaries',
        },
      },
      {
        $lookup: {
          from: 'mediastories',
          localField: 'contentMedias_id',
          foreignField: '_id',
          as: 'contentMedias_mediastories',
        },
      },
      {
        $group: {
          _id: '$isCertified',
          log: {
            $push: {
              email: '$email',
              postType: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ['$postType', 'vid'] },
                      then: 'HyppeVid',
                    },
                    {
                      case: { $eq: ['$postType', 'pic'] },
                      then: 'HyppePic',
                    },
                    {
                      case: { $eq: ['$postType', 'diary'] },
                      then: 'HyppeDiary',
                    },
                    {
                      case: { $eq: ['$postType', 'story'] },
                      then: 'HyppeStory',
                    },
                  ],
                  default: [],
                },
              },
              duration: {
                $cond: {
                  if: { $ne: ['$metadata_duration_hour', 0] },
                  then: {
                    $cond: {
                      if: { $lt: ['$metadata_duration_minute', 10] },
                      then: {
                        $cond: {
                          if: { $lt: ['$metadata_duration_second', 10] },
                          then: {
                            $concat: [
                              {
                                $toString: '$metadata_duration_hour',
                              },
                              ':',
                              '0',
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              '0',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                          else: {
                            $concat: [
                              {
                                $toString: '$metadata_duration_hour',
                              },
                              ':',
                              '0',
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                        },
                      },
                      else: {
                        $cond: {
                          if: { $lt: ['$metadata_duration_second', 10] },
                          then: {
                            $concat: [
                              {
                                $toString: '$metadata_duration_hour',
                              },
                              ':',
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              '0',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                          else: {
                            $concat: [
                              {
                                $toString: '$metadata_duration_hour',
                              },
                              ':',
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                        },
                      },
                    },
                  },
                  else: {
                    $cond: {
                      if: { $lt: ['$metadata_duration_minute', 10] },
                      then: {
                        $cond: {
                          if: { $lt: ['$metadata_duration_second', 10] },
                          then: {
                            $concat: [
                              '0',
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              '0',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                          else: {
                            $concat: [
                              '0',
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                        },
                      },
                      else: {
                        $cond: {
                          if: { $lt: ['$metadata_duration_second', 10] },
                          then: {
                            $concat: [
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              '0',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                          else: {
                            $concat: [
                              {
                                $toString: '$metadata_duration_minute',
                              },
                              ':',
                              {
                                $toString: '$metadata_duration_second',
                              },
                            ],
                          },
                        },
                      },
                    },
                  },
                },
              },
              description: '$description',
              visibility: '$visibility',
              tags: '$tags',
              allowComments: '$allowComments',
              metadata: '$metadata',
              likes: '$likes',
              views: '$views',
              shares: '$shares',
              comments: '$comments',
              reactions: '$reactions',
              // contentMedias_ref: '$contentMedias_ref',
              // contentMedias_id: '$contentMedias_id',
              // contentMedias_ref: '$customfield',
              // contentMedias_mediavideos: '$contentMedias_mediavideos',
              // contentMedias_mediapicts: '$contentMedias_mediavideos',
              // contentMedias_mediadiaries: '$contentMedias_mediavideos',
              // contentMedias_mediastories: '$contentMedias_mediastories',
              contentMedias: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ['$contentMedias_ref', 'mediavideos'] },
                      then: '$contentMedias_mediavideos',
                    },
                    {
                      case: { $eq: ['$contentMedias_ref', 'mediapicts'] },
                      then: '$contentMedias_mediapicts',
                    },
                    {
                      case: { $eq: ['$contentMedias_ref', 'mediadiaries'] },
                      then: '$contentMedias_mediadiaries',
                    },
                    {
                      case: { $eq: ['$contentMedias_ref', 'mediastories'] },
                      then: '$contentMedias_mediastories',
                    },
                  ],
                  default: [],
                },
              },
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          count: '$count',
          content: '$log',
        },
      },
    ]).exec();
    return GetCount;
  }

  async createNewPost(file: Express.Multer.File, body: any, headers: any): Promise<CreatePostResponse> {
    this.logger.log('createNewPost >>> start:');
    var res = new CreatePostResponse();
    res.response_code = 204;

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    if (profile == undefined) {
      res.messages = "Email tidak dikenali";
      return res;
    }

    if (body.certified && body.certified == "true") {
      if (profile.isIdVerified != true) {
        res.messages = "Profile belum verifikasi KTP";
        return res;        
      } 
    }

    var mime = file.mimetype;
    if (mime.startsWith('video')) {
      this.logger.log('createNewPost >>> is video');
      return this.createNewPostVideo(file, body, headers);
    }
    return null;
  }

  private async createNewPostVideo(file: Express.Multer.File, body: any, headers: any): Promise<CreatePostResponse> {
    this.logger.log('createNewPostVideo >>> start');
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);    
    this.logger.log('createNewPostVideo >>> profile: ' + profile);
 
    var post = new Posts();
    post._id = await this.utilService.generateId();
    post.postID = post._id;
    post.postType = 'vid';
    post.active = true;
    post.email = auth.email;
    post.createdAt = await this.utilService.getDateTimeString();
    post.updatedAt = await this.utilService.getDateTimeString();
    post.expiration = new Long(1000);
    post._class = 'io.melody.hyppe.content.domain.ContentPost';

    if (body.description != undefined) {
      post.description = body.description;
    }

    if (body.tags != undefined) {
      var obj = body.tags;
      var tgs = obj.split(",");
      post.tags = tgs;
    }

    if (body.visibility != undefined) {
      post.visibility = body.visibility;
    } else {
      post.visibility = 'PUBLIC';
    }

    if (body.location != undefined) {
      post.location = body.location;
    }

    if (body.lat != undefined) {
      post.lat = body.lat;
    }
    
    if (body.lon != undefined) {
      post.lon = body.lon;
    }

    if (body.saleAmount != undefined) {
      post.saleAmount = body.saleAmount;
    } else {
      post.saleAmount = null;
    }
    
    if (body.saleLike != undefined) {
      post.saleLike = body.saleLike;
    } else {
      post.saleLike = false;
    }
    
    if (body.saleView != undefined) {
      post.saleView = body.saleView;
    } else {
      post.saleView = false;
    }
    
    if (body.allowComments != undefined) {
      post.allowComments = body.allowComments;
    } else {
      post.allowComments = true;      
    }

    if (body.isSafe != undefined) {
      post.isSafe = body.isSafe;
    } else {
      post.isSafe = false;      
    }
    
    if (body.isOwned != undefined) {
      post.isOwned = body.isOwned;
    } else {
      post.isOwned = false;      
    }
    
    if (body.certified != undefined) {
      post.certified = body.certified;
    } else {
      post.certified = false;      
    }    
    
    if (body.cats != undefined) {
      var obj = body.cats;
      var cats = obj.split(",");
      var pcats = [];
      for(var i = 0; i < cats.length; i++) {
        var tmp = cats[i];
        var cat = await this.interestService.findByName(tmp);
        if (cat != undefined) {
          var objintr = { "$ref": "interests_repo", "$id": mongoose.Types.ObjectId(cat._id), "$db": "hyppe_infra_db" };
          pcats.push(objintr);
        }
      }
      post.category = pcats;
    }
    
    if (body.tagPeople != undefined) {
      var obj = body.tagPeople;
      var cats = obj.split(",");
      var pcats = [];
      for(var i = 0; i < cats.length; i++) {
        var tmp = cats[i];
        var tp = await this.userAuthService.findOneUsername(tmp);
        if (cat != undefined) {
          var objintr = { "$ref": "userauths", "$id": mongoose.Types.ObjectId(tp._id), "$db": "hyppe_trans_db" };
          pcats.push(objintr);
        }
      }
      post.tagPeople = pcats;
    }
    
    if (body.tagDescription != undefined) {
      var obj = body.tagDescription;
      var cats = obj.split(",");
      var pcats = [];
      for(var i = 0; i < cats.length; i++) {
        var tmp = cats[i];
        var tp = await this.userAuthService.findOneUsername(tmp);
        if (cat != undefined) {
          var objintrx = { "$ref": "userauths", "$id": tp._id, "$db": "hyppe_trans_db" };
          pcats.push(objintrx);
        }
      }
      post.tagDescription = pcats;
    }    

    post.active = false;

    //TODO Insight
    var ins = await this.insightService.findemail(auth.email);
    if (ins == undefined) {
      ins = new Insights();
      ins._id = await this.utilService.generateId();
      ins.insightID = ins._id;
      ins.active = true;
      ins.email = auth.email
      ins.createdAt = await this.utilService.getDateTimeString();
      ins.updatedAt = await this.utilService.getDateTimeString(); 
      ins._class = 'io.melody.hyppe.content.domain.Insight';
      
      if (post.postType != 'story') {
        ins.posts = new Long(1);
      }
    } else {
      console.log(ins);
      let prevPost = ins.posts;
      //prevPost = prevPost + 1;
      //ins.posts = new Long(prevPost);
    }
    this.insightService.create(ins);

    //TODO ContentEVent
    var ce = new Contentevents();
    ce._id = await this.utilService.generateId();
    ce.contentEventID = ce._id;
    ce.eventType = 'POST';
    ce.createdAt = await this.utilService.getDateTimeString();
    ce.updatedAt = await this.utilService.getDateTimeString();    
    ce.active = true; 
    ce.event = 'ACCEPT';
    ce.flowIsDone = true;
    ce.email = auth.email;
    ce.sequenceNumber = 0;
    ce._class = 'io.melody.hyppe.content.domain.ContentEvent';
    this.contentEventService.create(ce);

    //METADATA
    let metadata = {postType : 'vid', duration: 0, postID : post._id, email: auth.email, postRoll : 0, midRoll : 0, preRoll: 0};
    post.metadata = metadata;

    var med = new Mediavideos();
    med._id = await this.utilService.generateId();
    med.mediaID = med._id;
    med.postID = post.postID;
    med.active = false;
    med.createdAt = await this.utilService.getDateTimeString();
    med.updatedAt = await this.utilService.getDateTimeString();
    med.mediaMime = file.mimetype;
    med.mediaType = 'video';
    med.originalName = file.originalname;
    med.apsara = true;
    med._class = 'io.melody.hyppe.content.domain.MediaVideo';

    this.logger.log('createNewPostVideo >>> prepare save');
    var retm = await this.videoService.create(med);
    this.logger.log('createNewPostVideo >>> ' + retm);
    var cm = [];
    var vids = { "$ref": "mediavideos", "$id": retm.mediaID, "$db": "hyppe_content_db" };
    cm.push(vids);
    post.contentMedias = cm;
    let apost = await this.PostsModel.create(post);

    let fn = file.originalname;
    let ext = fn.split(".");
    let nm = this.configService.get("APSARA_UPLOADER_FOLDER") + post._id + "." + ext[1];
    const ws = createWriteStream(nm);
    ws.write(file.buffer);
    ws.close();

    let payload = {'file' : nm, 'postId' : apost._id};
    axios.post(this.configService.get("APSARA_UPLOADER"), JSON.stringify(payload), { headers: {'Content-Type': 'application/json'}});
    var res = new CreatePostResponse();
    res.response_code = 202;
    res.messages = "";
    return null;
  }

  async updateNewPost(body: any, headers: any) {
    let post = await this.findid(body.postID);
    if (post == undefined) {
      return;
    }
    let cm = post.contentMedias[0];
    let ns = cm.namespace;
    if (ns == 'mediavideos') {
      let vid = await this.videoService.findOne(cm.oid);
      if (vid == undefined) {
        return;
      }

      vid.apsaraId = body.videoId;
      this.videoService.create(vid);
    }

    let todel = body.filedel + "";
    unlink(todel, (err) => {
      if (err) {

      }
    });

    let meta = post.metadata;
    let metadata = {postType : meta.postType, duration: parseInt(body.duration), postID : post._id, email: meta.email, postRoll : meta.postRoll, midRoll : meta.midRoll, preRoll: meta.preRoll};
    post.metadata = metadata;
    post.active = false;
    this.create(post);    
  }

  async getUserPost(body: any, headers: any): Promise<PostResponseApps> {

    let type = 'GET_POST';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);    
    this.logger.log('getUserPost >>> profile: ' + profile);

    let res = new CreatePostResponse();
    res.response_code = 202;
    res.messages = "";
    let posts = await this.doGetUserPost(body, headers, profile);
    posts = await this.loadPostData(posts, body);
    res.data = posts;

    let tmp = new PostResponseApps();
    tmp.response_code = 202;

    return tmp;
  }

  private async doGetUserPost(body: any, headers: any, whoami: Userbasic): Promise<Posts[]> {
    //this.logger.log('doGetUserPost >>> start: ' + body);
    let query = this.PostsModel.find();
    if (body.visibility != undefined) {
      if (body.visibility == 'PRIVATE') {
        query.where('email', whoami.email);
      } else if (body.visibility == 'FOLLOWING') {
        let following = [];
        let check = await this.contentEventService.findFollowing(whoami.email);
        if (check != undefined) {
          for(let i = 0; i < check.length; i++) {
            var ce = check[i];
            if (ce.receiverParty != undefined && ce.receiverParty.length > 1) {
              following.push({email: ce.receiverParty});
            }
          }
        }

        query.where('visibility').in('FRIEND', 'PUBLIC').or(following);
      } else if (body.visibility == 'FRIEND') {
        let friend = [];
        let check = await this.contentEventService.friend(whoami.email.valueOf(), whoami);
        console.log(check);
        if (check != undefined) {
          for(let i = 0; i < check.length; i++) {
            var cex = check[i];
            friend.push(cex.friend);
          }
        }

        if (friend.length > 0) {
          friend.push(whoami.email);
          query.where('visibility').in('FRIEND', 'PUBLIC');
          query.where('email').in(friend);
        } else {
          query.where('visibility', 'PUBLIC');
        }
      } else {
        let friend = [];
        let check = await this.contentEventService.friend(whoami.email.valueOf(), whoami);
        if (check != undefined) {
          for(let i = 0; i < check.length; i++) {
            var cex = check[i];
            friend.push(cex.friend);
          }
        }

        if (friend.length > 0) {
          friend.push(whoami.email);
          query.where('visibility').in('FRIEND', 'PUBLIC');
          query.where('email').in(friend);
        } else {
          query.where('visibility', 'PUBLIC');
        }
      }
    }

    if (body.postID != undefined) {
      query.where('postID', body.postID);
    }

    if (body.postType != undefined) {
      query.where('postType', body.postType);
    } else {
      query.where('postType').ne('advertise');
    }

    if (body.withActive != undefined && body.withActive == true) {
      query.where('active', true);
    }

    let row = 20;
    let page = 0;
    if (body.pageNumber != undefined) {
      page = body.pageNumber;
    }
    if (body.pageRow != undefined) {
      row = body.pageRow;      
    }
    let skip = this.paging(page, row);
    query.skip(skip);
    query.limit(row);    

    console.log(skip + " - " + row + " - " + page);
        
    query.sort({'postType': 1, 'createdAt': -1});


    let res = await query.exec();
    return res;
  }

  private async loadPostData(posts: Posts[], body: any): Promise<Posts[]> {

    return posts;
  }

  private paging(page: number, row: number) {
    if (page == 0 || page == 1) {
      return 0;
    }
    let num = ((page - 1) * row);
    return num;
  }
}
