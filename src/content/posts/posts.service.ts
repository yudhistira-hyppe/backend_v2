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
import { ContentDto } from '../disqus/dto/create-disqus.dto';
import { Userbasic } from '../../trans/userbasics/schemas/userbasic.schema';
import { ContenteventsService } from '../contentevents/contentevents.service';
import { Contentevents } from '../contentevents/schemas/contentevents.schema';
import { ErrorHandler } from '../../utils/error.handler';
import { MediadiariesService } from '../../content/mediadiaries/mediadiaries.service';
import { MediastoriesService } from '../../content/mediastories/mediastories.service';
import { MediapictsService } from '../../content/mediapicts/mediapicts.service';
import { CreateUserplaylistDto } from '../../trans/userplaylist/dto/create-userplaylist.dto';
import { UserplaylistService } from '../../trans/userplaylist/userplaylist.service';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { SeaweedfsService } from '../../stream/seaweedfs/seaweedfs.service';
import * as fs from 'fs';

import { Queue, Job } from 'bull';


@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectQueue('post-user-playlist') private generateUserPlaylistqueue: Queue,
    @InjectModel(Posts.name, 'SERVER_FULL')
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
    private readonly seaweedfsService: SeaweedfsService,
  ) { }

  async create(CreatePostsDto: CreatePostsDto): Promise<Posts> {
    const createPostsDto = await this.PostsModel.create(CreatePostsDto);
    return createPostsDto;
  }

  async findAll(): Promise<Posts[]> {
    return this.PostsModel.find().exec();
  }

  async findOneByMedias(mediaID: string): Promise<Posts> {
    return this.PostsModel.findOne({ 'contentMedias.$id': mediaID }).exec();
  }

  async findAllSort(): Promise<Posts[]> {
    return this.PostsModel.find().sort({ createdAt: -1 }).exec();
  }

  async findid(id: string): Promise<Posts> {
    return this.PostsModel.findOne({ _id: id }).exec();
  }

  async findOne(email: string): Promise<Posts> {
    return this.PostsModel.findOne({ email: email }).exec();
  }

  async findUserPost(email: string): Promise<number> {
    return this.PostsModel.where('email', email).where('active', true).where('postType').ne('story').count();
  }

  async findByPostId(postID: string): Promise<Posts> {
    return this.PostsModel.findOne({ postID: postID }).exec();
  }
  async updateByPostId(
    postID: string,
    CreatePostsDto: CreatePostsDto,
  ): Promise<Object> {
    let data = await this.PostsModel.updateOne(
      { postID: postID },
      CreatePostsDto,
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      }
    );
    return data;
  }

  async update(
    id: string,
    CreatePostsDto: CreatePostsDto,
  ): Promise<Posts> {
    let data = await this.PostsModel.findByIdAndUpdate(
      id,
      CreatePostsDto,
      { new: true },
    );

    if (!data) {
      throw new Error('Todo is not found!');
    }
    return data;
  }

  async findOnepostID(postID: string): Promise<Object> {
    var datacontent = null;
    var CreatePostsDto_ = await this.PostsModel.findOne({ postID: postID }).exec();
    if (await this.utilsService.ceckData(CreatePostsDto_)) {

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
      const datauserbasicsService = await this.utilsService.generateProfile(
        CreatePostsDto_.email.toString(), "FULL");

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
    } else {
      return null;
    }
  }

  async updateView(email: string, postID: string) {
    this.PostsModel.updateOne(
      {
        email: email,
        postID: postID,
      },
      { $inc: { views: 1 } },
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

  async updateLike(email: string, postID: string) {
    this.PostsModel.updateOne(
      {
        email: email,
        postID: postID,
      },
      { $inc: { likes: 1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateUnLike(email: string, postID: string) {
    this.PostsModel.updateOne(
      {
        email: email,
        postID: postID,
      },
      { $inc: { likes: -1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateemail(id: string, email: string, iduser: {
    "$oid": string
  }, createdAt: string): Promise<Object> {
    let data = await this.PostsModel.updateOne({ "_id": id },
      {
        $set: {
          "email": email, "userProfile": {
            "$ref": "userbasics",
            "$id": iduser,
            "$db": "hyppe_trans_db"
          },
          "saleAmount": 0,
          "certified": true,
          "createdAt": createdAt,
          "updatedAt": createdAt,
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

  async updateReportuser(postID: string, reportedStatus: string, reportedUserCount: number, reportedUser: any[], contentModeration: boolean, contentModerationResponse: string, reportedUserHandle: any[]): Promise<Object> {
    let data = await this.PostsModel.updateOne({ "postID": postID },
      { $set: { "reportedStatus": reportedStatus, "reportedUserCount": reportedUserCount, "reportedUser": reportedUser, "contentModeration": contentModeration, "contentModerationResponse": contentModerationResponse, "reportedUserHandle": reportedUserHandle } });
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

  // async findpost() {
  //   const query = await this.PostsModel.aggregate([

  //     {
  //       $lookup: {
  //         from: 'posts',
  //         localField: 'posts.$id',
  //         foreignField: '_id',
  //         as: 'roless',
  //       },
  //     }, {
  //       $out: {
  //         db: 'hyppe_trans_db',
  //         coll: 'posts2'
  //       }
  //     },

  //   ]);
  //   return query;
  // }

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

  // generateUserPlaylist_(CreateUserplaylistDto_: CreateUserplaylistDto) {
  //   const job = this.generateUserPlaylistqueue.add('generate', {
  //     CreateUserplaylistDto_
  //   });
  //   return {
  //     jobId: job.id
  //   }
  // }

  async generateUserPlaylist(CreateUserplaylistDto_: CreateUserplaylistDto) {
    console.log("----------------------------------------" + new Date().toString() + "----------------------------------------");
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

      var type = null;
      var ceckFriendFollowingFollower = await this.contentEventService.ceckFriendFollowingFollower(data_userbasic.email.toString(), element.email.toString());
      if (await this.utilsService.ceckData(ceckFriendFollowingFollower)) {
        if (ceckFriendFollowingFollower.length == 2) {
          type = "FRIEND";
        } else {
          if (ceckFriendFollowingFollower[0].email == data_userbasic.email.toString()) {
            type = "FOLLOWER";
          } else {
            if (ceckFriendFollowingFollower[0].email == element.email.toString()) {
              type = "FOLLOWING";
            } else {
              type = "PUBLIC";
            }
          }
        }
      } else {
        type = "PUBLIC";
      }

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
      CreateUserplaylistDto_.postID = (data_post.postID != undefined) ? data_post.postID : "";
      CreateUserplaylistDto_.expiration = (data_post.expiration != undefined) ? Number(data_post.expiration) : 0;
      CreateUserplaylistDto_.description = (data_post.description != undefined) ? data_post.description : "";
      CreateUserplaylistDto_.userBasicData = Object(data_userbasic);
      CreateUserplaylistDto_.postData = Object(data_post);
      CreateUserplaylistDto_.mediaData = Object(data_media);
      CreateUserplaylistDto_.mediaData = Object(data_media); CreateUserplaylistDto_.FRIEND = (type == "FRIEND") ? true : false;
      CreateUserplaylistDto_.FOLLOWER = (type == "FOLLOWER" || type == "FRIEND") ? true : false;;
      CreateUserplaylistDto_.FOLLOWING = (type == "FOLLOWING" || type == "FRIEND") ? true : false;
      CreateUserplaylistDto_.PUBLIC = (type == "PUBLIC" || type == "FRIEND" || type == "FOLLOWER" || type == "FOLLOWING") ? true : false;
      CreateUserplaylistDto_.PRIVATE = (type == "PRIVATE") ? true : false;
      if (data_media.viewers != undefined) {
        CreateUserplaylistDto_.viewers = data_media.viewers;
      }
      if (await this.utilsService.ceckData(data_media)) {
        if (data_media.apsara != undefined) {
          CreateUserplaylistDto_.isApsara = data_media.apsara;
          if (!data_media.apsara) {
            if (data_media.mediaType != undefined) {
              if (data_media.mediaType == "video") {
                if (data_media.mediaThumb != undefined) {
                  CreateUserplaylistDto_.mediaThumbUri = data_media.mediaThumb;
                }
                if (data_media.mediaUri != undefined) {
                  CreateUserplaylistDto_.mediaEndpoint = "/stream/" + data_media.mediaUri;
                }
                if (data_media.postID != undefined) {
                  CreateUserplaylistDto_.mediaThumbEndpoint = "/thumb/" + data_media.postID;
                }
                CreateUserplaylistDto_.mediaType = data_media.mediaType;
              } else if (data_media.mediaType == "image") {
                if (data_media.mediaUri != undefined) {
                  CreateUserplaylistDto_.mediaEndpoint = "/pict" + data_media.mediaUri;
                }
                if (data_media.mediaUri != undefined) {
                  CreateUserplaylistDto_.mediaThumbEndpoint = "/thumb/" + data_media.postID;
                }
                CreateUserplaylistDto_.mediaType = data_media.mediaType;
              }
            }
          }
        } else {
          CreateUserplaylistDto_.isApsara = false;
          if (data_media.mediaType != undefined) {
            if (data_media.mediaType == "video") {
              if (data_media.mediaThumb != undefined) {
                CreateUserplaylistDto_.mediaThumbUri = data_media.mediaThumb;
              }
              if (data_media.mediaUri != undefined) {
                CreateUserplaylistDto_.mediaEndpoint = "/stream/" + data_media.mediaUri;
              }
              if (data_media.postID != undefined) {
                CreateUserplaylistDto_.mediaThumbEndpoint = "/thumb/" + data_media.postID;
              }
              CreateUserplaylistDto_.mediaType = data_media.mediaType;
            } else if (data_media.mediaType == "image") {
              if (data_media.mediaUri != undefined) {
                CreateUserplaylistDto_.mediaEndpoint = "/pict" + data_media.mediaUri;
              }
              if (data_media.mediaUri != undefined) {
                CreateUserplaylistDto_.mediaThumbEndpoint = "/thumb/" + data_media.postID;
              }
              CreateUserplaylistDto_.mediaType = data_media.mediaType;
            }
          }
        }
      }

      // const userId = element._id.toString();
      // const userIdPost = data_userbasic._id.toString();
      // const mediaId_ = mediaId.toString();
      // var ceckDataUser_ = await this.userplaylistModel.findOne({ userId: new Types.ObjectId(userId), userPostId: new Types.ObjectId(userIdPost), mediaId: mediaId_ }).clone().exec();

      //var ceckDataUser_ = await this.userplaylistService.findData(element._id.toString(), data_userbasic._id.toString(), mediaId.toString());

      // if (await this.utilsService.ceckData(ceckDataUser_)) {
      //   await this.userplaylistService.updateOne(ceckDataUser_[0]._id, CreateUserplaylistDto_);
      // } else {
      //   CreateUserplaylistDto_._id = new mongoose.Types.ObjectId();
      //   await this.userplaylistService.create(CreateUserplaylistDto_);
      // }
      CreateUserplaylistDto_._id = new mongoose.Types.ObjectId();
      await this.userplaylistService.create(CreateUserplaylistDto_);
      console.log("----------------------------------------" + new Date().toString() + "----------------------------------------");
    });
    console.log("----------------------------------------" + new Date().toString() + "----------------------------------------");
  }

  async updateGenerateUserPlaylist(oldUserPostID: mongoose.Types.ObjectId, CreateUserplaylistDto_: CreateUserplaylistDto) {
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

      var type = null;
      var ceckFriendFollowingFollower = await this.contentEventService.ceckFriendFollowingFollower(data_userbasic.email.toString(), element.email.toString());
      if (await this.utilsService.ceckData(ceckFriendFollowingFollower)) {
        if (ceckFriendFollowingFollower.length == 2) {
          type = "FRIEND";
        } else {
          if (ceckFriendFollowingFollower[0].email == data_userbasic.email.toString()) {
            type = "FOLLOWER";
          } else {
            if (ceckFriendFollowingFollower[0].email == element.email.toString()) {
              type = "FOLLOWING";
            } else {
              type = "PUBLIC";
            }
          }
        }
      } else {
        type = "PUBLIC";
      }

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
      CreateUserplaylistDto_.postID = (data_post.postID != undefined) ? data_post.postID : "";
      CreateUserplaylistDto_.expiration = (data_post.expiration != undefined) ? Number(data_post.expiration) : 0;
      CreateUserplaylistDto_.description = (data_post.description != undefined) ? data_post.description : "";
      CreateUserplaylistDto_.userBasicData = Object(data_userbasic);
      CreateUserplaylistDto_.postData = Object(data_post);
      CreateUserplaylistDto_.mediaData = Object(data_media);
      CreateUserplaylistDto_.mediaData = Object(data_media); CreateUserplaylistDto_.FRIEND = (type == "FRIEND") ? true : false;
      CreateUserplaylistDto_.FOLLOWER = (type == "FOLLOWER" || type == "FRIEND") ? true : false;;
      CreateUserplaylistDto_.FOLLOWING = (type == "FOLLOWING" || type == "FRIEND") ? true : false;
      CreateUserplaylistDto_.PUBLIC = (type == "PUBLIC" || type == "FRIEND" || type == "FOLLOWER" || type == "FOLLOWING") ? true : false;
      CreateUserplaylistDto_.PRIVATE = (type == "PRIVATE") ? true : false;
      if (data_media.viewers != undefined) {
        CreateUserplaylistDto_.viewers = data_media.viewers;
      }
      if (await this.utilsService.ceckData(data_media)) {
        if (data_media.apsara != undefined) {
          CreateUserplaylistDto_.isApsara = data_media.apsara;
          if (!data_media.apsara) {
            if (data_media.mediaType != undefined) {
              if (data_media.mediaType == "video") {
                if (data_media.mediaThumb != undefined) {
                  CreateUserplaylistDto_.mediaThumbUri = data_media.mediaThumb;
                }
                if (data_media.mediaUri != undefined) {
                  CreateUserplaylistDto_.mediaEndpoint = "/stream/" + data_media.mediaUri;
                }
                if (data_media.postID != undefined) {
                  CreateUserplaylistDto_.mediaThumbEndpoint = "/thumb/" + data_media.postID;
                }
                CreateUserplaylistDto_.mediaType = data_media.mediaType;
              } else if (data_media.mediaType == "image") {
                if (data_media.mediaUri != undefined) {
                  CreateUserplaylistDto_.mediaEndpoint = "/pict" + data_media.mediaUri;
                }
                if (data_media.mediaUri != undefined) {
                  CreateUserplaylistDto_.mediaThumbEndpoint = "/thumb/" + data_media.postID;
                }
                CreateUserplaylistDto_.mediaType = data_media.mediaType;
              }
            }
          }
        } else {
          CreateUserplaylistDto_.isApsara = false;
          if (data_media.mediaType != undefined) {
            if (data_media.mediaType == "video") {
              if (data_media.mediaThumb != undefined) {
                CreateUserplaylistDto_.mediaThumbUri = data_media.mediaThumb;
              }
              if (data_media.mediaUri != undefined) {
                CreateUserplaylistDto_.mediaEndpoint = "/stream/" + data_media.mediaUri;
              }
              if (data_media.postID != undefined) {
                CreateUserplaylistDto_.mediaThumbEndpoint = "/thumb/" + data_media.postID;
              }
              CreateUserplaylistDto_.mediaType = data_media.mediaType;
            } else if (data_media.mediaType == "image") {
              if (data_media.mediaUri != undefined) {
                CreateUserplaylistDto_.mediaEndpoint = "/pict" + data_media.mediaUri;
              }
              if (data_media.mediaUri != undefined) {
                CreateUserplaylistDto_.mediaThumbEndpoint = "/thumb/" + data_media.postID;
              }
              CreateUserplaylistDto_.mediaType = data_media.mediaType;
            }
          }
        }
      }

      var CreateUserplaylistDto_old = new CreateUserplaylistDto();
      CreateUserplaylistDto_old.userPostId = oldUserPostID;
      CreateUserplaylistDto_old.mediaId = mediaId.toString();
      CreateUserplaylistDto_old.userId = Object(element._id);
      // var ceckDataUser_ = await this.userplaylistService.findData(element._id.toString(), oldUserPostID.toString(), mediaId.toString());
      // if (await this.utilsService.ceckData(ceckDataUser_)) {
      //   await this.userplaylistService.updateOne(ceckDataUser_[0]._id, CreateUserplaylistDto_);
      // } 
      await this.userplaylistService.findOneAndUpdate(CreateUserplaylistDto_old, CreateUserplaylistDto_);
      //await this.userplaylistService.updateOne(ceckDataUser_[0]._id, CreateUserplaylistDto_);
    });
  }

  async updateGenerateUserPlaylist_(CreateUserplaylistDto_: CreateUserplaylistDto) {
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

      var type = null;
      var ceckFriendFollowingFollower = await this.contentEventService.ceckFriendFollowingFollower(data_userbasic.email.toString(), element.email.toString());
      if (await this.utilsService.ceckData(ceckFriendFollowingFollower)) {
        if (ceckFriendFollowingFollower.length == 2) {
          type = "FRIEND";
        } else {
          if (ceckFriendFollowingFollower[0].email == data_userbasic.email.toString()) {
            type = "FOLLOWER";
          } else {
            if (ceckFriendFollowingFollower[0].email == element.email.toString()) {
              type = "FOLLOWING";
            } else {
              type = "PUBLIC";
            }
          }
        }
      } else {
        type = "PUBLIC";
      }

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
      CreateUserplaylistDto_.postID = (data_post.postID != undefined) ? data_post.postID : "";
      CreateUserplaylistDto_.expiration = (data_post.expiration != undefined) ? Number(data_post.expiration) : 0;
      CreateUserplaylistDto_.description = (data_post.description != undefined) ? data_post.description : "";
      CreateUserplaylistDto_.userBasicData = Object(data_userbasic);
      CreateUserplaylistDto_.postData = Object(data_post);
      CreateUserplaylistDto_.mediaData = Object(data_media); CreateUserplaylistDto_.FRIEND = (type == "FRIEND") ? true : false;
      CreateUserplaylistDto_.FOLLOWER = (type == "FOLLOWER" || type == "FRIEND") ? true : false;;
      CreateUserplaylistDto_.FOLLOWING = (type == "FOLLOWING" || type == "FRIEND") ? true : false;
      CreateUserplaylistDto_.PUBLIC = (type == "PUBLIC" || type == "FRIEND" || type == "FOLLOWER" || type == "FOLLOWING") ? true : false;
      CreateUserplaylistDto_.PRIVATE = (type == "PRIVATE") ? true : false;
      if (data_media.viewers != undefined) {
        CreateUserplaylistDto_.viewers = data_media.viewers;
      }
      if (await this.utilsService.ceckData(data_media)) {
        if (data_media.apsara != undefined) {
          CreateUserplaylistDto_.isApsara = data_media.apsara;
          if (!data_media.apsara) {
            if (data_media.mediaType != undefined) {
              if (data_media.mediaType == "video") {
                if (data_media.mediaThumb != undefined) {
                  CreateUserplaylistDto_.mediaThumbUri = data_media.mediaThumb;
                }
                if (data_media.mediaUri != undefined) {
                  CreateUserplaylistDto_.mediaEndpoint = "/stream/" + data_media.mediaUri;
                }
                if (data_media.postID != undefined) {
                  CreateUserplaylistDto_.mediaThumbEndpoint = "/thumb/" + data_media.postID;
                }
                CreateUserplaylistDto_.mediaType = data_media.mediaType;
              } else if (data_media.mediaType == "image") {
                if (data_media.mediaUri != undefined) {
                  CreateUserplaylistDto_.mediaEndpoint = "/pict" + data_media.mediaUri;
                }
                if (data_media.mediaUri != undefined) {
                  CreateUserplaylistDto_.mediaThumbEndpoint = "/thumb/" + data_media.postID;
                }
                CreateUserplaylistDto_.mediaType = data_media.mediaType;
              }
            }
          }
        } else {
          CreateUserplaylistDto_.isApsara = false;
          if (data_media.mediaType != undefined) {
            if (data_media.mediaType == "video") {
              if (data_media.mediaThumb != undefined) {
                CreateUserplaylistDto_.mediaThumbUri = data_media.mediaThumb;
              }
              if (data_media.mediaUri != undefined) {
                CreateUserplaylistDto_.mediaEndpoint = "/stream/" + data_media.mediaUri;
              }
              if (data_media.postID != undefined) {
                CreateUserplaylistDto_.mediaThumbEndpoint = "/thumb/" + data_media.postID;
              }
              CreateUserplaylistDto_.mediaType = data_media.mediaType;
            } else if (data_media.mediaType == "image") {
              if (data_media.mediaUri != undefined) {
                CreateUserplaylistDto_.mediaEndpoint = "/pict" + data_media.mediaUri;
              }
              if (data_media.mediaUri != undefined) {
                CreateUserplaylistDto_.mediaThumbEndpoint = "/thumb/" + data_media.postID;
              }
              CreateUserplaylistDto_.mediaType = data_media.mediaType;
            }
          }
        }
      }

      var CreateUserplaylistDto_old = new CreateUserplaylistDto();
      CreateUserplaylistDto_old.userPostId = Object(data_userbasic._id);
      CreateUserplaylistDto_old.mediaId = mediaId.toString();
      CreateUserplaylistDto_old.userId = Object(element._id);
      // var ceckDataUser_ = await this.userplaylistService.findData(element._id.toString(), oldUserPostID.toString(), mediaId.toString());
      // if (await this.utilsService.ceckData(ceckDataUser_)) {
      //   await this.userplaylistService.updateOne(ceckDataUser_[0]._id, CreateUserplaylistDto_);
      // } 
      console.log(CreateUserplaylistDto_old);
      console.log(CreateUserplaylistDto_);
      await this.userplaylistService.findOneAndUpdate(CreateUserplaylistDto_old, CreateUserplaylistDto_);
      //await this.userplaylistService.updateOne(ceckDataUser_[0]._id, CreateUserplaylistDto_);
    });
  }

  async generateNewUserPlaylist(userId: string) {
    const limit = 20;
    const sort = -1;
    const data_user = await this.userService.findbyid(userId);
    const getPost_vid = await this.PostsModel.find({ postType: "vid" }).sort({ createdAt: sort }).limit(limit).exec();
    const getPost_pict = await this.PostsModel.find({ postType: "pict" }).sort({ createdAt: sort }).limit(limit).exec();
    const getPost_diary = await this.PostsModel.find({ postType: "diary" }).sort({ createdAt: sort }).limit(limit).exec();
    const getPost_story = await this.PostsModel.find({ postType: "story" }).sort({ createdAt: sort }).limit(limit).exec();

    var user_array_interest_string = null;
    var user_array_interest_toString = null;

    var user_array_interest = null;
    if (data_user.userInterests != undefined) {
      user_array_interest = data_user.userInterests;
    }

    if (user_array_interest.length > 0) {
      user_array_interest_toString = user_array_interest.map(function (item) {
        if ((JSON.parse(JSON.stringify(item)) != null)) {
          return '"' + JSON.parse(JSON.stringify(item)).$id + '"'
        }
      }).join(",");
      user_array_interest_string = JSON.parse("[" + user_array_interest_toString + "]");
    }

    for (var loopData = 0; loopData < limit; loopData++) {
      var email_post_vid = null;
      var email_post_pict = null;
      var email_post_diary = null;
      var email_post_story = null;

      var userbasic_post_vid = null;
      var userbasic_post_pict = null;
      var userbasic_post_diary = null;
      var userbasic_post_story = null;

      var id_user_post_vid = null;
      var id_user_post_pict = null;
      var id_user_post_diary = null;
      var id_user_post_story = null;

      var post_array_interest_vid_string = null;
      var post_array_interest_pict_string = null;
      var post_array_interest_diary_string = null;
      var post_array_interest_story_string = null;

      var post_array_interest_vid_toString = null;
      var post_array_interest_pict_toString = null;
      var post_array_interest_diary_toString = null;
      var post_array_interest_story_toString = null;

      var post_array_interest_vid = getPost_vid[loopData].category;
      var post_array_interest_pict = getPost_pict[loopData].category;
      var post_array_interest_diary = getPost_diary[loopData].category;
      var post_array_interest_story = getPost_story[loopData].category;

      email_post_vid = getPost_vid[loopData].email;
      email_post_pict = getPost_vid[loopData].email;
      email_post_diary = getPost_vid[loopData].email;
      email_post_story = getPost_vid[loopData].email;

      userbasic_post_vid = await this.userService.findOne(email_post_vid);
      userbasic_post_pict = await this.userService.findOne(email_post_vid);
      userbasic_post_diary = await this.userService.findOne(email_post_vid);
      userbasic_post_story = await this.userService.findOne(email_post_vid);

      id_user_post_vid = userbasic_post_vid._id.toString();
      id_user_post_pict = userbasic_post_pict._id.toString();
      id_user_post_diary = userbasic_post_diary._id.toString();
      id_user_post_story = userbasic_post_story._id.toString();

      var compare_interest_vid = null;
      var compare_interest_pict = null;
      var compare_interest_diary = null;
      var compare_interest_story = null;

      var Count_compare_interest_vid = 0;
      var Count_compare_interest_pict = 0;
      var Count_compare_interest_diary = 0;
      var Count_compare_interest_story = 0;

      if (post_array_interest_vid.length > 0) {
        post_array_interest_vid_toString = post_array_interest_vid.map(function (item) { return '"' + JSON.parse(JSON.stringify(item)).$id + '"' }).join(",");
        post_array_interest_vid_string = JSON.parse("[" + post_array_interest_vid_toString + "]");
      }

      if (post_array_interest_vid_string != null && user_array_interest_string != null) {
        compare_interest_vid = post_array_interest_vid_string.filter(function (obj) {
          return user_array_interest_string.indexOf(obj) !== -1;
        });
      }

      if (post_array_interest_pict.length > 0) {
        post_array_interest_pict_toString = post_array_interest_pict.map(function (item) { return '"' + JSON.parse(JSON.stringify(item)).$id + '"' }).join(",");
        post_array_interest_pict_string = JSON.parse("[" + post_array_interest_pict_toString + "]");
      }

      if (post_array_interest_pict_string != null && user_array_interest_string != null) {
        compare_interest_pict = post_array_interest_pict_string.filter(function (obj) {
          return user_array_interest_string.indexOf(obj) !== -1;
        });
      }

      if (post_array_interest_diary.length > 0) {
        post_array_interest_diary_toString = post_array_interest_diary.map(function (item) { return '"' + JSON.parse(JSON.stringify(item)).$id + '"' }).join(",");
        post_array_interest_diary_string = JSON.parse("[" + post_array_interest_diary_toString + "]");
      }

      if (post_array_interest_diary_string != null && user_array_interest_string != null) {
        compare_interest_diary = post_array_interest_diary_string.filter(function (obj) {
          return user_array_interest_string.indexOf(obj) !== -1;
        });
      }

      if (post_array_interest_story.length > 0) {
        post_array_interest_story_toString = post_array_interest_story.map(function (item) { return '"' + JSON.parse(JSON.stringify(item)).$id + '"' }).join(",");
        post_array_interest_story_string = JSON.parse("[" + post_array_interest_story_toString + "]");
      }

      if (post_array_interest_story_string != null && user_array_interest_string != null) {
        compare_interest_story = post_array_interest_story_string.filter(function (obj) {
          return user_array_interest_string.indexOf(obj) !== -1;
        });
      }

      //Compare Get Interes
      if (compare_interest_vid != null) {
        Count_compare_interest_vid = compare_interest_vid.length;
      }
      if (compare_interest_pict != null) {
        Count_compare_interest_pict = compare_interest_pict.length;
      }
      if (compare_interest_diary != null) {
        Count_compare_interest_diary = compare_interest_diary.length;
      }
      if (compare_interest_story != null) {
        Count_compare_interest_story = compare_interest_story.length;
      }

      var interest_db_vid = [];
      if (Count_compare_interest_vid > 0) {
        for (var j = 0; j < Count_compare_interest_vid; j++) {
          var objintr = { "$ref": "interests_repo", "$id": new mongoose.Types.ObjectId(compare_interest_vid[j]), "$db": "hyppe_infra_db" }
          interest_db_vid.push(objintr)
        }
      }

      var interest_db_pict = [];
      if (Count_compare_interest_pict > 0) {
        for (var k = 0; k < Count_compare_interest_pict; k++) {
          var objintr = { "$ref": "interests_repo", "$id": new mongoose.Types.ObjectId(compare_interest_pict[k]), "$db": "hyppe_infra_db" }
          interest_db_pict.push(objintr)
        }
      }

      var interest_db_diary = [];
      if (Count_compare_interest_diary > 0) {
        for (var l = 0; l < Count_compare_interest_diary; l++) {
          var objintr = { "$ref": "interests_repo", "$id": new mongoose.Types.ObjectId(compare_interest_diary[l]), "$db": "hyppe_infra_db" }
          interest_db_diary.push(objintr)
        }
      }

      var interest_db_story = [];
      if (Count_compare_interest_story > 0) {
        for (var m = 0; m < Count_compare_interest_story; m++) {
          var objintr = { "$ref": "interests_repo", "$id": new mongoose.Types.ObjectId(compare_interest_story[m]), "$db": "hyppe_infra_db" }
          interest_db_story.push(objintr)
        }
      }

      //-------------------------------------------INSERT VID
      console.log("-------------------------------------------INSERT VID");

      var type_vid = null;
      var ceckFriendFollowingFollower_vid = await this.contentEventService.ceckFriendFollowingFollower(data_user.email.toString(), getPost_vid[loopData].email.toString());
      if (await this.utilsService.ceckData(ceckFriendFollowingFollower_vid)) {
        if (ceckFriendFollowingFollower_vid.length == 2) {
          type_vid = "FRIEND";
        } else {
          if (ceckFriendFollowingFollower_vid[0].email == data_user.email.toString()) {
            type_vid = "FOLLOWER";
          } else {
            if (ceckFriendFollowingFollower_vid[0].email == getPost_vid[loopData].email.toString()) {
              type_vid = "FOLLOWING";
            } else {
              type_vid = "PUBLIC";
            }
          }
        }
      } else {
        type_vid = "PUBLIC";
      }

      var isHidden_vid = false;
      if (getPost_vid[loopData].visibility != undefined) {
        if (getPost_vid[loopData].visibility == "FRIEND") {
          if (type_vid == getPost_vid[loopData].visibility) {
            isHidden_vid = false;
          } else {
            isHidden_vid = true;
          }
        } else if (getPost_vid[loopData].visibility == "PRIVATE") {
          type_vid = "PRIVATE";
          if (getPost_vid[loopData].email.toString() == data_user.email.toString()) {
            isHidden_vid = false;
          } else {
            isHidden_vid = true;
          }
        } else {
          isHidden_vid = false;
        }
      }

      var data_media_vid = await this.mediavideosService.findOnepostID(getPost_vid[loopData].postID.toString());
      if (await this.utilsService.ceckData(data_media_vid)) {
        //Insert Playlist Type Vid
        var CreateUserplaylistDto_vid = new CreateUserplaylistDto();
        CreateUserplaylistDto_vid.userId = Object(data_user._id);
        CreateUserplaylistDto_vid.interestId = interest_db_vid;
        CreateUserplaylistDto_vid.interestIdCount = Count_compare_interest_vid;
        CreateUserplaylistDto_vid.userPostId = Object(id_user_post_vid);
        CreateUserplaylistDto_vid.postType = getPost_vid[loopData].postType;
        CreateUserplaylistDto_vid.mediaId = data_media_vid.mediaID;
        CreateUserplaylistDto_vid.type = type_vid;
        CreateUserplaylistDto_vid.createAt = getPost_vid[loopData].createdAt;
        CreateUserplaylistDto_vid.updatedAt = getPost_vid[loopData].updatedAt;
        CreateUserplaylistDto_vid.isWatched = false;
        CreateUserplaylistDto_vid.isHidden = isHidden_vid;
        CreateUserplaylistDto_vid.postID = (getPost_vid[loopData].postID != undefined) ? getPost_vid[loopData].postID : "";
        CreateUserplaylistDto_vid.expiration = (getPost_vid[loopData].expiration != undefined) ? Number(getPost_vid[loopData].expiration) : 0;
        CreateUserplaylistDto_vid.description = (getPost_vid[loopData].description != undefined) ? getPost_vid[loopData].description : "";
        CreateUserplaylistDto_vid.userBasicData = Object(userbasic_post_vid);
        CreateUserplaylistDto_vid.postData = Object(getPost_vid[loopData]);
        CreateUserplaylistDto_vid.mediaData = Object(data_media_vid);
        CreateUserplaylistDto_vid.mediaData = Object(data_media_vid);
        CreateUserplaylistDto_vid.FRIEND = (type_vid == "FRIEND") ? true : false;
        CreateUserplaylistDto_vid.FOLLOWER = (type_vid == "FOLLOWER" || type_vid == "FRIEND") ? true : false;;
        CreateUserplaylistDto_vid.FOLLOWING = (type_vid == "FOLLOWING" || type_vid == "FRIEND") ? true : false;
        CreateUserplaylistDto_vid.PUBLIC = (type_vid == "PUBLIC" || type_vid == "FRIEND" || type_vid == "FOLLOWER" || type_vid == "FOLLOWING") ? true : false;
        CreateUserplaylistDto_vid.PRIVATE = (type_vid == "PRIVATE") ? true : false;
        if (data_media_vid.viewers != undefined) {
          CreateUserplaylistDto_vid.viewers = data_media_vid.viewers;
        }
        if (await this.utilsService.ceckData(data_media_vid)) {
          if (data_media_vid.apsara != undefined) {
            CreateUserplaylistDto_vid.isApsara = data_media_vid.apsara;
            if (!data_media_vid.apsara) {
              if (data_media_vid.mediaType != undefined) {
                if (data_media_vid.mediaType == "video") {
                  if (data_media_vid.mediaThumb != undefined) {
                    CreateUserplaylistDto_vid.mediaThumbUri = data_media_vid.mediaThumb;
                  }
                  if (data_media_vid.mediaUri != undefined) {
                    CreateUserplaylistDto_vid.mediaEndpoint = "/stream/" + data_media_vid.mediaUri;
                  }
                  if (data_media_vid.postID != undefined) {
                    CreateUserplaylistDto_vid.mediaThumbEndpoint = "/thumb/" + data_media_vid.postID;
                  }
                  CreateUserplaylistDto_vid.mediaType = data_media_vid.mediaType;
                } else if (data_media_vid.mediaType == "image") {
                  if (data_media_vid.mediaUri != undefined) {
                    CreateUserplaylistDto_vid.mediaEndpoint = "/pict" + data_media_vid.mediaUri;
                  }
                  if (data_media_vid.mediaUri != undefined) {
                    CreateUserplaylistDto_vid.mediaThumbEndpoint = "/thumb/" + data_media_vid.postID;
                  }
                  CreateUserplaylistDto_vid.mediaType = data_media_vid.mediaType;
                }
              }
            }
          } else {
            CreateUserplaylistDto_vid.isApsara = false;
            if (data_media_vid.mediaType != undefined) {
              if (data_media_vid.mediaType == "video") {
                if (data_media_vid.mediaThumb != undefined) {
                  CreateUserplaylistDto_vid.mediaThumbUri = data_media_vid.mediaThumb;
                }
                if (data_media_vid.mediaUri != undefined) {
                  CreateUserplaylistDto_vid.mediaEndpoint = "/stream/" + data_media_vid.mediaUri;
                }
                if (data_media_vid.postID != undefined) {
                  CreateUserplaylistDto_vid.mediaThumbEndpoint = "/thumb/" + data_media_vid.postID;
                }
                CreateUserplaylistDto_vid.mediaType = data_media_vid.mediaType;
              } else if (data_media_vid.mediaType == "image") {
                if (data_media_vid.mediaUri != undefined) {
                  CreateUserplaylistDto_vid.mediaEndpoint = "/pict" + data_media_vid.mediaUri;
                }
                if (data_media_vid.mediaUri != undefined) {
                  CreateUserplaylistDto_vid.mediaThumbEndpoint = "/thumb/" + data_media_vid.postID;
                }
                CreateUserplaylistDto_vid.mediaType = data_media_vid.mediaType;
              }
            }
          }
        }
        CreateUserplaylistDto_vid._id = new mongoose.Types.ObjectId();
        await this.userplaylistService.create(CreateUserplaylistDto_vid);
      }

      //-------------------------------------------INSERT PICT
      console.log("-------------------------------------------INSERT PICT");

      var type_pict = null;
      var ceckFriendFollowingFollower_pict = await this.contentEventService.ceckFriendFollowingFollower(data_user.email.toString(), getPost_pict[loopData].email.toString());
      if (await this.utilsService.ceckData(ceckFriendFollowingFollower_pict)) {
        if (ceckFriendFollowingFollower_pict.length == 2) {
          type_pict = "FRIEND";
        } else {
          if (ceckFriendFollowingFollower_pict[0].email == data_user.email.toString()) {
            type_pict = "FOLLOWER";
          } else {
            if (ceckFriendFollowingFollower_pict[0].email == getPost_pict[loopData].email.toString()) {
              type_pict = "FOLLOWING";
            } else {
              type_pict = "PUBLIC";
            }
          }
        }
      } else {
        type_pict = "PUBLIC";
      }

      var isHidden_pict = false;
      if (getPost_pict[loopData].visibility != undefined) {
        if (getPost_pict[loopData].visibility == "FRIEND") {
          if (type_pict == getPost_pict[loopData].visibility) {
            isHidden_pict = false;
          } else {
            isHidden_pict = true;
          }
        } else if (getPost_pict[loopData].visibility == "PRIVATE") {
          type_pict = "PRIVATE";
          if (getPost_pict[loopData].email.toString() == data_user.email.toString()) {
            isHidden_pict = false;
          } else {
            isHidden_pict = true;
          }
        } else {
          isHidden_pict = false;
        }
      }

      var data_media_pict = await this.mediapictsService.findOnepostID(getPost_pict[loopData].postID.toString());
      if (await this.utilsService.ceckData(data_media_pict)) {
        //Insert Playlist Type Vid
        var CreateUserplaylistDto_pict = new CreateUserplaylistDto();
        CreateUserplaylistDto_pict.userId = Object(data_user._id);
        CreateUserplaylistDto_pict.interestId = interest_db_pict;
        CreateUserplaylistDto_pict.interestIdCount = Count_compare_interest_pict;
        CreateUserplaylistDto_pict.userPostId = Object(id_user_post_pict);
        CreateUserplaylistDto_pict.postType = getPost_pict[loopData].postType;
        CreateUserplaylistDto_pict.mediaId = data_media_pict.mediaID;
        CreateUserplaylistDto_pict.type = type_pict;
        CreateUserplaylistDto_pict.createAt = getPost_pict[loopData].createdAt;
        CreateUserplaylistDto_pict.updatedAt = getPost_pict[loopData].updatedAt;
        CreateUserplaylistDto_pict.isWatched = false;
        CreateUserplaylistDto_pict.isHidden = isHidden_pict;
        CreateUserplaylistDto_pict.postID = (getPost_pict[loopData].postID != undefined) ? getPost_pict[loopData].postID : "";
        CreateUserplaylistDto_pict.expiration = (getPost_pict[loopData].expiration != undefined) ? Number(getPost_pict[loopData].expiration) : 0;
        CreateUserplaylistDto_pict.description = (getPost_pict[loopData].description != undefined) ? getPost_pict[loopData].description : "";
        CreateUserplaylistDto_pict.userBasicData = Object(userbasic_post_pict);
        CreateUserplaylistDto_pict.postData = Object(getPost_pict[loopData]);
        CreateUserplaylistDto_pict.mediaData = Object(data_media_pict);
        CreateUserplaylistDto_pict.mediaData = Object(data_media_pict);
        CreateUserplaylistDto_pict.FRIEND = (type_pict == "FRIEND") ? true : false;
        CreateUserplaylistDto_pict.FOLLOWER = (type_pict == "FOLLOWER" || type_pict == "FRIEND") ? true : false;;
        CreateUserplaylistDto_pict.FOLLOWING = (type_pict == "FOLLOWING" || type_pict == "FRIEND") ? true : false;
        CreateUserplaylistDto_pict.PUBLIC = (type_pict == "PUBLIC" || type_pict == "FRIEND" || type_pict == "FOLLOWER" || type_pict == "FOLLOWING") ? true : false;
        CreateUserplaylistDto_pict.PRIVATE = (type_pict == "PRIVATE") ? true : false;
        if (data_media_pict.viewers != undefined) {
          CreateUserplaylistDto_pict.viewers = data_media_pict.viewers;
        }
        if (await this.utilsService.ceckData(data_media_pict)) {
          if (data_media_pict.apsara != undefined) {
            CreateUserplaylistDto_pict.isApsara = data_media_pict.apsara;
            if (!data_media_pict.apsara) {
              if (data_media_pict.mediaType != undefined) {
                if (data_media_pict.mediaType == "video") {
                  if (data_media_pict.mediaUri != undefined) {
                    CreateUserplaylistDto_pict.mediaEndpoint = "/stream/" + data_media_pict.mediaUri;
                  }
                  if (data_media_pict.postID != undefined) {
                    CreateUserplaylistDto_pict.mediaThumbEndpoint = "/thumb/" + data_media_pict.postID;
                  }
                  CreateUserplaylistDto_pict.mediaType = data_media_pict.mediaType;
                } else if (data_media_pict.mediaType == "image") {
                  if (data_media_pict.mediaUri != undefined) {
                    CreateUserplaylistDto_pict.mediaEndpoint = "/pict" + data_media_pict.mediaUri;
                  }
                  if (data_media_pict.mediaUri != undefined) {
                    CreateUserplaylistDto_pict.mediaThumbEndpoint = "/thumb/" + data_media_pict.postID;
                  }
                  CreateUserplaylistDto_pict.mediaType = data_media_pict.mediaType;
                }
              }
            }
          } else {
            CreateUserplaylistDto_pict.isApsara = false;
            if (data_media_pict.mediaType != undefined) {
              if (data_media_pict.mediaType == "video") {
                if (data_media_pict.mediaUri != undefined) {
                  CreateUserplaylistDto_pict.mediaEndpoint = "/stream/" + data_media_pict.mediaUri;
                }
                if (data_media_pict.postID != undefined) {
                  CreateUserplaylistDto_pict.mediaThumbEndpoint = "/thumb/" + data_media_pict.postID;
                }
                CreateUserplaylistDto_pict.mediaType = data_media_pict.mediaType;
              } else if (data_media_pict.mediaType == "image") {
                if (data_media_pict.mediaUri != undefined) {
                  CreateUserplaylistDto_pict.mediaEndpoint = "/pict" + data_media_pict.mediaUri;
                }
                if (data_media_pict.mediaUri != undefined) {
                  CreateUserplaylistDto_pict.mediaThumbEndpoint = "/thumb/" + data_media_pict.postID;
                }
                CreateUserplaylistDto_pict.mediaType = data_media_pict.mediaType;
              }
            }
          }
        }
        CreateUserplaylistDto_pict._id = new mongoose.Types.ObjectId();
        await this.userplaylistService.create(CreateUserplaylistDto_pict);

      }

      //-------------------------------------------INSERT DIARY
      console.log("-------------------------------------------INSERT DIARY");

      var type_diary = null;
      var ceckFriendFollowingFollower_diary = await this.contentEventService.ceckFriendFollowingFollower(data_user.email.toString(), getPost_diary[loopData].email.toString());
      if (await this.utilsService.ceckData(ceckFriendFollowingFollower_diary)) {
        if (ceckFriendFollowingFollower_diary.length == 2) {
          type_diary = "FRIEND";
        } else {
          if (ceckFriendFollowingFollower_diary[0].email == data_user.email.toString()) {
            type_diary = "FOLLOWER";
          } else {
            if (ceckFriendFollowingFollower_diary[0].email == getPost_diary[loopData].email.toString()) {
              type_diary = "FOLLOWING";
            } else {
              type_diary = "PUBLIC";
            }
          }
        }
      } else {
        type_diary = "PUBLIC";
      }

      var isHidden_diary = false;
      if (getPost_diary[loopData].visibility != undefined) {
        if (getPost_diary[loopData].visibility == "FRIEND") {
          if (type_diary == getPost_diary[loopData].visibility) {
            isHidden_diary = false;
          } else {
            isHidden_diary = true;
          }
        } else if (getPost_diary[loopData].visibility == "PRIVATE") {
          type_diary = "PRIVATE";
          if (getPost_diary[loopData].email.toString() == data_user.email.toString()) {
            isHidden_diary = false;
          } else {
            isHidden_diary = true;
          }
        } else {
          isHidden_diary = false;
        }
      }

      var data_media_diary = await this.mediadiariesService.findOnepostID(getPost_diary[loopData].postID.toString());
      if (await this.utilsService.ceckData(data_media_diary)) {
        //Insert Playlist Type Vid
        var CreateUserplaylistDto_diary = new CreateUserplaylistDto();
        CreateUserplaylistDto_diary.userId = Object(data_user._id);
        CreateUserplaylistDto_diary.interestId = interest_db_diary;
        CreateUserplaylistDto_diary.interestIdCount = Count_compare_interest_diary;
        CreateUserplaylistDto_diary.userPostId = Object(id_user_post_diary);
        CreateUserplaylistDto_diary.postType = getPost_diary[loopData].postType;
        CreateUserplaylistDto_diary.mediaId = data_media_diary.mediaID;
        CreateUserplaylistDto_diary.type = type_diary;
        CreateUserplaylistDto_diary.createAt = getPost_diary[loopData].createdAt;
        CreateUserplaylistDto_diary.updatedAt = getPost_diary[loopData].updatedAt;
        CreateUserplaylistDto_diary.isWatched = false;
        CreateUserplaylistDto_diary.isHidden = isHidden_diary;
        CreateUserplaylistDto_diary.postID = (getPost_diary[loopData].postID != undefined) ? getPost_diary[loopData].postID : "";
        CreateUserplaylistDto_diary.expiration = (getPost_diary[loopData].expiration != undefined) ? Number(getPost_diary[loopData].expiration) : 0;
        CreateUserplaylistDto_diary.description = (getPost_diary[loopData].description != undefined) ? getPost_diary[loopData].description : "";
        CreateUserplaylistDto_diary.userBasicData = Object(userbasic_post_diary);
        CreateUserplaylistDto_diary.postData = Object(getPost_diary[loopData]);
        CreateUserplaylistDto_diary.mediaData = Object(data_media_diary);
        CreateUserplaylistDto_diary.mediaData = Object(data_media_diary);
        CreateUserplaylistDto_diary.FRIEND = (type_diary == "FRIEND") ? true : false;
        CreateUserplaylistDto_diary.FOLLOWER = (type_diary == "FOLLOWER" || type_diary == "FRIEND") ? true : false;;
        CreateUserplaylistDto_diary.FOLLOWING = (type_diary == "FOLLOWING" || type_diary == "FRIEND") ? true : false;
        CreateUserplaylistDto_diary.PUBLIC = (type_diary == "PUBLIC" || type_diary == "FRIEND" || type_diary == "FOLLOWER" || type_diary == "FOLLOWING") ? true : false;
        CreateUserplaylistDto_diary.PRIVATE = (type_diary == "PRIVATE") ? true : false;
        if (data_media_diary.viewers != undefined) {
          CreateUserplaylistDto_diary.viewers = data_media_diary.viewers;
        }
        if (await this.utilsService.ceckData(data_media_diary)) {
          if (data_media_diary.apsara != undefined) {
            CreateUserplaylistDto_diary.isApsara = data_media_diary.apsara;
            if (!data_media_diary.apsara) {
              if (data_media_diary.mediaType != undefined) {
                if (data_media_diary.mediaType == "video") {
                  if (data_media_diary.mediaThumb != undefined) {
                    CreateUserplaylistDto_diary.mediaThumbUri = data_media_diary.mediaThumb;
                  }
                  if (data_media_diary.mediaUri != undefined) {
                    CreateUserplaylistDto_diary.mediaEndpoint = "/stream/" + data_media_diary.mediaUri;
                  }
                  if (data_media_diary.postID != undefined) {
                    CreateUserplaylistDto_diary.mediaThumbEndpoint = "/thumb/" + data_media_diary.postID;
                  }
                  CreateUserplaylistDto_diary.mediaType = data_media_diary.mediaType;
                } else if (data_media_diary.mediaType == "image") {
                  if (data_media_diary.mediaUri != undefined) {
                    CreateUserplaylistDto_diary.mediaEndpoint = "/pict" + data_media_diary.mediaUri;
                  }
                  if (data_media_diary.mediaUri != undefined) {
                    CreateUserplaylistDto_diary.mediaThumbEndpoint = "/thumb/" + data_media_diary.postID;
                  }
                  CreateUserplaylistDto_diary.mediaType = data_media_diary.mediaType;
                }
              }
            }
          } else {
            CreateUserplaylistDto_diary.isApsara = false;
            if (data_media_diary.mediaType != undefined) {
              if (data_media_diary.mediaType == "video") {
                if (data_media_diary.mediaThumb != undefined) {
                  CreateUserplaylistDto_diary.mediaThumbUri = data_media_diary.mediaThumb;
                }
                if (data_media_diary.mediaUri != undefined) {
                  CreateUserplaylistDto_diary.mediaEndpoint = "/stream/" + data_media_diary.mediaUri;
                }
                if (data_media_diary.postID != undefined) {
                  CreateUserplaylistDto_diary.mediaThumbEndpoint = "/thumb/" + data_media_diary.postID;
                }
                CreateUserplaylistDto_diary.mediaType = data_media_diary.mediaType;
              } else if (data_media_diary.mediaType == "image") {
                if (data_media_diary.mediaUri != undefined) {
                  CreateUserplaylistDto_diary.mediaEndpoint = "/pict" + data_media_diary.mediaUri;
                }
                if (data_media_diary.mediaUri != undefined) {
                  CreateUserplaylistDto_diary.mediaThumbEndpoint = "/thumb/" + data_media_diary.postID;
                }
                CreateUserplaylistDto_diary.mediaType = data_media_diary.mediaType;
              }
            }
          }
        }
        CreateUserplaylistDto_diary._id = new mongoose.Types.ObjectId();
        await this.userplaylistService.create(CreateUserplaylistDto_diary);
      }

      //-------------------------------------------INSERT STORY
      console.log("-------------------------------------------INSERT STORY");

      var type_story = null;
      var ceckFriendFollowingFollower_story = await this.contentEventService.ceckFriendFollowingFollower(data_user.email.toString(), getPost_story[loopData].email.toString());
      if (await this.utilsService.ceckData(ceckFriendFollowingFollower_story)) {
        if (ceckFriendFollowingFollower_story.length == 2) {
          type_story = "FRIEND";
        } else {
          if (ceckFriendFollowingFollower_story[0].email == data_user.email.toString()) {
            type_story = "FOLLOWER";
          } else {
            if (ceckFriendFollowingFollower_story[0].email == getPost_story[loopData].email.toString()) {
              type_story = "FOLLOWING";
            } else {
              type_story = "PUBLIC";
            }
          }
        }
      } else {
        type_story = "PUBLIC";
      }

      var isHidden_story = false;
      if (getPost_story[loopData].visibility != undefined) {
        if (getPost_story[loopData].visibility == "FRIEND") {
          if (type_story == getPost_story[loopData].visibility) {
            isHidden_story = false;
          } else {
            isHidden_story = true;
          }
        } else if (getPost_story[loopData].visibility == "PRIVATE") {
          type_story = "PRIVATE";
          if (getPost_story[loopData].email.toString() == data_user.email.toString()) {
            isHidden_story = false;
          } else {
            isHidden_story = true;
          }
        } else {
          isHidden_story = false;
        }
      }

      var data_media_story = await this.mediastoriesService.findOnepostID(getPost_story[loopData].postID.toString());
      if (await this.utilsService.ceckData(data_media_story)) {
        //Insert Playlist Type Vid
        var CreateUserplaylistDto_story = new CreateUserplaylistDto();
        CreateUserplaylistDto_story.userId = Object(data_user._id);
        CreateUserplaylistDto_story.interestId = interest_db_story;
        CreateUserplaylistDto_story.interestIdCount = Count_compare_interest_story;
        CreateUserplaylistDto_story.userPostId = Object(id_user_post_story);
        CreateUserplaylistDto_story.postType = getPost_story[loopData].postType;
        CreateUserplaylistDto_story.mediaId = data_media_story.mediaID;
        CreateUserplaylistDto_story.type = type_story;
        CreateUserplaylistDto_story.createAt = getPost_story[loopData].createdAt;
        CreateUserplaylistDto_story.updatedAt = getPost_story[loopData].updatedAt;
        CreateUserplaylistDto_story.isWatched = false;
        CreateUserplaylistDto_story.isHidden = isHidden_story;
        CreateUserplaylistDto_story.postID = (getPost_story[loopData].postID != undefined) ? getPost_story[loopData].postID : "";
        CreateUserplaylistDto_story.expiration = (getPost_story[loopData].expiration != undefined) ? Number(getPost_story[loopData].expiration) : 0;
        CreateUserplaylistDto_story.description = (getPost_story[loopData].description != undefined) ? getPost_story[loopData].description : "";
        CreateUserplaylistDto_story.userBasicData = Object(userbasic_post_story);
        CreateUserplaylistDto_story.postData = Object(getPost_story[loopData]);
        CreateUserplaylistDto_story.mediaData = Object(data_media_story);
        CreateUserplaylistDto_story.mediaData = Object(data_media_story);
        CreateUserplaylistDto_story.FRIEND = (type_story == "FRIEND") ? true : false;
        CreateUserplaylistDto_story.FOLLOWER = (type_story == "FOLLOWER" || type_story == "FRIEND") ? true : false;;
        CreateUserplaylistDto_story.FOLLOWING = (type_story == "FOLLOWING" || type_story == "FRIEND") ? true : false;
        CreateUserplaylistDto_story.PUBLIC = (type_story == "PUBLIC" || type_story == "FRIEND" || type_story == "FOLLOWER" || type_story == "FOLLOWING") ? true : false;
        CreateUserplaylistDto_story.PRIVATE = (type_story == "PRIVATE") ? true : false;
        if (data_media_story.viewers != undefined) {
          CreateUserplaylistDto_story.viewers = data_media_story.viewers;
        }
        if (await this.utilsService.ceckData(data_media_story)) {
          if (data_media_story.apsara != undefined) {
            CreateUserplaylistDto_story.isApsara = data_media_story.apsara;
            if (!data_media_story.apsara) {
              if (data_media_story.mediaType != undefined) {
                if (data_media_story.mediaType == "video") {
                  if (data_media_story.mediaThumb != undefined) {
                    CreateUserplaylistDto_story.mediaThumbUri = data_media_story.mediaThumb;
                  }
                  if (data_media_story.mediaUri != undefined) {
                    CreateUserplaylistDto_story.mediaEndpoint = "/stream/" + data_media_story.mediaUri;
                  }
                  if (data_media_story.postID != undefined) {
                    CreateUserplaylistDto_story.mediaThumbEndpoint = "/thumb/" + data_media_story.postID;
                  }
                  CreateUserplaylistDto_story.mediaType = data_media_story.mediaType;
                } else if (data_media_story.mediaType == "image") {
                  if (data_media_story.mediaUri != undefined) {
                    CreateUserplaylistDto_story.mediaEndpoint = "/pict" + data_media_story.mediaUri;
                  }
                  if (data_media_story.mediaUri != undefined) {
                    CreateUserplaylistDto_story.mediaThumbEndpoint = "/thumb/" + data_media_story.postID;
                  }
                  CreateUserplaylistDto_story.mediaType = data_media_story.mediaType;
                }
              }
            }
          } else {
            CreateUserplaylistDto_story.isApsara = false;
            if (data_media_story.mediaType != undefined) {
              if (data_media_story.mediaType == "video") {
                if (data_media_story.mediaThumb != undefined) {
                  CreateUserplaylistDto_story.mediaThumbUri = data_media_story.mediaThumb;
                }
                if (data_media_story.mediaUri != undefined) {
                  CreateUserplaylistDto_story.mediaEndpoint = "/stream/" + data_media_story.mediaUri;
                }
                if (data_media_story.postID != undefined) {
                  CreateUserplaylistDto_story.mediaThumbEndpoint = "/thumb/" + data_media_story.postID;
                }
                CreateUserplaylistDto_story.mediaType = data_media_story.mediaType;
              } else if (data_media_story.mediaType == "image") {
                if (data_media_story.mediaUri != undefined) {
                  CreateUserplaylistDto_story.mediaEndpoint = "/pict" + data_media_story.mediaUri;
                }
                if (data_media_story.mediaUri != undefined) {
                  CreateUserplaylistDto_story.mediaThumbEndpoint = "/thumb/" + data_media_story.postID;
                }
                CreateUserplaylistDto_story.mediaType = data_media_story.mediaType;
              }
            }
          }
        }
        CreateUserplaylistDto_story._id = new mongoose.Types.ObjectId();
        await this.userplaylistService.create(CreateUserplaylistDto_story);
      }
    }
  }

  async findcontentfilters(keys: string, postType: string, skip: number, limit: number) {

    if (keys !== undefined) {
      const query = await this.PostsModel.aggregate([
        {
          $match: {

            description: {
              $regex: keys, $options: 'i'
            }, postType: postType, visibility: "PUBLIC", active: true
          }
        },


        {
          $addFields: {

            salePrice: { $cmp: ["$saleAmount", 0] }

          },
        },


        {
          $project: {
            refs: { $arrayElemAt: ['$contentMedias', 0] },
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
            postID: '$postID',
            email: '$email',
            postType: '$postType',
            description: '$description',
            title: '$description',
            active: '$active',
            metadata: '$metadata',
            location: '$location',
            tags: '$tags',
            likes: '$likes',
            shares: '$shares',
            reaction: '$reaction',
            comments: '$comments',
            isOwned: '$isOwned',
            views: '$views',
            visibility: '$visibility',
            isViewed:
            {
              $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
            },
            allowComments: '$allowComments',
            isCertified: '$isCertified',
            saleLike: {
              $cond: { if: { $eq: ["$saleLike", -1] }, then: false, else: "$saleLike" }
            },
            saleView: {
              $cond: { if: { $eq: ["$saleView", -1] }, then: false, else: "$saleView" }
            },
            saleAmount: {
              $cond: { if: { $eq: ["$salePrice", -1] }, then: 0, else: "$saleAmount" }
            },
            monetize: {
              $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
            },


          }
        },
        {
          $project: {
            refs: '$refs.$ref',
            idmedia: '$refs.$id',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
            postID: '$postID',
            email: '$email',
            postType: '$postType',
            description: '$description',
            title: '$description',
            active: '$active',
            metadata: '$metadata',
            location: '$location',
            tags: '$tags',
            isOwned: '$isOwned',
            visibility: '$visibility',
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            saleAmount: '$saleAmount',
            monetize: '$monetize',
            refe: '$refs.ref',
            insight: {
              shares: '$shares',
              comments: '$comments',
              reaction: '$reaction',
              views: '$views',
              likes: '$likes',
            },
          }
        },

        {
          $lookup: {
            from: 'mediapicts',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediavideos_data',
          },
        },
        {
          $project: {
            mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
            mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
            mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },
            mediapictPath: '$mediapict.mediaBasePath',
            mediadiariPath: '$mediadiaries.mediaBasePath',
            mediavideoPath: '$mediavideos.mediaBasePath',
            refs: '$refs',
            idmedia: '$idmedia',
            rotate: '$mediadiaries.rotate',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
            postID: '$postID',
            email: '$email',
            postType: '$postType',
            description: '$description',
            title: '$description',
            active: '$active',
            metadata: '$metadata',
            location: '$location',
            tags: '$tags',
            isOwned: '$isOwned',
            visibility: '$visibility',
            privacy: '$privacy',
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            saleAmount: '$saleAmount',
            monetize: '$monetize',
            insight: '$insight',



          }
        },

        {
          $addFields: {

            concats: '/profilepict',
            pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            concatmediapict: '/pict',
            media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


            concatmediadiari: '/stream',
            concatthumbdiari: '/thumb',
            media_diari: '$mediadiaries.mediaUri',

            concatmediavideo: '/stream',
            concatthumbvideo: '/thumb',
            media_video: '$mediavideos.mediaUri'
          },
        },
        {
          $project: {
            rotate: '$mediadiaries.rotate',
            mediaBasePath: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                  { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                  { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
                ],
                default: ''
              }
            },
            mediaUri: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                  { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                  { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
                ],
                default: ''
              }
            },
            mediaType: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                  { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                  { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
                ],
                default: ''
              }
            },

            mediaThumbEndpoint: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                  { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$postID"] }, },
                  { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$postID"] }, }
                ],
                default: ''
              }
            },

            mediaEndpoint: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$postID"] }, },
                  { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$postID"] }, },
                  { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$postID"] }, }
                ],
                default: ''
              }
            },

            mediaThumbUri: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                  { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                  { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
                ],
                default: ''
              }
            },
            apsaraId: {
              $switch: {
                branches: [
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediapicts"
                      ]
                    },
                    then: "$mediapict.apsaraId"
                  },
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediadiaries"
                      ]
                    },
                    then: "$mediadiaries.apsaraId"
                  },
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediavideos"
                      ]
                    },
                    then: "$mediavideos.apsaraId"
                  }
                ],
                default: false
              }
            },
            apsara: {
              $switch: {
                branches: [
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediapicts"
                      ]
                    },
                    then: "$mediapict.apsara"
                  },
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediadiaries"
                      ]
                    },
                    then: "$mediadiaries.apsara"
                  },
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediavideos"
                      ]
                    },
                    then: "$mediavideos.apsara"
                  }
                ],
                default: false
              }
            },
            fullName: '$fullName',
            username: '$auth.username',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
            postID: '$postID',
            email: '$email',
            postType: '$postType',
            description: '$description',
            title: '$description',
            active: '$active',
            metadata: '$metadata',
            location: '$location',
            tags: '$tags',
            isOwned: '$isOwned',
            visibility: '$visibility',
            privacy: '$privacy',
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            saleAmount: '$saleAmount',
            monetize: '$monetize',
            insight: '$insight',

          }
        },
        { $sort: { description: -1 }, },
        { $skip: skip },
        { $limit: limit },
      ]);

      return query;
    } else {
      const query = await this.PostsModel.aggregate([
        {
          $match: {

            postType: postType, visibility: "PUBLIC", active: true

          }
        },


        {
          $addFields: {

            salePrice: { $cmp: ["$saleAmount", 0] }

          },
        },


        {
          $project: {
            refs: { $arrayElemAt: ['$contentMedias', 0] },
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
            postID: '$postID',
            email: '$email',
            postType: '$postType',
            description: '$description',
            title: '$description',
            active: '$active',
            metadata: '$metadata',
            location: '$location',
            tags: '$tags',
            likes: '$likes',
            shares: '$shares',
            reaction: '$reaction',
            comments: '$comments',
            isOwned: '$isOwned',
            views: '$views',
            visibility: '$visibility',
            isViewed:
            {
              $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
            },
            allowComments: '$allowComments',
            isCertified: '$isCertified',
            saleLike: {
              $cond: { if: { $eq: ["$saleLike", -1] }, then: false, else: "$saleLike" }
            },
            saleView: {
              $cond: { if: { $eq: ["$saleView", -1] }, then: false, else: "$saleView" }
            },
            saleAmount: {
              $cond: { if: { $eq: ["$salePrice", -1] }, then: 0, else: "$saleAmount" }
            },
            monetize: {
              $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
            },


          }
        },
        {
          $project: {
            refs: '$refs.$ref',
            idmedia: '$refs.$id',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
            postID: '$postID',
            email: '$email',
            postType: '$postType',
            description: '$description',
            title: '$description',
            active: '$active',
            metadata: '$metadata',
            location: '$location',
            tags: '$tags',
            isOwned: '$isOwned',
            visibility: '$visibility',
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            saleAmount: '$saleAmount',
            monetize: '$monetize',
            refe: '$refs.ref',
            insight: {
              shares: '$shares',
              comments: '$comments',
              reaction: '$reaction',
              views: '$views',
              likes: '$likes',
            },
          }
        },

        {
          $lookup: {
            from: 'mediapicts',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediavideos_data',
          },
        },
        {
          $project: {
            mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
            mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
            mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },
            mediapictPath: '$mediapict.mediaBasePath',
            mediadiariPath: '$mediadiaries.mediaBasePath',
            mediavideoPath: '$mediavideos.mediaBasePath',
            refs: '$refs',
            idmedia: '$idmedia',
            rotate: '$mediadiaries.rotate',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
            postID: '$postID',
            email: '$email',
            postType: '$postType',
            description: '$description',
            title: '$description',
            active: '$active',
            metadata: '$metadata',
            location: '$location',
            tags: '$tags',
            isOwned: '$isOwned',
            visibility: '$visibility',
            privacy: '$privacy',
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            saleAmount: '$saleAmount',
            monetize: '$monetize',
            insight: '$insight',



          }
        },

        {
          $addFields: {

            concats: '/profilepict',
            pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
            concatmediapict: '/pict',
            media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


            concatmediadiari: '/stream',
            concatthumbdiari: '/thumb',
            media_diari: '$mediadiaries.mediaUri',

            concatmediavideo: '/stream',
            concatthumbvideo: '/thumb',
            media_video: '$mediavideos.mediaUri'
          },
        },
        {
          $project: {
            rotate: '$mediadiaries.rotate',
            mediaBasePath: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                  { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                  { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
                ],
                default: ''
              }
            },
            mediaUri: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                  { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                  { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
                ],
                default: ''
              }
            },
            mediaType: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                  { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                  { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
                ],
                default: ''
              }
            },

            mediaThumbEndpoint: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                  { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$postID"] }, },
                  { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$postID"] }, }
                ],
                default: ''
              }
            },

            mediaEndpoint: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$postID"] }, },
                  { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$postID"] }, },
                  { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$postID"] }, }
                ],
                default: ''
              }
            },

            mediaThumbUri: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                  { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                  { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
                ],
                default: ''
              }
            },
            apsaraId: {
              $switch: {
                branches: [
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediapicts"
                      ]
                    },
                    then: "$mediapict.apsaraId"
                  },
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediadiaries"
                      ]
                    },
                    then: "$mediadiaries.apsaraId"
                  },
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediavideos"
                      ]
                    },
                    then: "$mediavideos.apsaraId"
                  }
                ],
                default: false
              }
            },
            apsara: {
              $switch: {
                branches: [
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediapicts"
                      ]
                    },
                    then: "$mediapict.apsara"
                  },
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediadiaries"
                      ]
                    },
                    then: "$mediadiaries.apsara"
                  },
                  {
                    case: {
                      $eq: [
                        "$refs",
                        "mediavideos"
                      ]
                    },
                    then: "$mediavideos.apsara"
                  }
                ],
                default: false
              }
            },
            fullName: '$fullName',
            username: '$auth.username',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
            postID: '$postID',
            email: '$email',
            postType: '$postType',
            description: '$description',
            title: '$description',
            active: '$active',
            metadata: '$metadata',
            location: '$location',
            tags: '$tags',
            isOwned: '$isOwned',
            visibility: '$visibility',
            privacy: '$privacy',
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            saleAmount: '$saleAmount',
            monetize: '$monetize',
            insight: '$insight',

          }
        },
        { $sort: { description: -1 }, },
        { $skip: skip },
        { $limit: limit },
      ]);

      return query;
    }

  }
  async findcontentfilterTags(keys: string, skip: number, limit: number) {

    const query = await this.PostsModel.aggregate([
      {
        $match: {

          tags: {
            $regex: keys, $options: 'i'
          }

        }
      },
      { $sort: { tags: 1 }, },
      { $skip: skip },
      { $limit: limit },
      {
        $group: {
          _id: '$tags',
          total: {
            $sum: 1
          }
        }
      }
    ]);
    return query;
  }
  async findcountfilteTag(keys: string) {
    const query = await this.PostsModel.aggregate([
      {
        $match: {

          tags: {
            $regex: keys, $options: 'i'
          }


        }
      },
      {
        $group: {
          _id: null,
          totalpost: {
            $sum: 1
          }
        }
      }
    ]);
    return query;
  }
  async findcontentAllTags(skip: number, limit: number) {

    const query = await this.PostsModel.aggregate([


      {
        $group: {
          _id: '$tags',
          total: {
            $sum: 1
          }
        }
      },
      { $sort: { tags: 1 }, },
      { $skip: skip },
      { $limit: limit },
    ]);
    return query;
  }
  async findcountfilteTagAll() {
    const query = await this.PostsModel.aggregate([
      {
        $group: {
          _id: null,
          totalpost: {
            $sum: 1
          }
        }
      }
    ]);
    return query;
  }
  async findcountfilterall(keys: string, postType: string) {

    if (keys !== undefined) {
      const query = await this.PostsModel.aggregate([
        {
          $match: {

            description: {
              $regex: keys, $options: 'i'
            }, postType: postType, visibility: "PUBLIC", active: true
          }
        },
        {
          $group: {
            _id: null,
            totalpost: {
              $sum: 1
            }
          }
        }
      ]);
      return query;
    } else {
      const query = await this.PostsModel.aggregate([
        {
          $match: {

            postType: postType, visibility: "PUBLIC", active: true
          }
        },
        {
          $group: {
            _id: null,
            totalpost: {
              $sum: 1
            }
          }
        }
      ]);
      return query;
    }
  }


  async findhistorySell(postID: string) {

    const query = await this.PostsModel.aggregate([
      {
        $match: {
          postID: postID

        }
      },
      {
        $addFields: {

          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },


      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          likes: '$likes',
          shares: '$shares',
          reaction: '$reaction',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          visibility: '$visibility',
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          isCertified: '$isCertified',
          saleLike: {
            $cond: { if: { $eq: ["$saleLike", -1] }, then: false, else: "$saleLike" }
          },
          saleView: {
            $cond: { if: { $eq: ["$saleView", -1] }, then: false, else: "$saleView" }
          },
          saleAmount: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: 0, else: "$saleAmount" }
          },
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },


        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          isOwned: '$isOwned',
          visibility: '$visibility',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          isCertified: '$isCertified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',
          refe: '$refs.ref',
          insight: {
            shares: '$shares',
            comments: '$comments',
            reaction: '$reaction',
            views: '$views',
            likes: '$likes',
          },
        }
      },

      {
        $lookup: {
          from: 'mediapicts',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
      {
        $project: {
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          isOwned: '$isOwned',
          visibility: '$visibility',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          isCertified: '$isCertified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',
          insight: '$insight',



        }
      },

      {
        $addFields: {

          concats: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          concatmediapict: '/pict',
          media_pict: { $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari: '/stream',
          concatthumbdiari: '/thumb',
          media_diari: '$mediadiaries.mediaUri',

          concatmediavideo: '/stream',
          concatthumbvideo: '/thumb',
          media_video: '$mediavideos.mediaUri'
        },
      },
      {
        $project: {
          rotate: '$mediadiaries.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaBasePath' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaBasePath' }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaUri' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaUri' }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediapict.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaType' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaType' }
              ],
              default: ''
            }
          },

          mediaThumbEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$postID"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$postID"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$postID"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$postID"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$postID"] }, }
              ],
              default: ''
            }
          },

          mediaThumbUri: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': '$mediadiaries.mediaThumb' },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': '$mediavideos.mediaThumb' }
              ],
              default: ''
            }
          },
          apsaraId: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediapicts"
                    ]
                  },
                  then: "$mediapict.apsaraId"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediadiaries"
                    ]
                  },
                  then: "$mediadiaries.apsaraId"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediavideos"
                    ]
                  },
                  then: "$mediavideos.apsaraId"
                }
              ],
              default: false
            }
          },
          apsara: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediapicts"
                    ]
                  },
                  then: "$mediapict.apsara"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediadiaries"
                    ]
                  },
                  then: "$mediadiaries.apsara"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediavideos"
                    ]
                  },
                  then: "$mediavideos.apsara"
                }
              ],
              default: false
            }
          },
          fullName: '$fullName',
          username: '$auth.username',
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          postID: '$postID',
          email: '$email',
          postType: '$postType',
          description: '$description',
          title: '$description',
          active: '$active',
          metadata: '$metadata',
          location: '$location',
          tags: '$tags',
          isOwned: '$isOwned',
          visibility: '$visibility',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          isCertified: '$isCertified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',
          insight: '$insight',

        }
      },
      { $sort: { createdAt: -1 }, },

    ]);
    return query;
  }

  async findreport(keys: string, postType: string, startdate: string, enddate: string, page: number, limit: number, startreport: number, endreport: number, status: any[], reason: any[], descending: boolean) {
    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
    var order = null;

    if (descending === true) {
      order = -1;
    } else {
      order = 1;
    }
    var pipeline = [];
    pipeline = [{
      $lookup: {
        from: 'userbasics',
        localField: 'email',
        foreignField: 'email',
        as: 'basicdata',

      }
    },
    {
      $addFields: {

        'profilepictid': {
          $arrayElemAt: ['$basicdata.profilePict.$id', 0]
        },


      }
    },
    {
      $lookup: {
        from: 'mediaprofilepicts',
        localField: 'profilepictid',
        foreignField: '_id',
        as: 'avatardata',

      }
    },
    {
      $addFields: {
        'avatar': {
          $arrayElemAt: ['$avatardata', 0]
        },
        'basic': {
          $arrayElemAt: ['$basicdata', 0]
        },

      }
    },
    {
      $project: {
        refs: {
          $arrayElemAt: ['$contentMedias', 0]
        },
        createdAt: 1,
        updatedAt: 1,
        postID: 1,
        email: 1,
        postType: 1,
        description: 1,
        title: 1,
        active: 1,
        contentModeration: 1,
        contentModerationResponse: 1,
        reportedStatus: 1,
        reportedUserCount: 1,
        reportedUserHandle: 1,
        reportedUser: 1,
        fullName: '$basic.fullName',
        avatar: {
          mediaBasePath: '$avatar.mediaBasePath',
          mediaUri: '$avatar.mediaUri',
          mediaType: '$avatar.mediaType',
          mediaEndpoint: '$avatar.fsTargetUri',
          medreplace: {
            $replaceOne: {
              input: "$avatar.mediaUri",
              find: "_0001.jpeg",
              replacement: ""
            }
          },

        },
      }
    },
    {
      $project: {
        refs: '$refs.$ref',
        idmedia: '$refs.$id',
        createdAt: 1,
        updatedAt: 1,
        postID: 1,
        email: 1,
        fullName: 1,
        postType: 1,
        description: 1,
        title: 1,
        active: 1,
        contentModeration: 1,
        contentModerationResponse: 1,
        reportedStatus: 1,
        reportedUserCount: 1,
        reportedUserHandle: 1,
        reportedUser: 1,
        avatar: 1
      }
    },
    {
      $addFields: {

        concat: '/profilepict',
        pict: { $replaceOne: { input: "$avatar.mediaUri", find: "_0001.jpeg", replacement: "" } },
      },
    },
    {
      $lookup: {
        from: 'mediapicts',
        localField: 'idmedia',
        foreignField: '_id',
        as: 'mediaPict_data',

      },

    },
    {
      $lookup: {
        from: 'mediadiaries',
        localField: 'idmedia',
        foreignField: '_id',
        as: 'mediadiaries_data',

      },

    },
    {
      $lookup: {
        from: 'mediavideos',
        localField: 'idmedia',
        foreignField: '_id',
        as: 'mediavideos_data',

      },

    },
    {
      $project: {
        mediapict: {
          $arrayElemAt: ['$mediaPict_data', 0]
        },
        mediadiaries: {
          $arrayElemAt: ['$mediadiaries_data', 0]
        },
        mediavideos: {
          $arrayElemAt: ['$mediavideos_data', 0]
        },
        mediapictPath: '$mediapict.mediaBasePath',
        mediadiariPath: '$mediadiaries.mediaBasePath',
        mediavideoPath: '$mediavideos.mediaBasePath',
        refs: '$refs',
        idmedia: 1,
        createdAt: 1,
        updatedAt: 1,
        postID: 1,
        email: 1,
        fullName: 1,
        postType: 1,
        description: 1,
        title: 1,
        active: 1,
        contentModeration: 1,
        contentModerationResponse: 1,
        reportedStatus: 1,
        reportedUserCount: 1,
        reportedUserHandle: 1,
        reportedUser: 1,
        avatar: {
          mediaBasePath: '$profilpict.mediaBasePath',
          mediaUri: '$profilpict.mediaUri',
          mediaType: '$profilpict.mediaType',
          mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

        },
      }
    },
    {
      $addFields: {

        concatmediapict: '/pict',
        media_pict: {
          $replaceOne: {
            input: "$mediapict.mediaUri",
            find: "_0001.jpeg",
            replacement: ""
          }
        },
        concatmediadiari: '/stream',
        concatthumbdiari: '/thumb',
        media_diari: '$mediadiaries.mediaUri',
        concatmediavideo: '/stream',
        concatthumbvideo: '/thumb',
        media_video: '$mediavideos.mediaUri'
      },

    },
    {
      $project: {
        rotate: '$mediadiaries.rotate',
        mediaBasePath: {
          $switch: {
            branches: [
              {
                'case': {
                  '$eq': ['$refs', 'mediapicts']
                },
                'then': '$mediapict.mediaBasePath'
              },
              {
                'case': {
                  '$eq': ['$refs', 'mediadiaries']
                },
                'then': '$mediadiaries.mediaBasePath'
              },
              {
                'case': {
                  '$eq': ['$refs', 'mediavideos']
                },
                'then': '$mediavideos.mediaBasePath'
              }
            ],
            default: ''
          }
        },
        mediaUri: {
          $switch: {
            branches: [
              {
                'case': {
                  '$eq': ['$refs', 'mediapicts']
                },
                'then': '$mediapict.mediaUri'
              },
              {
                'case': {
                  '$eq': ['$refs', 'mediadiaries']
                },
                'then': '$mediadiaries.mediaUri'
              },
              {
                'case': {
                  '$eq': ['$refs', 'mediavideos']
                },
                'then': '$mediavideos.mediaUri'
              }
            ],
            default: ''
          }
        },
        mediaType: {
          $switch: {
            branches: [
              {
                'case': {
                  '$eq': ['$refs', 'mediapicts']
                },
                'then': '$mediapict.mediaType'
              },
              {
                'case': {
                  '$eq': ['$refs', 'mediadiaries']
                },
                'then': '$mediadiaries.mediaType'
              },
              {
                'case': {
                  '$eq': ['$refs', 'mediavideos']
                },
                'then': '$mediavideos.mediaType'
              }
            ],
            default: ''
          }
        },
        mediaThumbEndpoint: {
          $switch: {
            branches: [
              {
                'case': {
                  '$eq': ['$refs', 'mediapicts']
                },
                'then': '$mediadiaries.mediaThumb'
              },
              {
                'case': {
                  '$eq': ['$refs', 'mediadiaries']
                },
                'then': {
                  $concat: ["$concatthumbdiari", "/", "$postID"]
                },

              },
              {
                'case': {
                  '$eq': ['$refs', 'mediavideos']
                },
                'then': {
                  $concat: ["$concatthumbvideo", "/", "$postID"]
                },

              }
            ],
            default: ''
          }
        },
        mediaEndpoint: {
          $switch: {
            branches: [
              {
                'case': {
                  '$eq': ['$refs', 'mediapicts']
                },
                'then': {
                  $concat: ["$concatmediapict", "/", "$postID"]
                },

              },
              {
                'case': {
                  '$eq': ['$refs', 'mediadiaries']
                },
                'then': {
                  $concat: ["$concatmediadiari", "/", "$postID"]
                },

              },
              {
                'case': {
                  '$eq': ['$refs', 'mediavideos']
                },
                'then': {
                  $concat: ["$concatmediavideo", "/", "$postID"]
                },

              }
            ],
            default: ''
          }
        },
        mediaThumbUri: {
          $switch: {
            branches: [
              {
                'case': {
                  '$eq': ['$refs', 'mediapicts']
                },
                'then': '$mediadiaries.mediaThumb'
              },
              {
                'case': {
                  '$eq': ['$refs', 'mediadiaries']
                },
                'then': '$mediadiaries.mediaThumb'
              },
              {
                'case': {
                  '$eq': ['$refs', 'mediavideos']
                },
                'then': '$mediavideos.mediaThumb'
              }
            ],
            default: ''
          }
        },
        apsaraId: {
          $switch: {
            branches: [
              {
                case: {
                  $eq: [
                    "$refs",
                    "mediapicts"
                  ]
                },
                then: "$mediapict.apsaraId"
              },
              {
                case: {
                  $eq: [
                    "$refs",
                    "mediadiaries"
                  ]
                },
                then: "$mediadiaries.apsaraId"
              },
              {
                case: {
                  $eq: [
                    "$refs",
                    "mediavideos"
                  ]
                },
                then: "$mediavideos.apsaraId"
              }
            ],
            default: ""
          }
        },
        idmedia: '$idmedia',
        apsara: {
          $switch: {
            branches: [
              {
                case: {
                  $eq: [
                    "$refs",
                    "mediapicts"
                  ]
                },
                then: "$mediapict.apsara"
              },
              {
                case: {
                  $eq: [
                    "$refs",
                    "mediadiaries"
                  ]
                },
                then: "$mediadiaries.apsara"
              },
              {
                case: {
                  $eq: [
                    "$refs",
                    "mediavideos"
                  ]
                },
                then: "$mediavideos.apsara"
              }
            ],
            default: false
          }
        },
        createdAt: 1,
        updatedAt: 1,
        postID: 1,
        email: 1,
        fullName: 1,
        postType: 1,
        description: 1,
        title: 1,
        active: 1,
        contentModeration: 1,
        contentModerationResponse: 1,
        reportedStatus: 1,
        reportedUserCount: 1,
        reportedUser: 1,
        avatar: 1,
        reportedUserHandle: 1,
        reportReasonIdLast: {
          $last: "$reportedUser.reportReasonId"
        },
        reasonLast: {
          $last: "$reportedUser.description"
        },
        lastAppeal: {
          $cond: {
            if: {
              $or: [{
                $eq: ["$reportedUserHandle.reason", null]
              }, {
                $eq: ["$reportedUserHandle.reason", ""]
              }, {
                $eq: ["$reportedUserHandle.reason", "Lainnya"]
              }]
            },
            then: "Lainnya",
            else: {
              $last: "$reportedUserHandle.reason"
            }
          },

        },
        createdAtReportLast: {
          $last: "$reportedUser.createdAt"
        },
        statusLast: {
          $cond: {
            if: {
              $or: [{
                $eq: ["$reportedUserHandle", null]
              }, {
                $eq: ["$reportedUserHandle", ""]
              }, {
                $eq: ["$reportedUserHandle", []]
              }]
            },
            then: "BARU",
            else: {
              $last: "$reportedUserHandle.status"
            }
          },

        },

      }
    },
    {
      $project: {
        rotate: 1,
        mediaBasePath: 1,
        mediaUri: 1,
        mediaType: 1,
        mediaThumbEndpoint: 1,
        mediaEndpoint: 1,
        mediaThumbUri: 1,
        apsaraId: 1,
        idmedia: 1,
        apsara: 1,
        createdAt: 1,
        updatedAt: 1,
        postID: 1,
        email: 1,
        fullName: 1,
        postType: 1,
        description: 1,
        title: 1,
        active: 1,
        contentModeration: 1,
        contentModerationResponse: 1,
        reportedStatus: 1,
        reportedUserCount: 1,
        reportedUser: 1,
        avatar: 1,
        reportedUserHandle: 1,
        reportReasonIdLast: 1,
        reasonLast: 1,
        createdAtReportLast: 1,
        statusLast: 1,
        lastAppeal: 1,
        reasonLastAppeal: {
          $cond: {
            if: {
              $or: [{
                $eq: ["$lastAppeal", null]
              }, {
                $eq: ["$lastAppeal", ""]
              }, {
                $eq: ["$lastAppeal", "Lainnya"]
              }]
            },
            then: "Lainnya",
            else: {
              $last: "$reportedUserHandle.reason"
            }
          },

        },
        reportStatusLast: {
          $cond: {
            if: {
              $or: [{
                $eq: ["$statusLast", null]
              }, {
                $eq: ["$statusLast", ""]
              }, {
                $eq: ["$statusLast", []]
              }, {
                $eq: ["$statusLast", "BARU"]
              }]
            },
            then: "BARU",
            else: {
              $last: "$reportedUserHandle.status"
            }
          },

        },

      }
    },
    {
      $project: {
        rotate: 1,
        mediaBasePath: 1,
        mediaUri: 1,
        mediaType: 1,
        mediaThumbEndpoint: 1,
        mediaEndpoint: 1,
        mediaThumbUri: 1,
        apsaraId: 1,
        idmedia: 1,
        apsara: 1,
        createdAt: 1,
        updatedAt: 1,
        postID: 1,
        email: 1,
        fullName: 1,
        postType: 1,
        description: 1,
        title: 1,
        active: 1,
        contentModeration: 1,
        contentModerationResponse: 1,
        reportedStatus: 1,
        reportedUserCount: 1,
        reportedUser: 1,
        reportedUserHandle: 1,
        reportReasonIdLast: 1,
        reasonLast: 1,
        createdAtReportLast: 1,
        statusLast: 1,
        reportStatusLast: 1,
        reasonLastAppeal: 1,
        avatar: 1,


      }
    },
    {
      $match: {
        reportedUser: {
          $ne: null
        },
        reportReasonIdLast: {
          $ne: null
        },
        active: true
      }
    },


    ];

    if (keys && keys !== undefined) {

      pipeline.push({
        $match: {
          description: {
            $regex: keys,
            $options: 'i'
          },

        }
      },);

    }

    if (postType && postType !== undefined) {
      pipeline.push({
        $match: {
          postType: postType

        }
      },);
    }
    if (startdate && startdate !== undefined) {
      pipeline.push({ $match: { createdAtReportLast: { "$gte": startdate } } });
    }
    if (enddate && enddate !== undefined) {
      pipeline.push({ $match: { createdAtReportLast: { "$lte": dateend } } });
    }
    if (startreport && startreport !== undefined) {
      pipeline.push({ $match: { reportedUserCount: { "$gte": startreport } } });
    }
    if (endreport && endreport !== undefined) {
      pipeline.push({ $match: { reportedUserCount: { "$lte": endreport } } });
    }

    if (status && status !== undefined) {

      pipeline.push(
        {
          $match: {
            $or: [
              {
                reportStatusLast: {
                  $in: status
                }
              },

            ]
          }
        },
      );

    }
    if (reason && reason !== undefined) {

      let reasonsleng = reason.length;
      let arrayReason = [];
      for (var i = 0; i < reasonsleng; i++) {
        var id = reason[i];
        var idreason = mongoose.Types.ObjectId(id);
        arrayReason.push(idreason);
      }
      pipeline.push(
        {
          $match: {
            $or: [
              {
                reportReasonIdLast: {
                  $in: arrayReason
                }
              },

            ]
          }
        });

    }
    pipeline.push({
      $sort: {
        createdAtReportLast: order
      },

    });
    if (page > 0) {
      pipeline.push({ $skip: (page * limit) });
    }
    if (limit > 0) {
      pipeline.push({ $limit: limit });
    }
    let query = await this.PostsModel.aggregate(pipeline);

    return query;
  }


  async findreportdetail(postID: string, iduser: string) {

    let query = await this.PostsModel.aggregate([

      {
        $match: {
          iduserbuyer: iduser,
          postID: postID
        }
      },

      {
        $addFields: {
          type: 'Buy',
          jenis: "$type",

        },
      },
      {
        $lookup: {
          from: "userbasics",
          localField: "iduserbuyer",
          foreignField: "_id",
          as: "userbasics_data"
        }
      }, {
        $lookup: {
          from: "posts",
          localField: "postid",
          foreignField: "postID",
          as: "post_data"
        }
      }, {
        $lookup: {
          from: "mediapicts",
          localField: "post_data.contentMedias.$id",
          foreignField: "_id",
          as: "mediaPict_data"
        }
      }, {
        $lookup: {
          from: "mediadiaries",
          localField: "post_data.contentMedias.$id",
          foreignField: "_id",
          as: "mediadiaries_data"
        }
      }, {
        $lookup: {
          from: "mediavideos",
          localField: "post_data.contentMedias.$id",
          foreignField: "_id",
          as: "mediavideos_data"
        }
      },
      {
        $lookup: {
          from: "userbasics",
          localField: "idusersell",
          foreignField: "_id",
          as: "userbasics_sell"
        }
      },
      {
        $project: {
          iduser: "$iduserbuyer",
          type: "$type",
          jenis: "$jenis",
          timestamp: "$timestamp",
          description: "$description",
          noinvoice: "$noinvoice",
          nova: "$nova",
          expiredtimeva: "$expiredtimeva",
          salelike: "$salelike",
          saleview: "$saleview",
          bank: "$bank",
          amount: "$amount",
          totalamount: "$totalamount",
          status: "$status",
          user: {
            $arrayElemAt: [
              "$userbasics_data",
              0
            ]
          },
          usersell: {
            $arrayElemAt: [
              "$userbasics_sell",
              0
            ]
          },
          postdata: {
            $arrayElemAt: [
              "$post_data",
              0
            ]
          },
          mediapict: {
            $arrayElemAt: [
              "$mediaPict_data",
              0
            ]
          },
          mediadiaries: {
            $arrayElemAt: [
              "$mediadiaries_data",
              0
            ]
          },
          mediavideos: {
            $arrayElemAt: [
              "$mediavideos_data",
              0
            ]
          }
        }
      }, {
        $project: {
          contentMedias: "$postdata.contentMedias",
          iduser: "$iduser",
          type: "$type",
          jenis: "$jenis",
          timestamp: "$timestamp",
          description: "$description",
          noinvoice: "$noinvoice",
          nova: "$nova",
          expiredtimeva: "$expiredtimeva",
          salelike: "$salelike",
          saleview: "$saleview",
          bank: "$bank",
          amount: "$amount",
          totalamount: "$totalamount",
          status: "$status",
          fullName: "$user.fullName",
          email: "$user.email",
          penjual: "$usersell.fullName",
          emailpenjual: "$usersell.email",
          postID: "$postdata.postID",
          postType: "$postdata.postType",
          descriptionContent: '$postdata.description',
          title: '$postdata.description',
          mediapict: "$mediapict",
          mediadiaries: "$mediadiaries",
          mediavideos: "$mediavideos",
          mediapictPath: "$mediapict.mediaBasePath",
          mediadiariPath: "$mediadiaries.mediaBasePath",
          mediavideoPath: "$mediavideos.mediaBasePath"
        }
      }, {
        $project: {
          refs: {
            $arrayElemAt: [
              "$contentMedias",
              0
            ]
          },
          iduser: "$iduser",
          type: "$type",
          jenis: "$jenis",
          timestamp: "$timestamp",
          description: "$description",
          noinvoice: "$noinvoice",
          nova: "$nova",
          expiredtimeva: "$expiredtimeva",
          salelike: "$salelike",
          saleview: "$saleview",
          bank: "$bank",
          amount: "$amount",
          totalamount: "$totalamount",
          status: "$status",
          fullName: "$fullName",
          email: "$email",
          penjual: "$penjual",
          emailpenjual: "$emailpenjual",
          postID: "$postID",
          postType: "$postType",
          descriptionContent: '$descriptionContent',
          title: '$title',
          mediapict: "$mediapict",
          mediadiaries: "$mediadiaries",
          mediavideos: "$mediavideos",
          mediapictPath: "$mediapictPath",
          mediadiariPath: "$mediadiariPath",
          mediavideoPath: "$mediavideoPath"
        }
      }, {
        $project: {
          refs: "$refs.$ref",
          iduser: "$iduser",
          type: "$type",
          jenis: "$jenis",
          timestamp: "$timestamp",
          description: "$description",
          noinvoice: "$noinvoice",
          nova: "$nova",
          expiredtimeva: "$expiredtimeva",
          salelike: "$salelike",
          saleview: "$saleview",
          bank: "$bank",
          amount: "$amount",
          totalamount: "$totalamount",
          status: "$status",
          fullName: "$fullName",
          email: "$email",
          penjual: "$penjual",
          emailpenjual: "$emailpenjual",
          postID: "$postID",
          postType: "$postType",
          descriptionContent: '$descriptionContent',
          title: '$title',
          mediapict: "$mediapict",
          mediadiaries: "$mediadiaries",
          mediavideos: "$mediavideos",
          mediapictPath: "$mediapictPath",
          mediadiariPath: "$mediadiariPath",
          mediavideoPath: "$mediavideoPath"
        }
      }, {
        $project: {
          refs: "$refs",
          iduser: "$iduser",
          type: "$type",
          jenis: "$jenis",
          timestamp: "$timestamp",
          description: "$description",
          noinvoice: "$noinvoice",
          nova: "$nova",
          expiredtimeva: "$expiredtimeva",
          salelike: "$salelike",
          saleview: "$saleview",
          bank: "$bank",
          amount: "$amount",
          totalamount: "$totalamount",
          status: "$status",
          fullName: "$fullName",
          email: "$email",
          penjual: "$penjual",
          emailpenjual: "$emailpenjual",
          postID: "$postID",
          postType: "$postType",
          descriptionContent: '$descriptionContent',
          title: '$title',
          mediapict: "$mediapict",
          mediadiaries: "$mediadiaries",
          mediavideos: "$mediavideos",
          mediapictPath: "$mediapictPath",
          mediadiariPath: "$mediadiariPath",
          mediavideoPath: "$mediavideoPath"
        }
      }, {
        $addFields: {
          concatmediapict: "/pict",
          "media_pict": {
            $replaceOne: {
              input: "$mediapict.mediaUri",
              find: "_0001.jpeg",
              replacement: ""
            }
          },
          concatmediadiari: "/stream",
          concatthumbdiari: "/thumb",
          "media_diari": "$mediadiaries.mediaUri",
          concatmediavideo: "/stream",
          concatthumbvideo: "/thumb",
          "media_video": "$mediavideos.mediaUri"
        }
      }, {
        $project: {

          iduser: "$iduser",
          type: "$type",
          jenis: "$jenis",
          timestamp: "$timestamp",
          description: "$description",
          noinvoice: "$noinvoice",
          nova: "$nova",
          expiredtimeva: "$expiredtimeva",
          salelike: "$salelike",
          saleview: "$saleview",
          bank: "$bank",
          amount: "$amount",
          totalamount: "$totalamount",
          status: "$status",
          fullName: "$fullName",
          email: "$email",
          penjual: "$penjual",
          emailpenjual: "$emailpenjual",
          postID: "$postID",
          postType: "$postType",
          descriptionContent: '$descriptionContent',
          title: '$title',
          mediaBasePath: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediapicts"
                    ]
                  },
                  then: "$mediapict.mediaBasePath"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediadiaries"
                    ]
                  },
                  then: "$mediadiaries.mediaBasePath"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediavideos"
                    ]
                  },
                  then: "$mediavideos.mediaBasePath"
                }
              ],
              default: ""
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediapicts"
                    ]
                  },
                  then: "$mediapict.mediaUri"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediadiaries"
                    ]
                  },
                  then: "$mediadiaries.mediaUri"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediavideos"
                    ]
                  },
                  then: "$mediavideos.mediaUri"
                }
              ],
              default: ""
            }
          },
          mediaType: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediapicts"
                    ]
                  },
                  then: "$mediapict.mediaType"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediadiaries"
                    ]
                  },
                  then: "$mediadiaries.mediaType"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediavideos"
                    ]
                  },
                  then: "$mediavideos.mediaType"
                }
              ],
              default: ""
            }
          },
          mediaThumbEndpoint: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediapicts"
                    ]
                  },
                  then: "$mediadiaries.mediaThumb"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediadiaries"
                    ]
                  },
                  then: {
                    $concat: [
                      "$concatthumbdiari",
                      "/",
                      "$postID"
                    ]
                  }
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediavideos"
                    ]
                  },
                  then: {
                    $concat: [
                      "$concatthumbvideo",
                      "/",
                      "$postID"
                    ]
                  }
                }
              ],
              default: ""
            }
          },
          mediaEndpoint: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediapicts"
                    ]
                  },
                  then: {
                    $concat: [
                      "$concatmediapict",
                      "/",
                      "$postID"
                    ]
                  }
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediadiaries"
                    ]
                  },
                  then: {
                    $concat: [
                      "$concatmediadiari",
                      "/",
                      "$postID"
                    ]
                  }
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediavideos"
                    ]
                  },
                  then: {
                    $concat: [
                      "$concatmediavideo",
                      "/",
                      "$postID"
                    ]
                  }
                }
              ],
              default: ""
            }
          },
          mediaThumbUri: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediapicts"
                    ]
                  },
                  then: "$mediadiaries.mediaThumb"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediadiaries"
                    ]
                  },
                  then: "$mediadiaries.mediaThumb"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediavideos"
                    ]
                  },
                  then: "$mediavideos.mediaThumb"
                }
              ],
              default: ""
            }
          },
          apsaraId: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediapicts"
                    ]
                  },
                  then: "$mediapict.apsaraId"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediadiaries"
                    ]
                  },
                  then: "$mediadiaries.apsaraId"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediavideos"
                    ]
                  },
                  then: "$mediavideos.apsaraId"
                }
              ],
              default: ""
            }
          },
          apsara: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediapicts"
                    ]
                  },
                  then: "$mediapict.apsara"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediadiaries"
                    ]
                  },
                  then: "$mediadiaries.apsara"
                },
                {
                  case: {
                    $eq: [
                      "$refs",
                      "mediavideos"
                    ]
                  },
                  then: "$mediavideos.apsara"
                }
              ],
              default: false
            }
          },
        }
      },

    ]);

    return query;
  }


  async findreportuserdetail(postID: string) {
    let query = await this.PostsModel.aggregate([

      {
        $lookup: {
          from: 'userbasics',
          localField: 'email',
          foreignField: 'email',
          as: 'basicdata',

        }
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'email',
          foreignField: 'email',
          as: 'authdata',

        }
      },

      {
        $addFields: {
          'salePrice': {
            $cmp: ["$saleAmount", 0]
          },
          'komen': {
            $cmp: ["$comments", 0]
          },
          'auth': {
            $arrayElemAt: ['$authdata', 0]
          },
          'basic': {
            $arrayElemAt: ['$basicdata', 0]
          },
          'profilepictid': {
            $arrayElemAt: ['$basicdata.profilePict.$id', 0]
          },
          'proofpictid': {
            $arrayElemAt: ['$basicdata.proofPict.$id', 0]
          },
          'insightid': {
            $arrayElemAt: ['$basicdata.insight.$id', 0]
          },
          'mediaid': {
            $arrayElemAt: ['$contentMedias.$id', 0]
          },
          'mediaref': {
            $arrayElemAt: ['$contentMedias.$ref', 0]
          },
          'isViewed': {
            '$cond': {
              if: {
                '$eq': ['$views', 0]
              },
              then: false,
              else: true
            }
          },

        }
      },
      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilepictid',
          foreignField: '_id',
          as: 'avatardata',

        }
      },
      {
        "$lookup": {
          from: "mediaproofpicts",
          as: "proofpict",
          let: {
            local_id: '$proofpictid'
          },
          pipeline: [
            {
              $match:
              {


                $expr: {
                  $eq: ['$_id', '$$local_id']
                }
              }
            },
            {
              $project: {
                createdAt: '$createdAt',
                nama: '$nama'
              }
            }
          ],

        }
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insightid',
          foreignField: '_id',
          as: 'insightdata',

        }
      },
      {
        $lookup: {
          from: 'mediapicts',
          localField: 'mediaid',
          foreignField: '_id',
          as: 'picturedata',

        }
      },
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'mediaid',
          foreignField: '_id',
          as: 'diarydata',

        }
      },
      {
        $lookup: {
          from: 'mediavideos',
          localField: 'mediaid',
          foreignField: '_id',
          as: 'videodata',

        }
      },
      {
        $addFields: {
          'avatar': {
            $arrayElemAt: ['$avatardata', 0]
          },
          'basic': {
            $arrayElemAt: ['$basicdata', 0]
          },
          'insight': {
            $arrayElemAt: ['$insightdata', 0]
          },
          'picture': {
            $arrayElemAt: ['$picturedata', 0]
          },
          'diary': {
            $arrayElemAt: ['$diarydata', 0]
          },
          'video': {
            $arrayElemAt: ['$videodata', 0]
          },

        }
      },
      {
        $addFields: {
          pathavatar: '/profilepict',
          pathpicture: '/pict',
          mediapicture: {
            $replaceOne: {
              input: "$picture.mediaUri",
              find: "_0001.jpeg",
              replacement: ""
            }
          },
          pathdiary: '/stream',
          paththumbdiary: '/thumb',
          mediadiary: '$diary.mediaUri',
          pathvideo: '/stream',
          paththumbvideo: '/thumb',
          mediavideo: '$video.mediaUri'
        }
      },
      {
        $project: {
          _id: 1,
          insight: {
            shares: '$insight.shares',
            followers: '$insight.followers',
            comments: '$insight.comments',
            followings: '$insight.followings',
            reactions: '$insight.reactions',
            posts: '$insight.posts',
            views: '$insight.views',
            likes: '$insight.likes'
          },
          avatar: {
            mediaBasePath: '$avatar.mediaBasePath',
            mediaUri: '$avatar.mediaUri',
            mediaType: '$avatar.mediaType',
            mediaEndpoint: '$avatar.fsTargetUri',
            medreplace: {
              $replaceOne: {
                input: "$avatar.mediaUri",
                find: "_0001.jpeg",
                replacement: ""
              }
            },

          },
          fullName: "$basic.fullName",
          proofpict: 1,
          username: "$auth.username",
          privacy: {
            isPostPrivate: '$basic.isPostPrivate',
            isCelebrity: '$basic.isCelebrity',
            isPrivate: '$basic.isPrivate'
          },
          createdAt: 1,
          updatedAt: 1,
          postID: 1,
          email: 1,
          postType: 1,
          description: 1,
          title: 1,
          active: 1,
          metadata: 1,
          location: 1,
          visibility: 1,
          tags: 1,
          likes: 1,
          views: 1,
          shares: 1,
          komen: 1,
          isOwned: 1,
          tagPeople: 1,
          reportedUserCount: 1,
          reportedUser: 1,
          isIdVerified: '$basic.isIdVerified',
          reportedUserHandle: 1,
          reportedStatus: 1,
          statusUser:
          {
            $cond: {
              if: {
                $eq: ["$basic.isIdVerified", true]
              },
              then: "PREMIUM",
              else: "BASIC"
            }
          },

          isViewed: '$isViewed',
          allowComments: 1,
          isSafe: 1,
          saleLike: 1,
          saleView: 1,
          monetize: {
            $cond: {
              if: {
                $eq: ["$salePrice", - 1]
              },
              then: false,
              else: true
            }
          },
          comments: {
            $cond: {
              if: {
                $eq: ["$komen", - 1]
              },
              then: 0,
              else: '$comments'
            }
          },
          salePrice: '$salePrice',
          saleAmount: {
            $cond: {
              if: {
                $eq: ["$salePrice", - 1]
              },
              then: 0,
              else: "$saleAmount"
            }
          },
          mediaref: "$mediaref",
          rotate: '$diary.rotate',
          mediaBasePath: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$mediaref', 'mediapicts']
                  },
                  'then': '$picture.mediaBasePath'
                },
                {
                  'case': {
                    '$eq': ['$mediaref', 'mediadiaries']
                  },
                  'then': '$diary.mediaBasePath'
                },
                {
                  'case': {
                    '$eq': ['$mediaref', 'mediavideos']
                  },
                  'then': '$video.mediaBasePath'
                }
              ],
              default: ''
            }
          },
          mediaUri: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$mediaref', 'mediapicts']
                  },
                  'then': '$picture.mediaUri'
                },
                {
                  'case': {
                    '$eq': ['$mediaref', 'mediadiaries']
                  },
                  'then': '$diary.mediaUri'
                },
                {
                  'case': {
                    '$eq': ['$mediaref', 'mediavideos']
                  },
                  'then': '$video.mediaUri'
                }
              ],
              default: ''
            }
          },
          mediaType: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$mediaref', 'mediapicts']
                  },
                  'then': '$picture.mediaType'
                },
                {
                  'case': {
                    '$eq': ['$mediaref', 'mediadiaries']
                  },
                  'then': '$diary.mediaType'
                },
                {
                  'case': {
                    '$eq': ['$mediaref', 'mediavideos']
                  },
                  'then': '$video.mediaType'
                }
              ],
              default: ''
            }
          },
          mediaThumbEndpoint: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$mediaref', 'mediapicts']
                  },
                  'then': '$picture.mediaThumb'
                },
                {
                  'case': {
                    '$eq': ['$mediaref', 'mediadiaries']
                  },
                  'then': {
                    $concat: ["$paththumbdiary", "/", "$mediadiary"]
                  },

                },
                {
                  'case': {
                    '$eq': ['$mediaref', 'mediavideos']
                  },
                  'then': {
                    $concat: ["$paththumbvideo", "/", "$mediavideo"]
                  },

                }
              ],
              default: ''
            }
          },
          mediaEndpoint: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$mediaref', 'mediapicts']
                  },
                  'then': {
                    $concat: ["$pathpicture", "/", "$mediapicture"]
                  },

                },
                {
                  'case': {
                    '$eq': ['$mediaref', 'mediadiaries']
                  },
                  'then': {
                    $concat: ["$pathdiary", "/", "$mediadiary"]
                  },

                },
                {
                  'case': {
                    '$eq': ['$mediaref', 'mediavideos']
                  },
                  'then': {
                    $concat: ["$pathvideo", "/", "$mediavideo"]
                  },

                }
              ],
              default: ''
            }
          },
          mediaThumbUri: {
            $switch: {
              branches: [
                {
                  'case': {
                    '$eq': ['$mediaref', 'mediapicts']
                  },
                  'then': '$diary.mediaThumb'
                },
                {
                  'case': {
                    '$eq': ['$mediaref', 'mediadiaries']
                  },
                  'then': '$diary.mediaThumb'
                },
                {
                  'case': {
                    '$eq': ['$mediaref', 'mediavideos']
                  },
                  'then': '$video.mediaThumb'
                }
              ],
              default: ''
            }
          },
          apsaraId: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$mediaref",
                      "mediapicts"
                    ]
                  },
                  then: "$picture.apsaraId"
                },
                {
                  case: {
                    $eq: [
                      "$mediaref",
                      "mediadiaries"
                    ]
                  },
                  then: "$diary.apsaraId"
                },
                {
                  case: {
                    $eq: [
                      "$mediaref",
                      "mediavideos"
                    ]
                  },
                  then: "$video.apsaraId"
                }
              ],
              default: ""
            }
          },
          apsara: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$mediaref",
                      "mediapicts"
                    ]
                  },
                  then: "$picture.apsara"
                },
                {
                  case: {
                    $eq: [
                      "$mediaref",
                      "mediadiaries"
                    ]
                  },
                  then: "$diary.apsara"
                },
                {
                  case: {
                    $eq: [
                      "$mediaref",
                      "mediavideos"
                    ]
                  },
                  then: "$video.apsara"
                }
              ],
              default: false
            }
          },

        }
      },

      {
        $project: {
          _id: 1,
          insight: 1,
          avatar: 1,
          fullName: 1,
          proofpict: 1,
          username: 1,
          createdAt: 1,
          updatedAt: 1,
          postID: 1,
          email: 1,
          postType: 1,
          description: 1,
          title: 1,
          active: 1,
          metadata: 1,
          location: 1,
          visibility: 1,
          isIdVerified: 1,
          statusUser: 1,
          tags: 1,
          likes: 1,
          views: 1,
          shares: 1,
          comments: 1,
          isOwned: 1,
          privacy: 1,
          isViewed: 1,
          allowComments: 1,
          isSafe: 1,
          saleLike: 1,
          saleView: 1,
          monetize: 1,
          saleAmount: 1,
          mediaref: 1,
          rotate: 1,
          mediaBasePath: 1,
          mediaUri: 1,
          mediaType: 1,
          mediaThumbEndpoint: 1,
          mediaEndpoint: 1,
          mediaThumbUri: 1,
          apsaraId: 1,
          apsara: 1,
          tagPeople: 1,
          reportedUserCount: 1,
          reportedUserHandle: 1,
          reportedUser: 1,
          reportedStatus: 1,
          statusLast: {
            $cond: {
              if: {
                $or: [{
                  $eq: ["$reportedUserHandle", null]
                }, {
                  $eq: ["$reportedUserHandle", ""]
                }, {
                  $eq: ["$reportedUserHandle", []]
                }]
              },
              then: "BARU",
              else: {
                $last: "$reportedUserHandle.status"
              }
            },

          },


        }
      },
      {
        $project: {
          _id: 1,
          insight: 1,
          avatar: 1,
          fullName: 1,
          proofpict: 1,
          username: 1,
          createdAt: 1,
          updatedAt: 1,
          postID: 1,
          email: 1,
          postType: 1,
          description: 1,
          title: 1,
          active: 1,
          metadata: 1,
          location: 1,
          visibility: 1,
          isIdVerified: 1,
          statusUser: 1,
          tags: 1,
          likes: 1,
          views: 1,
          shares: 1,
          comments: 1,
          isOwned: 1,
          privacy: 1,
          isViewed: 1,
          allowComments: 1,
          isSafe: 1,
          saleLike: 1,
          saleView: 1,
          monetize: 1,
          saleAmount: 1,
          mediaref: 1,
          rotate: 1,
          mediaBasePath: 1,
          mediaUri: 1,
          mediaType: 1,
          mediaThumbEndpoint: 1,
          mediaEndpoint: 1,
          mediaThumbUri: 1,
          apsaraId: 1,
          apsara: 1,
          tagPeople: 1,
          reportedUserCount: 1,
          reportedUserHandle: 1,
          reportedUser: 1,
          reportedStatus: 1,
          statusLast: 1,
          reportStatusLast: {
            $cond: {
              if: {
                $or: [{
                  $eq: ["$statusLast", null]
                }, {
                  $eq: ["$statusLast", ""]
                }, {
                  $eq: ["$statusLast", []]
                }, {
                  $eq: ["$statusLast", "BARU"]
                }]
              },
              then: "BARU",
              else: {
                $last: "$reportedUserHandle.status"
              }
            },

          },

        }
      },

      {
        $match: { postID: postID }
      }

    ]);

    return query;
  }



  async countReason(postID: string) {
    let query = await this.PostsModel.aggregate([
      {
        $match: {

          postID: postID
        }
      },
      {
        $unwind: "$reportedUser"
      },
      {
        $match: {

          'reportedUser.active': true
        }
      },
      {
        $group: {
          _id: "$reportedUser.description",

          myCount: {
            $sum: 1
          }
        }
      },
      {
        $project: {
          _id: "$_id",
          "myCount": "$myCount",

        }
      }

    ]);
    return query;
  }
  async thum(thum_data: string): Promise<any> {
    var data = await this.seaweedfsService.read(thum_data.replace('/localrepo', ''));
    return data;
  }
  async pict(media: string): Promise<any> {
    var data = await this.seaweedfsService.read(media.replace('/localrepo', ''));
    return data;
  }

  async stream(mediaFile: string): Promise<any> {
    var data = await this.seaweedfsService.read("/" + mediaFile);
    return data;
  }

  async updateActive(id: string, updatedAt: string, remark: string) {
    let data = await this.PostsModel.updateMany({ "_id": id },

      { $set: { "active": false, "updatedAt": updatedAt, "reportedUserHandle.$[].remark": remark, "reportedUserHandle.$[].status": "DELETE", "reportedUserHandle.$[].updatedAt": updatedAt } });
    return data;
  }

  async updateActiveEmpty(id: string, updatedAt: string, reportedUserHandle: any[]) {
    let data = await this.PostsModel.updateMany({ "_id": id },

      { $set: { "active": false, "updatedAt": updatedAt, "reportedUserHandle": reportedUserHandle } });
    return data;
  }

  async updateDitangguhkan(id: string, reason: string, updatedAt: string, reasonId: ObjectId) {
    let data = await this.PostsModel.updateMany({ "_id": id },
      { $set: { "reportedStatus": "OWNED", "updatedAt": updatedAt, "reportedUserHandle.$[].reasonId": reasonId, "reportedUserHandle.$[].reasonAdmin": reason, "reportedUserHandle.$[].status": "DITANGGUHKAN", "reportedUserHandle.$[].updatedAt": updatedAt } });
    return data;
  }

  async updateDitangguhkanEmpty(id: string, updatedAt: string, reportedUserHandle: any[]) {
    let data = await this.PostsModel.updateMany({ "_id": id },
      { $set: { "reportedStatus": "OWNED", "updatedAt": updatedAt, "reportedUserHandle": reportedUserHandle } });
    return data;
  }

  async updateFlaging(id: string, updatedAt: string) {
    let data = await this.PostsModel.updateMany({ "_id": id },
      { $set: { "reportedStatus": "BLURRED", "updatedAt": updatedAt, "reportedUserHandle.$[].status": "FLAGING", "reportedUserHandle.$[].updatedAt": updatedAt } });
    return data;
  }
  async updateFlagingEmpty(id: string, updatedAt: string, reportedUserHandle: any[]) {
    let data = await this.PostsModel.updateMany({ "_id": id },
      { $set: { "reportedStatus": "BLURRED", "updatedAt": updatedAt, "reportedUserHandle": reportedUserHandle } });
    return data;
  }

  async updateTidakditangguhkan(id: string, updatedAt: string) {
    let data = await this.PostsModel.updateMany({ "_id": id },
      { $set: { "reportedStatus": "ALL", "updatedAt": updatedAt, "reportedUserCount": 0, "reportedUserHandle.$[].status": "TIDAK DITANGGUHKAN", "reportedUserHandle.$[].updatedAt": updatedAt } });
    return data;
  }

  async updateTidakditangguhkanEmpty(id: string, updatedAt: string, reportedUserHandle: any[]) {
    let data = await this.PostsModel.updateMany({ "_id": id },
      { $set: { "reportedStatus": "ALL", "updatedAt": updatedAt, "reportedUserCount": 0, "reportedUserHandle": reportedUserHandle } });
    return data;
  }

  async nonactive(id: string, updatedAt: string) {
    let data = await this.PostsModel.updateMany({ "_id": id },
      {
        $set: {
          "reportedUser.$[].active": false, "reportedUser.$[].updatedAt": updatedAt
        }


      });
    return data;
  }
}


