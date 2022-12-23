import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateGetusercontentsDto } from './dto/create-getusercontents.dto';
import { Getusercontents, GetusercontentsDocument } from './schemas/getusercontents.schema';
import { PostsService } from '../../content/posts/posts.service';
import { MediavideosService } from '../../content/mediavideos/mediavideos.service';
import { MediapictsService } from '../../content/mediapicts/mediapicts.service';
import { MediaprofilepictsService } from '../../content/mediaprofilepicts/mediaprofilepicts.service';
import { MediadiariesService } from '../../content/mediadiaries/mediadiaries.service';

import { InsightsService } from '../../content/insights/insights.service';
import { DisqusService } from '../../content/disqus/disqus.service';
import { DisquslogsService } from '../../content/disquslogs/disquslogs.service';
import { PostContentService } from '../../content/posts/postcontent.service';
//import { CountriesService } from '../../infra/countries/countries.service';
@Injectable()
export class GetusercontentsService {

  constructor(
    @InjectModel(Getusercontents.name, 'SERVER_FULL')
    private readonly getusercontentsModel: Model<GetusercontentsDocument>,
    private readonly postsService: PostsService,
    private readonly mediavideosService: MediavideosService,
    private readonly mediapictsService: MediapictsService,
    private readonly mediaprofilepictsService: MediaprofilepictsService,
    private readonly mediadiariesService: MediadiariesService,
    private readonly insightsService: InsightsService,
    private readonly disqusService: DisqusService,
    private readonly disquslogsService: DisquslogsService,
    private readonly postContentService: PostContentService,

    // private readonly countriesService: CountriesService,

  ) { }

  async findAll(): Promise<Getusercontents[]> {
    return this.getusercontentsModel.find().exec();
  }
  async findcountfilter(email: string) {
    const query = await this.getusercontentsModel.aggregate([

      {
        $match: {
          email: email
        }
      },
      {
        $group: {
          _id: "$email",
          totalpost: {
            $sum: 1
          }
        }
      }
    ]);
    return query;
  }

  async findcountfilterall(keys: string, postType: string) {
    const query = await this.getusercontentsModel.aggregate([
      {
        $match: {
          $or: [{
            description: {
              $regex: keys, $options: 'i'
            }, postType: postType
          }, {
            tags: {
              $regex: keys, $options: 'i'
            }, postType: postType
          }]
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

  async findcountfilteTag(keys: string) {
    const query = await this.getusercontentsModel.aggregate([
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

  async findcountfilteTagAll() {
    const query = await this.getusercontentsModel.aggregate([
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

  async findalldata(email: string, monetize: any, popular: any, startdate: string, enddate: string, page: number, limit: number) {
    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }

    var pipeline = [];

    pipeline.push(
      {
        $addFields: {

          salePrice: {
            $cmp: ["$saleAmount", 0]
          }
        },

      },
      {
        $project: {
          refs: {
            $arrayElemAt: ['$contentMedias', 0]
          },
          createdAt: 1,
          reportedStatus: 1,
          reportedUserCount: 1,
          updatedAt: 1,
          postID: 1,
          email: 1,
          postType: 1,
          description: 1,
          title: 1,
          active: 1,
          metadata: 1,
          location: 1,
          tags: 1,
          likes: 1,
          shares: 1,
          reaction: 1,
          comments: 1,
          isOwned: 1,
          views: 1,
          visibility: 1,
          allowComments: 1,
          certified: 1,
          isViewed:
          {
            $cond: {
              if: {
                $eq: ["$views", 0]
              },
              then: false,
              else: true
            }
          },
          saleLike: {
            $cond: {
              if: {
                $eq: ["$saleLike", - 1]
              },
              then: false,
              else: "$saleLike"
            }
          },
          saleView: {
            $cond: {
              if: {
                $eq: ["$saleView", - 1]
              },
              then: false,
              else: "$saleView"
            }
          },
          saleAmount: {
            $cond: {
              if: {
                $eq: ["$salePrice", - 1]
              },
              then: 0,
              else: "$saleAmount"
            }
          },

          monetize: {
            $cond: {
              if: {
                $or: [{
                  $eq: ["$salePrice", -1]
                }, {
                  $eq: ["$salePrice", 0]
                },]
              },
              then: false,
              else: true
            },

          },

        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          reportedStatus: 1,
          reportedUserCount: 1,
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
          tags: 1,
          likes: 1,
          shares: 1,
          reaction: 1,
          comments: 1,
          isOwned: 1,
          views: 1,
          visibility: 1,
          isViewed: 1,
          allowComments: 1,
          certified: 1,
          saleLike: 1,
          saleView: 1,
          saleAmount: 1,
          monetize: 1,
          refe: '$refs.ref',


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
          refs: 1,
          reportedStatus: 1,
          reportedUserCount: 1,
          idmedia: 1,
          rotate: '$mediadiaries.rotate',
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
          tags: 1,
          likes: 1,
          shares: 1,
          reaction: 1,
          comments: 1,
          isOwned: 1,
          views: 1,
          visibility: 1,
          privacy: 1,
          isViewed: 1,
          allowComments: 1,
          certified: 1,
          saleLike: 1,
          saleView: 1,
          saleAmount: 1,
          monetize: 1,


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
          reportedStatus: 1,
          reportedUserCount: 1,
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
          tags: 1,
          likes: 1,
          shares: 1,
          reaction: 1,
          comments: 1,
          isOwned: 1,
          views: 1,
          visibility: 1,
          privacy: 1,
          isViewed: 1,
          allowComments: 1,
          certified: 1,
          saleLike: 1,
          saleView: 1,
          saleAmount: 1,
          monetize: 1,


        }
      },
    );

    pipeline.push({
      $match: {
        email: email
      }
    },);

    if (monetize && monetize !== undefined) {
      pipeline.push({
        $match: {
          monetize: monetize
        }
      },);
    }
    if (startdate && startdate !== undefined) {

      pipeline.push({ $match: { createdAt: { "$gte": startdate } } });

    }
    if (enddate && enddate !== undefined) {

      pipeline.push({ $match: { createdAt: { "$lte": dateend } } });

    }

    if (popular && popular !== undefined) {
      pipeline.push({ $sort: { views: -1, likes: -1 }, },);
    } else {
      pipeline.push({ $sort: { createdAt: - 1 } });
    }

    if (page > 0) {
      pipeline.push({ $skip: (page * limit) });
    }
    if (limit > 0) {
      pipeline.push({ $limit: limit });
    }
    let query = await this.getusercontentsModel.aggregate(pipeline);

    try {
      var data = null;
      var datas = null;
      var arrdata = [];
      let pict: String[] = [];
      var objk = {};
      var type = null;
      var idapsara = null;
      var apsara = null;
      var idapsaradefine = null;
      var apsaradefine = null;
      for (var i = 0; i < query.length; i++) {
        try {
          idapsara = query[i].apsaraId;
        } catch (e) {
          idapsara = "";
        }
        try {
          apsara = query[i].apsara;
        } catch (e) {
          apsara = false;
        }
        if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
          apsaradefine = false;
        } else {
          apsaradefine = true;
        }

        if (idapsara === undefined || idapsara === "" || idapsara === null) {
          idapsaradefine = "";
        } else {
          idapsaradefine = idapsara;
        }
        var type = query[i].postType;
        pict = [idapsara];

        if (idapsara === "") {
          datas = [];
        } else {
          if (type === "pict") {

            try {
              datas = await this.postContentService.getImageApsara(pict);
            } catch (e) {
              datas = [];
            }
          }
          else if (type === "vid") {
            try {
              datas = await this.postContentService.getVideoApsara(pict);
            } catch (e) {
              datas = [];
            }

          }
          else if (type === "story") {
            try {
              datas = await this.postContentService.getVideoApsara(pict);
            } catch (e) {
              datas = [];
            }
          }
          else if (type === "diary") {
            try {
              datas = await this.postContentService.getVideoApsara(pict);
            } catch (e) {
              datas = [];
            }
          }
        }
        objk = {
          "_id": query[i]._id,
          "postID": query[i].postID,
          "email": query[i].email,
          "postType": query[i].postType,
          "description": query[i].description,
          "active": query[i].active,
          "createdAt": query[i].createdAt,
          "updatedAt": query[i].updatedAt,
          "visibility": query[i].visibility,
          "location": query[i].location,
          "isViewed": query[i].isViewed,
          "saleLike": query[i].saleLike,
          "saleView": query[i].saleView,
          "likes": query[i].likes,
          "shares": query[i].shares,
          "reaction": query[i].reaction,
          "comments": query[i].comments,
          "isOwned": query[i].isOwned,
          "views": query[i].views,
          "saleAmount": query[i].saleAmount,
          "monetize": query[i].monetize,
          "mediaType": query[i].mediaType,
          "mediaThumbEndpoint": query[i].mediaThumbEndpoint,
          "mediaEndpoint": query[i].mediaEndpoint,
          "apsaraId": idapsaradefine,
          "apsara": apsaradefine,
          "media": datas
        };

        arrdata.push(objk);
      }
      data = arrdata;
    } catch (e) {
      data = null;
    }

    return data;
  }


  async findlatesdata(email: string, skip: number, limit: number): Promise<object> {


    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },
          // refe:'$refs.ref',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',

        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },

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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },



        }
      },

      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },

    ]);

    return query;
  }


  async findpopular(email: string, skip: number, limit: number): Promise<object> {


    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },
          // refe:'$refs.ref',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',

        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },

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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },




        }
      },

      { $sort: { views: -1, likes: -1 }, },
      { $skip: skip },
      { $limit: limit },

    ]);

    return query;
  }

  async findsearch(email: string, title: string, skip: number, limit: number): Promise<object> {

    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email, title: { $regex: title, $options: 'i' } } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',

        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },

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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },




        }
      },

      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },

    ]);

    return query;
  }


  async findmonetize(email: string, skip: number, limit: number): Promise<object> {


    const query = await this.getusercontentsModel.aggregate([

      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }


        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },
          // refe:'$refs.ref',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          certified: '$certified',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          saleAmount: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: 0, else: "$saleAmount" }
          },
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },

        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          certified: '$certified',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          saleAmount: '$saleAmount',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',

          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          certified: '$certified',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          saleAmount: '$saleAmount',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },

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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          certified: '$certified',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          saleAmount: '$saleAmount',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },




        }
      },
      { $match: { email: email, monetize: true } },
      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },

    ]);

    return query;
  }

  async findmanagementcontentall(email: string): Promise<object> {

    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

          postid: '$postID'
        },
      },

      {
        "$lookup": {
          "from": "disqus",
          "let": {
            "postIDs": "$postID",
            "postTypes": "$postType"
          },
          "pipeline": [
            {
              "$match": {
                "$expr": {
                  "$eq": [
                    "$postID",
                    "$$postIDs"
                  ]
                }
              }
            },
            {
              "$lookup": {
                "from": "disquslogs",
                "let": {
                  "disqusIDs": "$disqusID"
                },
                "pipeline": [
                  {
                    "$match": {
                      "$expr": {
                        "$eq": [
                          "$disqusID",
                          "$$disqusIDs"
                        ]
                      }
                    }
                  },

                  {
                    "$lookup": {
                      "from": "disquslogsdata",
                      "let": {
                        "parentIDs": "$parentID",
                        "actives": "$active"
                      },
                      "pipeline": [
                        {
                          "$match": {
                            "$expr": {
                              "$eq": [
                                "$parentID",
                                "$$parentIDs"
                              ]
                            }
                          }
                        }
                      ],
                      "as": "replyLogs"
                    },
                  },
                  { "$match": { "active": true } },
                  { "$group": { _id: "$parentID", replyLogs: { $push: "$$ROOT" } } },
                  { "$set": { "disqusID": "$$disqusIDs", "postID": "$$postIDs", "postType": "$$postTypes" } }
                ],
                "as": "disquslogs"
              }
            }, { "$unset": "disqusLogs" },

          ],
          "as": "disqusdata"
        }
      },

      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },


      {
        $project: {
          // "_id" : 0, 
          // posts : '$$ROOT',

          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',

          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',

          disqus: '$disqusdata'

        }
      },
      {
        $lookup: {
          localField: 'posts.postID',
          from: 'disqus',
          foreignField: 'postID',
          as: 'disqusdata'
        }
      }, {
        $unwind: {
          path: '$disqusdata',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $lookup: {
          from: 'disquslogs',
          localField: 'disqusdata.disqusLogs.$id', // or author.$id
          foreignField: "_id",
          as: "logs"
        }
      },

      {
        $lookup: {
          from: 'disquslogs',
          localField: 'logs.replyLogs.$id', // or author.$id
          foreignField: "_id",
          as: "logs2"
        }
      },
      {
        $project: {
          // replylogs:'$logs2',
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          disqus: '$disqus',


          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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
          // replylogs:'$replylogs',
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },
          disqus: '$disqus'
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
          //replylogs:'$replylogs',
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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },

          disqus: '$disqus'




        }
      },
      {
        $project: {
          // replylogs:'$replylogs',
          rotate: '$mediadiaries.rotate',
          mediaBasePath: '$mediaBasePath',
          mediaUri: '$mediaUri',
          mediaType: '$mediaType',

          mediaThumbEndpoint: '$mediaThumbEndpoint',

          mediaEndpoint: '$mediaEndpoint',

          mediaThumbUri: '$mediaThumbUri',

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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: '$insight',
          avatar: '$avatar',

          disqus: '$disqus'




        }
      },

      { $sort: { createdAt: -1 }, },
      // { $skip: 0},
      // { $limit: 10 },

    ]);

    return query;
  }
  async findmanagementcontentpopular(email: string) {



    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

          postid: '$postID'
        },
      },


      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },


      {
        $project: {


          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',

          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',


        }
      },

      {
        $project: {

          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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

          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },

        }
      },

      {
        $addFields: {


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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },

        }
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: '$mediaBasePath',
          mediaUri: '$mediaUri',
          mediaType: '$mediaType',

          mediaThumbEndpoint: '$mediaThumbEndpoint',

          mediaEndpoint: '$mediaEndpoint',

          mediaThumbUri: '$mediaThumbUri',

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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: '$insight',
        }
      },

      { $sort: { views: -1, likes: -1 }, },
      { $skip: 0 },
      { $limit: 1 },

    ]);
    return query;
  }
  async findmanagementcontentlikes(email: string) {


    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

          postid: '$postID'
        },
      },


      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },


      {
        $project: {


          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',

          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',


        }
      },

      {
        $project: {

          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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

          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },

        }
      },

      {
        $addFields: {


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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },

        }
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: '$mediaBasePath',
          mediaUri: '$mediaUri',
          mediaType: '$mediaType',

          mediaThumbEndpoint: '$mediaThumbEndpoint',

          mediaEndpoint: '$mediaEndpoint',

          mediaThumbUri: '$mediaThumbUri',

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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: '$insight',
        }
      },

      { $sort: { likes: -1 }, },
      { $skip: 0 },
      { $limit: 1 },

    ]);
    return query;
  }

  async findmanagementcontentshare(email: string) {

    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

          postid: '$postID'
        },
      },


      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },


      {
        $project: {


          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',

          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',


        }
      },

      {
        $project: {

          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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

          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },

        }
      },

      {
        $addFields: {


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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },

        }
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: '$mediaBasePath',
          mediaUri: '$mediaUri',
          mediaType: '$mediaType',

          mediaThumbEndpoint: '$mediaThumbEndpoint',

          mediaEndpoint: '$mediaEndpoint',

          mediaThumbUri: '$mediaThumbUri',

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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: '$insight',
        }
      },

      { $sort: { shares: -1 }, },
      { $skip: 0 },
      { $limit: 1 },

    ]);
    return query;
  }
  async findmanagementcontentlatepos(email: string) {

    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

          postid: '$postID'
        },
      },


      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },


      {
        $project: {


          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',

          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',


        }
      },

      {
        $project: {

          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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

          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },

        }
      },

      {
        $addFields: {


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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },

        }
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: '$mediaBasePath',
          mediaUri: '$mediaUri',
          mediaType: '$mediaType',

          mediaThumbEndpoint: '$mediaThumbEndpoint',

          mediaEndpoint: '$mediaEndpoint',

          mediaThumbUri: '$mediaThumbUri',

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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: '$insight',
        }
      },

      { $sort: { createdAt: -1 }, },
      { $skip: 0 },
      { $limit: 1 },

    ]);
    return query;
  }

  async findmanagementcontentmonetize(email: string) {

    const query = await this.getusercontentsModel.aggregate([

      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

          postid: '$postID',
          salePrice: { $cmp: ["$saleAmount", 0] }
        },
      },


      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },


      {
        $project: {


          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',

          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },


        }
      },

      {
        $project: {

          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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

          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          monetize: '$monetize',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },

        }
      },

      {
        $addFields: {


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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          monetize: '$monetize',
          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },

        }
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: '$mediaBasePath',
          mediaUri: '$mediaUri',
          mediaType: '$mediaType',

          mediaThumbEndpoint: '$mediaThumbEndpoint',

          mediaEndpoint: '$mediaEndpoint',

          mediaThumbUri: '$mediaThumbUri',

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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          monetize: '$monetize',
          insight: '$insight',
        }
      },
      { $match: { email: email, monetize: true } },
      { $sort: { createdAt: -1 }, },
      { $skip: 0 },
      { $limit: 1 },

    ]);
    return query;
  }
  async findmanagementcontentowner(email: string) {

    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email, isOwned: true } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

          postid: '$postID'
        },
      },


      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },


      {
        $project: {


          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',

          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',


        }
      },

      {
        $project: {

          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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

          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },

        }
      },

      {
        $addFields: {


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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },

        }
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: '$mediaBasePath',
          mediaUri: '$mediaUri',
          mediaType: '$mediaType',

          mediaThumbEndpoint: '$mediaThumbEndpoint',

          mediaEndpoint: '$mediaEndpoint',

          mediaThumbUri: '$mediaThumbUri',

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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: '$insight',
        }
      },

      { $sort: { createdAt: -1 }, },
      { $skip: 0 },
      { $limit: 1 },

    ]);
    return query;
  }
  async findmanagementcontentregion(email: string, countries: string) {

    const query = await this.getusercontentsModel.aggregate([
      {
        $match: {
          email: email,
          location: {
            $regex: countries, $options: 'i'
          }
        }
      },
      {
        $group: {
          _id: "$email",
          totalpost: {
            $sum: 1
          }
        }
      }

    ]);
    return query;
  }

  async findmanagementcontentallregion(email: string) {

    const query = await this.getusercontentsModel.find({ "email": email }).exec();
    return query;
  }

  async findmanagementcontenttrafic(email: string) {


    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

          postid: '$postID'
        },
      },


      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },


      {
        $project: {


          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',

          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',


        }
      },

      {
        $project: {

          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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

          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },

        }
      },

      {
        $addFields: {


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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },

        }
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: '$mediaBasePath',
          mediaUri: '$mediaUri',
          mediaType: '$mediaType',

          mediaThumbEndpoint: '$mediaThumbEndpoint',

          mediaEndpoint: '$mediaEndpoint',

          mediaThumbUri: '$mediaThumbUri',

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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: '$insight',
        }
      },

      { $sort: { views: -1, likes: -1 }, },
      { $skip: 0 },
      { $limit: 1 },

    ]);
    return query;
  }


  async findmanagementcontentmoderate(email: string) {

    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

          postid: '$postID'
        },
      },


      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },


      {
        $project: {


          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',

          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',


        }
      },

      {
        $project: {

          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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

          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },

        }
      },

      {
        $addFields: {


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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },

        }
      },
      {
        $project: {

          rotate: '$mediadiaries.rotate',
          mediaBasePath: '$mediaBasePath',
          mediaUri: '$mediaUri',
          mediaType: '$mediaType',

          mediaThumbEndpoint: '$mediaThumbEndpoint',

          mediaEndpoint: '$mediaEndpoint',

          mediaThumbUri: '$mediaThumbUri',

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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: '$insight',
        }
      },

      { $sort: { createdAt: -1 }, },
      { $skip: 0 },
      { $limit: 1 },

    ]);
    return query;
  }

  async findtime(postID: string) {

    const query = await this.getusercontentsModel.aggregate([

      {
        $match: {

          postID: postID

        }

      },
      {
        $project: {

          createdAt: "$createdAt"


        }
      },

    ]);


    return query;
  }


  async findpostid(postID: string): Promise<object> {

    const query = await this.getusercontentsModel.aggregate([
      { $match: { postID: postID } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },
          // refe:'$refs.ref',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',

        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },

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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },
        }
      },
      { $limit: 1 },

    ]);

    return query;
  }


  async findalldatakonten(email: string, skip: number, limit: number): Promise<object> {


    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },
        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },

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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },




        }
      },

      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },

    ]);

    return query;
  }

  async findalldatakontenowned(email: string, skip: number, limit: number): Promise<object> {

    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email, isOwned: true } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },
        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },

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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },
        }
      },

      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },

    ]);

    return query;
  }
  async findalldatakontenmonetize(email: string, skip: number, limit: number): Promise<object> {


    const query = await this.getusercontentsModel.aggregate([

      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },
        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },

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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },
        }
      },
      { $match: { email: email, monetize: true } },
      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },

    ]);

    return query;
  }


  async findalldatakontenpostype(email: string, postType: string, skip: number, limit: number): Promise<object> {


    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email, postType: postType } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },
        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },

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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },
        }
      },

      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },

    ]);

    return query;
  }

  async findalldatakontendaterange(email: string, startdate: string, enddate: string, skip: number, limit: number): Promise<object> {


    var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

    var dateend = currentdate.toISOString();

    const query = await this.getusercontentsModel.aggregate([

      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },
        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },

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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },
        }
      },
      { $match: { email: email, createdAt: { $gte: startdate, $lte: dateend } } },
      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },

    ]);

    return query;
  }


  async findalldatakontenbuy(iduserbuy: Types.ObjectId, skip: number, limit: number): Promise<object> {


    const query = await this.getusercontentsModel.aggregate([
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },
      {
        $lookup: {
          from: 'transactions',
          localField: 'postID',
          foreignField: 'postid',
          as: 'tr_data',
        },
      },
      {
        "$unwind": {
          "path": "$tr_data",
          "preserveNullAndEmptyArrays": false
        }
      },
      { "$match": { "tr_data.iduserbuyer": iduserbuy, "tr_data.status": "success" } },
      { "$sort": { "tr_data.createdAt": -1 }, },


      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: {
            $cond: { if: { $eq: ["$salePrice", -1] }, then: false, else: true }
          },
        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },

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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes'
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },




        }
      },
      { $skip: skip },
      { $limit: limit },

    ]);

    return query;
  }


  async findalldatakontenmultiple(iduserbuy: Types.ObjectId, email: string, ownership: boolean, monetesisasi: boolean, buy: boolean, archived: boolean, reported: boolean, postType: string, startdate: string, enddate: string, skip: number, limit: number) {

    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }
    var pipeline = new Array<any>();
    if (buy && buy !== undefined) {
      pipeline = new Array<any>(
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
          $lookup: {
            from: 'transactions',
            localField: 'postID',
            foreignField: 'postid',
            as: 'trans',
          }
        },
        {
          $unwind: {
            path: '$trans',
            preserveNullAndEmptyArrays: false
          }
        },

        {
          $addFields: {
            'auth': { $arrayElemAt: ['$authdata', 0] },
            'basic': { $arrayElemAt: ['$basicdata', 0] },
            'profilepictid': { $arrayElemAt: ['$basicdata.profilePict.$id', 0] },
            'insightid': { $arrayElemAt: ['$basicdata.insight.$id', 0] },
            'mediaid': { $arrayElemAt: ['$contentMedias.$id', 0] },
            'mediaref': { $arrayElemAt: ['$contentMedias.$ref', 0] },
            'isViewed': {
              '$cond': { if: { '$eq': ['$views', 0] }, then: false, else: true }
            },
            salePrice: "$trans.amount",
            monetize: true
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
            'avatar': { $arrayElemAt: ['$avatardata', 0] },
            'insight': { $arrayElemAt: ['$insightdata', 0] },
            'picture': { $arrayElemAt: ['$picturedata', 0] },
            'diary': { $arrayElemAt: ['$diarydata', 0] },
            'video': { $arrayElemAt: ['$videodata', 0] },
          }
        },
        {
          $addFields: {
            pathavatar: '/profilepict',

            pathpicture: '/pict',
            mediapicture: { $replaceOne: { input: "$picture.mediaUri", find: "_0001.jpeg", replacement: "" } },

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
              medreplace: { $replaceOne: { input: "$avatar.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
            fullName: "$basic.fullName",
            username: "$auth.username",
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
            tags: 1,
            likes: 1,
            views: 1,
            shares: 1,
            comments: 1,
            isOwned: 1,
            privacy: {
              isPostPrivate: '$basic.isPostPrivate',
              isCelebrity: '$basic.isCelebrity',
              isPrivate: '$basic.isPrivate'
            },
            isViewed: '$isViewed',
            allowComments: 1,
            isSafe: 1,
            saleLike: 1,
            saleView: 1,
            monetize: "$monetize",
            salePrice: "$salePrice",
            mediaref: "$mediaref",
            rotate: '$diary.rotate',
            trans: 1,
            mediaBasePath: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': '$picture.mediaBasePath' },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': '$diary.mediaBasePath' },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': '$video.mediaBasePath' }
                ],
                default: ''
              }
            },
            mediaUri: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': '$picture.mediaUri' },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': '$diary.mediaUri' },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': '$video.mediaUri' }
                ],
                default: ''
              }
            },
            mediaType: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': '$picture.mediaType' },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': '$diary.mediaType' },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': '$video.mediaType' }
                ],
                default: ''
              }
            },
            mediaThumbEndpoint: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': '$picture.mediaThumb' },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': { $concat: ["$paththumbdiary", "/", "$mediadiary"] }, },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': { $concat: ["$paththumbvideo", "/", "$mediavideo"] }, }
                ],
                default: ''
              }
            },

            mediaEndpoint: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': { $concat: ["$pathpicture", "/", "$mediapicture"] }, },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': { $concat: ["$pathdiary", "/", "$mediadiary"] }, },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': { $concat: ["$pathvideo", "/", "$mediavideo"] }, }
                ],
                default: ''
              }
            },

            mediaThumbUri: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': '$diary.mediaThumb' },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': '$diary.mediaThumb' },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': '$video.mediaThumb' }
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
      );
      pipeline.push({ $match: { "trans.iduserbuyer": iduserbuy, "trans.status": "Success" } });
    }
    else {
      console.log("not monetized");
      pipeline = new Array<any>(
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
            'auth': { $arrayElemAt: ['$authdata', 0] },
            'basic': { $arrayElemAt: ['$basicdata', 0] },
            'profilepictid': { $arrayElemAt: ['$basicdata.profilePict.$id', 0] },
            'insightid': { $arrayElemAt: ['$basicdata.insight.$id', 0] },
            'mediaid': { $arrayElemAt: ['$contentMedias.$id', 0] },
            'mediaref': { $arrayElemAt: ['$contentMedias.$ref', 0] },
            'isViewed': {
              '$cond': { if: { '$eq': ['$views', 0] }, then: false, else: true }
            },
            salePrice: "$saleAmount",
            monetize: {
              $cond: { if: { $eq: ["$saleAmount", 0] }, then: false, else: true }
            }
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
            'avatar': { $arrayElemAt: ['$avatardata', 0] },
            'insight': { $arrayElemAt: ['$insightdata', 0] },
            'picture': { $arrayElemAt: ['$picturedata', 0] },
            'diary': { $arrayElemAt: ['$diarydata', 0] },
            'video': { $arrayElemAt: ['$videodata', 0] },
          }
        },
        {
          $addFields: {
            pathavatar: '/profilepict',

            pathpicture: '/pict',
            mediapicture: { $replaceOne: { input: "$picture.mediaUri", find: "_0001.jpeg", replacement: "" } },

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
              medreplace: { $replaceOne: { input: "$avatar.mediaUri", find: "_0001.jpeg", replacement: "" } },
            },
            fullName: "$basic.fullName",
            username: "$auth.username",
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
            tags: 1,
            likes: 1,
            views: 1,
            shares: 1,
            comments: 1,
            isOwned: 1,
            privacy: {
              isPostPrivate: '$basic.isPostPrivate',
              isCelebrity: '$basic.isCelebrity',
              isPrivate: '$basic.isPrivate'
            },
            isViewed: '$isViewed',
            allowComments: 1,
            isSafe: 1,
            saleLike: 1,
            saleView: 1,
            reportedUserCount: 1,
            monetize: "$monetize",
            salePrice: "$salePrice",
            mediaref: "$mediaref",
            rotate: '$diary.rotate',
            mediaBasePath: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': '$picture.mediaBasePath' },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': '$diary.mediaBasePath' },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': '$video.mediaBasePath' }
                ],
                default: ''
              }
            },
            mediaUri: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': '$picture.mediaUri' },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': '$diary.mediaUri' },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': '$video.mediaUri' }
                ],
                default: ''
              }
            },
            mediaType: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': '$picture.mediaType' },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': '$diary.mediaType' },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': '$video.mediaType' }
                ],
                default: ''
              }
            },
            mediaThumbEndpoint: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': '$picture.mediaThumb' },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': { $concat: ["$paththumbdiary", "/", "$mediadiary"] }, },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': { $concat: ["$paththumbvideo", "/", "$mediavideo"] }, }
                ],
                default: ''
              }
            },

            mediaEndpoint: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': { $concat: ["$pathpicture", "/", "$mediapicture"] }, },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': { $concat: ["$pathdiary", "/", "$mediadiary"] }, },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': { $concat: ["$pathvideo", "/", "$mediavideo"] }, }
                ],
                default: ''
              }
            },

            mediaThumbUri: {
              $switch: {
                branches: [
                  { 'case': { '$eq': ['$mediaref', 'mediapicts'] }, 'then': '$diary.mediaThumb' },
                  { 'case': { '$eq': ['$mediaref', 'mediadiaries'] }, 'then': '$diary.mediaThumb' },
                  { 'case': { '$eq': ['$mediaref', 'mediavideos'] }, 'then': '$video.mediaThumb' }
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
        }
      );
      pipeline.push({ $match: { email: email, active: true } });
      if (ownership !== undefined) {
        pipeline.push({ $match: { isOwned: ownership } });
      }
      if (archived && archived !== undefined) {
        pipeline.push({ $match: { postType: "story" } });
      }
    }

    if (postType && postType !== undefined) {
      pipeline.push({ $match: { postType: postType } });
    }
    if (monetesisasi !== undefined) {
      pipeline.push({ $match: { monetize: monetesisasi } });
    }
    if (startdate && startdate !== undefined) {
      pipeline.push({ $match: { createdAt: { "$gte": startdate } } });
    }
    if (enddate && enddate !== undefined) {
      pipeline.push({ $match: { createdAt: { "$lte": dateend } } });
    }
    if (reported !== undefined) {
      if (reported)
        pipeline.push({ $match: { "reportedUserCount": { $gt: 0 } } })
      else
        pipeline.push({ $match: { "reportedUserCount": 0 } })
    }

    if (buy !== undefined) {
      pipeline.push({ $sort: { "trans.createdAt": -1 } });
    }
    else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });
    const util = require('util')
    console.log(util.inspect(pipeline, { showHidden: false, depth: null, colors: true }));

    const query = await this.getusercontentsModel.aggregate(pipeline);
    var data = null;
    var arrdata = [];
    let pict: String[] = [];
    var objk = {};
    var type = null;
    var idapsara = null;
    for (var i = 0; i < query.length; i++) {
      try {
        idapsara = query[i].apsaraId;
      } catch (e) {
        idapsara = "";
      }

      var type = query[i].postType;
      pict = [idapsara];

      if (idapsara === "") {
        data = [];
      } else {
        if (type === "pict") {

          try {
            data = await this.postContentService.getImageApsara(pict);
          } catch (e) {
            data = [];
          }
        }
        else if (type === "vid") {
          try {
            data = await this.postContentService.getVideoApsara(pict);
          } catch (e) {
            data = [];
          }

        }
        else if (type === "story") {
          try {
            data = await this.postContentService.getVideoApsara(pict);
          } catch (e) {
            data = [];
          }
        }
        else if (type === "diary") {
          try {
            data = await this.postContentService.getVideoApsara(pict);
          } catch (e) {
            data = [];
          }
        }
      }
      objk = {
        "_id": query[i]._id,
        "insight": query[i].insight,
        "avatar": query[i].avatar,
        "mediaType": query[i].mediaType,
        "mediaThumbEndpoint": query[i].mediaThumbEndpoint,
        "mediaEndpoint": query[i].mediaEndpoint,
        "apsaraId": query[i].apsaraId,
        "apsara": query[i].apsara,
        "fullName": query[i].fullName,
        "username": query[i].username,
        "createdAt": query[i].createdAt,
        "updatedAt": query[i].updatedAt,
        "postID": query[i].postID,
        "email": query[i].email,
        "postType": query[i].postType,
        "description": query[i].description,
        "title": query[i].title,
        "active": query[i].active,
        "metadata": query[i].metadata,
        "location": query[i].location,
        "tags": query[i].tags,
        "likes": query[i].likes,
        "shares": query[i].shares,
        "isOwned": query[i].isOwned,
        "views": query[i].views,
        "privacy": query[i].privacy,
        "isViewed": query[i].isViewed,
        "allowComments": query[i].allowComments,
        "saleLike": query[i].saleLike,
        "saleView": query[i].saleView,
        "monetize": query[i].monetize,
        "salePrice": query[i].salePrice,
        "media": data,
        "trans": query[i].trans
      };

      arrdata.push(objk);
    }
    return arrdata;

  }

  async findpopularanalitic(email: string): Promise<object> {


    const query = await this.getusercontentsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          profilevisit: { $cmp: ["$profilevisit", 0] }

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },
          // refe:'$refs.ref',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          visit: {
            $cond: { if: { $eq: ["$profilevisit", -1] }, then: 0, else: 1 }
          },
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',

        }
      },
      {
        $project: {
          refs: '$refs.$ref',
          idmedia: '$refs.$id',
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          visit: '$visit',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          visit: '$visit',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',


          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes',

          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },

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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          visit: '$visit',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',

          insight: {
            shares: '$insights.shares',
            followers: '$insights.followers',
            comments: '$insights.comments',
            followings: '$insights.followings',
            reactions: '$insights.reactions',
            posts: '$insights.posts',
            views: '$insights.views',
            likes: '$insights.likes',

          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },

        }
      },

      { $sort: { likes: -1, comments: -1 }, },
      { $limit: 1 },

    ]);

    return query;
  }
  async findcontenbuy(postID: string) {

    const query = await this.getusercontentsModel.aggregate([
      { $match: { postID: postID } },
      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          certified: '$certified',
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
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      // {
      //   $lookup: {
      //     from: 'insights2',
      //     localField: 'insight_id',
      //     foreignField: '_id',
      //     as: 'insight_data',
      //   },
      // },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          // insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',

          // insight: {
          //   shares: '$insights.shares',
          //   followers: '$insights.followers',
          //   comments: '$insights.comments',
          //   followings: '$insights.followings',
          //   reactions: '$insights.reactions',
          //   posts: '$insights.posts',
          //   views: '$insights.views',
          //   likes: '$insights.likes'
          // },
          // avatar: {
          //   mediaBasePath: '$profilpict.mediaBasePath',
          //   mediaUri: '$profilpict.mediaUri',
          //   mediaType: '$profilpict.mediaType',
          //   mediaEndpoint: '$profilpict.fsTargetUri',
          //   medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          // },

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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',
          // insight: {
          //   shares: '$insights.shares',
          //   followers: '$insights.followers',
          //   comments: '$insights.comments',
          //   followings: '$insights.followings',
          //   reactions: '$insights.reactions',
          //   posts: '$insights.posts',
          //   views: '$insights.views',
          //   likes: '$insights.likes'
          // },
          // avatar: {
          //   mediaBasePath: '$profilpict.mediaBasePath',
          //   mediaUri: '$profilpict.mediaUri',
          //   mediaType: '$profilpict.mediaType',
          //   mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          // },
        }
      }

    ]);
    return query;
  }


  async findcontentfilter(keys: string, postType: string, skip: number, limit: number) {

    const query = await this.getusercontentsModel.aggregate([
      {
        $match: {
          $or: [{
            description: {
              $regex: keys, $options: 'i'
            }, postType: postType, visibility: "PUBLIC", active: true
          }, {
            tags: {
              $regex: keys, $options: 'i'
            }, postType: postType, visibility: "PUBLIC", active: true
          }]
        }
      },


      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          certified: '$certified',
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
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
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
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
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
          mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
          mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
          mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          // insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: { $arrayElemAt: ['$userAuth_data', 0] },
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          certified: '$certified',
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
          certified: '$certified',
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


  async findcontentfilterTags(keys: string, skip: number, limit: number) {

    const query = await this.getusercontentsModel.aggregate([
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

  async findcontentAllTags(skip: number, limit: number) {

    const query = await this.getusercontentsModel.aggregate([


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


  async findcontentfilterbyuser(username: string, postType: string, skip: number, limit: number) {

    const query = await this.getusercontentsModel.aggregate([


      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          visibility: '$visibility',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          certified: '$certified',
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
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          visibility: '$visibility',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
        },
      },

      {
        "$unwind": {
          "path": "$userAuth_data",
          "preserveNullAndEmptyArrays": false
        }
      },

      {
        "$match": {
          "userAuth_data.username": username,
          "postType": postType
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

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          // insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: '$userAuth_data',
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          visibility: '$visibility',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',


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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          visibility: '$visibility',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',

        }
      },
      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },
    ]);
    return query;
  }

  async findcontentfilterbyuserCount(username: string, postType: string) {

    const query = await this.getusercontentsModel.aggregate([


      {
        $addFields: {
          ubasic_id: '$userProfile.$id',
          salePrice: { $cmp: ["$saleAmount", 0] }

        },
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'ubasic_id',
          foreignField: '_id',
          as: 'userbasics_data',
        },
      },

      {
        $project: {
          refs: { $arrayElemAt: ['$contentMedias', 0] },
          user: { $arrayElemAt: ['$userbasics_data', 0] },

          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed:
          {
            $cond: { if: { $eq: ["$views", 0] }, then: false, else: true }
          },
          allowComments: '$allowComments',
          certified: '$certified',
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
          profilpictid: '$user.profilePict.$id',
          insight_id: '$user.insight.$id',
          userAuth_id: '$user.userAuth.$id',
          fullName: '$user.fullName',
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
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          isPostPrivate: '$user.isPostPrivate',
          privacy: {
            isPostPrivate: '$user.isPostPrivate',
            isCelebrity: '$user.isCelebrity',
            isPrivate: '$user.isPrivate',
          },
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
        },
      },

      {
        "$unwind": {
          "path": "$userAuth_data",
          "preserveNullAndEmptyArrays": false
        }
      },

      {
        "$match": {
          "userAuth_data.username": username,
          "postType": postType
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

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          // insights: { $arrayElemAt: ['$insight_data', 0] },
          auth: '$userAuth_data',
          mediapictPath: '$mediapict.mediaBasePath',
          mediadiariPath: '$mediadiaries.mediaBasePath',
          mediavideoPath: '$mediavideos.mediaBasePath',
          refs: '$refs',
          idmedia: '$idmedia',
          rotate: '$mediadiaries.rotate',
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',


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
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatthumbdiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatthumbvideo", "/", "$media_video"] }, }
              ],
              default: ''
            }
          },

          mediaEndpoint: {
            $switch: {
              branches: [
                { 'case': { '$eq': ['$refs', 'mediapicts'] }, 'then': { $concat: ["$concatmediapict", "/", "$media_pict"] }, },
                { 'case': { '$eq': ['$refs', 'mediadiaries'] }, 'then': { $concat: ["$concatmediadiari", "/", "$media_diari"] }, },
                { 'case': { '$eq': ['$refs', 'mediavideos'] }, 'then': { $concat: ["$concatmediavideo", "/", "$media_video"] }, }
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
          likes: '$likes',
          shares: '$shares',
          comments: '$comments',
          isOwned: '$isOwned',
          views: '$views',
          privacy: '$privacy',
          isViewed: '$isViewed',
          allowComments: '$allowComments',
          certified: '$certified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',

        }
      },
      { $sort: { createdAt: -1 }, }
    ]);
    return query;
  }
  async findPostIDsByEmail(email: string) {
    const posts = await this.getusercontentsModel.find({
      "email": email,
    }, {
      postID: 1, _id: 0
    });
    var postIDs = [];
    for (var i = 0; i < posts.length; i++) {
      postIDs.push(posts[i].postID);
    }
    // console.log(postIDs);
    return postIDs;
  }

  async databasekonten(username: string, description: string, kepemilikan: string, statusjual: string, celebrity: any, postType: any[], page: number, limit: number) {

    var pipeline = [];

    var match = {};
    var matchAll = {};
    var kepem = {};
    var uname = {};
    var desc = {};
    var jual = {};
    var artis = {};
    var tipe = {};
    if (username && username !== undefined) {
      uname = {
        $regex: username, $options: 'i'
      };
    }
    else {
      uname = {
        $ne: null
      };
    }
    if (description && description !== undefined) {
      desc = {
        $regex: description, $options: 'i'
      };
    }
    else {
      desc = {
        $ne: null
      };
    }
    if (kepemilikan && kepemilikan !== undefined) {
      kepem = {
        $regex: kepemilikan, $options: 'i'
      };
    } else {
      kepem = {
        $ne: null
      };
    }
    if (statusjual && statusjual !== undefined) {
      jual = statusjual
    }
    else {
      jual = {
        $ne: null
      };
    }
    if (celebrity && celebrity !== undefined) {
      artis = true
    }
    else {
      artis = {
        $ne: null
      };
    }

    if (postType && postType !== undefined) {
      tipe = {

        $or: [
          {
            type: postType
          },

        ]

      };
    }
    else {
      tipe = {
        $ne: null
      };
    }
    match = {
      $match: {
        username: uname,
        description: desc,
        kepemilikan: kepem,
        statusJual: jual,
        isCelebrity: artis,
        type: tipe
      }
    }

    matchAll = {
      $match: {

        postID: {
          $ne: null
        }
      }
    };

    pipeline.push(
      {
        $facet: {
          "data": [{
            $sort: {
              createdAt: - 1
            },

          }, {
            $addFields: {

              salePrice: {
                $cmp: ["$saleAmount", 0]
              },
              sLike: {
                $cmp: ["$saleLike", 0]
              },
              sView: {
                $cmp: ["$saleView", 0]
              },
              certi: {
                $cmp: ["$certified", 0]
              },

            }
          }, {
            $lookup: {
              from: 'userauths',
              localField: 'email',
              foreignField: 'email',
              as: 'authdata',

            }
          }, {
            $lookup: {
              from: 'userbasics',
              localField: 'email',
              foreignField: 'email',
              as: 'basicdata',

            }
          }, {
            $addFields: {


              'auth': {
                $arrayElemAt: ['$authdata', 0]
              },
              'basic': {
                $arrayElemAt: ['$basicdata', 0]
              },

            }
          }, {
            "$lookup": {
              "from": "interests_repo",
              "as": "kategori",
              "let": {
                "local_id": "$category.$id",

              },
              "pipeline": [
                {
                  $match:
                  {
                    $and: [
                      {
                        $expr: {

                          $in: ['$_id', {
                            $ifNull: ['$$local_id', []]
                          }]
                        }
                      },

                    ]
                  }
                },
                {
                  $project: {
                    interestName: 1,

                  }
                },

              ],

            },

          }, {
            $project: {
              refs: {
                $arrayElemAt: ['$contentMedias', 0]
              },
              username: "$auth.username",
              isCelebrity: "$basic.isCelebrity",
              createdAt: 1,
              updatedAt: 1,
              postID: 1,
              email: 1,
              postType: 1,
              description: 1,
              title: 1,
              active: 1,
              kategori: 1,
              certified:
              {
                $cond: {
                  if: {
                    $or: [{
                      $eq: ["$certi", - 1]
                    }, {
                      $eq: ["$certi", 0]
                    }]
                  },
                  then: false,
                  else: "$certified"
                }
              },
              visibility: 1,
              saleAmount: {
                $cond: {
                  if: {
                    $or: [{
                      $eq: ["$salePrice", - 1]
                    }, {
                      $eq: ["$salePrice", 0]
                    }]
                  },
                  then: 0,
                  else: "$saleAmount"
                }
              },
              monetize: {
                $cond: {
                  if: {
                    $or: [{
                      $eq: ["$salePrice", - 1]
                    }, {
                      $eq: ["$salePrice", 0]
                    }]
                  },
                  then: false,
                  else: true
                }
              },

            }
          }, {
            $project: {
              refs: '$refs.$ref',
              idmedia: '$refs.$id',
              username: 1,
              isCelebrity: 1,
              createdAt: 1,
              updatedAt: 1,
              postID: 1,
              postType: 1,
              email: 1,
              type: {
                $switch: {
                  branches: [
                    {
                      'case': {
                        '$eq': ['$postType', 'pict']
                      },
                      'then': "HyppePic"
                    },
                    {
                      'case': {
                        '$eq': ['$postType', 'vid']
                      },
                      'then': "HyppeVid"
                    },
                    {
                      'case': {
                        '$eq': ['$postType', 'diary']
                      },
                      'then': "HyppeDiary"
                    },
                    {
                      'case': {
                        '$eq': ['$postType', 'story']
                      },
                      'then': "HyppeStory"
                    },

                  ],
                  default: ''
                }
              },
              description: 1,
              title: 1,
              active: 1,
              kategori: 1,
              kepemilikan:
              {
                $cond: {
                  if: {
                    $or: [{
                      $eq: ["$certified", false]
                    }, {
                      $eq: ["$certified", ""]
                    }]
                  },
                  then: "Bebas",
                  else: "Terdaftar"
                }
              },
              visibility: 1,
              saleAmount: 1,
              statusJual:
              {
                $cond: {
                  if: {

                    $eq: ["$monetize", false]
                  },
                  then: "Tidak Dijual",
                  else: "Dijual"
                }
              },

            }
          }, {
            $lookup: {
              from: 'mediapicts',
              localField: 'idmedia',
              foreignField: '_id',
              as: 'mediaPict_data',

            },

          }, {
            $lookup: {
              from: 'mediadiaries',
              localField: 'idmedia',
              foreignField: '_id',
              as: 'mediadiaries_data',

            },

          }, {
            $lookup: {
              from: 'mediavideos',
              localField: 'idmedia',
              foreignField: '_id',
              as: 'mediavideos_data',

            },

          }, {
            $lookup: {
              from: 'mediastories',
              localField: 'idmedia',
              foreignField: '_id',
              as: 'mediastories_data',

            },

          }, {
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
              mediastories: {
                $arrayElemAt: ['$mediastories_data', 0]
              },
              refs: 1,
              idmedia: 1,
              username: 1,
              isCelebrity: 1,
              createdAt: 1,
              updatedAt: 1,
              postID: 1,
              postType: 1,
              email: 1,
              type: 1,
              description: 1,
              title: 1,
              active: 1,
              kategori: 1,
              kepemilikan: 1,
              visibility: 1,
              saleAmount: 1,
              statusJual: 1
            }
          }, {
            $addFields: {


              pict: {
                $replaceOne: {
                  input: "$profilpict.mediaUri",
                  find: "_0001.jpeg",
                  replacement: ""
                }
              },
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
              media_video: '$mediavideos.mediaUri',
              concatmediastory:
              {
                $cond: {
                  if: {

                    $eq: ["$mediastories.mediaType", "image"]
                  },
                  then: '/pict',
                  else: '/stream',

                }
              },
              concatthumbstory: '/thumb',
              media_story: '$mediastories.mediaUri'
            },

          }, {
            $project: {

              username: 1,
              isCelebrity: 1,
              createdAt: 1,
              updatedAt: 1,
              postID: 1,
              postType: 1,
              email: 1,
              type: 1,
              description: 1,
              title: 1,
              active: 1,
              kategori: 1,
              kepemilikan: 1,
              visibility: 1,
              saleAmount: 1,
              statusJual: 1,
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
                    },
                    {
                      'case': {
                        '$eq': ['$refs', 'mediastories']
                      },
                      'then': '$mediastories.mediaBasePath'
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
                    },
                    {
                      'case': {
                        '$eq': ['$refs', 'mediastories']
                      },
                      'then': '$mediastories.mediaUri'
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
                    },
                    {
                      'case': {
                        '$eq': ['$refs', 'mediastories']
                      },
                      'then': '$mediastories.mediaType'
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

                    },
                    {
                      'case': {
                        '$eq': ['$refs', 'mediastories']
                      },
                      'then': {
                        $concat: ["$concatthumbstory", "/", "$postID"]
                      },

                    },

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

                    },
                    {
                      'case': {
                        '$eq': ['$refs', 'mediastories']
                      },
                      'then': {
                        $concat: ["$concatmediastory", "/", "$postID"]
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
                    },
                    {
                      'case': {
                        '$eq': ['$refs', 'mediastories']
                      },
                      'then': '$mediastories.mediaThumb'
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
                    },
                    {
                      case: {
                        $eq: [
                          "$refs",
                          "mediastories"
                        ]
                      },
                      then: "$mediastories.apsaraId"
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
                    },
                    {
                      case: {
                        $eq: [
                          "$refs",
                          "mediastories"
                        ]
                      },
                      then: "$mediastories.apsara"
                    }
                  ],
                  default: false
                }
              },

            }
          }, match, {
            $skip: (page * limit)
          }, {
            $limit: limit
          }],
          "countSearch": [{
            $addFields: {

              salePrice: {
                $cmp: ["$saleAmount", 0]
              },
              sLike: {
                $cmp: ["$saleLike", 0]
              },
              sView: {
                $cmp: ["$saleView", 0]
              },
              certi: {
                $cmp: ["$certified", 0]
              },

            }
          }, {
            $lookup: {
              from: 'userauths',
              localField: 'email',
              foreignField: 'email',
              as: 'authdata',

            }
          }, {
            $lookup: {
              from: 'userbasics',
              localField: 'email',
              foreignField: 'email',
              as: 'basicdata',

            }
          }, {
            $addFields: {


              'auth': {
                $arrayElemAt: ['$authdata', 0]
              },
              'basic': {
                $arrayElemAt: ['$basicdata', 0]
              },

            }
          }, {
            "$lookup": {
              "from": "interests_repo",
              "as": "kategori",
              "let": {
                "local_id": "$category.$id",

              },
              "pipeline": [
                {
                  $match:
                  {
                    $and: [
                      {
                        $expr: {

                          $in: ['$_id', {
                            $ifNull: ['$$local_id', []]
                          }]
                        }
                      },

                    ]
                  }
                },
                {
                  $project: {
                    interestName: 1,

                  }
                },

              ],

            },

          }, {
            $project: {
              refs: {
                $arrayElemAt: ['$contentMedias', 0]
              },
              username: "$auth.username",
              isCelebrity: "$basic.isCelebrity",
              createdAt: 1,
              updatedAt: 1,
              postID: 1,
              email: 1,
              postType: 1,
              description: 1,
              title: 1,
              active: 1,
              kategori: 1,
              certified:
              {
                $cond: {
                  if: {
                    $or: [{
                      $eq: ["$certi", - 1]
                    }, {
                      $eq: ["$certi", 0]
                    }]
                  },
                  then: false,
                  else: "$certified"
                }
              },
              visibility: 1,
              saleAmount: {
                $cond: {
                  if: {
                    $or: [{
                      $eq: ["$salePrice", - 1]
                    }, {
                      $eq: ["$salePrice", 0]
                    }]
                  },
                  then: 0,
                  else: "$saleAmount"
                }
              },
              monetize: {
                $cond: {
                  if: {
                    $or: [{
                      $eq: ["$salePrice", - 1]
                    }, {
                      $eq: ["$salePrice", 0]
                    }]
                  },
                  then: false,
                  else: true
                }
              },

            }
          }, {
            $project: {
              refs: '$refs.$ref',
              idmedia: '$refs.$id',
              username: 1,
              isCelebrity: 1,
              createdAt: 1,
              updatedAt: 1,
              postID: 1,
              postType: 1,
              email: 1,
              type: {
                $switch: {
                  branches: [
                    {
                      'case': {
                        '$eq': ['$postType', 'pict']
                      },
                      'then': "HyppePic"
                    },
                    {
                      'case': {
                        '$eq': ['$postType', 'vid']
                      },
                      'then': "HyppeVid"
                    },
                    {
                      'case': {
                        '$eq': ['$postType', 'diary']
                      },
                      'then': "HyppeDiary"
                    },
                    {
                      'case': {
                        '$eq': ['$postType', 'story']
                      },
                      'then': "HyppeStory"
                    },

                  ],
                  default: ''
                }
              },
              description: 1,
              title: 1,
              active: 1,
              kategori: 1,
              kepemilikan:
              {
                $cond: {
                  if: {
                    $or: [{
                      $eq: ["$certified", false]
                    }, {
                      $eq: ["$certified", ""]
                    }]
                  },
                  then: "Bebas",
                  else: "Terdaftar"
                }
              },
              visibility: 1,
              saleAmount: 1,
              statusJual:
              {
                $cond: {
                  if: {

                    $eq: ["$monetize", false]
                  },
                  then: "Tidak Dijual",
                  else: "Dijual"
                }
              },

            }
          }, {
            $project: {

              username: 1,
              isCelebrity: 1,
              createdAt: 1,
              updatedAt: 1,
              postID: 1,
              postType: 1,
              email: 1,
              type: 1,
              description: 1,
              title: 1,
              active: 1,
              kategori: 1,
              kepemilikan: 1,
              visibility: 1,
              saleAmount: 1,
              statusJual: 1
            }
          }, match, {
            $group: {
              _id: null,
              totalpost: {
                $sum: 1
              }
            }
          }],
          "countAll": [
            matchAll,
            {
              $group: {
                _id: null,
                totalpost: {
                  $sum: 1
                }
              }
            }
          ]
        }
      }
    );


    let ardata = await this.getusercontentsModel.aggregate(pipeline);
    var dataquery = null;
    dataquery = ardata[0].data;
    var datanew = null;
    var data = [];
    let pict: String[] = [];
    var objk = {};
    var type = null;
    var idapsara = null;
    var apsara = null;
    var idapsaradefine = null;
    var apsaradefine = null;
    for (var i = 0; i < dataquery.length; i++) {
      try {
        idapsara = dataquery[i].apsaraId;
      } catch (e) {
        idapsara = "";
      }
      try {
        apsara = dataquery[i].apsara;
      } catch (e) {
        apsara = false;
      }

      if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
        apsaradefine = false;
      } else {
        apsaradefine = true;
      }

      if (idapsara === undefined || idapsara === "" || idapsara === null || idapsara === "other") {
        idapsaradefine = "";
      } else {
        idapsaradefine = idapsara;
      }
      var type = dataquery[i].postType;
      pict = [idapsara];

      if (idapsara === "") {

      } else {
        if (type === "pict") {

          try {
            datanew = await this.postContentService.getImageApsara(pict);
          } catch (e) {
            datanew = [];
          }
        }
        else if (type === "vid") {
          try {
            datanew = await this.postContentService.getVideoApsara(pict);
          } catch (e) {
            datanew = [];
          }

        }
        else if (type === "story") {
          try {
            datanew = await this.postContentService.getVideoApsara(pict);
          } catch (e) {
            datanew = [];
          }
        }
        else if (type === "diary") {
          try {
            datanew = await this.postContentService.getVideoApsara(pict);
          } catch (e) {
            datanew = [];
          }
        }
      }
      objk = {
        "_id": dataquery[i]._id,
        "postID": dataquery[i].postID,
        "email": dataquery[i].email,
        "description": dataquery[i].description,
        "active": dataquery[i].active,
        "createdAt": dataquery[i].createdAt,
        "updatedAt": dataquery[i].updatedAt,
        "visibility": dataquery[i].visibility,
        "kategori": dataquery[i].kategori,
        "username": dataquery[i].username,
        "isCelebrity": dataquery[i].isCelebrity,
        "saleAmount": dataquery[i].saleAmount,
        "type": dataquery[i].type,
        "kepemilikan": dataquery[i].kepemilikan,
        "statusJual": dataquery[i].statusJual,
        "mediaType": dataquery[i].mediaType,
        "mediaEndpoint": dataquery[i].mediaEndpoint,
        "mediaThumbEndpoint": dataquery[i].mediaThumbEndpoint,
        "apsaraId": idapsaradefine,
        "apsara": apsaradefine,
        "media": datanew

      };

      data.push(objk);
    }


    var datapost = { "data": data, "countSearch": ardata[0].countSearch, "countAll": ardata[0].countAll }

    return datapost;

  }

}


