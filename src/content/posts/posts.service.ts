import { Logger, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DBRef, Long, ObjectId } from 'mongodb';
import mongoose, { Model, Types } from 'mongoose';
import { CreatePostResponse, CreatePostsDto, PostResponseApps } from './dto/create-posts.dto';
import { Posts, PostsDocument } from './schemas/posts.schema';
import { GetuserprofilesService } from '../../trans/getuserprofiles/getuserprofiles.service';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import { GlobalResponse } from '../../utils/data/globalResponse';
import { Mediavideos, MediavideosDocument } from '../mediavideos/schemas/mediavideos.schema';
import { UtilsService } from '../../utils/utils.service';
import { InterestsService } from '../../infra/interests/interests.service';
import { UserauthsService } from '../../trans/userauths/userauths.service';
import { MediavideosService } from '../mediavideos/mediavideos.service';
import { InsightsService } from '../insights/insights.service';
import { Insights } from '../insights/schemas/insights.schema';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { createWriteStream, unlink } from 'fs'
import { QueryDiscusDto } from '../disqus/dto/create-disqus.dto';
import { Userbasic } from '../../trans/userbasics/schemas/userbasic.schema';
import { ContenteventsService } from '../contentevents/contentevents.service';
import { Contentevents } from '../contentevents/schemas/contentevents.schema';
import { ErrorHandler } from '../../utils/error.handler';
import { MediadiariesService } from '../../content/mediadiaries/mediadiaries.service';
import { MediastoriesService } from '../../content/mediastories/mediastories.service';
import { MediapictsService } from '../../content/mediapicts/mediapicts.service';
import { CreateUserplaylistDto } from '../../trans/userplaylist/dto/create-userplaylist.dto';
import { UserplaylistService } from '../../trans/userplaylist/userplaylist.service';


@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectModel(Posts.name, 'SERVER_CONTENT')
    private readonly PostsModel: Model<PostsDocument>,
    private getuserprofilesService: GetuserprofilesService,
    private userService: UserbasicsService,
    private readonly utilsService: UtilsService,
    private readonly errorHandler: ErrorHandler,
    private interestService: InterestsService,
    private userAuthService: UserauthsService,
    private videoService: MediavideosService,
    private insightService: InsightsService,
    private contentEventService: ContenteventsService,
    private readonly mediadiariesService: MediadiariesService,
    private readonly mediastoriesService: MediastoriesService,
    private readonly mediavideosService: MediavideosService,
    private readonly mediapictsService: MediapictsService,
    private readonly configService: ConfigService,
    private readonly userplaylistService: UserplaylistService,
  ) { }

  async create(CreatePostsDto: CreatePostsDto): Promise<Posts> {
    const createPostsDto = await this.PostsModel.create(CreatePostsDto);
    return createPostsDto;
  }

  async findAll(): Promise<Posts[]> {
    return this.PostsModel.find().exec();
  }

  async findAllSort(): Promise<Posts[]> {
    return this.PostsModel.find().sort({ createdAt: 1 }).exec();
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
    if (CreatePostsDto_.postType == 'vid') {
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
          "salelike": false,
          "saleAmount": 0
        }
      });
    return data;
  }

  async updatesaleview(id: string): Promise<Object> {
    let data = await this.PostsModel.updateOne({ "_id": id },
      {
        $set: {
          "saleview": false,
          "saleAmount": 0
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

  async generateUserPlaylist(CreateUserplaylistDto_: CreateUserplaylistDto) {
    if (CreateUserplaylistDto_.userPostId == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, param userPostId is required',
      );
    }
    if (CreateUserplaylistDto_.mediaId == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, param mediaId is required',
      );
    }
    if (CreateUserplaylistDto_.postType == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, param postType is required',
      );
    }

    var userPostId = CreateUserplaylistDto_.userPostId;
    var mediaId = CreateUserplaylistDto_.mediaId;
    var postType = CreateUserplaylistDto_.postType;

    var current_date = await this.utilsService.getDateTimeString();
    var data_userbasic_all = await this.userService.findAll();
    var data_media = null;

    if (postType == "vid") {
      data_media = await this.mediavideosService.findOne(mediaId.toString());
    } else if (postType == "pict") {
      data_media = await this.mediapictsService.findOne(mediaId.toString());
    } else if (postType == "diary") {
      data_media = await this.mediadiariesService.findOne(mediaId.toString());
    } else if (postType == "story") {
      data_media = await this.mediastoriesService.findOne(mediaId.toString());
    }

    if (!(await this.utilsService.ceckData(data_media))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, data_media not found',
      );
    }

    var data_userbasic = await this.userService.findbyid(userPostId.toString());
    var data_post = await this.findid(data_media.postID);

    if (!(await this.utilsService.ceckData(data_userbasic))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, data_userbasic not found',
      );
    }

    if (!(await this.utilsService.ceckData(data_post))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, data_post not found',
      );
    }

    data_userbasic_all.forEach(async element => {
      var post_array_interest = data_post.category;
      var user_array_interest = element.userInterests;

      var post_array_interest_toString = null;
      var post_array_interest_string = null;
      var user_array_interest_toString = null;
      var user_array_interest_string = null;

      var compare_interest = null;
      var Count_compare_interest = 0;

      if (post_array_interest.length > 0) {
        post_array_interest_toString = post_array_interest.map(function (item) { return '"' + JSON.parse(JSON.stringify(item)).$id + '"' }).join(",");
        post_array_interest_string = JSON.parse("[" + post_array_interest_toString + "]");
      }
      if (user_array_interest.length > 0) {
        user_array_interest_toString = user_array_interest.map(function (item) {
          if ((JSON.parse(JSON.stringify(item)) != null)) {
            return '"' + JSON.parse(JSON.stringify(item)).$id + '"'
          }
        }).join(",");
        user_array_interest_string = JSON.parse("[" + user_array_interest_toString + "]");
      }
      if (post_array_interest_string != null && user_array_interest_string != null) {
        compare_interest = post_array_interest_string.filter(function (obj) {
          return user_array_interest_string.indexOf(obj) !== -1;
        });
      }

      //Compare Get Interes
      if (compare_interest != null) {
        Count_compare_interest = compare_interest.length;
      }

      var type = "PUBLIC";
      // var type = null;
      // var ceckFriendFollowingFollower = await this.contentEventService.ceckFriendFollowingFollower(data_userbasic.email.toString(), element.email.toString());
      // if (await this.utilsService.ceckData(ceckFriendFollowingFollower)) {
      //   if (ceckFriendFollowingFollower.length == 2) {
      //     type = "FRIEND";
      //   } else {
      //     if (ceckFriendFollowingFollower[0].email == data_userbasic.email.toString()) {
      //       type = "FOLLOWER";
      //     } else {
      //       if (ceckFriendFollowingFollower[0].email == element.email.toString()) {
      //         type = "FOLLOWING";
      //       } else {
      //         type = "PUBLIC";
      //       }
      //     }
      //   }
      // } else {
      //   type = "PUBLIC";
      // }

      var interest_db = [];
      if (Count_compare_interest > 0) {
        for (var i = 0; i < Count_compare_interest; i++) {
          var objintr = { "$ref": "interests_repo", "$id": new mongoose.Types.ObjectId(compare_interest[i]), "$db": "hyppe_infra_db" }
          interest_db.push(objintr)
        }
      }
      var isHidden_ = false;
      if (data_post.visibility != undefined) {
        if (data_post.visibility == "FRIEND") {
          if (type == data_post.visibility) {
            isHidden_ = false;
          } else {
            isHidden_ = true;
          }
        } else if (data_post.visibility == "PRIVATE") {
          type = "PRIVATE";
          if (element._id.toString() == data_userbasic._id.toString()) {
            isHidden_ = false;
          } else {
            isHidden_ = true;
          }
        } else {
          isHidden_ = false;
        }
      }

      var CreateUserplaylistDto_ = new CreateUserplaylistDto();
      CreateUserplaylistDto_.userId = Object(element._id);
      CreateUserplaylistDto_.interestId = interest_db;
      CreateUserplaylistDto_.interestIdCount = Count_compare_interest;
      CreateUserplaylistDto_.userPostId = Object(data_userbasic._id);
      CreateUserplaylistDto_.postType = postType;
      CreateUserplaylistDto_.mediaId = mediaId.toString();
      CreateUserplaylistDto_.type = type;
      CreateUserplaylistDto_.createAt = data_post.createdAt;
      CreateUserplaylistDto_.updatedAt = data_post.updatedAt;
      CreateUserplaylistDto_.isWatched = false;
      CreateUserplaylistDto_.isHidden = isHidden_;
      CreateUserplaylistDto_.postID = (data_post.postID != undefined) ? data_post.postID :"";
      CreateUserplaylistDto_.expiration = (data_post.expiration != undefined) ? Number(data_post.expiration) : 0;
      CreateUserplaylistDto_.description = (data_post.description != undefined) ? data_post.description : "";

      // const userId = element._id.toString();
      // const userIdPost = data_userbasic._id.toString();
      // const mediaId_ = mediaId.toString();
      // var ceckDataUser_ = await this.userplaylistModel.findOne({ userId: new Types.ObjectId(userId), userPostId: new Types.ObjectId(userIdPost), mediaId: mediaId_ }).clone().exec();

      var ceckDataUser_ = await this.userplaylistService.findData(element._id.toString(), data_userbasic._id.toString(), mediaId.toString());

      if (await this.utilsService.ceckData(ceckDataUser_)) {
        await this.userplaylistService.updateOne(ceckDataUser_[0]._id, CreateUserplaylistDto_);
      } else {
        CreateUserplaylistDto_._id = new mongoose.Types.ObjectId();
        await this.userplaylistService.create(CreateUserplaylistDto_);
      }
    });
  }
}
