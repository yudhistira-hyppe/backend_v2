import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { CreateUserauthDto } from './dto/create-userauth.dto';
import { Userauth, UserauthDocument } from './schemas/userauth.schema';

@Injectable()
export class UserauthsService {
  constructor(
    @InjectModel(Userauth.name, 'SERVER_FULL')
    private readonly userauthModel: Model<UserauthDocument>,

  ) { }

  async create(CreateUserauthDto: CreateUserauthDto): Promise<Userauth> {
    const createUserauthDto = await this.userauthModel.create(
      CreateUserauthDto,
    );
    return createUserauthDto;
  }

  async findAll(): Promise<Userauth[]> {
    return this.userauthModel.find().exec();
  }

  async findOneUsername(username: String): Promise<Userauth> {
    return this.userauthModel.findOne({ username: username, isEmailVerified: true, isEnabled: true }).exec();
  }

  async findOneemail(email: String): Promise<Userauth> {
    return this.userauthModel.findOne({ email: email, isEmailVerified: true, isEnabled: true }).exec();
  }
  async findOneId(id: ObjectId): Promise<Userauth> {
    return this.userauthModel.findOne({ _id: id }).exec();
  }

  async findById(id: String): Promise<Userauth> {
    return this.userauthModel.findById(id);
  }

  async findIn(id: String[]): Promise<Userauth[]> {
    return this.userauthModel.find().where('email').in(id).exec();
  }

  async findByUsername(Username: String): Promise<Userauth> {
    return await this.userauthModel.findOne({ username: Username }).exec();
  }

  async findRoleEmail(email: String, roles_: String): Promise<Userauth[]> {
    return this.userauthModel.find({ email: email, roles: { $in: [roles_] } }).exec();
  }

  async removeRoleEmail(email: String, roles_: String) {
    return await this.userauthModel.updateOne({ email: email }, { $pull: { roles: roles_ } }).exec();
  }

  // async findOne(username: String): Promise<Userauth> {
  //   return this.userauthModel.findOne({ username: username }).exec();
  // }

  async findOneByEmailandUsername(
    email: String,
    username: String,
  ): Promise<any> {
    return this.userauthModel
      .findOne({
        $or: [{ email: email }, { username: username }],
      })
      .exec();
  }

  async search(search: String): Promise<Userauth[]> {
    return this.userauthModel.find({ $or: [{ email: search }, { username: search }], }).exec();
  }

  async findOne(email: String): Promise<Userauth> {
    return await this.userauthModel.findOne({ email: email }).exec();
  }

  async updatebyId(id: string, data: Object) {
    console.log(id);
    this.userauthModel.updateOne(
      {
        _id: Object(id),
      },
      data,
      function (err, docs) {
        if (err) {
          //console.log(err);
        } else {
          //console.log(docs);
        }
      },
    );
  }

  async findOneByEmail(email: String): Promise<Userauth> {
    return this.userauthModel.findOne({ email: email }).exec();
  }
  // async findOneId(id: String): Promise<Userauth> {
  //   return this.userauthModel.findOne({ _id: id }).exec();
  // }

  async delete(id: String) {
    const deletedCat = await this.userauthModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }

  async updatebyEmail(email: String, data: Object) {
    this.userauthModel.updateOne(
      {
        email: email,
      },
      data,
      function (err, docs) {
        if (err) {
          //console.log(err);
        } else {
          //console.log(docs);
        }
      },
    );
  }

  async findOneupdatebyEmail(email: String) {
    this.userauthModel.updateOne(
      {
        email: email,
      },
      { $inc: { otpAttempt: 1 } },
      function (err, docs) {
        if (err) {
          //console.log(err);
        } else {
          //console.log(docs);
        }
      },
    );
  }

  async deleteUserRole(email: String, Role: String) {
    return await this.userauthModel.updateOne({ email: email }, { $pull: { roles: Role } }).exec();
  }

  async addUserRole(email: String, Role: String) {
    return await this.userauthModel.updateOne({ email: email }, { $push: { roles: Role } }).exec();
  }

  async findUpdateEmailStatusRole(email: String, upgradeRole: String) {
    this.userauthModel.updateOne(
      {
        email: email,
      },
      { upgradeRole: upgradeRole },
      function (err, docs) {
        if (err) {
          //console.log(err);
        } else {
          //console.log(docs);
        }
      },
    );
  }
  async update(email: String, roles: String): Promise<Object> {
    let data = await this.userauthModel.updateOne({ "email": email },
      { $set: { "roles": [roles] } });
    return data;
  }

  async updateNoneActive(email: String): Promise<Object> {
    let data = await this.userauthModel.updateOne({ "email": email },
      {
        $set: {
          "isEnabled": false,
          "isEmailVerified": false,
          "email": email + '_noneactive',
        }
      });
    return data;
  }

  async coutRow(keys: string) {
    const query = await this.userauthModel.aggregate([
      {
        "$match": {
          username: {
            $regex: keys
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

  async findUserNew(username: string, skip: number, limit: number) {

    if (username !== undefined) {
      const query = await this.userauthModel.aggregate([

        {
          "$match": {
            "username": {
              $regex: username,
              $options: 'i'
            }
          }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'userbasics',
            localField: '_id',
            foreignField: 'userAuth.$id',
            as: 'userbasic_data',

          },

        },
        {
          $project: {
            ubasic: {
              $arrayElemAt: ['$userbasic_data', 0]
            },
            username: '$username',
            email: '$email',
            idUserAuth: '$_id',
          },

        },
        {
          $project: {

            _id: '$ubasic._id',
            username: '$username',
            fullName: '$ubasic.fullName',
            mediaId: '$ubasic.profilePict.$id',
            email: '$email',
            idUserAuth: '$idUserAuth'

          },

        },
        {
          $sort: {
            username: 1
          },

        },
      ]);
      return query;
    }
    else {
      const query = await this.userauthModel.aggregate([

        {
          $skip: 0
        },
        {
          $limit: 1
        },

      ]);
      return query;
    }

  }

  async getUserActiveByDate(startdate: string) {
    var before = new Date(startdate).toISOString().split("T")[0];
    var input = new Date();
    input.setDate(input.getDate() + 1);
    var today = new Date(input).toISOString().split("T")[0];
    //kalo error, coba ganti jadi set dan jadi object
    var query = await this.userauthModel.aggregate([
      {
        "$match":
        {
          createdAt:
          {
            "$gte": before,
            "$lte": today
          },
          isEnabled: true
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

  async getRecentStory(email: string, page: number, limit: number) {
    var query = await this.userauthModel.aggregate([

      {
        "$lookup":
        {
          from: 'posts',
          as: 'post_data',
          let:
          {
            post_fk: "$email"
          },
          pipeline:
            [

              {
                "$match":
                {
                  $and: [
                    {
                      "$expr": {
                        $eq: ['$email', '$$post_fk']
                      }
                    },
                    {
                      "$expr":
                      {
                        "$eq": ["$postType", "story"]
                      }
                    },
                    {
                      "reportedStatus": {
                        "$ne": "OWNED"
                      }
                    },
                    {
                      "visibility": "PUBLIC"
                    },
                    {
                      "active": true
                    },
                    {
                      "email": {
                        $ne: email
                      }
                    },
                    {
                      "$or": [
                        {
                          "reportedUser": {
                            "$elemMatch": {
                              "email": email,
                              "active": false,

                            }
                          }
                        },
                        {
                          "reportedUser.email": {
                            "$not": {
                              "$regex": email
                            }
                          }
                        },

                      ]
                    },

                  ]
                },

              },
              {
                "$set": {
                  "settimeStart":
                  {
                    "$dateToString": {
                      "format": "%Y-%m-%d %H:%M:%S",
                      "date": {
                        $add: [new Date(), - 61200000] // 1 hari 61200000
                      }
                    }
                  },
                  "settimeEnd":
                  {
                    "$dateToString": {
                      "format": "%Y-%m-%d %H:%M:%S",
                      "date": {
                        $add: [new Date(), 25200000]
                      }
                    }
                  }
                }
              },
              {
                $match: {
                  $and: [
                    {
                      "$expr":
                      {
                        "$gte": ["$createdAt", '$settimeStart']
                      },

                    },
                    {
                      "$expr":
                      {
                        "$lte": ["$createdAt", '$settimeEnd']
                      }
                    },

                  ]
                }
              },

            ]
        }
      },
      {
        "$unwind":
        {
          path: "$post_data"
        }
      },
      {
        "$project":
        {

          mediaEndpoint: {
            "$concat": ["/pict/", "$post_data.postID"]
          },
          username: "$username",
          postID: "$post_data.postID",
          musicId: "$post_data.musicId",
          email: "$post_data.email",
          postType: "$post_data.postType",
          description: "$post_data.description",
          active: "$post_data.active",
          createdAt: "$post_data.createdAt",
          updatedAt: "$post_data.updatedAt",
          expiration: "$post_data.expiration",
          visibility: "$post_data.visibility",
          location: "$post_data.location",
          allowComments: "$post_data.allowComments",
          isSafe: "$post_data.isSafe",
          isOwned: "$post_data.isOwned",
          saleLike: "$post_data.saleLike",
          saleView: "$post_data.saleView",
          metadata: "$post_data.metadata",
          likes: "$post_data.likes",
          views: "$post_data.views",
          shares: "$post_data.shares",
          userProfile: "$post_data.userProfile",
          contentMedias: "$post_data.contentMedias",
          category: "$post_data.category",
          settimeStart: "$settimeStart",
          settimeEnd: "$settimeEnd",
          convertCreatedAt:
          {
            "$toDate": "$post_data.createdAt"
          }
        }
      },
      {
        "$sort":
        {
          createdAt: - 1
        }
      },
      {
        "$lookup": {
          from: "mediastories",
          as: "media",
          let: {
            localID: '$postID'
          },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $eq: ['$postID', '$$localID']
                }
              }
            },
            {
              $project: {

                "apsara": 1,
                "apsaraId": 1,
                "apsaraThumbId": 1,
                "mediaEndpoint": 1,
                "mediaUri": 1,
                "mediaThumbEndpoint": 1,
                "mediaThumbUri": 1,
                "mediaType": 1,

              }
            }
          ],

        },

      },
      {
        "$lookup": {
          from: "userbasics",
          as: "userBasic",
          let: {
            localID: '$email'
          },
          pipeline: [
            {
              $match:
              {


                $expr: {
                  $eq: ['$email', '$$localID']
                }
              }
            },
            {
              $project: {
                "fullName": 1,
                "profilePict": 1,
                "isCelebrity": 1,
                "isIdVerified": 1,
                "isPrivate": 1,

              }
            }
          ],

        }
      },
      //      {
      //        "$lookup": {
      //          from: "mediaprofilepicts",
      //          as: "avatar",
      //          let: {
      //            localID: {
      //              "$arrayElemAt": ["$userBasic.profilePict.$id", 0]
      //            },
      //
      //          },
      //          pipeline: [
      //            {
      //              $match:
      //              {
      //
      //
      //                $expr: {
      //                  $eq: ['$mediaID', '$$localID']
      //                }
      //              }
      //            },
      //            {
      //              $project: {
      //
      //                "mediaEndpoint": {
      //                  "$concat": ["/profilepict/", "$mediaID"]
      //                }
      //              }
      //            }
      //          ],
      //
      //        }
      //      },

      {
        "$lookup": {
          from: "mediamusic",
          as: "music",
          let: {
            localID: '$musicId'
          },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $eq: ['$_id', '$$localID']
                }
              }
            },
            {
              $project: {
                "_id": 1,
                "musicTitle": 1,
                "artistName": 1,
                "albumName": 1,
                "apsaraMusic": 1,
                "apsaraThumnail": 1,
                "genre": "$genre.name",
                "theme": "$theme.name",
                "mood": "$mood.name",

              }
            }
          ],

        }
      },
      {
        $project: {
          "storyDate": 1,
          "postID": 1,
          "musicId": {
            "$arrayElemAt": ['$music._id', 0]
          },
          "musicTitle": {
            "$arrayElemAt": ['$music.musicTitle', 0]
          },
          "artistName":
          {
            "$arrayElemAt": ["$music.artistName", 0]
          },
          "albumName":
          {
            "$arrayElemAt": ["$music.albumName", 0]
          },
          "apsaraMusic":
          {
            "$arrayElemAt": ["$music.apsaraMusic", 0]
          },
          "apsaraThumnail":
          {
            "$arrayElemAt": ["$music.apsaraThumnail", 0]
          },
          "genre":
          {
            "$arrayElemAt": ["$music.genre.name", 0]
          },
          "theme":
          {
            "$arrayElemAt": ["$music.theme.name", 0]
          },
          "mood":
          {
            "$arrayElemAt": ["$music.mood.name", 0]
          },
          "testDate": 1,
          "mediaType":
          {
            "$arrayElemAt": ["$media.mediaType", 0]
          },
          "email": 1,
          "postType": 1,
          "description": 1,
          "active": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "expiration": 1,
          "visibility": 1,
          "location": 1,
          "allowComments": 1,
          "isSafe": 1,
          "isOwned": 1,
          "saleLike": 1,
          "saleView": 1,
          "userProfile": 1,
          "contentMedias": 1,
          "tagDescription": 1,
          "metadata": 1,
          "contentModeration": 1,
          "reportedStatus": 1,
          "reportedUserCount": 1,
          "contentModerationResponse": 1,
          "reportedUser": 1,
          "timeStart": 1,
          "timeEnd": 1,
          "apsara": {
            "$arrayElemAt": ["$media.apsara", 0]
          },
          "apsaraId": {
            "$arrayElemAt": ["$media.apsaraId", 0]
          },
          "apsaraThumbId": {
            "$arrayElemAt": ["$media.apsaraThumbId", 0]
          },
          "insight":
          {
            "likes": "$likes",
            "views": "$views",
            "shares": "$shares",
            "comments": "$comments",

          }
          ,
          "fullName": {
            "$arrayElemAt": ["$userBasic.fullName", 0]
          },
          "username": "$username",
          "avatar": {
            "_id": {
              "$arrayElemAt": ["$userBasic.profilePict.$id", 0]
            },
            "mediaEndpoint": {
              "$concat": ["/profilepict/", {
                "$arrayElemAt": ["$userBasic.profilePict.$id", 0]
              }]
            }
          },
          "statusCB": 1,
          "mediaEndpoint": 1,
          "privacy": {
            "isCelebrity":
            {
              "$arrayElemAt": ["$userBasic.isCelebrity", 0]
            },
            "isIdVerified":
            {
              "$arrayElemAt": ["$userBasic.isIdVerified", 0]
            },
            "isPrivate":
            {
              "$arrayElemAt": ["$userBasic.isPrivate", 0]
            }
          },

        }
      },
      {
        "$lookup": {
          from: "contentevents",
          as: "isView",
          let: {

            storys: '$postID',

          },
          pipeline: [
            {
              $match:
              {
                $or: [

                  {
                    $and: [
                      {
                        $expr: {
                          $eq: ['$postID', '$$storys']
                        }
                      },
                      {
                        "email": email,

                      },
                      {
                        "eventType": "VIEW"
                      }
                    ]
                  },

                ]
              }
            },
            {
              $project: {
                "email": 1,
                "postID": 1,

              }
            }
          ],

        }
      },
      {
        $project: {
          "mediaEndpoint": 1,
          "storyDate": 1,
          "postID": 1,
          "musicId": 1,
          "musicTitle": 1,
          "artistName": 1,
          "albumName": 1,
          "apsaraMusic": 1,
          "apsaraThumnail": 1,
          "genre": 1,
          "theme": 1,
          "mood": 1,
          "testDate": 1,
          "mediaType": 1,
          "email": 1,
          "postType": 1,
          "description": 1,
          "active": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "expiration": 1,
          "visibility": 1,
          "location": 1,
          "allowComments": 1,
          "isSafe": 1,
          "isOwned": 1,
          "saleLike": 1,
          "saleView": 1,
          "userProfile": 1,
          "contentMedias": 1,
          "tagDescription": 1,
          "metadata": 1,
          "contentModeration": 1,
          "reportedStatus": 1,
          "reportedUserCount": 1,
          "contentModerationResponse": 1,
          "reportedUser": 1,
          "timeStart": 1,
          "timeEnd": 1,
          "apsara": 1,
          "apsaraId": 1,
          "apsaraThumbId": 1,
          "insight": 1,
          "fullName": 1,
          "username": 1,
          "avatar": 1,
          "statusCB": 1,
          "privacy": 1,
          "isView": 1,
          "music": {
            "_id": "$musicId",
            "musicTitle": "$musicTitle",
            "artistName": "$artistName",
            "albumName": "$albumName",
            "apsaraMusic": "$apsaraMusic",
            "apsaraThumnail": "$apsaraThumnail",

          },

        }
      },
      {
        "$sort":
        {
          createdAt: - 1
        }
      },
      {
        "$group":
        {
          _id: {
            email: "$email",
            username: "$username"
          },
          story:
          {
            "$push":
            {
              "mediaEndpoint": "$mediaEndpoint",
              "postID": "$postID",
              "musicTitle": "$musicTitle",
              "artistName": "$artistName",
              "albumName": "$albumName",
              "apsaraMusic": "$apsaraMusic",
              "apsaraThumnail": "$apsaraThumnail",
              "genre": "$genre",
              "theme": "$theme",
              "mood": "$mood",
              "mediaType": "$mediaType",
              "email": "$email",
              "postType": "$postType",
              "description": "$description",
              "active": "$active",
              "createdAt": "$createdAt",
              "updatedAt": "$updatedAt",
              "expiration": "$expiration",
              "visibility": "$visibility",
              "location": "$location",
              "allowComments": "$allowComments",
              "isSafe": "$isSafe",
              "isOwned": "$isOwned",
              "metadata": "$metadata",
              "contentModeration": "$contentModeration",
              "reportedStatus": "$reportedStatus",
              "reportedUserCount": "$reportedUserCount",
              "contentModerationResponse": "$contentModerationResponse",
              "reportedUser": "$reportedUser",
              "apsara": "$apsara",
              "apsaraId": "$apsaraId",
              "apsaraThumbId": "$apsaraThumbId",
              "insight": "$insight",
              "fullName": "$fullName",
              "username": "$username",
              "music": "$music",
              "avatar":
              {
                $cond: {
                  if: {
                    $eq: ["$avatar", {}]
                  },
                  then: null,
                  else: "$avatar"
                }
              },
              "statusCB": "$statusCB",
              "privacy": "$privacy",
              "isViewed":
              {
                $cond: {
                  if: {
                    $eq: ["$isView", []]
                  },
                  then: false,
                  else: true
                }
              },

            }
          }
        }
      },
      {
        "$sort":
        {
          'story.createdAt': - 1
        }
      },
      {
        "$project":
        {
          _id: 0,
          email: "$_id.email",
          username: "$_id.username",
          story: 1
        }
      },
      {
        $skip: (page * limit)
      },
      {
        $limit: limit
      },

    ]);


    return query;
  }
}
