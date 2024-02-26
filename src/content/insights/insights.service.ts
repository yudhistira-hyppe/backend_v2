import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateInsightsDto } from './dto/create-insights.dto';
import { Insights, InsightsDocument } from './schemas/insights.schema';


@Injectable()
export class InsightsService {
  constructor(
    @InjectModel(Insights.name, 'SERVER_FULL')
    private readonly InsightsModel: Model<InsightsDocument>,
  ) { }

  async create(CreateInsightsDto: CreateInsightsDto): Promise<Insights> {
    const createInsightsDto = await this.InsightsModel.create(
      CreateInsightsDto,
    );
    return createInsightsDto;
  }

  async updateNoneActive(email: string) {
    this.InsightsModel.updateMany(
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

  async updateone(email: string, CreateInsightsDto: CreateInsightsDto) {
    this.InsightsModel.updateMany(
      {
        email: email,
      },
      {
        $set: CreateInsightsDto
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

  async updateoneByID(id: string, CreateInsightsDto: CreateInsightsDto) {
    this.InsightsModel.updateOne(
      {
        _id: id
      },
      {
        $set: CreateInsightsDto
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

  async findAll(): Promise<Insights[]> {
    return this.InsightsModel.find().exec();
  }

  async findemail(email: string): Promise<Insights> {
    return this.InsightsModel.findOne({ email: email }).exec();
  }

  async updatesalelike(id: string, like: number): Promise<Object> {
    let data = await this.InsightsModel.updateOne({ "_id": id },
      {
        $set: {
          "likes": like
        }
      });
    return data;
  }

  async updatesaleview(id: string, view: number): Promise<Object> {
    let data = await this.InsightsModel.updateOne({ "_id": id },
      {
        $set: {
          "views": view
        }
      });
    return data;
  }
  async findOne(_id: string): Promise<Insights> {
    return this.InsightsModel.findOne({ _id: _id }).exec();
  }
  async delete(id: string) {
    const deletedCat = await this.InsightsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  async updateFollowing(email: string) {
    this.InsightsModel.updateOne(
      {
        email: email,
      },
      { $inc: { followings: 1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateFollowingByID(id: string) {
    
    this.InsightsModel.updateOne(
      {
        _id: id
      },
      { $inc: { followings: 1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async Engagement(year: number): Promise<Object> {
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
    var GetCount = this.InsightsModel.aggregate([
      {
        $project: {
          views_repo: '$views',
          likes_repo: '$likes',
          shares_repo: '$shares',
          reactions_repo: '$reactions',
          month_repo: { $toInt: { $substrCP: ['$createdAt', 5, 2] } },
          month_name_repo: {
            $arrayElemAt: [
              monthsArray,
              {
                $subtract: [{ $toInt: { $substrCP: ['$createdAt', 5, 2] } }, 1],
              },
            ],
          },
          YearcreatedAt_repo: { $toInt: { $substrCP: ['$createdAt', 0, 4] } },
          year_param_repo: { $toInt: year_param.toString() },
        },
      },
      {
        $group: {
          _id: {
            month_group: '$month_repo',
          },
          views_repo_sum: { $sum: '$views_repo' },
          likes_repo_sum: { $sum: '$likes_repo' },
          shares_repo_sum: { $sum: '$shares_repo' },
          reactions_repo_sum: { $sum: '$reactions_repo' },
        },
      },
      {
        $sort: { '_id.month_group': 1 },
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month_group',
          month_name: {
            $arrayElemAt: [
              monthsArray,
              {
                $subtract: ['$_id.month_group', 1],
              },
            ],
          },
          views: '$views_repo_sum',
          likes: '$likes_repo_sum',
          shares: '$shares_repo_sum',
          reactions: '$reactions_repo_sum',
        },
      },
      // {
      //   $group: {
      //     _id: { year_month: { $substrCP: ['$createdAt', 0, 7] } },
      //     count: { $sum: 1 },
      //   },
      // },
    ]).exec();
    return GetCount;
  }

  // async findinsight() {
  //   const query = await this.InsightsModel.aggregate([

  //     {
  //       $lookup: {
  //         from: 'insights',
  //         localField: 'insights.$id',
  //         foreignField: '_id',
  //         as: 'roless',
  //       },
  //     }, {
  //       $out: {
  //         db: 'hyppe_trans_db',
  //         coll: 'insights2'
  //       }
  //     },

  //   ]);
  //   return query;
  // }

  async getinsight(email: string) {
    const query = await this.InsightsModel.aggregate([


      { "$match": { "email": email } },
    ]).exec();

    return query;
  }

  async updateViewProfile(emailViewed: string) {
    this.InsightsModel.updateOne(
      {
        email: emailViewed,
      },
      { $inc: { views_profile: 1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async getInteractivesQuery(emailViewed: string) {
    let Query = this.InsightsModel
  }

  async updateFollowerV5(email: string) {
    this.InsightsModel.updateOne(
      {
        email: email,
      },
      { $inc: { followers: 1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateUnFollowerV5(email: string) {
    this.InsightsModel.updateOne(
      {
        email: email,
      },
      { $inc: { followers: -1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateUnFollowingV5(email: string) {
    this.InsightsModel.updateOne(
      {
        email: email,
      },
      { $inc: { followings: -1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateFollower(email: string) {
    this.InsightsModel.updateOne(
      {
        email: email,
      },
      { $inc: { followers: 1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateFollowerByID(id: string) {
    
    this.InsightsModel.updateOne(
      {
        _id: id
      },
      { $inc: { followers: 1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateComment(email: string) {
    this.InsightsModel.updateOne(
      {
        email: email,
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

  async updateLike(email: string) {
    this.InsightsModel.updateOne(
      {
        email: email,
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

  async updateLikeByID(id: string) {
    
    this.InsightsModel.updateOne(
      {
        _id: id
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

  async updateUnlike(email: string) {
    this.InsightsModel.updateOne(
      {
        email: email,
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

  async updateUnlikeByID(id: string) {
    
    this.InsightsModel.updateOne(
      {
        _id: id
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

  async updateUnFollower(email: string) {
    this.InsightsModel.updateOne(
      {
        email: email,
      },
      { $inc: { followers: -1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateUnFollowerByID(id: string) {
    
    this.InsightsModel.updateOne(
      {
        _id: id
      },
      { $inc: { followers: -1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateUnFollowing(email: string) {
    this.InsightsModel.updateOne(
      {
        email: email,
      },
      { $inc: { followings: -1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateUnFollowingByID(id: string) {
    
    this.InsightsModel.updateOne(
      {
        _id: id
      },
      { $inc: { followings: -1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateUnFollow(email: string) {
    this.InsightsModel.updateOne(
      {
        email: email,
      },
      { $inc: { unfollows: 1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateUnFollowByID(id: string) {
    
    this.InsightsModel.updateOne(
      {
        _id: id
      },
      { $inc: { unfollows: 1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateReactions(email: string) {
    this.InsightsModel.updateOne(
      {
        email: email,
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

  async updateReactionsByID(id: string) {
    
    this.InsightsModel.updateOne(
      {
        _id: id
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

  async updateViews(email: string) {
    this.InsightsModel.updateOne(
      {
        email: email,
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

  async updateViewsByID(id: string) {
    
    this.InsightsModel.updateOne(
      {
        _id: id
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

  async getInsightbyEmail(email: string)
  {
      var dateNow = new Date();

      var getDateNow = new Date(dateNow.getTime() - (dateNow.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var date_today_start = getDateNow.substring(0, 10) + " 00:00:00";
      var date_today_end = getDateNow.substring(0, 10) + " 23:59:59";
      console.log("date_today_start", date_today_start);
      console.log("date_today_end", date_today_end);

      var getDateNow_1 = new Date(dateNow.setDate(dateNow.getDate() - 1)).toISOString().replace('T', ' ');;
      var date_today_1_start = getDateNow_1.substring(0, 10) + " 00:00:00";
      var date_today_1_end = getDateNow_1.substring(0, 10) + " 23:59:59";
      console.log("date_today_1_start", date_today_1_start);
      console.log("date_today_1_end", date_today_1_end);
    var query = await this.InsightsModel.aggregate([
      //ganti tanggal masih pake cara barbar
      {
          "$match": 
          {
              $and:
              [
                  {
                      email: email,
                  },
              ]
          },
      },
      // {
      //     "$limit":1
      // },
      {
          "$facet":
          {
              "insightdata":
              [
                  {
                      "$project":
                      {
                          _id:"$_id",
                          insightID:"$insightID",
                          email:"$email",
                          active:"$active",
                          followers:"$followers",
                          following:"$followings",
                          likes:"$likes",
                      }
                  },
              ],
              "likesyesterday":
              [
                  {
                      $lookup:
                      {
                          from: "insightlogs",
                          as: "insightlogs_fk",
                          let:
                          {
                              insightfk:"$insightID"
                          },
                          pipeline:
                          [
                              {
                                  "$match":
                                  {
                                      "$and":
                                      [
                                          {
                                              "eventInsight":"LIKE"
                                          },
                                          {
                                              "$expr" : 
                                              {
                                                  "$eq" : 
                                                  [
                                                      "$insightID",
                                                      "$$insightfk"
                                                  ]
                                              }
                                              }, {
                                                  "$expr":
                                                  {
                                                      $gte: ["$createdAt", date_today_1_start,]
                                                  }
                                              },
                                              {
                                                  "$expr":
                                                  {
                                                      $lte: ["$createdAt", date_today_1_end,]
                                                  }
                                              }
                                      ]
                                  }
                              },
                              {
                                  "$unwind":
                                  {
                                      path:"$createdAt"
                                  }
                              },
                              {
                                  "$project":
                                  {
                                      "tanggal":
                                      {
                                          "$split":["$createdAt", " "]
                                      }
                                  }
                              },
                              {
                                  "$group":
                                  {
                                      _id:
                                      {
                                          "$arrayElemAt":["$tanggal", 0]
                                      },
                                      count:
                                      {
                                          $sum : 1
                                      }
                                  }
                              },
                              {
                                  "$sort":
                                  {
                                      _id : -1
                                  }
                              },
                              {
                                  "$limit":1
                              }
                          ]
                      },
                  },
                  {
                      "$project":
                      {
                          _id:
                          {
                              "$arrayElemAt":
                              [
                                  "$insightlogs_fk._id", 0
                              ]
                          },
                          totallike:
                          {
                              "$arrayElemAt":
                              [
                                  "$insightlogs_fk.count", 0
                              ]
                          },
                      }
                  }
              ],
              "likestoday":
              [
                  {
                      $lookup:
                      {
                          from: "insightlogs",
                          as: "insightlogs_fk",
                          let:
                          {
                              insightfk:"$insightID"
                          },
                          pipeline:
                          [
                              {
                                  "$match":
                                  {
                                      "$and":
                                      [
                                          {
                                              "eventInsight":"LIKE"
                                          },
                                          {
                                              "$expr" : 
                                              {
                                                  "$eq" : 
                                                  [
                                                      "$insightID",
                                                      "$$insightfk"
                                                  ]
                                              }
                                          },
                                              {
                                                  "$expr":
                                                  {
                                                      $gte: ["$createdAt", date_today_start,]
                                                  }
                                              },
                                              {
                                                  "$expr":
                                                  {
                                                      $lte: ["$createdAt", date_today_end,]
                                                  }
                                              }
                                      ]
                                  }
                              },
                              {
                                  "$sort":
                                  {
                                      "createdAt":-1
                                  }
                              }
                          ]
                      },
                  },
                  {
                      "$project":
                      {
                          _id:"likestoday",
                          "totallike":
                          {
                              "$size":"$insightlogs_fk"
                          },
                      }
                  },
              ],
              "followingyesterday":
              [
                  {
                      $lookup:
                      {
                          from: "insightlogs",
                          as: "insightlogs_fk",
                          let:
                          {
                              insightfk:"$insightID"
                          },
                          pipeline:
                          [
                              {
                                  "$match":
                                  {
                                      "$and":
                                      [
                                          {
                                              "eventInsight":"FOLLOWING"
                                          },
                                          {
                                              "$expr" : 
                                              {
                                                  "$eq" : 
                                                  [
                                                      "$insightID",
                                                      "$$insightfk"
                                                  ]
                                              }
                                          },
                                              {
                                                  "$expr":
                                                  {
                                                      $gte: ["$createdAt", date_today_1_start,]
                                                  }
                                              },
                                              {
                                                  "$expr":
                                                  {
                                                      $lte: ["$createdAt", date_today_1_end,]
                                                  }
                                              }
                                      ]
                                  }
                              },
                              {
                                  "$unwind":
                                  {
                                      path:"$createdAt"
                                  }
                              },
                              {
                                  "$project":
                                  {
                                      "tanggal":
                                      {
                                          "$split":["$createdAt", " "]
                                      }
                                  }
                              },
                              {
                                  "$group":
                                  {
                                      _id:
                                      {
                                          "$arrayElemAt":["$tanggal", 0]
                                      },
                                      count:
                                      {
                                          $sum : 1
                                      }
                                  }
                              },
                              {
                                  "$sort":
                                  {
                                      _id : -1
                                  }
                              },
                              {
                                  "$limit":1
                              }
                          ]
                      },
                  },
                  {
                      "$project":
                      {
                          _id:
                          {
                              "$arrayElemAt":
                              [
                                  "$insightlogs_fk._id", 0
                              ]
                          },
                          totalfollowing:
                          {
                              "$arrayElemAt":
                              [
                                  "$insightlogs_fk.count", 0
                              ]
                          },
                      }
                  }
              ],
              "followingtoday":
              [
                  {
                      $lookup:
                      {
                          from: "insightlogs",
                          as: "insightlogs_fk",
                          let:
                          {
                              insightfk:"$insightID"
                          },
                          pipeline:
                          [
                              {
                                  "$match":
                                  {
                                      "$and":
                                      [
                                          {
                                              "eventInsight":"FOLLOWING"
                                          },
                                          {
                                              "$expr" : 
                                              {
                                                  "$eq" : 
                                                  [
                                                      "$insightID",
                                                      "$$insightfk"
                                                  ]
                                              }
                                          },
                                              {
                                                  "$expr":
                                                  {
                                                      $gte: ["$createdAt", date_today_start,]
                                                  }
                                              },
                                              {
                                                  "$expr":
                                                  {
                                                      $lte: ["$createdAt", date_today_end,]
                                                  }
                                              }
                                      ]
                                  }
                              },
                              {
                                  "$sort":
                                  {
                                      "createdAt":-1
                                  }
                              }
                          ]
                      },
                  },
                  {
                      "$project":
                      {
                          _id:"followingtoday",
                          "totalfollowing":
                          {
                              "$size":"$insightlogs_fk"
                          },
                      }
                  },
              ],
              "followeryesterday":
              [
                  {
                      $lookup:
                      {
                          from: "insightlogs",
                          as: "insightlogs_fk",
                          let:
                          {
                              insightfk:"$insightID"
                          },
                          pipeline:
                          [
                              {
                                  "$match":
                                  {
                                      "$and":
                                      [
                                          {
                                              "eventInsight":"FOLLOWER"
                                          },
                                          {
                                              "$expr" : 
                                              {
                                                  "$eq" : 
                                                  [
                                                      "$insightID",
                                                      "$$insightfk"
                                                  ]
                                              }
                                          },
                                              {
                                                  "$expr":
                                                  {
                                                      $gte: ["$createdAt", date_today_1_start,]
                                                  }
                                              },
                                              {
                                                  "$expr":
                                                  {
                                                      $lte: ["$createdAt", date_today_1_end,]
                                                  }
                                              }
                                      ]
                                  }
                              },
                              {
                                  "$unwind":
                                  {
                                      path:"$createdAt"
                                  }
                              },
                              {
                                  "$project":
                                  {
                                      "tanggal":
                                      {
                                          "$split":["$createdAt", " "]
                                      }
                                  }
                              },
                              {
                                  "$group":
                                  {
                                      _id:
                                      {
                                          "$arrayElemAt":["$tanggal", 0]
                                      },
                                      count:
                                      {
                                          $sum : 1
                                      }
                                  }
                              },
                              {
                                  "$sort":
                                  {
                                      _id : -1
                                  }
                              },
                              {
                                  "$limit":1
                              }
                          ]
                      },
                  },
                  {
                      "$project":
                      {
                          _id:
                          {
                              "$arrayElemAt":
                              [
                                  "$insightlogs_fk._id", 0
                              ]
                          },
                          totalfollower:
                          {
                              "$arrayElemAt":
                              [
                                  "$insightlogs_fk.count", 0
                              ]
                          },
                      }
                  }
              ],
              "followertoday":
              [
                  {
                      $lookup:
                      {
                          from: "insightlogs",
                          as: "insightlogs_fk",
                          let:
                          {
                              insightfk:"$insightID"
                          },
                          pipeline:
                          [
                              {
                                  "$match":
                                  {
                                      "$and":
                                      [
                                          {
                                              "eventInsight":"FOLLOWER"
                                          },
                                          {
                                              "$expr" : 
                                              {
                                                  "$eq" : 
                                                  [
                                                      "$insightID",
                                                      "$$insightfk"
                                                  ]
                                              }
                                          },
                                              {
                                                  "$expr":
                                                  {
                                                      $gte: ["$createdAt", date_today_start,]
                                                  }
                                              },
                                              {
                                                  "$expr":
                                                  {
                                                      $lte: ["$createdAt", date_today_end,]
                                                  }
                                              }
                                      ]
                                  }
                              },
                              {
                                  "$sort":
                                  {
                                      "createdAt":-1
                                  }
                              }
                          ]
                      },
                  },
                  {
                      "$project":
                      {
                          _id:"followertoday",
                          "totalfollower":
                          {
                              "$size":"$insightlogs_fk"
                          },
                      }
                  },
              ],
          }
      },
      {
          "$set":
          {
              "selisihdatalike":
              {
                  "$toInt":
                  {
                      "$subtract":
                      [
                          { 
                              "$arrayElemAt": 
                              [ 
                                  "$likestoday.totallike", 0 
                              ] 
                          },
                          { 
                              "$arrayElemAt": 
                              [ 
                                  "$likesyesterday.totallike", 0 
                              ] 
                          },
                      ]
                  }
              },
              "totallikenow" : 
              { 
                  "$toInt":
                  {
                      "$ifNull": 
                      [
                          {
                              "$arrayElemAt": 
                              [ 
                                  "$likestoday.totallike", 0 
                              ]
                          } , 0
                      ]
                  } 
              },
              "totallikeyesterday" : 
              { 
                  "$toInt":
                  {
                      "$ifNull": 
                      [
                          {
                              "$arrayElemAt": 
                              [ 
                                  "$likesyesterday.totallike", 0 
                              ]
                          } , 0
                      ]
                  } 
              },
              "selisihdatafollowing":
              {
                  "$toInt":
                  {
                      "$subtract":
                      [
                          { 
                              "$arrayElemAt": 
                              [ 
                                  "$followingtoday.totalfollowing", 0 
                              ] 
                          },
                          { 
                              "$arrayElemAt": 
                              [ 
                                  "$followingyesterday.totalfollowing", 0 
                              ] 
                          },
                      ]
                  }
              },
              "totalfollowingnow" : 
              { 
                  "$toInt":
                  {
                      "$ifNull": 
                      [
                          {
                              "$arrayElemAt": 
                              [ 
                                  "$followingtoday.totalfollowing", 0 
                              ]
                          } , 0
                      ]
                  } 
              },
              "totalfollowingyesterday" : 
              { 
                  "$toInt":
                  {
                      "$ifNull": 
                      [
                          {
                              "$arrayElemAt": 
                              [ 
                                  "$followingyesterday.totalfollowing", 0 
                              ]
                          } , 0
                      ]
                  } 
              },
              "selisihdatafollower":
              {
                  "$toInt":
                  {
                      "$subtract":
                      [
                          { 
                              "$arrayElemAt": 
                              [ 
                                  "$followertoday.totalfollower", 0 
                              ] 
                          },
                          { 
                              "$arrayElemAt": 
                              [ 
                                  "$followeryesterday.totalfollower", 0 
                              ] 
                          },
                      ]
                  }
              },
              "totalfollowernow" : 
              { 
                  "$toInt":
                  {
                      "$ifNull": 
                      [
                          {
                              "$arrayElemAt": 
                              [ 
                                  "$followertoday.totalfollower", 0 
                              ]
                          } , 0
                      ]
                  } 
              },
              "totalfolloweryesterday" : 
              { 
                  "$toInt":
                  {
                      "$ifNull": 
                      [
                          {
                              "$arrayElemAt": 
                              [ 
                                  "$followeryesterday.totalfollower", 0 
                              ]
                          } , 0
                      ]
                  } 
              },
          }
      },
      {
          "$project":
          {
              // insightdata : 1,
              // followingtoday:1,
              // followingyesterday:1,
              // likestoday:1,
              // likesyesterday:1,
              // followertoday:1,
              // followeryesterday:1,
              Likes:
              {
                  "$switch":
                  {
                      branches:
                      [
                          {
                              case : 
                              {
                                  "$gt":
                                  [
                                      "$totallikeyesterday",
                                      "$totallikenow", 
                                  ]
                              },
                              then:
                              {
                                  "total_now" : "$totallikenow",
                                  "total_yesterday" : "$totallikeyesterday",
                                  "like" : "$selisihdatalike",
                                  "status" : "down",
                                  "totalsekarang":
                                  {
                                      "$arrayElemAt":
                                      [
                                          "$insightdata.likes", 0
                                      ]
                                  },
                                  //"message" : "kemarin lebih besar dari hari ini"
                              }
                          },
                          {
                              case : 
                              {
                                  "$lt":
                                  [
                                      "$totallikeyesterday",
                                      "$totallikenow",
                                  ]
                              },
                              then:
                              {
                                  "total_now" : "$totallikenow",
                                  "total_yesterday" : "$totallikeyesterday",
                                  "like" : "$selisihdatalike",
                                  "status" : "up",
                                  "totalsekarang":
                                  {
                                      "$arrayElemAt":
                                      [
                                          "$insightdata.likes", 0
                                      ]
                                  },
                                  //"message" : "kemarin lebih kecil dari hari ini"
                              }
                          }
                      ],
                      default:
                      {
                          "total_now" : "$totallikenow",
                          "total_yesterday" : "$totallikeyesterday",
                          "like" : "$selisihdatalike",
                          "status" : "down",
                          "totalsekarang":
                          {
                              "$arrayElemAt":
                              [
                                  "$insightdata.likes", 0
                              ]
                          },
                          //"message" : "default"
                      }
                  }
              },
              Following:
              {
                  "$switch":
                  {
                      branches:
                      [
                          {
                              case : 
                              {
                                  "$gt":
                                  [
                                      "$totalfollowingyesterday",
                                      "$totalfollowingnow", 
                                  ]
                              },
                              then:
                              {
                                  "total_now" : "$totalfollowingnow",
                                  "total_yesterday" : "$totalfollowingyesterday",
                                  "followings" : "$selisihdatafollowing",
                                  "status" : "down",
                                  "totalsekarang":
                                  {
                                      "$arrayElemAt":
                                      [
                                          "$insightdata.following", 0
                                      ]
                                  },
                                  //"message" : "kemarin lebih besar dari hari ini"
                              }
                          },
                          {
                              case : 
                              {
                                  "$lt":
                                  [
                                      "$totalfollowingyesterday",
                                      "$totalfollowingnow",
                                  ]
                              },
                              then:
                              {
                                  "total_now" : "$totalfollowingnow",
                                  "total_yesterday" : "$totalfollowingyesterday",
                                  "followings" : "$selisihdatafollowing",
                                  "status" : "up",
                                  "totalsekarang":
                                  {
                                      "$arrayElemAt":
                                      [
                                          "$insightdata.following", 0
                                      ]
                                  },
                                  //"message" : "kemarin lebih kecil dari hari ini"
                              }
                          }
                      ],
                      default:
                      {
                          "total_now" : "$totalfollowingnow",
                          "total_yesterday" : "$totalfollowingyesterday",
                          "followings" : "$selisihdatafollowing",
                          "status" : "down",
                          "totalsekarang":
                          {
                              "$arrayElemAt":
                              [
                                  "$insightdata.following", 0
                              ]
                          },
                          //"message" : "default"
                      }
                  }
              },
              Follower:
              {
                  "$switch":
                  {
                      branches:
                      [
                          {
                              case : 
                              {
                                  "$gt":
                                  [
                                      "$totalfolloweryesterday",
                                      "$totalfollowernow", 
                                  ]
                              },
                              then:
                              {
                                  "total_now" : "$totalfollowernow",
                                  "total_yesterday" : "$totalfolloweryesterday",
                                  "followers" : "$selisihdatafollower",
                                  "status" : "down",
                                  "totalsekarang":
                                  {
                                      "$arrayElemAt":
                                      [
                                          "$insightdata.followers", 0
                                      ]
                                  },
                                  //"message" : "kemarin lebih besar dari hari ini"
                              }
                          },
                          {
                              case : 
                              {
                                  "$lt":
                                  [
                                      "$totalfolloweryesterday",
                                      "$totalfollowernow",
                                  ]
                              },
                              then:
                              {
                                  "total_now" : "$totalfollowernow",
                                  "total_yesterday" : "$totalfolloweryesterday",
                                  "followers" : "$selisihdatafollower",
                                  "status" : "up",
                                  "totalsekarang":
                                  {
                                      "$arrayElemAt":
                                      [
                                          "$insightdata.followers", 0
                                      ]
                                  },
                                  //"message" : "kemarin lebih kecil dari hari ini"
                              }
                          }
                      ],
                      default:
                      {
                          "total_now" : "$totalfollowernow",
                          "total_yesterday" : "$totalfolloweryesterday",
                          "followers" : "$selisihdatafollower",
                          "status" : "down",
                          "totalsekarang":
                          {
                              "$arrayElemAt":
                              [
                                  "$insightdata.followers", 0
                              ]
                          },
                          //"message" : "default"
                      }
                  }
              },
          }
      }
    ]);

    return query;
  }

}
