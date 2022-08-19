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
//import { CountriesService } from '../../infra/countries/countries.service';
@Injectable()
export class GetusercontentsService {

  constructor(
    @InjectModel(Getusercontents.name, 'SERVER_TRANS')
    private readonly getusercontentsModel: Model<GetusercontentsDocument>,
    private readonly postsService: PostsService,
    private readonly mediavideosService: MediavideosService,
    private readonly mediapictsService: MediapictsService,
    private readonly mediaprofilepictsService: MediaprofilepictsService,
    private readonly mediadiariesService: MediadiariesService,
    private readonly insightsService: InsightsService,
    private readonly disqusService: DisqusService,
    private readonly disquslogsService: DisquslogsService,
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

  async findalldata(email: string, skip: number, limit: number): Promise<object> {
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();

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
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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


  async findlatesdata(email: string, skip: number, limit: number): Promise<object> {
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();

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
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();

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
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();

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
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();

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
          isCertified: '$isCertified',
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
          isCertified: '$isCertified',
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
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
          isCertified: '$isCertified',
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
          isCertified: '$isCertified',
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();
    const disqus = await this.disqusService.finddisqus();
    const disquslogs = await this.disquslogsService.finddisquslog();


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
          "from": "disqus2",
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
                "from": "disquslogs2",
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
          from: 'disqus2',
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
          from: 'disquslogs2',
          localField: 'disqusdata.disqusLogs.$id', // or author.$id
          foreignField: "_id",
          as: "logs"
        }
      },

      {
        $lookup: {
          from: 'disquslogs2',
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
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();
    const disqus = await this.disqusService.finddisqus();
    const disquslogs = await this.disquslogsService.finddisquslog();


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
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();
    const disqus = await this.disqusService.finddisqus();
    const disquslogs = await this.disquslogsService.finddisquslog();


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
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();
    const disqus = await this.disqusService.finddisqus();
    const disquslogs = await this.disquslogsService.finddisquslog();


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
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();
    const disqus = await this.disqusService.finddisqus();
    const disquslogs = await this.disquslogsService.finddisquslog();


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
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();
    const disqus = await this.disqusService.finddisqus();
    const disquslogs = await this.disquslogsService.finddisquslog();


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
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();
    const disqus = await this.disqusService.finddisqus();
    const disquslogs = await this.disquslogsService.finddisquslog();


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
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
    const posts = await this.postsService.findpost();


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
    const posts = await this.postsService.findpost();


    const query = await this.getusercontentsModel.find({ "email": email }).exec();
    return query;
  }

  async findmanagementcontenttrafic(email: string) {
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();
    const disqus = await this.disqusService.finddisqus();
    const disquslogs = await this.disquslogsService.finddisquslog();


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
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();
    const disqus = await this.disqusService.finddisqus();
    const disquslogs = await this.disquslogsService.finddisquslog();


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
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();

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
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();

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
          isCertified: '$isCertified',
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
          isCertified: '$isCertified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
          isCertified: '$isCertified',
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
          isCertified: '$isCertified',
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();

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
          isCertified: '$isCertified',
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
          isCertified: '$isCertified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
          isCertified: '$isCertified',
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
          isCertified: '$isCertified',
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();

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
          isCertified: '$isCertified',
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
          isCertified: '$isCertified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
          isCertified: '$isCertified',
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
          isCertified: '$isCertified',
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();

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
          isCertified: '$isCertified',
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
          isCertified: '$isCertified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
          isCertified: '$isCertified',
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
          isCertified: '$isCertified',
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();

    var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate()));

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
          isCertified: '$isCertified',
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
          isCertified: '$isCertified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
          isCertified: '$isCertified',
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
          isCertified: '$isCertified',
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();

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
          isCertified: '$isCertified',
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
          isCertified: '$isCertified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
          isCertified: '$isCertified',
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
          isCertified: '$isCertified',
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


  async findalldatakontenmultiple(iduserbuy: Types.ObjectId, email: string, ownership: boolean, monetesisasi: boolean, buy: boolean, archived: boolean, postType: string, startdate: string, enddate: string, skip: number, limit: number) {
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();

    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate()));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }


    if (ownership === true && monetesisasi === false && buy === false && archived === false && startdate === undefined && enddate === undefined && postType === undefined) {
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
    else if (ownership === false && monetesisasi === true && buy === false && archived === false && startdate === undefined && enddate === undefined && postType === undefined) {
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
    else if (ownership === false && monetesisasi === false && buy === true && archived === false && startdate === undefined && enddate === undefined && postType === undefined) {
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
    else if (ownership === false && monetesisasi === false && buy === false && archived === true && startdate === undefined && enddate === undefined && postType === undefined) {

      const query = await this.getusercontentsModel.aggregate([
        { $match: { email: email, postType: "story" } },
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
    else if (ownership === false && monetesisasi === false && buy === false && archived === false && startdate !== undefined && enddate !== undefined && postType === undefined) {
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
    else if (ownership === false && monetesisasi === false && buy === false && archived === false && startdate === undefined && enddate === undefined && postType !== undefined) {

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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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

    else if (ownership === true && monetesisasi === true && buy === false && archived === false && startdate === undefined && enddate === undefined && postType === undefined) {
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
        { $match: { email: email, monetize: true, isOwned: true } },
        { $sort: { createdAt: -1 }, },
        { $skip: skip },
        { $limit: limit },

      ]);
      return query;
    }
    else if (ownership === true && monetesisasi === true && buy === false && archived === true && startdate === undefined && enddate === undefined && postType === undefined) {
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
        { $match: { email: email, monetize: true, isOwned: true, postType: "story" } },
        { $sort: { createdAt: -1 }, },
        { $skip: skip },
        { $limit: limit },

      ]);
      return query;
    }
    else if (ownership === true && monetesisasi === true && buy === false && archived === true && startdate !== undefined && enddate !== undefined && postType === undefined) {
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
        { $match: { email: email, monetize: true, isOwned: true, createdAt: { $gte: startdate, $lte: dateend }, postType: "story" } },
        { $sort: { createdAt: -1 }, },
        { $skip: skip },
        { $limit: limit },

      ]);
      return query;
    }
    else if (ownership === true && monetesisasi === true && buy === true && archived === false && startdate === undefined && enddate === undefined && postType === undefined) {
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
        { "$match": { "tr_data.iduserbuyer": iduserbuy, "tr_data.status": "success", salePrice: 1, isOwned: true } },
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
    else if (ownership === true && monetesisasi === true && buy === true && archived === true && startdate === undefined && enddate === undefined && postType === undefined) {
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
        { "$match": { "tr_data.iduserbuyer": iduserbuy, "tr_data.status": "success", salePrice: 1, isOwned: true, postType: "story" } },
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
    else if (ownership === true && monetesisasi === true && buy === true && archived === true && startdate !== undefined && enddate !== undefined && postType === undefined) {
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
        { "$match": { "tr_data.iduserbuyer": iduserbuy, "tr_data.status": "success", salePrice: 1, isOwned: true, createdAt: { $gte: startdate, $lte: dateend }, postType: "story" } },
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
    else if (ownership === true && monetesisasi === true && buy === true && archived === true && startdate !== undefined && enddate !== undefined && postType !== undefined) {
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
        { "$match": { "tr_data.iduserbuyer": iduserbuy, "tr_data.status": "success", salePrice: 1, isOwned: true, createdAt: { $gte: startdate, $lte: dateend }, postType: postType } },
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
    else if (ownership === false && monetesisasi === true && buy === true && archived === true && startdate !== undefined && enddate !== undefined && postType !== undefined) {
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
        { "$match": { "tr_data.iduserbuyer": iduserbuy, "tr_data.status": "success", salePrice: 1, createdAt: { $gte: startdate, $lte: dateend }, postType: postType } },
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
    else if (ownership === false && monetesisasi === false && buy === true && archived === true && startdate !== undefined && enddate !== undefined && postType !== undefined) {
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
        { "$match": { "tr_data.iduserbuyer": iduserbuy, "tr_data.status": "success", createdAt: { $gte: startdate, $lte: dateend }, postType: postType } },
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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

    else if (ownership === false && monetesisasi === false && buy === false && archived === true && startdate !== undefined && enddate !== undefined && postType !== undefined) {
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
        { $match: { email: email, createdAt: { $gte: startdate, $lte: dateend }, postType: postType } },
        { $sort: { createdAt: -1 }, },
        { $skip: skip },
        { $limit: limit },

      ]);
      return query;
    }
    else if (ownership === false && monetesisasi === false && buy === false && archived === false && startdate !== undefined && enddate !== undefined && postType !== undefined) {
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
        { $match: { email: email, createdAt: { $gte: startdate, $lte: dateend }, postType: postType } },
        { $sort: { createdAt: -1 }, },
        { $skip: skip },
        { $limit: limit },

      ]);
      return query;
    }
    else if (ownership === false && monetesisasi === false && buy === false && archived === false && startdate === undefined && enddate === undefined && postType !== undefined) {
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
        { $match: { email: email, postType: postType } },
        { $sort: { createdAt: -1 }, },
        { $skip: skip },
        { $limit: limit },

      ]);
      return query;
    }

    else if (ownership === true && monetesisasi === false && buy === true && archived === false && startdate === undefined && enddate === undefined && postType === undefined) {
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
        { "$match": { "tr_data.iduserbuyer": iduserbuy, "tr_data.status": "success", isOwned: true } },
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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

    else if (ownership === true && monetesisasi === false && buy === true && archived === false && startdate === undefined && enddate === undefined && postType === undefined) {
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
        { "$match": { "tr_data.iduserbuyer": iduserbuy, "tr_data.status": "success", isOwned: true } },
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
    else if (ownership === true && monetesisasi === false && buy === false && archived === true && startdate === undefined && enddate === undefined && postType === undefined) {

      const query = await this.getusercontentsModel.aggregate([
        { $match: { email: email, isOwned: true, postType: "story" } },
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
    else if (ownership === true && monetesisasi === false && buy === false && archived === false && startdate !== undefined && enddate !== undefined && postType === undefined) {
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
        { $match: { email: email, createdAt: { $gte: startdate, $lte: dateend }, isOwned: true } },
        { $sort: { createdAt: -1 }, },
        { $skip: skip },
        { $limit: limit },

      ]);
      return query;
    }
    else if (ownership === true && monetesisasi === true && buy === false && archived === false && startdate !== undefined && enddate !== undefined && postType === undefined) {
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
        { $match: { email: email, createdAt: { $gte: startdate, $lte: dateend }, isOwned: true, monetize: true } },
        { $sort: { createdAt: -1 }, },
        { $skip: skip },
        { $limit: limit },

      ]);
      return query;
    }
    else if (ownership === true && monetesisasi === false && buy === false && archived === false && startdate === undefined && enddate === undefined && postType !== undefined) {

      const query = await this.getusercontentsModel.aggregate([
        { $match: { email: email, isOwned: true, postType: postType } },
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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

    else if (ownership === true && monetesisasi === false && buy === true && archived === false && startdate !== undefined && enddate !== undefined && postType === undefined) {
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
        { "$match": { "tr_data.iduserbuyer": iduserbuy, "tr_data.status": "success", isOwned: true, createdAt: { $gte: startdate, $lte: dateend } } },
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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

    else if (ownership === true && monetesisasi === false && buy === true && archived === false && startdate !== undefined && enddate !== undefined && postType !== undefined) {
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
        { "$match": { "tr_data.iduserbuyer": iduserbuy, "tr_data.status": "success", isOwned: true, createdAt: { $gte: startdate, $lte: dateend }, postType: postType } },
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
    else if (ownership === true && monetesisasi === true && buy === true && archived === false && startdate !== undefined && enddate !== undefined && postType !== undefined) {
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
        { "$match": { "tr_data.iduserbuyer": iduserbuy, "tr_data.status": "success", isOwned: true, salePrice: 1, createdAt: { $gte: startdate, $lte: dateend }, postType: postType } },
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
    else if (ownership === true && monetesisasi === true && buy === false && archived === false && startdate !== undefined && enddate !== undefined && postType !== undefined) {
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
        { $match: { email: email, createdAt: { $gte: startdate, $lte: dateend }, isOwned: true, monetize: true, postType: postType } },
        { $sort: { createdAt: -1 }, },
        { $skip: skip },
        { $limit: limit },

      ]);
      return query;
    }
    else if (ownership === false && monetesisasi === false && buy === false && archived === false && startdate === undefined && enddate === undefined && postType === undefined) {
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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
        { $match: { email: email } },
        { $sort: { createdAt: -1 }, },
        { $skip: skip },
        { $limit: limit },

      ]);
      return query;
    }
    else if (ownership === false && monetesisasi === true && buy === true && archived === false && startdate === undefined && enddate === undefined && postType === undefined) {
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            isCertified: '$isCertified',
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

  }

  async findpopularanalitic(email: string): Promise<object> {
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();

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
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'insights2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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

  async findalldatakontenmonetesbuy(iduserbuy: Types.ObjectId, email: string, buy: boolean, monetize: boolean, postType: string, lastmonetize: boolean, startdate: string, enddate: string, skip: number, limit: number) {
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();
    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate()));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }

    if (buy === true && monetize === false && postType === undefined && lastmonetize === false && startdate === undefined && enddate === undefined) {
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
            isCertified: '$isCertified',
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
            isPostPrivate: '$user.isPostPrivate',
            privacy: {
              isPostPrivate: '$user.isPostPrivate',
              isCelebrity: '$user.isCelebrity',
              isPrivate: '$user.isPrivate',
            },
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
            saleAmount: '$saleAmount',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            privacy: '$privacy',
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
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
        { $skip: skip },
        { $limit: limit },

      ]);
      return query;
    }
    else if (buy === false && monetize === true && postType === undefined && lastmonetize === false && startdate === undefined && enddate === undefined) {
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
            isCertified: '$isCertified',
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
            isPostPrivate: '$user.isPostPrivate',
            privacy: {
              isPostPrivate: '$user.isPostPrivate',
              isCelebrity: '$user.isCelebrity',
              isPrivate: '$user.isPrivate',
            },
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
            saleAmount: '$saleAmount',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            privacy: '$privacy',
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
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
    else if (buy === false && monetize === true && postType !== undefined && lastmonetize === false && startdate === undefined && enddate === undefined) {
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
            isCertified: '$isCertified',
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
            isPostPrivate: '$user.isPostPrivate',
            privacy: {
              isPostPrivate: '$user.isPostPrivate',
              isCelebrity: '$user.isCelebrity',
              isPrivate: '$user.isPrivate',
            },
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
            saleAmount: '$saleAmount',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            privacy: '$privacy',
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
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
        { $match: { email: email, monetize: true, postType: postType } },
        { $sort: { createdAt: -1 }, },
        { $skip: skip },
        { $limit: limit },

      ]);
      return query;
    }
    else if (buy === true && monetize === false && postType !== undefined && lastmonetize === false && startdate === undefined && enddate === undefined) {
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
        { "$match": { "tr_data.iduserbuyer": iduserbuy, "tr_data.status": "success", "postType": postType } },
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
            isCertified: '$isCertified',
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
            isPostPrivate: '$user.isPostPrivate',
            privacy: {
              isPostPrivate: '$user.isPostPrivate',
              isCelebrity: '$user.isCelebrity',
              isPrivate: '$user.isPrivate',
            },
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
            saleAmount: '$saleAmount',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            privacy: '$privacy',
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
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
        { $skip: skip },
        { $limit: limit },

      ]);
      return query;
    }
    else if (buy === false && monetize === false && postType === undefined && lastmonetize === true && startdate === undefined && enddate === undefined) {
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
            isCertified: '$isCertified',
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
            isPostPrivate: '$user.isPostPrivate',
            privacy: {
              isPostPrivate: '$user.isPostPrivate',
              isCelebrity: '$user.isCelebrity',
              isPrivate: '$user.isPrivate',
            },
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
            saleAmount: '$saleAmount',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            privacy: '$privacy',
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
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
        { $limit: 1 },

      ]);
      return query;
    }

    else if (buy === true && monetize === false && postType !== undefined && lastmonetize === false && startdate !== undefined && enddate !== undefined) {
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
        { "$match": { "tr_data.iduserbuyer": iduserbuy, "tr_data.status": "success", "postType": postType, "tr_data.timestamp": { "$gte": startdate, "$lte": dateend } } },
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
            isCertified: '$isCertified',
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
            isPostPrivate: '$user.isPostPrivate',
            privacy: {
              isPostPrivate: '$user.isPostPrivate',
              isCelebrity: '$user.isCelebrity',
              isPrivate: '$user.isPrivate',
            },
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
            saleAmount: '$saleAmount',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            privacy: '$privacy',
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
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
        { $skip: skip },
        { $limit: limit },

      ]);
      return query;
    }

    else if (buy === true && monetize === false && postType === undefined && lastmonetize === false && startdate !== undefined && enddate !== undefined) {
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
        { "$match": { "tr_data.iduserbuyer": iduserbuy, "tr_data.status": "success", "tr_data.timestamp": { "$gte": startdate, "$lte": dateend } } },
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
            isCertified: '$isCertified',
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
            isPostPrivate: '$user.isPostPrivate',
            privacy: {
              isPostPrivate: '$user.isPostPrivate',
              isCelebrity: '$user.isCelebrity',
              isPrivate: '$user.isPrivate',
            },
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
            saleAmount: '$saleAmount',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            privacy: '$privacy',
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
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
        { $skip: skip },
        { $limit: limit },

      ]);
      return query;
    }
    else if (buy === false && monetize === true && postType !== undefined && lastmonetize === false && startdate !== undefined && enddate !== undefined) {
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
            isCertified: '$isCertified',
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
            isPostPrivate: '$user.isPostPrivate',
            privacy: {
              isPostPrivate: '$user.isPostPrivate',
              isCelebrity: '$user.isCelebrity',
              isPrivate: '$user.isPrivate',
            },
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
            saleAmount: '$saleAmount',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            privacy: '$privacy',
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
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
        { $match: { email: email, monetize: true, postType: postType, createdAt: { $gte: startdate, $lte: dateend } } },
        { $sort: { createdAt: -1 }, },
        { $skip: skip },
        { $limit: limit },

      ]);
      return query;
    }
    else if (buy === false && monetize === true && postType === undefined && lastmonetize === false && startdate !== undefined && enddate !== undefined) {
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
            isCertified: '$isCertified',
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
            isPostPrivate: '$user.isPostPrivate',
            privacy: {
              isPostPrivate: '$user.isPostPrivate',
              isCelebrity: '$user.isCelebrity',
              isPrivate: '$user.isPrivate',
            },
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
            saleAmount: '$saleAmount',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            privacy: '$privacy',
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
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
        { $match: { email: email, monetize: true, createdAt: { $gte: startdate, $lte: dateend } } },
        { $sort: { createdAt: -1 }, },
        { $skip: skip },
        { $limit: limit },

      ]);
      return query;
    }
    else {
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
            isCertified: '$isCertified',
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
            isPostPrivate: '$user.isPostPrivate',
            privacy: {
              isPostPrivate: '$user.isPostPrivate',
              isCelebrity: '$user.isCelebrity',
              isPrivate: '$user.isPrivate',
            },
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
            saleAmount: '$saleAmount',
            saleLike: '$saleLike',
            saleView: '$saleView',
            monetize: '$monetize',
            refe: '$refs.ref',
          }
        },

        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $lookup: {
            from: 'insights2',
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
            from: 'mediapicts2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediaPict_data',
          },
        },
        {
          $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        {
          $lookup: {
            from: 'mediavideos2',
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
            isCertified: '$isCertified',
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
            privacy: '$privacy',
            isViewed: '$isViewed',
            allowComments: '$allowComments',
            isCertified: '$isCertified',
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



  }

  async findcontenbuy(postID: string) {
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();
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
          isCertified: '$isCertified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
          isCertified: '$isCertified',
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
          isCertified: '$isCertified',
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();
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
          from: 'mediaprofilepicts2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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




  async findcontentfilterTags(keys: string, skip: number, limit: number) {
    const posts = await this.postsService.findpost();
    // const video = await this.mediavideosService.findvideo();
    // const pict = await this.mediapictsService.findpict();
    // const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    // const insight = await this.insightsService.findinsight();
    // const diaries = await this.mediadiariesService.finddiaries();
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
    const posts = await this.postsService.findpost();
    // const video = await this.mediavideosService.findvideo();
    // const pict = await this.mediapictsService.findpict();
    // const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    // const insight = await this.insightsService.findinsight();
    // const diaries = await this.mediadiariesService.finddiaries();
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();
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
          isCertified: '$isCertified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
          isCertified: '$isCertified',
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
          isCertified: '$isCertified',
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
    const posts = await this.postsService.findpost();
    const video = await this.mediavideosService.findvideo();
    const pict = await this.mediapictsService.findpict();
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    const insight = await this.insightsService.findinsight();
    const diaries = await this.mediadiariesService.finddiaries();
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
          isCertified: '$isCertified',
          saleLike: '$saleLike',
          saleView: '$saleView',
          saleAmount: '$saleAmount',
          monetize: '$monetize',
          refe: '$refs.ref',
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts2',
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
          from: 'mediapicts2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediaPict_data',
        },
      },
      {
        $lookup: {
          from: 'mediadiaries2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediadiaries_data',
        },
      },
      {
        $lookup: {
          from: 'mediavideos2',
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
          isCertified: '$isCertified',
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
          isCertified: '$isCertified',
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

}


