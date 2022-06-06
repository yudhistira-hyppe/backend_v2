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
           
            {$sort: { views: -1 },},
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
}


