import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { CreatePostsDto } from './dto/create-posts.dto';
import { Posts, PostsDocument } from './schemas/posts.schema';


@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Posts.name, 'SERVER_CONTENT')
    private readonly PostsModel: Model<PostsDocument>,
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
}
