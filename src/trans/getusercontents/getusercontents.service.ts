import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
       
      ) {}

      async findAll(): Promise<Getusercontents[]> {
        return this.getusercontentsModel.find().exec();
      }

      async findalldata(email:string): Promise<object> {
        const posts = await this.postsService.findpost();
        const video = await this.mediavideosService.findvideo();
        const pict = await this.mediapictsService.findpict();
        const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
        const insight = await this.insightsService.findinsight();
        const diaries = await this.mediadiariesService.finddiaries();

        const query =await this.getusercontentsModel.aggregate([
           {$match:{email: email}},
            {
                $addFields: {
                  ubasic_id:'$userProfile.$id',
                  
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
              $project:{
               refs: { $arrayElemAt: ['$contentMedias', 0] },
                user: { $arrayElemAt: ['$userbasics_data', 0] },
            
                profilpictid:'$user.profilePict.$id',
                insight_id: '$user.insight.$id',
                userAuth_id:'$user.userAuth.$id',
                fullName: '$user.fullName',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                isPostPrivate: '$user.isPostPrivate',
                privacy:{
                  isPostPrivate: '$user.isPostPrivate',
                  isCelebrity: '$user.isCelebrity',
                  isPrivate: '$user.isPrivate',
                },
                isViewed:
                {
                  $cond: { if: { $eq: [ "$views", 0 ] }, then: false, else: true }
                },
                allowComments: '$allowComments',
              
              }
            },
            {
              $project:{
                refs: '$refs.$ref',
                idmedia:'$refs.$id',
                profilpictid:'$user.profilePict.$id',
                 insight_id: '$user.insight.$id',
                 userAuth_id:'$user.userAuth.$id',
                fullName: '$user.fullName',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                isPostPrivate: '$user.isPostPrivate',
                privacy:{
                  isPostPrivate: '$user.isPostPrivate',
                  isCelebrity: '$user.isCelebrity',
                  isPrivate: '$user.isPrivate',
                },
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
               
                refe:'$refs.ref',
              }
            },
           
              { $lookup: {
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
            { $lookup: {
              from: 'mediapicts2',
              localField: 'idmedia',
              foreignField: '_id',
              as: 'mediaPict_data',
            },
          },
          { $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        { $lookup: {
          from: 'mediavideos2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
            {
              $project:{
                mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
                mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
                mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

                profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
                insights: { $arrayElemAt: ['$insight_data', 0] },
                auth: { $arrayElemAt: ['$userAuth_data', 0] },
                mediapictPath:'$mediapict.mediaBasePath',
                mediadiariPath:'$mediadiaries.mediaBasePath',
                mediavideoPath:'$mediavideos.mediaBasePath',
                refs: '$refs',
                idmedia:'$idmedia',
                rotate:'$mediadiaries.rotate',
                 fullName: '$fullName',
                username:'$auth.username',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                privacy:'$privacy',
                isViewed:'$isViewed',
                allowComments: '$allowComments',
         
              
                insight:{
                  shares:'$insights.shares',
                   followers:'$insights.followers',
                   comments:'$insights.comments',
                   followings:'$insights.followings',
                   reactions:'$insights.reactions',
                   posts:'$insights.posts',
                   views:'$insights.views',
                   likes:'$insights.likes'
                 },
                avatar:{
                  mediaBasePath:'$profilpict.mediaBasePath',
                  mediaUri:'$profilpict.mediaUri',
                  mediaType:'$profilpict.mediaType',
                  mediaEndpoint:'$profilpict.fsTargetUri',
                  medreplace:{ $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
                  
                },
               
              }
            },
           
            {
              $addFields: {
               
                concats:'/profilepict',
               pict:{ $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
               concatmediapict:'/pict',
               media_pict:{ $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


               concatmediadiari:'/stream',
               concatthumbdiari:'/thumb',
               media_diari:'$mediadiaries.mediaUri',

               concatmediavideo:'/stream',
               concatthumbvideo:'/thumb',
               media_video:'$mediavideos.mediaUri'
              },
            },
            {
              $project:{
                rotate:'$mediadiaries.rotate',
                mediaBasePath: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaBasePath' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaBasePath' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaBasePath' }
                    ],
                    default: ''
                  }
                },
                mediaUri: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaUri' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaUri' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaUri' }
                    ],
                    default: ''
                  }
                },
                mediaType: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaType' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaType' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaType' }
                    ],
                    default: ''
                  }
                },
             
               mediaThumbEndpoint: {
                $switch: {
                  branches: [
                    { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediadiaries.mediaThumb' },
                    { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': { $concat: [ "$concatthumbdiari", "/", "$media_diari" ] }, },
                    { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': { $concat: [ "$concatthumbvideo", "/", "$media_video" ] }, }
                  ],
                  default: ''
                }
              },
               
                mediaEndpoint: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then':  { $concat: [ "$concatmediapict", "/", "$media_pict" ] }, },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': { $concat: [ "$concatmediadiari", "/", "$media_diari" ] }, },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': { $concat: [ "$concatmediavideo", "/", "$media_video" ] }, }
                    ],
                    default: ''
                  }
                },

                mediaThumbUri: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediadiaries.mediaThumb' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaThumb' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaThumb' }
                    ],
                    default: ''
                  }
                },
                
                fullName: '$fullName',
                username:'$auth.username',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                privacy:'$privacy',
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
                insight:{
                  shares:'$insights.shares',
                   followers:'$insights.followers',
                   comments:'$insights.comments',
                   followings:'$insights.followings',
                   reactions:'$insights.reactions',
                   posts:'$insights.posts',
                   views:'$insights.views',
                   likes:'$insights.likes'
                 },
                avatar:{
                  mediaBasePath:'$profilpict.mediaBasePath',
                  mediaUri:'$profilpict.mediaUri',
                  mediaType:'$profilpict.mediaType',
                  mediaEndpoint:{ $concat: [ "$concats", "/", "$pict" ] },
                   
                
                },
               
             
               
              
              }
            },
           
            {$sort: { createdAt: -1 },},
            { $skip: 0},
            { $limit: 10 },
        
        ]);

        return query;
      }


      async findlatesdata(email:string): Promise<object> {
        const posts = await this.postsService.findpost();
        const video = await this.mediavideosService.findvideo();
        const pict = await this.mediapictsService.findpict();
        const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
        const insight = await this.insightsService.findinsight();
        const diaries = await this.mediadiariesService.finddiaries();

        const query =await this.getusercontentsModel.aggregate([
           {$match:{email: email}},
            {
                $addFields: {
                  ubasic_id:'$userProfile.$id',
                  
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
              $project:{
               refs: { $arrayElemAt: ['$contentMedias', 0] },
                user: { $arrayElemAt: ['$userbasics_data', 0] },
               // refe:'$refs.ref',
                profilpictid:'$user.profilePict.$id',
                insight_id: '$user.insight.$id',
                userAuth_id:'$user.userAuth.$id',
                fullName: '$user.fullName',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                isPostPrivate: '$user.isPostPrivate',
                privacy:{
                  isPostPrivate: '$user.isPostPrivate',
                  isCelebrity: '$user.isCelebrity',
                  isPrivate: '$user.isPrivate',
                },
                isViewed:
                {
                  $cond: { if: { $eq: [ "$views", 0 ] }, then: false, else: true }
                },
                allowComments: '$allowComments',
              
              }
            },
            {
              $project:{
                refs: '$refs.$ref',
                idmedia:'$refs.$id',
                profilpictid:'$user.profilePict.$id',
                 insight_id: '$user.insight.$id',
                 userAuth_id:'$user.userAuth.$id',
                fullName: '$user.fullName',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                isPostPrivate: '$user.isPostPrivate',
                privacy:{
                  isPostPrivate: '$user.isPostPrivate',
                  isCelebrity: '$user.isCelebrity',
                  isPrivate: '$user.isPrivate',
                },
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
               
                refe:'$refs.ref',
              }
            },
           
              { $lookup: {
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
            { $lookup: {
              from: 'mediapicts2',
              localField: 'idmedia',
              foreignField: '_id',
              as: 'mediaPict_data',
            },
          },
          { $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        { $lookup: {
          from: 'mediavideos2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
            {
              $project:{
                mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
                mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
                mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

                profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
                insights: { $arrayElemAt: ['$insight_data', 0] },
                auth: { $arrayElemAt: ['$userAuth_data', 0] },
                mediapictPath:'$mediapict.mediaBasePath',
                mediadiariPath:'$mediadiaries.mediaBasePath',
                mediavideoPath:'$mediavideos.mediaBasePath',
                refs: '$refs',
                idmedia:'$idmedia',
                rotate:'$mediadiaries.rotate',
                 fullName: '$fullName',
                username:'$auth.username',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                privacy:'$privacy',
                isViewed:'$isViewed',
                allowComments: '$allowComments',
         
              
                insight:{
                  shares:'$insights.shares',
                   followers:'$insights.followers',
                   comments:'$insights.comments',
                   followings:'$insights.followings',
                   reactions:'$insights.reactions',
                   posts:'$insights.posts',
                   views:'$insights.views',
                   likes:'$insights.likes'
                 },
                avatar:{
                  mediaBasePath:'$profilpict.mediaBasePath',
                  mediaUri:'$profilpict.mediaUri',
                  mediaType:'$profilpict.mediaType',
                  mediaEndpoint:'$profilpict.fsTargetUri',
                  medreplace:{ $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
                  
                },
               
              }
            },
           
            {
              $addFields: {
               
                concats:'/profilepict',
               pict:{ $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
               concatmediapict:'/pict',
               media_pict:{ $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


               concatmediadiari:'/stream',
               concatthumbdiari:'/thumb',
               media_diari:'$mediadiaries.mediaUri',

               concatmediavideo:'/stream',
               concatthumbvideo:'/thumb',
               media_video:'$mediavideos.mediaUri'
              },
            },
            {
              $project:{
                rotate:'$mediadiaries.rotate',
                mediaBasePath: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaBasePath' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaBasePath' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaBasePath' }
                    ],
                    default: ''
                  }
                },
                mediaUri: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaUri' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaUri' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaUri' }
                    ],
                    default: ''
                  }
                },
                mediaType: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaType' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaType' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaType' }
                    ],
                    default: ''
                  }
                },
                
               mediaThumbEndpoint: {
                $switch: {
                  branches: [
                    { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediadiaries.mediaThumb' },
                    { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': { $concat: [ "$concatthumbdiari", "/", "$media_diari" ] }, },
                    { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': { $concat: [ "$concatthumbvideo", "/", "$media_video" ] }, }
                  ],
                  default: ''
                }
              },
               
                mediaEndpoint: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then':  { $concat: [ "$concatmediapict", "/", "$media_pict" ] }, },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': { $concat: [ "$concatmediadiari", "/", "$media_diari" ] }, },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': { $concat: [ "$concatmediavideo", "/", "$media_video" ] }, }
                    ],
                    default: ''
                  }
                },

                mediaThumbUri: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediadiaries.mediaThumb' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaThumb' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaThumb' }
                    ],
                    default: ''
                  }
                },
                
                fullName: '$fullName',
                username:'$auth.username',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                privacy:'$privacy',
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
                insight:{
                  shares:'$insights.shares',
                   followers:'$insights.followers',
                   comments:'$insights.comments',
                   followings:'$insights.followings',
                   reactions:'$insights.reactions',
                   posts:'$insights.posts',
                   views:'$insights.views',
                   likes:'$insights.likes'
                 },
                avatar:{
                  mediaBasePath:'$profilpict.mediaBasePath',
                  mediaUri:'$profilpict.mediaUri',
                  mediaType:'$profilpict.mediaType',
                  mediaEndpoint:{ $concat: [ "$concats", "/", "$pict" ] },
                   
                
                },
          
               
              
              }
            },
           
            {$sort: { createdAt: -1 },},
            { $skip: 0},
            { $limit: 10 },
        
        ]);

        return query;
      }


      async findpopular(email:string): Promise<object> {
        const posts = await this.postsService.findpost();
        const video = await this.mediavideosService.findvideo();
        const pict = await this.mediapictsService.findpict();
        const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
        const insight = await this.insightsService.findinsight();
        const diaries = await this.mediadiariesService.finddiaries();

        const query =await this.getusercontentsModel.aggregate([
           {$match:{email: email}},
            {
                $addFields: {
                  ubasic_id:'$userProfile.$id',
                  
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
              $project:{
               refs: { $arrayElemAt: ['$contentMedias', 0] },
                user: { $arrayElemAt: ['$userbasics_data', 0] },
               // refe:'$refs.ref',
                profilpictid:'$user.profilePict.$id',
                insight_id: '$user.insight.$id',
                userAuth_id:'$user.userAuth.$id',
                fullName: '$user.fullName',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                isPostPrivate: '$user.isPostPrivate',
                privacy:{
                  isPostPrivate: '$user.isPostPrivate',
                  isCelebrity: '$user.isCelebrity',
                  isPrivate: '$user.isPrivate',
                },
                isViewed:
                {
                  $cond: { if: { $eq: [ "$views", 0 ] }, then: false, else: true }
                },
                allowComments: '$allowComments',
              
              }
            },
            {
              $project:{
                refs: '$refs.$ref',
                idmedia:'$refs.$id',
                profilpictid:'$user.profilePict.$id',
                 insight_id: '$user.insight.$id',
                 userAuth_id:'$user.userAuth.$id',
                fullName: '$user.fullName',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                isPostPrivate: '$user.isPostPrivate',
                privacy:{
                  isPostPrivate: '$user.isPostPrivate',
                  isCelebrity: '$user.isCelebrity',
                  isPrivate: '$user.isPrivate',
                },
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
               
                refe:'$refs.ref',
              }
            },
           
              { $lookup: {
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
            { $lookup: {
              from: 'mediapicts2',
              localField: 'idmedia',
              foreignField: '_id',
              as: 'mediaPict_data',
            },
          },
          { $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        { $lookup: {
          from: 'mediavideos2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
            {
              $project:{
                mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
                mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
                mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

                profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
                insights: { $arrayElemAt: ['$insight_data', 0] },
                auth: { $arrayElemAt: ['$userAuth_data', 0] },
                mediapictPath:'$mediapict.mediaBasePath',
                mediadiariPath:'$mediadiaries.mediaBasePath',
                mediavideoPath:'$mediavideos.mediaBasePath',
                refs: '$refs',
                idmedia:'$idmedia',
                rotate:'$mediadiaries.rotate',
                 fullName: '$fullName',
                username:'$auth.username',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                privacy:'$privacy',
                isViewed:'$isViewed',
                allowComments: '$allowComments',
         
              
                insight:{
                  shares:'$insights.shares',
                   followers:'$insights.followers',
                   comments:'$insights.comments',
                   followings:'$insights.followings',
                   reactions:'$insights.reactions',
                   posts:'$insights.posts',
                   views:'$insights.views',
                   likes:'$insights.likes'
                 },
                avatar:{
                  mediaBasePath:'$profilpict.mediaBasePath',
                  mediaUri:'$profilpict.mediaUri',
                  mediaType:'$profilpict.mediaType',
                  mediaEndpoint:'$profilpict.fsTargetUri',
                  medreplace:{ $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
                  
                },
               
              }
            },
           
            {
              $addFields: {
               
                concats:'/profilepict',
               pict:{ $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
               concatmediapict:'/pict',
               media_pict:{ $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


               concatmediadiari:'/stream',
               concatthumbdiari:'/thumb',
               media_diari:'$mediadiaries.mediaUri',

               concatmediavideo:'/stream',
               concatthumbvideo:'/thumb',
               media_video:'$mediavideos.mediaUri'
              },
            },
            {
              $project:{
                rotate:'$mediadiaries.rotate',
                mediaBasePath: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaBasePath' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaBasePath' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaBasePath' }
                    ],
                    default: ''
                  }
                },
                mediaUri: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaUri' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaUri' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaUri' }
                    ],
                    default: ''
                  }
                },
                mediaType: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaType' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaType' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaType' }
                    ],
                    default: ''
                  }
                },
                
               mediaThumbEndpoint: {
                $switch: {
                  branches: [
                    { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediadiaries.mediaThumb' },
                    { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': { $concat: [ "$concatthumbdiari", "/", "$media_diari" ] }, },
                    { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': { $concat: [ "$concatthumbvideo", "/", "$media_video" ] }, }
                  ],
                  default: ''
                }
              },
               
                mediaEndpoint: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then':  { $concat: [ "$concatmediapict", "/", "$media_pict" ] }, },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': { $concat: [ "$concatmediadiari", "/", "$media_diari" ] }, },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': { $concat: [ "$concatmediavideo", "/", "$media_video" ] }, }
                    ],
                    default: ''
                  }
                },

                mediaThumbUri: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediadiaries.mediaThumb' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaThumb' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaThumb' }
                    ],
                    default: ''
                  }
                },
                
                fullName: '$fullName',
                username:'$auth.username',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                privacy:'$privacy',
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
                insight:{
                  shares:'$insights.shares',
                   followers:'$insights.followers',
                   comments:'$insights.comments',
                   followings:'$insights.followings',
                   reactions:'$insights.reactions',
                   posts:'$insights.posts',
                   views:'$insights.views',
                   likes:'$insights.likes'
                 },
                avatar:{
                  mediaBasePath:'$profilpict.mediaBasePath',
                  mediaUri:'$profilpict.mediaUri',
                  mediaType:'$profilpict.mediaType',
                  mediaEndpoint:{ $concat: [ "$concats", "/", "$pict" ] },
                   
                
                },
               
             
               
              
              }
            },
           
            {$sort: { views: -1 ,likes:-1},},
            { $skip: 0},
            { $limit: 10 },
        
        ]);

        return query;
      }

      async findsearch(email:string,title:string): Promise<object> {
        const posts = await this.postsService.findpost();
        const video = await this.mediavideosService.findvideo();
        const pict = await this.mediapictsService.findpict();
        const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
        const insight = await this.insightsService.findinsight();
        const diaries = await this.mediadiariesService.finddiaries();

        const query =await this.getusercontentsModel.aggregate([
           {$match:{email: email,title:{ $regex: title}}},
            {
                $addFields: {
                  ubasic_id:'$userProfile.$id',
                  
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
              $project:{
               refs: { $arrayElemAt: ['$contentMedias', 0] },
                user: { $arrayElemAt: ['$userbasics_data', 0] },
            
                profilpictid:'$user.profilePict.$id',
                insight_id: '$user.insight.$id',
                userAuth_id:'$user.userAuth.$id',
                fullName: '$user.fullName',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                isPostPrivate: '$user.isPostPrivate',
                privacy:{
                  isPostPrivate: '$user.isPostPrivate',
                  isCelebrity: '$user.isCelebrity',
                  isPrivate: '$user.isPrivate',
                },
                isViewed:
                {
                  $cond: { if: { $eq: [ "$views", 0 ] }, then: false, else: true }
                },
                allowComments: '$allowComments',
              
              }
            },
            {
              $project:{
                refs: '$refs.$ref',
                idmedia:'$refs.$id',
                profilpictid:'$user.profilePict.$id',
                 insight_id: '$user.insight.$id',
                 userAuth_id:'$user.userAuth.$id',
                fullName: '$user.fullName',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                isPostPrivate: '$user.isPostPrivate',
                privacy:{
                  isPostPrivate: '$user.isPostPrivate',
                  isCelebrity: '$user.isCelebrity',
                  isPrivate: '$user.isPrivate',
                },
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
               
                refe:'$refs.ref',
              }
            },
           
              { $lookup: {
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
            { $lookup: {
              from: 'mediapicts2',
              localField: 'idmedia',
              foreignField: '_id',
              as: 'mediaPict_data',
            },
          },
          { $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        { $lookup: {
          from: 'mediavideos2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
            {
              $project:{
                mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
                mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
                mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

                profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
                insights: { $arrayElemAt: ['$insight_data', 0] },
                auth: { $arrayElemAt: ['$userAuth_data', 0] },
                mediapictPath:'$mediapict.mediaBasePath',
                mediadiariPath:'$mediadiaries.mediaBasePath',
                mediavideoPath:'$mediavideos.mediaBasePath',
                refs: '$refs',
                idmedia:'$idmedia',
                rotate:'$mediadiaries.rotate',
                 fullName: '$fullName',
                username:'$auth.username',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                privacy:'$privacy',
                isViewed:'$isViewed',
                allowComments: '$allowComments',
         
              
                insight:{
                  shares:'$insights.shares',
                   followers:'$insights.followers',
                   comments:'$insights.comments',
                   followings:'$insights.followings',
                   reactions:'$insights.reactions',
                   posts:'$insights.posts',
                   views:'$insights.views',
                   likes:'$insights.likes'
                 },
                avatar:{
                  mediaBasePath:'$profilpict.mediaBasePath',
                  mediaUri:'$profilpict.mediaUri',
                  mediaType:'$profilpict.mediaType',
                  mediaEndpoint:'$profilpict.fsTargetUri',
                  medreplace:{ $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
                  
                },
               
              }
            },
           
            {
              $addFields: {
               
                concats:'/profilepict',
               pict:{ $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
               concatmediapict:'/pict',
               media_pict:{ $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


               concatmediadiari:'/stream',
               concatthumbdiari:'/thumb',
               media_diari:'$mediadiaries.mediaUri',

               concatmediavideo:'/stream',
               concatthumbvideo:'/thumb',
               media_video:'$mediavideos.mediaUri'
              },
            },
            {
              $project:{
                rotate:'$mediadiaries.rotate',
                mediaBasePath: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaBasePath' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaBasePath' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaBasePath' }
                    ],
                    default: ''
                  }
                },
                mediaUri: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaUri' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaUri' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaUri' }
                    ],
                    default: ''
                  }
                },
                mediaType: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaType' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaType' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaType' }
                    ],
                    default: ''
                  }
                },
             
               mediaThumbEndpoint: {
                $switch: {
                  branches: [
                    { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediadiaries.mediaThumb' },
                    { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': { $concat: [ "$concatthumbdiari", "/", "$media_diari" ] }, },
                    { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': { $concat: [ "$concatthumbvideo", "/", "$media_video" ] }, }
                  ],
                  default: ''
                }
              },
               
                mediaEndpoint: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then':  { $concat: [ "$concatmediapict", "/", "$media_pict" ] }, },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': { $concat: [ "$concatmediadiari", "/", "$media_diari" ] }, },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': { $concat: [ "$concatmediavideo", "/", "$media_video" ] }, }
                    ],
                    default: ''
                  }
                },

                mediaThumbUri: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediadiaries.mediaThumb' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaThumb' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaThumb' }
                    ],
                    default: ''
                  }
                },
                
                fullName: '$fullName',
                username:'$auth.username',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                privacy:'$privacy',
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
                insight:{
                  shares:'$insights.shares',
                   followers:'$insights.followers',
                   comments:'$insights.comments',
                   followings:'$insights.followings',
                   reactions:'$insights.reactions',
                   posts:'$insights.posts',
                   views:'$insights.views',
                   likes:'$insights.likes'
                 },
                avatar:{
                  mediaBasePath:'$profilpict.mediaBasePath',
                  mediaUri:'$profilpict.mediaUri',
                  mediaType:'$profilpict.mediaType',
                  mediaEndpoint:{ $concat: [ "$concats", "/", "$pict" ] },
                   
                
                },
               
            
               
              
              }
            },
           
            {$sort: { createdAt: -1 },},
            { $skip: 0},
            { $limit: 10 },
        
        ]);

        return query;
      }


      async findmonetize(email:string): Promise<object> {
        const posts = await this.postsService.findpost();
        const video = await this.mediavideosService.findvideo();
        const pict = await this.mediapictsService.findpict();
        const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
        const insight = await this.insightsService.findinsight();
        const diaries = await this.mediadiariesService.finddiaries();

        const query =await this.getusercontentsModel.aggregate([
           {$match:{email: email,isCertified:true}},
            {
                $addFields: {
                  ubasic_id:'$userProfile.$id',
                  
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
              $project:{
               refs: { $arrayElemAt: ['$contentMedias', 0] },
                user: { $arrayElemAt: ['$userbasics_data', 0] },
               // refe:'$refs.ref',
                profilpictid:'$user.profilePict.$id',
                insight_id: '$user.insight.$id',
                userAuth_id:'$user.userAuth.$id',
                fullName: '$user.fullName',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                isCertified:'$isCertified',
                isPostPrivate: '$user.isPostPrivate',
                privacy:{
                  isPostPrivate: '$user.isPostPrivate',
                  isCelebrity: '$user.isCelebrity',
                  isPrivate: '$user.isPrivate',
                },
                isViewed:
                {
                  $cond: { if: { $eq: [ "$views", 0 ] }, then: false, else: true }
                },
                allowComments: '$allowComments',
              
              }
            },
            {
              $project:{
                refs: '$refs.$ref',
                idmedia:'$refs.$id',
                profilpictid:'$user.profilePict.$id',
                 insight_id: '$user.insight.$id',
                 userAuth_id:'$user.userAuth.$id',
                fullName: '$user.fullName',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                isCertified:'$isCertified',
                isPostPrivate: '$user.isPostPrivate',
                privacy:{
                  isPostPrivate: '$user.isPostPrivate',
                  isCelebrity: '$user.isCelebrity',
                  isPrivate: '$user.isPrivate',
                },
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
               
                refe:'$refs.ref',
              }
            },
           
              { $lookup: {
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
            { $lookup: {
              from: 'mediapicts2',
              localField: 'idmedia',
              foreignField: '_id',
              as: 'mediaPict_data',
            },
          },
          { $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        { $lookup: {
          from: 'mediavideos2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
            {
              $project:{
                mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
                mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
                mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

                profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
                insights: { $arrayElemAt: ['$insight_data', 0] },
                auth: { $arrayElemAt: ['$userAuth_data', 0] },
                mediapictPath:'$mediapict.mediaBasePath',
                mediadiariPath:'$mediadiaries.mediaBasePath',
                mediavideoPath:'$mediavideos.mediaBasePath',
                refs: '$refs',
                idmedia:'$idmedia',
                rotate:'$mediadiaries.rotate',
                 fullName: '$fullName',
                username:'$auth.username',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                isCertified:'$isCertified',
                privacy:'$privacy',
                isViewed:'$isViewed',
                allowComments: '$allowComments',
         
              
                insight:{
                  shares:'$insights.shares',
                   followers:'$insights.followers',
                   comments:'$insights.comments',
                   followings:'$insights.followings',
                   reactions:'$insights.reactions',
                   posts:'$insights.posts',
                   views:'$insights.views',
                   likes:'$insights.likes'
                 },
                avatar:{
                  mediaBasePath:'$profilpict.mediaBasePath',
                  mediaUri:'$profilpict.mediaUri',
                  mediaType:'$profilpict.mediaType',
                  mediaEndpoint:'$profilpict.fsTargetUri',
                  medreplace:{ $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
                  
                },
               
              }
            },
           
            {
              $addFields: {
               
                concats:'/profilepict',
               pict:{ $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
               concatmediapict:'/pict',
               media_pict:{ $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


               concatmediadiari:'/stream',
               concatthumbdiari:'/thumb',
               media_diari:'$mediadiaries.mediaUri',

               concatmediavideo:'/stream',
               concatthumbvideo:'/thumb',
               media_video:'$mediavideos.mediaUri'
              },
            },
            {
              $project:{
                rotate:'$mediadiaries.rotate',
                mediaBasePath: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaBasePath' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaBasePath' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaBasePath' }
                    ],
                    default: ''
                  }
                },
                mediaUri: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaUri' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaUri' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaUri' }
                    ],
                    default: ''
                  }
                },
                mediaType: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaType' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaType' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaType' }
                    ],
                    default: ''
                  }
                },
                
               mediaThumbEndpoint: {
                $switch: {
                  branches: [
                    { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediadiaries.mediaThumb' },
                    { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': { $concat: [ "$concatthumbdiari", "/", "$media_diari" ] }, },
                    { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': { $concat: [ "$concatthumbvideo", "/", "$media_video" ] }, }
                  ],
                  default: ''
                }
              },
               
                mediaEndpoint: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then':  { $concat: [ "$concatmediapict", "/", "$media_pict" ] }, },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': { $concat: [ "$concatmediadiari", "/", "$media_diari" ] }, },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': { $concat: [ "$concatmediavideo", "/", "$media_video" ] }, }
                    ],
                    default: ''
                  }
                },

                mediaThumbUri: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediadiaries.mediaThumb' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaThumb' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaThumb' }
                    ],
                    default: ''
                  }
                },
                
                fullName: '$fullName',
                username:'$auth.username',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                isCertified:'$isCertified',
                privacy:'$privacy',
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
                insight:{
                  shares:'$insights.shares',
                   followers:'$insights.followers',
                   comments:'$insights.comments',
                   followings:'$insights.followings',
                   reactions:'$insights.reactions',
                   posts:'$insights.posts',
                   views:'$insights.views',
                   likes:'$insights.likes'
                 },
                avatar:{
                  mediaBasePath:'$profilpict.mediaBasePath',
                  mediaUri:'$profilpict.mediaUri',
                  mediaType:'$profilpict.mediaType',
                  mediaEndpoint:{ $concat: [ "$concats", "/", "$pict" ] },
                   
                
                },
               
             
               
              
              }
            },
           
            {$sort: { createdAt: -1 },},
            { $skip: 0},
            { $limit: 10 },
        
        ]);

        return query;
      }

      async findcontentall(email:string): Promise<object> {
        const posts = await this.postsService.findpost();
        const video = await this.mediavideosService.findvideo();
        const pict = await this.mediapictsService.findpict();
        const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
        const insight = await this.insightsService.findinsight();
        const diaries = await this.mediadiariesService.finddiaries();
        const disqus = await this.disqusService.finddisqus();
        const disquslogs = await this.disquslogsService.finddisquslog();
        

        const query =await this.getusercontentsModel.aggregate([
           {$match:{email: email}},
            {
                $addFields: {
                  ubasic_id:'$userProfile.$id',
                  
                  postid:'$postID'
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
              $project:{
                "_id" : 0, 
                posts : '$$ROOT',
            
                refs: { $arrayElemAt: ['$contentMedias', 0] },
                user: { $arrayElemAt: ['$userbasics_data', 0] },
               
                profilpictid:'$user.profilePict.$id',
                insight_id: '$user.insight.$id',
                userAuth_id:'$user.userAuth.$id',
                fullName: '$user.fullName',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                isPostPrivate: '$user.isPostPrivate',
            
                privacy:{
                  isPostPrivate: '$user.isPostPrivate',
                  isCelebrity: '$user.isCelebrity',
                  isPrivate: '$user.isPrivate',
                },
                isViewed:
                {
                  $cond: { if: { $eq: [ "$views", 0 ] }, then: false, else: true }
                },
                allowComments: '$allowComments',
               
              }
            },
            { 
              $lookup : { 
                  localField : 'posts.postID', 
                  from : 'disqus2', 
                  foreignField : 'postID', 
                  as: 'disqusdata'
              }
          },  { 
            $unwind : { 
                path : '$disqusdata', 
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
              $project:{
                
                refs: '$refs.$ref',
                idmedia:'$refs.$id',
                profilpictid:'$user.profilePict.$id',
                 insight_id: '$user.insight.$id',
                 userAuth_id:'$user.userAuth.$id',
                fullName: '$user.fullName',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                isPostPrivate: '$user.isPostPrivate',
                privacy:{
                  isPostPrivate: '$user.isPostPrivate',
                  isCelebrity: '$user.isCelebrity',
                  isPrivate: '$user.isPrivate',
                },
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
                disqus:{
                  disqusID:'$disqusdata.disqusID',
                  email:'$disqusdata.email',
                  mate:'$disqusdata.mate',
                  eventType: '$disqusdata.eventType',
                  active: '$disqusdata.active',
                  room: '$disqusdata.room',
                  createdAt: '$disqusdata.createdAt',
                  updatedAt:  '$disqusdata.updatedAt',
                  lastestMessage: '$disqusdata.lastestMessage',
                  disquslogs:'$logs',
                },
              
               
                refe:'$refs.ref',
              }
            },
           
              { $lookup: {
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
            { $lookup: {
              from: 'mediapicts2',
              localField: 'idmedia',
              foreignField: '_id',
              as: 'mediaPict_data',
            },
          },
          { $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        { $lookup: {
          from: 'mediavideos2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
            {
              $project:{
                mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
                mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
                mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

                profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
                insights: { $arrayElemAt: ['$insight_data', 0] },
                auth: { $arrayElemAt: ['$userAuth_data', 0] },
                mediapictPath:'$mediapict.mediaBasePath',
                mediadiariPath:'$mediadiaries.mediaBasePath',
                mediavideoPath:'$mediavideos.mediaBasePath',
                refs: '$refs',
                idmedia:'$idmedia',
                rotate:'$mediadiaries.rotate',
                 fullName: '$fullName',
                username:'$auth.username',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                privacy:'$privacy',
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
              
                insight:{
                  shares:'$insights.shares',
                   followers:'$insights.followers',
                   comments:'$insights.comments',
                   followings:'$insights.followings',
                   reactions:'$insights.reactions',
                   posts:'$insights.posts',
                   views:'$insights.views',
                   likes:'$insights.likes'
                 },
                avatar:{
                  mediaBasePath:'$profilpict.mediaBasePath',
                  mediaUri:'$profilpict.mediaUri',
                  mediaType:'$profilpict.mediaType',
                  mediaEndpoint:'$profilpict.fsTargetUri',
                  medreplace:{ $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
                  
                },
                disqus:'$disqus'
              }
            },
           
            {
              $addFields: {
               
                concats:'/profilepict',
               pict:{ $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
               concatmediapict:'/pict',
               media_pict:{ $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


               concatmediadiari:'/stream',
               concatthumbdiari:'/thumb',
               media_diari:'$mediadiaries.mediaUri',

               concatmediavideo:'/stream',
               concatthumbvideo:'/thumb',
               media_video:'$mediavideos.mediaUri'
              },
            },
            {
              $project:{
                rotate:'$mediadiaries.rotate',
                mediaBasePath: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaBasePath' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaBasePath' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaBasePath' }
                    ],
                    default: ''
                  }
                },
                mediaUri: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaUri' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaUri' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaUri' }
                    ],
                    default: ''
                  }
                },
                mediaType: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaType' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaType' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaType' }
                    ],
                    default: ''
                  }
                },
             
               mediaThumbEndpoint: {
                $switch: {
                  branches: [
                    { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediadiaries.mediaThumb' },
                    { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': { $concat: [ "$concatthumbdiari", "/", "$media_diari" ] }, },
                    { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': { $concat: [ "$concatthumbvideo", "/", "$media_video" ] }, }
                  ],
                  default: ''
                }
              },
               
                mediaEndpoint: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then':  { $concat: [ "$concatmediapict", "/", "$media_pict" ] }, },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': { $concat: [ "$concatmediadiari", "/", "$media_diari" ] }, },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': { $concat: [ "$concatmediavideo", "/", "$media_video" ] }, }
                    ],
                    default: ''
                  }
                },

                mediaThumbUri: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediadiaries.mediaThumb' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaThumb' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaThumb' }
                    ],
                    default: ''
                  }
                },
                
                fullName: '$fullName',
                username:'$auth.username',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                privacy:'$privacy',
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
                insight:{
                  shares:'$insights.shares',
                   followers:'$insights.followers',
                   comments:'$insights.comments',
                   followings:'$insights.followings',
                   reactions:'$insights.reactions',
                   posts:'$insights.posts',
                   views:'$insights.views',
                   likes:'$insights.likes'
                 },
                avatar:{
                  mediaBasePath:'$profilpict.mediaBasePath',
                  mediaUri:'$profilpict.mediaUri',
                  mediaType:'$profilpict.mediaType',
                  mediaEndpoint:{ $concat: [ "$concats", "/", "$pict" ] },
                   
                
                },
               
                disqus:'$disqus'
               
              
              }
            },
           
            {$sort: { createdAt: -1 },},
            // { $skip: 0},
            // { $limit: 10 },
        
        ]);

        return query;
      }
      async findcontentgroup(email:string): Promise<object> {
        const posts = await this.postsService.findpost();
        const video = await this.mediavideosService.findvideo();
        const pict = await this.mediapictsService.findpict();
        const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
        const insight = await this.insightsService.findinsight();
        const diaries = await this.mediadiariesService.finddiaries();
        const disqus = await this.disqusService.finddisqus();
        const disquslogs = await this.disquslogsService.finddisquslog();
        

        const contentpopular =await this.getusercontentsModel.aggregate([
           {$match:{email: email}},
            {
                $addFields: {
                  ubasic_id:'$userProfile.$id',
                  
                  postid:'$postID'
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
              $project:{
                "_id" : 0, 
                posts : '$$ROOT',
            
                refs: { $arrayElemAt: ['$contentMedias', 0] },
                user: { $arrayElemAt: ['$userbasics_data', 0] },
               
                profilpictid:'$user.profilePict.$id',
                insight_id: '$user.insight.$id',
                userAuth_id:'$user.userAuth.$id',
                fullName: '$user.fullName',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                isPostPrivate: '$user.isPostPrivate',
            
                privacy:{
                  isPostPrivate: '$user.isPostPrivate',
                  isCelebrity: '$user.isCelebrity',
                  isPrivate: '$user.isPrivate',
                },
                isViewed:
                {
                  $cond: { if: { $eq: [ "$views", 0 ] }, then: false, else: true }
                },
                allowComments: '$allowComments',
               
              }
            },
            { 
              $lookup : { 
                  localField : 'posts.postID', 
                  from : 'disqus2', 
                  foreignField : 'postID', 
                  as: 'disqusdata'
              }
          },  { 
            $unwind : { 
                path : '$disqusdata', 
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
          $unwind : { 
              path : '$logs', 
              preserveNullAndEmptyArrays: false
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
              $project:{
                replylogs:'$logs2',
                refs: '$refs.$ref',
                idmedia:'$refs.$id',
                profilpictid:'$user.profilePict.$id',
                 insight_id: '$user.insight.$id',
                 userAuth_id:'$user.userAuth.$id',
                fullName: '$user.fullName',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                isPostPrivate: '$user.isPostPrivate',
                privacy:{
                  isPostPrivate: '$user.isPostPrivate',
                  isCelebrity: '$user.isCelebrity',
                  isPrivate: '$user.isPrivate',
                },
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
                disqus:{
                  disqusID:'$disqusdata.disqusID',
                  email:'$disqusdata.email',
                  mate:'$disqusdata.mate',
                  eventType: '$disqusdata.eventType',
                  active: '$disqusdata.active',
                  room: '$disqusdata.room',
                  createdAt: '$disqusdata.createdAt',
                  updatedAt:  '$disqusdata.updatedAt',
                  lastestMessage: '$disqusdata.lastestMessage',
                  disquslogs:{
                    disqusID:'$logs.disqusID',
                    sequenceNumber: '$logs.sequenceNumber',
                    sender: '$logs.sender',
                    receiver: '$logs.receiver',
                    active: '$logs.active',
                    postType: '$logs.postType',
                    createdAt: '$logs.createdAt',
                    updatedAt: '$logs.updatedAt',
                    txtMessages: '$logs.txtMessages',
                    replyLogs: '$logs2',

                  }
                },
              
               
                refe:'$refs.ref',
              }
            },
           
              { $lookup: {
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
            { $lookup: {
              from: 'mediapicts2',
              localField: 'idmedia',
              foreignField: '_id',
              as: 'mediaPict_data',
            },
          },
          { $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        { $lookup: {
          from: 'mediavideos2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
            {
              $project:{
                replylogs:'$replylogs',
                mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
                mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
                mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

                profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
                insights: { $arrayElemAt: ['$insight_data', 0] },
                auth: { $arrayElemAt: ['$userAuth_data', 0] },
                mediapictPath:'$mediapict.mediaBasePath',
                mediadiariPath:'$mediadiaries.mediaBasePath',
                mediavideoPath:'$mediavideos.mediaBasePath',
                refs: '$refs',
                idmedia:'$idmedia',
                rotate:'$mediadiaries.rotate',
                 fullName: '$fullName',
                username:'$auth.username',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                privacy:'$privacy',
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
              
                insight:{
                  shares:'$insights.shares',
                   followers:'$insights.followers',
                   comments:'$insights.comments',
                   followings:'$insights.followings',
                   reactions:'$insights.reactions',
                   posts:'$insights.posts',
                   views:'$insights.views',
                   likes:'$insights.likes'
                 },
                avatar:{
                  mediaBasePath:'$profilpict.mediaBasePath',
                  mediaUri:'$profilpict.mediaUri',
                  mediaType:'$profilpict.mediaType',
                  mediaEndpoint:'$profilpict.fsTargetUri',
                  medreplace:{ $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
                  
                },
                disqus:'$disqus'
            }
            },
          
            {
              $addFields: {
               
                concats:'/profilepict',
               pict:{ $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
               concatmediapict:'/pict',
               media_pict:{ $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


               concatmediadiari:'/stream',
               concatthumbdiari:'/thumb',
               media_diari:'$mediadiaries.mediaUri',

               concatmediavideo:'/stream',
               concatthumbvideo:'/thumb',
               media_video:'$mediavideos.mediaUri'
              },
            },
            {
              $project:{
                replylogs:'$replylogs',
                rotate:'$mediadiaries.rotate',
                mediaBasePath: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaBasePath' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaBasePath' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaBasePath' }
                    ],
                    default: ''
                  }
                },
                mediaUri: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaUri' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaUri' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaUri' }
                    ],
                    default: ''
                  }
                },
                mediaType: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaType' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaType' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaType' }
                    ],
                    default: ''
                  }
                },
             
               mediaThumbEndpoint: {
                $switch: {
                  branches: [
                    { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediadiaries.mediaThumb' },
                    { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': { $concat: [ "$concatthumbdiari", "/", "$media_diari" ] }, },
                    { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': { $concat: [ "$concatthumbvideo", "/", "$media_video" ] }, }
                  ],
                  default: ''
                }
              },
               
                mediaEndpoint: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then':  { $concat: [ "$concatmediapict", "/", "$media_pict" ] }, },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': { $concat: [ "$concatmediadiari", "/", "$media_diari" ] }, },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': { $concat: [ "$concatmediavideo", "/", "$media_video" ] }, }
                    ],
                    default: ''
                  }
                },

                mediaThumbUri: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediadiaries.mediaThumb' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaThumb' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaThumb' }
                    ],
                    default: ''
                  }
                },
                
                fullName: '$fullName',
                username:'$auth.username',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                privacy:'$privacy',
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
                insight:{
                  shares:'$insights.shares',
                   followers:'$insights.followers',
                   comments:'$insights.comments',
                   followings:'$insights.followings',
                   reactions:'$insights.reactions',
                   posts:'$insights.posts',
                   views:'$insights.views',
                   likes:'$insights.likes'
                 },
                avatar:{
                  mediaBasePath:'$profilpict.mediaBasePath',
                  mediaUri:'$profilpict.mediaUri',
                  mediaType:'$profilpict.mediaType',
                  mediaEndpoint:{ $concat: [ "$concats", "/", "$pict" ] },
                   
                
                },
               
                disqus:'$disqus'
                
             

              
              }
            },
            {
              $project:{
                 replylogs:'$replylogs',
                rotate:'$mediadiaries.rotate',
                mediaBasePath: '$mediaBasePath',
                mediaUri:'$mediaUri',
                mediaType: '$mediaType',
             
               mediaThumbEndpoint:'$mediaThumbEndpoint',
               
                mediaEndpoint: '$mediaEndpoint',

                mediaThumbUri:'$mediaThumbUri',
                
                fullName: '$fullName',
                username:'$auth.username',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                privacy:'$privacy',
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
                insight:'$insight',
                avatar:'$avatar',
               
                disqus:'$disqus'
                
             

              
              }
            },
           
           {$sort: { views: -1 ,likes:-1},},
            { $skip: 0},
            { $limit: 1 },
        
        ]);

        const contentlatest =await this.getusercontentsModel.aggregate([
          {$match:{email: email}},
            {
                $addFields: {
                  ubasic_id:'$userProfile.$id',
                  
                  postid:'$postID'
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
              $project:{
                "_id" : 0, 
                posts : '$$ROOT',
            
                refs: { $arrayElemAt: ['$contentMedias', 0] },
                user: { $arrayElemAt: ['$userbasics_data', 0] },
               
                profilpictid:'$user.profilePict.$id',
                insight_id: '$user.insight.$id',
                userAuth_id:'$user.userAuth.$id',
                fullName: '$user.fullName',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                isPostPrivate: '$user.isPostPrivate',
            
                privacy:{
                  isPostPrivate: '$user.isPostPrivate',
                  isCelebrity: '$user.isCelebrity',
                  isPrivate: '$user.isPrivate',
                },
                isViewed:
                {
                  $cond: { if: { $eq: [ "$views", 0 ] }, then: false, else: true }
                },
                allowComments: '$allowComments',
               
              }
            },
            { 
              $lookup : { 
                  localField : 'posts.postID', 
                  from : 'disqus2', 
                  foreignField : 'postID', 
                  as: 'disqusdata'
              }
          },  { 
            $unwind : { 
                path : '$disqusdata', 
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
          $unwind : { 
              path : '$logs', 
              preserveNullAndEmptyArrays: false
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
              $project:{
                replylogs:'$logs2',
                refs: '$refs.$ref',
                idmedia:'$refs.$id',
                profilpictid:'$user.profilePict.$id',
                 insight_id: '$user.insight.$id',
                 userAuth_id:'$user.userAuth.$id',
                fullName: '$user.fullName',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                isPostPrivate: '$user.isPostPrivate',
                privacy:{
                  isPostPrivate: '$user.isPostPrivate',
                  isCelebrity: '$user.isCelebrity',
                  isPrivate: '$user.isPrivate',
                },
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
                disqus:{
                  disqusID:'$disqusdata.disqusID',
                  email:'$disqusdata.email',
                  mate:'$disqusdata.mate',
                  eventType: '$disqusdata.eventType',
                  active: '$disqusdata.active',
                  room: '$disqusdata.room',
                  createdAt: '$disqusdata.createdAt',
                  updatedAt:  '$disqusdata.updatedAt',
                  lastestMessage: '$disqusdata.lastestMessage',
                  disquslogs:{
                    disqusID:'$logs.disqusID',
                    sequenceNumber: '$logs.sequenceNumber',
                    sender: '$logs.sender',
                    receiver: '$logs.receiver',
                    active: '$logs.active',
                    postType: '$logs.postType',
                    createdAt: '$logs.createdAt',
                    updatedAt: '$logs.updatedAt',
                    txtMessages: '$logs.txtMessages',
                    replyLogs: '$logs2',

                  }
                },
              
               
                refe:'$refs.ref',
              }
            },
           
              { $lookup: {
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
            { $lookup: {
              from: 'mediapicts2',
              localField: 'idmedia',
              foreignField: '_id',
              as: 'mediaPict_data',
            },
          },
          { $lookup: {
            from: 'mediadiaries2',
            localField: 'idmedia',
            foreignField: '_id',
            as: 'mediadiaries_data',
          },
        },
        { $lookup: {
          from: 'mediavideos2',
          localField: 'idmedia',
          foreignField: '_id',
          as: 'mediavideos_data',
        },
      },
            {
              $project:{
                replylogs:'$replylogs',
                mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
                mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
                mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

                profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
                insights: { $arrayElemAt: ['$insight_data', 0] },
                auth: { $arrayElemAt: ['$userAuth_data', 0] },
                mediapictPath:'$mediapict.mediaBasePath',
                mediadiariPath:'$mediadiaries.mediaBasePath',
                mediavideoPath:'$mediavideos.mediaBasePath',
                refs: '$refs',
                idmedia:'$idmedia',
                rotate:'$mediadiaries.rotate',
                 fullName: '$fullName',
                username:'$auth.username',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                privacy:'$privacy',
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
              
                insight:{
                  shares:'$insights.shares',
                   followers:'$insights.followers',
                   comments:'$insights.comments',
                   followings:'$insights.followings',
                   reactions:'$insights.reactions',
                   posts:'$insights.posts',
                   views:'$insights.views',
                   likes:'$insights.likes'
                 },
                avatar:{
                  mediaBasePath:'$profilpict.mediaBasePath',
                  mediaUri:'$profilpict.mediaUri',
                  mediaType:'$profilpict.mediaType',
                  mediaEndpoint:'$profilpict.fsTargetUri',
                  medreplace:{ $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
                  
                },
                disqus:'$disqus'
            }
            },
          
            {
              $addFields: {
               
                concats:'/profilepict',
               pict:{ $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
               concatmediapict:'/pict',
               media_pict:{ $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


               concatmediadiari:'/stream',
               concatthumbdiari:'/thumb',
               media_diari:'$mediadiaries.mediaUri',

               concatmediavideo:'/stream',
               concatthumbvideo:'/thumb',
               media_video:'$mediavideos.mediaUri'
              },
            },
            {
              $project:{
                replylogs:'$replylogs',
                rotate:'$mediadiaries.rotate',
                mediaBasePath: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaBasePath' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaBasePath' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaBasePath' }
                    ],
                    default: ''
                  }
                },
                mediaUri: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaUri' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaUri' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaUri' }
                    ],
                    default: ''
                  }
                },
                mediaType: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaType' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaType' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaType' }
                    ],
                    default: ''
                  }
                },
             
               mediaThumbEndpoint: {
                $switch: {
                  branches: [
                    { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediadiaries.mediaThumb' },
                    { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': { $concat: [ "$concatthumbdiari", "/", "$media_diari" ] }, },
                    { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': { $concat: [ "$concatthumbvideo", "/", "$media_video" ] }, }
                  ],
                  default: ''
                }
              },
               
                mediaEndpoint: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then':  { $concat: [ "$concatmediapict", "/", "$media_pict" ] }, },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': { $concat: [ "$concatmediadiari", "/", "$media_diari" ] }, },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': { $concat: [ "$concatmediavideo", "/", "$media_video" ] }, }
                    ],
                    default: ''
                  }
                },

                mediaThumbUri: {
                  $switch: {
                    branches: [
                      { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediadiaries.mediaThumb' },
                      { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaThumb' },
                      { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaThumb' }
                    ],
                    default: ''
                  }
                },
                
                fullName: '$fullName',
                username:'$auth.username',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                privacy:'$privacy',
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
                insight:{
                  shares:'$insights.shares',
                   followers:'$insights.followers',
                   comments:'$insights.comments',
                   followings:'$insights.followings',
                   reactions:'$insights.reactions',
                   posts:'$insights.posts',
                   views:'$insights.views',
                   likes:'$insights.likes'
                 },
                avatar:{
                  mediaBasePath:'$profilpict.mediaBasePath',
                  mediaUri:'$profilpict.mediaUri',
                  mediaType:'$profilpict.mediaType',
                  mediaEndpoint:{ $concat: [ "$concats", "/", "$pict" ] },
                   
                
                },
               
                disqus:'$disqus'
                
             

              
              }
            },
            {
              $project:{
                 replylogs:'$replylogs',
                rotate:'$mediadiaries.rotate',
                mediaBasePath: '$mediaBasePath',
                mediaUri:'$mediaUri',
                mediaType: '$mediaType',
             
               mediaThumbEndpoint:'$mediaThumbEndpoint',
               
                mediaEndpoint: '$mediaEndpoint',

                mediaThumbUri:'$mediaThumbUri',
                
                fullName: '$fullName',
                username:'$auth.username',
                createdAt:'$createdAt',
                updatedAt:'$updatedAt',
                postID:'$postID',
                email:'$email' ,
                postType: '$postType',
                description:'$description',
                title:'$description',
                active:'$active',
                metadata:'$metadata',
                tags: '$tags',
                likes:'$likes',
                views:'$views',
                privacy:'$privacy',
                isViewed:'$isViewed',
                allowComments: '$allowComments',
               
                insight:'$insight',
                avatar:'$avatar',
               
                disqus:'$disqus'
                
             

              
              }
            },
           
          
           {$sort: { createdAt: -1 },},
           { $skip: 0},
           { $limit: 1 },
       
       ]);
       const contentmonetize =await this.getusercontentsModel.aggregate([
       {$match:{email: email,isCertified:true}},
       {
           $addFields: {
             ubasic_id:'$userProfile.$id',
             
             postid:'$postID'
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
         $project:{
           "_id" : 0, 
           posts : '$$ROOT',
       
           refs: { $arrayElemAt: ['$contentMedias', 0] },
           user: { $arrayElemAt: ['$userbasics_data', 0] },
          
           profilpictid:'$user.profilePict.$id',
           insight_id: '$user.insight.$id',
           userAuth_id:'$user.userAuth.$id',
           fullName: '$user.fullName',
           createdAt:'$createdAt',
           updatedAt:'$updatedAt',
           postID:'$postID',
           email:'$email' ,
           postType: '$postType',
           description:'$description',
           title:'$description',
           active:'$active',
           metadata:'$metadata',
           tags: '$tags',
           likes:'$likes',
           views:'$views',
           isPostPrivate: '$user.isPostPrivate',
       
           privacy:{
             isPostPrivate: '$user.isPostPrivate',
             isCelebrity: '$user.isCelebrity',
             isPrivate: '$user.isPrivate',
           },
           isViewed:
           {
             $cond: { if: { $eq: [ "$views", 0 ] }, then: false, else: true }
           },
           allowComments: '$allowComments',
          
         }
       },
       { 
         $lookup : { 
             localField : 'posts.postID', 
             from : 'disqus2', 
             foreignField : 'postID', 
             as: 'disqusdata'
         }
     },  { 
       $unwind : { 
           path : '$disqusdata', 
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
     $unwind : { 
         path : '$logs', 
         preserveNullAndEmptyArrays: false
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
         $project:{
           replylogs:'$logs2',
           refs: '$refs.$ref',
           idmedia:'$refs.$id',
           profilpictid:'$user.profilePict.$id',
            insight_id: '$user.insight.$id',
            userAuth_id:'$user.userAuth.$id',
           fullName: '$user.fullName',
           createdAt:'$createdAt',
           updatedAt:'$updatedAt',
           postID:'$postID',
           email:'$email' ,
           postType: '$postType',
           description:'$description',
           title:'$description',
           active:'$active',
           metadata:'$metadata',
           tags: '$tags',
           likes:'$likes',
           views:'$views',
           isPostPrivate: '$user.isPostPrivate',
           privacy:{
             isPostPrivate: '$user.isPostPrivate',
             isCelebrity: '$user.isCelebrity',
             isPrivate: '$user.isPrivate',
           },
           isViewed:'$isViewed',
           allowComments: '$allowComments',
          
           disqus:{
             disqusID:'$disqusdata.disqusID',
             email:'$disqusdata.email',
             mate:'$disqusdata.mate',
             eventType: '$disqusdata.eventType',
             active: '$disqusdata.active',
             room: '$disqusdata.room',
             createdAt: '$disqusdata.createdAt',
             updatedAt:  '$disqusdata.updatedAt',
             lastestMessage: '$disqusdata.lastestMessage',
             disquslogs:{
               disqusID:'$logs.disqusID',
               sequenceNumber: '$logs.sequenceNumber',
               sender: '$logs.sender',
               receiver: '$logs.receiver',
               active: '$logs.active',
               postType: '$logs.postType',
               createdAt: '$logs.createdAt',
               updatedAt: '$logs.updatedAt',
               txtMessages: '$logs.txtMessages',
               replyLogs: '$logs2',

             }
           },
         
          
           refe:'$refs.ref',
         }
       },
      
         { $lookup: {
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
       { $lookup: {
         from: 'mediapicts2',
         localField: 'idmedia',
         foreignField: '_id',
         as: 'mediaPict_data',
       },
     },
     { $lookup: {
       from: 'mediadiaries2',
       localField: 'idmedia',
       foreignField: '_id',
       as: 'mediadiaries_data',
     },
   },
   { $lookup: {
     from: 'mediavideos2',
     localField: 'idmedia',
     foreignField: '_id',
     as: 'mediavideos_data',
   },
 },
       {
         $project:{
           replylogs:'$replylogs',
           mediapict: { $arrayElemAt: ['$mediaPict_data', 0] },
           mediadiaries: { $arrayElemAt: ['$mediadiaries_data', 0] },
           mediavideos: { $arrayElemAt: ['$mediavideos_data', 0] },

           profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
           insights: { $arrayElemAt: ['$insight_data', 0] },
           auth: { $arrayElemAt: ['$userAuth_data', 0] },
           mediapictPath:'$mediapict.mediaBasePath',
           mediadiariPath:'$mediadiaries.mediaBasePath',
           mediavideoPath:'$mediavideos.mediaBasePath',
           refs: '$refs',
           idmedia:'$idmedia',
           rotate:'$mediadiaries.rotate',
            fullName: '$fullName',
           username:'$auth.username',
           createdAt:'$createdAt',
           updatedAt:'$updatedAt',
           postID:'$postID',
           email:'$email' ,
           postType: '$postType',
           description:'$description',
           title:'$description',
           active:'$active',
           metadata:'$metadata',
           tags: '$tags',
           likes:'$likes',
           views:'$views',
           privacy:'$privacy',
           isViewed:'$isViewed',
           allowComments: '$allowComments',
          
         
           insight:{
             shares:'$insights.shares',
              followers:'$insights.followers',
              comments:'$insights.comments',
              followings:'$insights.followings',
              reactions:'$insights.reactions',
              posts:'$insights.posts',
              views:'$insights.views',
              likes:'$insights.likes'
            },
           avatar:{
             mediaBasePath:'$profilpict.mediaBasePath',
             mediaUri:'$profilpict.mediaUri',
             mediaType:'$profilpict.mediaType',
             mediaEndpoint:'$profilpict.fsTargetUri',
             medreplace:{ $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
             
           },
           disqus:'$disqus'
       }
       },
     
       {
         $addFields: {
          
           concats:'/profilepict',
          pict:{ $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
          concatmediapict:'/pict',
          media_pict:{ $replaceOne: { input: "$mediapict.mediaUri", find: "_0001.jpeg", replacement: "" } },


          concatmediadiari:'/stream',
          concatthumbdiari:'/thumb',
          media_diari:'$mediadiaries.mediaUri',

          concatmediavideo:'/stream',
          concatthumbvideo:'/thumb',
          media_video:'$mediavideos.mediaUri'
         },
       },
       {
         $project:{
           replylogs:'$replylogs',
           rotate:'$mediadiaries.rotate',
           mediaBasePath: {
             $switch: {
               branches: [
                 { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaBasePath' },
                 { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaBasePath' },
                 { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaBasePath' }
               ],
               default: ''
             }
           },
           mediaUri: {
             $switch: {
               branches: [
                 { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaUri' },
                 { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaUri' },
                 { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaUri' }
               ],
               default: ''
             }
           },
           mediaType: {
             $switch: {
               branches: [
                 { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediapict.mediaType' },
                 { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaType' },
                 { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaType' }
               ],
               default: ''
             }
           },
        
          mediaThumbEndpoint: {
           $switch: {
             branches: [
               { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediadiaries.mediaThumb' },
               { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': { $concat: [ "$concatthumbdiari", "/", "$media_diari" ] }, },
               { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': { $concat: [ "$concatthumbvideo", "/", "$media_video" ] }, }
             ],
             default: ''
           }
         },
          
           mediaEndpoint: {
             $switch: {
               branches: [
                 { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then':  { $concat: [ "$concatmediapict", "/", "$media_pict" ] }, },
                 { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': { $concat: [ "$concatmediadiari", "/", "$media_diari" ] }, },
                 { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': { $concat: [ "$concatmediavideo", "/", "$media_video" ] }, }
               ],
               default: ''
             }
           },

           mediaThumbUri: {
             $switch: {
               branches: [
                 { 'case': { '$eq': [ '$refs', 'mediapicts' ] }, 'then': '$mediadiaries.mediaThumb' },
                 { 'case': { '$eq': [ '$refs', 'mediadiaries' ] }, 'then': '$mediadiaries.mediaThumb' },
                 { 'case': { '$eq': [ '$refs', 'mediavideos' ] }, 'then': '$mediavideos.mediaThumb' }
               ],
               default: ''
             }
           },
           
           fullName: '$fullName',
           username:'$auth.username',
           createdAt:'$createdAt',
           updatedAt:'$updatedAt',
           postID:'$postID',
           email:'$email' ,
           postType: '$postType',
           description:'$description',
           title:'$description',
           active:'$active',
           metadata:'$metadata',
           tags: '$tags',
           likes:'$likes',
           views:'$views',
           privacy:'$privacy',
           isViewed:'$isViewed',
           allowComments: '$allowComments',
          
           insight:{
             shares:'$insights.shares',
              followers:'$insights.followers',
              comments:'$insights.comments',
              followings:'$insights.followings',
              reactions:'$insights.reactions',
              posts:'$insights.posts',
              views:'$insights.views',
              likes:'$insights.likes'
            },
           avatar:{
             mediaBasePath:'$profilpict.mediaBasePath',
             mediaUri:'$profilpict.mediaUri',
             mediaType:'$profilpict.mediaType',
             mediaEndpoint:{ $concat: [ "$concats", "/", "$pict" ] },
              
           
           },
          
           disqus:'$disqus'
           
        

         
         }
       },
       {
         $project:{
            replylogs:'$replylogs',
           rotate:'$mediadiaries.rotate',
           mediaBasePath: '$mediaBasePath',
           mediaUri:'$mediaUri',
           mediaType: '$mediaType',
        
          mediaThumbEndpoint:'$mediaThumbEndpoint',
          
           mediaEndpoint: '$mediaEndpoint',

           mediaThumbUri:'$mediaThumbUri',
           
           fullName: '$fullName',
           username:'$auth.username',
           createdAt:'$createdAt',
           updatedAt:'$updatedAt',
           postID:'$postID',
           email:'$email' ,
           postType: '$postType',
           description:'$description',
           title:'$description',
           active:'$active',
           metadata:'$metadata',
           tags: '$tags',
           likes:'$likes',
           views:'$views',
           privacy:'$privacy',
           isViewed:'$isViewed',
           allowComments: '$allowComments',
          
           insight:'$insight',
           avatar:'$avatar',
          
           disqus:'$disqus'
           
        

         
         }
       },
      
        
         {$sort: { createdAt: -1 },},
         { $skip: 0},
         { $limit: 1 },
     
     ]);

        return {contentpopular,contentlatest,contentmonetize};
      }

}


