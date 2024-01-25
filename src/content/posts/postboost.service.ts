import { Logger, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DBRef, Long, ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { ApsaraImageResponse, ApsaraVideoResponse, Cat, CreatePostResponse, CreatePostsDto, Metadata, PostData, PostResponseApps, Privacy, TagPeople, Messages, InsightPost, ApsaraPlayResponse, Avatar, PostLandingResponseApps, PostLandingData, PostBuildData, VideoList, ImageInfo } from './dto/create-posts.dto';
import { Posts, PostsDocument } from './schemas/posts.schema';
import { GetuserprofilesService } from '../../trans/getuserprofiles/getuserprofiles.service';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import { Mediavideos } from '../mediavideos/schemas/mediavideos.schema';
import { UtilsService } from '../../utils/utils.service';
import { InterestsService } from '../../infra/interests/interests.service';
import { UserauthsService } from '../../trans/userauths/userauths.service';
import { MediavideosService } from '../mediavideos/mediavideos.service';
import { InsightsService } from '../insights/insights.service';
import { Insights } from '../insights/schemas/insights.schema';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { createWriteStream, unlink } from 'fs'
import { Userbasic } from '../../trans/userbasics/schemas/userbasic.schema';
import { ContenteventsService } from '../contentevents/contentevents.service';
import { Contentevents } from '../contentevents/schemas/contentevents.schema';
import { PostsService } from './posts.service';
import { Mediastories } from '../mediastories/schemas/mediastories.schema';
import { MediastoriesService } from '../mediastories/mediastories.service';
import { Mediadiaries } from '../mediadiaries/schemas/mediadiaries.schema';
import { Mediapicts } from '../mediapicts/schemas/mediapicts.schema';
import { MediapictsService } from '../mediapicts/mediapicts.service';
import { MediadiariesService } from '../mediadiaries/mediadiaries.service';
import { MediaprofilepictsService } from '../mediaprofilepicts/mediaprofilepicts.service';
import { IsDefined } from 'class-validator';
import { CreateUserplaylistDto, MediaData } from '../../trans/userplaylist/dto/create-userplaylist.dto';
import { Userplaylist, UserplaylistDocument } from '../../trans/userplaylist/schemas/userplaylist.schema';
import { PostPlaylistService } from '../postplaylist/postplaylist.service';
import { SeaweedfsService } from '../../stream/seaweedfs/seaweedfs.service';
import { ErrorHandler } from '../../utils/error.handler';
import * as fs from 'fs';
import { post } from 'jquery';
import { TemplatesRepoService } from '../../infra/templates_repo/templates_repo.service';
import { UnsubscriptionError } from 'rxjs';
import { Userauth } from '../../trans/userauths/schemas/userauth.schema';
import { SettingsService } from '../../trans/settings/settings.service';
import { InsightlogsService } from '../insightlogs/insightlogs.service';
import { ContentModService } from './contentmod.service';
import { threadId } from 'worker_threads';
import { NotificationsService } from '../notifications/notifications.service';
import { ContentDTO, CreateNotificationsDto, NotifResponseApps } from '../notifications/dto/create-notifications.dto';
import { use } from 'passport';
import { PostContentService } from './postcontent.service';
import { profile } from 'console';
import { CreateContenteventsDto } from '../contentevents/dto/create-contentevents.dto';
import { AdsLandingService } from './adslanding/adslanding.service';
import { LogapisService } from 'src/trans/logapis/logapis.service'; 
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import { Userbasicnew } from 'src/trans/userbasicnew/schemas/userbasicnew.schema';

//import FormData from "form-data";
var FormData = require('form-data');

@Injectable()
export class PostBoostService {
  private readonly logger = new Logger(PostBoostService.name);

  constructor(
    @InjectModel(Posts.name, 'SERVER_FULL')
    private readonly PostsModel: Model<PostsDocument>,
    private postService: PostContentService,
    private postxService: PostsService,
    private userService: UserbasicsService,
    private utilService: UtilsService,
    private userAuthService: UserauthsService,
    private settingsService: SettingsService,
    private contentEventsService: ContenteventsService,
    private errorHandler: ErrorHandler,
    private adsLandingService: AdsLandingService,
    private logapiSS: LogapisService,
    private readonly basic2SS: UserbasicnewService,
  ) { }

  async getBoost(body: any, headers: any): Promise<PostLandingResponseApps> {
    let st = await this.utilService.getDateTimeDate();
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    this.logger.log('getUserPostLandingPage >>> profile: ' + profile);

    let res = new PostLandingResponseApps();
    let data = new PostLandingData();
    res.response_code = 202;

    let x = Date.now();
    // x = x + (7 * 3600 * 1000);
    let today = new Date();
    //today.setHours(today.getHours() + 4);
    console.log(today);

    let row = 20;
    let page = 0;
    if (body.pageNumber != undefined) {
      page = parseInt(body.pageNumber);
    }
    if (body.pageRow != undefined) {
      row = parseInt(body.pageRow);
    }

    if (body.postType == undefined) {
      body.postType = 'ALL';
    }
    let skip = this.paging(page, row);

    let pipeline = new Array<any>(
      {
        $set: {
          "testDate": today
        }
      },
      {
        $unwind: {
          path: "$boosted",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$boosted.boostSession",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $set: {

          "timeStart": {
            $dateFromString: {
              dateString:
              {
                $concat: [
                  {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: "$testDate"
                    }
                  },
                  "T",
                  "$boosted.boostSession.timeStart"
                ]
              }
            }
          }
        }
      },
      {
        $set: {
          "timeEnd": {
            $dateFromString: {
              dateString:
              {
                $concat: [
                  {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: "$testDate"
                    }
                  },
                  "T",
                  "$boosted.boostSession.timeEnd"
                ]
              }
            }
          }
        }
      }
    );

    let pict = new Array<any>(


      {
        $sort: {
          "timeStart": -1,
          "isBoost": -1,
          "createdAt": -1
        }
      },
      {
        $match:
        {
          $or: [
            {
              $and: [

                {
                  $or: [
                    { "reportedStatus": "ALL" },
                    { "reportedStatus": null },
                  ]
                },
                {
                  "visibility": "PUBLIC"
                },
                {
                  "active": true
                },
                {
                  "postType": "pict"
                },
                {
                  "boosted.boostSession.start": {
                    $lte: {
                      $add: [new Date(), 25200000]
                    }
                  }
                },
                {
                  "boosted.boostSession.end": {
                    $gt: {
                      $add: [new Date(), 25200000]
                    }
                  }
                },
                {
                  "timeStart": {
                    $lte: {
                      $add: [new Date(), 25200000]
                    }
                  }
                },
                {
                  "timeEnd": {
                    $gte: {
                      $add: [new Date(), 25200000]
                    }
                  }
                },
                {

                  "timeStart": {
                    $ne: null
                  }
                },
                {
                  "reportedUser.email": {
                    $not: {
                      $regex: profile.email
                    }
                  }
                },
                {
                  $or: [
                    {
                      $and: [
                        {
                          "boosted.boostViewer.email": profile.email
                        },
                        {
                          "boosted.boostViewer.isLast": true
                        },
                        {
                          "boosted.boostViewer.timeEnd": {
                            $gt: "$testDate"
                          }
                        },
                      ]
                    },
                    {
                      $and: [
                        {
                          "boosted.boostViewer.email": {
                            $ne: profile.email
                          }
                        },
                      ]
                    }
                  ]
                }
              ]
            },
            {
              $and: [
                {
                  $or: [
                    { "reportedStatus": "ALL" },
                    { "reportedStatus": null },
                  ]
                },
                {
                  "visibility": "PUBLIC"
                },
                {
                  "active": true
                },
                {
                  "postType": "pict"
                },
                {
                  "isBoost": {
                    $ne: 5
                  }
                }
              ]
            },

          ]
        }
      },
      {
        "$lookup": {
          from: "mediapicts",
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
                "mediaType": 1,
                "mediaThumbEndpoint": 1,
                "mediaThumbUri": 1,

              }
            }
          ],
        },
      },
      {
        "$lookup": {
          from: "interests_repo",
          as: "cats",
          let: {
            localID: '$category.$id'
          },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $eq: ['$id', '$$localID']
                }
              }
            },
            {
              $project: {
                "interestName": 1,
                "langIso": 1,
                "icon": 1,
                "createdAt": 1,
                "updatedAt": 1
              }
            }
          ],

        }
      },
      {
        "$lookup": {
          from: "insights",
          as: "insight",
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
                "followers": 1,
                "followings": 1,
                "unfollows": 1,
                "likes": 1,
                "views": 1,
                "comments": 1,
                "posts": 1,
                "shares": 1,
                "reactions": 1,
                "views_profile": 1
              }
            }
          ],

        }
      },
      {
        "$lookup": {
          from: "userauths",
          as: "userTag",
          let: {
            localID: '$tagPeople.$id'
          },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $in: ['$_id', '$$localID']
                }
              }
            },
            {
              $project: {

                "username": 1
              }
            }
          ],

        }
      },
      {
        "$lookup": {
          from: "userauths",
          as: "username",
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

                "username": 1
              }
            }
          ],
        }
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
      {
        $unwind: {
          path: "$userBasic",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        "$lookup": {
          from: "mediaprofilepicts",
          as: "avatar",
          let: {
            localID: '$userBasic.profilePict.$id'
          },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $eq: ['$mediaID', '$$localID']
                }
              }
            },
            {
              $project: {
                "mediaBasePath": 1,
                "mediaUri": 1,
                "originalName": 1,
                "fsSourceUri": 1,
                "fsSourceName": 1,
                "fsTargetUri": 1,
              }
            }
          ],
        }
      },
      {
        "$lookup": {
          from: "mediamusic",
          as: "music",
          let: {
            localID: '$musicId'
          },
          pipeline: [
            {
              "$lookup": {
                from: "genre",
                as: "genre",
                let: {
                  localID: '$genre'
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
                      "name": 1
                    }
                  }
                ],
              }
            },
            {
              "$lookup": {
                from: "theme",
                as: "theme",
                let: {
                  localID: '$theme'
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
                      "name": 1
                    }
                  }
                ],
              }
            },
            {
              "$lookup": {
                from: "mood",
                as: "mood",
                let: {
                  localID: '$mood'
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
                      "name": 1
                    }
                  }
                ],
              }
            },
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
                "musicTitle": 1,
                "artistName": 1,
                "albumName": 1,
                "apsaraMusic": 1,
                "apsaraThumnail": 1,
                "genre": "$genre.name",
                "theme": "$theme.name",
                "mood": "$mood.name",
              }
            },
            {
              $unwind: {
                path: "$genre",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$theme",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$mood",
                preserveNullAndEmptyArrays: true
              }
            },
          ],
        }
      },
      {
        $skip: skip
      },
      {
        $limit: row
      },
      {
        $unwind: {
          path: "$media",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$username",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$music",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        "$lookup": {
          from: "contentevents",
          as: "isLike",
          let: {
            localID: '$postID'
          },
          pipeline: [
            {
              $match:
              {
                $and: [
                  {
                    $expr: {
                      $eq: ['$postID', '$$localID']
                    }
                  },
                  {
                    "email": profile.email
                  },
                  {
                    "eventType": "LIKE"
                  }
                ]
              }
            },
            {
              $project: {
                "email": 1,
              }
            }
          ],

        }
      },
      {
        $project: {
          "isLike": "$isLike",
          "tagPeople": "$userTag",
          "mediaType": "$media.mediaType",
          "music": 1,
          "musicId": 1,
          "email": 1,
          "postType": 1,
          "postID": 1,
          "description": 1,
          "active": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "expiration": 1,
          "visibility": 1,
          "location": 1,
          "tags": 1,
          "allowComments": 1,
          "isSafe": 1,
          "isOwned": 1,
          "certified": 1,
          "saleAmount": 1,
          "saleLike": 1,
          "saleView": 1,
          "likes": 1,
          "views": 1,
          "shares": 1,
          "userProfile": 1,
          "contentMedias": 1,
          "category": 1,
          "tagDescription": 1,
          "metadata": 1,
          "boostDate": 1,
          "boostInterval": 1,
          "boostSession": 1,
          "isBoost": 1,
          "boostViewer": 1,
          "boostCount": 1,
          "contentModeration": 1,
          "reportedStatus": 1,
          "reportedUserCount": 1,
          "contentModerationResponse": 1,
          "reportedUser": 1,
          "timeStart": 1,
          "timeEnd": 1,
          "apsara": "$media.apsara",
          "apsaraId": "$media.apsaraId",
          "apsaraThumbId": "$media.apsaraThumbId",
          "mediaEndpoint": "$media.mediaEndpoint",
          "mediaUri": "$media.mediaUri",
          "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
          "mediaThumbUri": "$media.mediaThumbUri",
          "apsaraMusic": "$music.apsaraMusic",
          "apsaraThumnail": "$music.apsaraThumnail",
          "cats": 1,
          "insight": 1,
          "fullName": "$userBasic.fullName",
          "username": "$username.username",
          "avatar": 1,
          "boosted": 1,
          "privacy": [{ "isCelebrity": "$userBasic.isCelebrity" }, { "isIdVerified": "$userBasic.isIdVerified" }, { "isPrivate": "$userBasic.isPrivate" }]
        }
      }
    );


    let video = new Array<any>(

      {
        $sort: {
          "timeStart": -1,
          "isBoost": -1,
          "createdAt": -1
        }
      },
      {
        $match:
        {
          $or: [
            {
              $and: [
                {
                  $or: [
                    { "reportedStatus": "ALL" },
                    { "reportedStatus": null },
                  ]
                },
                {
                  "visibility": "PUBLIC"
                },
                {
                  "active": true
                },
                {
                  "postType": "vid"
                },
                {
                  "boosted.boostSession.start": {
                    $lte: {
                      $add: [new Date(), 25200000]
                    }
                  }
                },
                {
                  "boosted.boostSession.end": {
                    $gt: {
                      $add: [new Date(), 25200000]
                    }
                  }
                },
                {
                  "timeStart": {
                    $lte: {
                      $add: [new Date(), 25200000]
                    }
                  }
                },
                {
                  "timeEnd": {
                    $gte: {
                      $add: [new Date(), 25200000]
                    }
                  }
                },
                {

                  "timeStart": {
                    $ne: null
                  }
                },
                {
                  "reportedUser.email": {
                    $not: {
                      $regex: profile.email
                    }
                  }
                },
                {
                  $or: [
                    {
                      $and: [
                        {
                          "boosted.boostViewer.email": profile.email
                        },
                        {
                          "boosted.boostViewer.isLast": true
                        },
                        {
                          "boosted.boostViewer.timeEnd": {
                            $gt: "$testDate"
                          }
                        },
                      ]
                    },
                    {
                      $and: [
                        {
                          "boosted.boostViewer.email": {
                            $ne: profile.email
                          }
                        },
                      ]
                    }
                  ]
                }
              ]
            },
            {
              $and: [
                {
                  $or: [
                    { "reportedStatus": "ALL" },
                    { "reportedStatus": null },
                  ]
                },
                {
                  "visibility": "PUBLIC"
                },
                {
                  "active": true
                },
                {
                  "postType": "vid"
                },
                {
                  "isBoost": {
                    $ne: 5
                  }
                }
              ]
            },
          ]
        }
      },
      {
        "$lookup": {
          from: "mediavideos",
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
                "mediaType": 1,
                "mediaThumbEndpoint": 1,
                "mediaThumbUri": 1,
              }
            }
          ],
        },
      },
      {
        "$lookup": {
          from: "interests_repo",
          as: "cats",
          let: {
            localID: '$category.$id'
          },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $eq: ['$id', '$$localID']
                }
              }
            },
            {
              $project: {
                "interestName": 1,
                "langIso": 1,
                "icon": 1,
                "createdAt": 1,
                "updatedAt": 1
              }
            }
          ],
        }
      },
      {
        "$lookup": {
          from: "insights",
          as: "insight",
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
                "followers": 1,
                "followings": 1,
                "unfollows": 1,
                "likes": 1,
                "views": 1,
                "comments": 1,
                "posts": 1,
                "shares": 1,
                "reactions": 1,
                "views_profile": 1
              }
            }
          ],
        }
      },
      {
        "$lookup": {
          from: "userauths",
          as: "userTag",
          let: {
            localID: '$tagPeople.$id'
          },
          pipeline: [
            {
              $match:
              {


                $expr: {
                  $in: ['$_id', '$$localID']
                }
              }
            },
            {
              $project: {

                "username": 1
              }
            }
          ],

        }
      },
      {
        "$lookup": {
          from: "userauths",
          as: "username",
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

                "username": 1
              }
            }
          ],

        }
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
      {
        $unwind: {
          path: "$userBasic",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        "$lookup": {
          from: "mediaprofilepicts",
          as: "avatar",
          let: {
            localID: '$userBasic.profilePict.$id'
          },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $eq: ['$mediaID', '$$localID']
                }
              }
            },
            {
              $project: {
                "mediaBasePath": 1,
                "mediaUri": 1,
                "originalName": 1,
                "fsSourceUri": 1,
                "fsSourceName": 1,
                "fsTargetUri": 1,
              }
            }
          ],
        }
      },
      {
        "$lookup": {
          from: "mediamusic",
          as: "music",
          let: {
            localID: '$musicId'
          },
          pipeline: [
            {
              "$lookup": {
                from: "genre",
                as: "genre",
                let: {
                  localID: '$genre'
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
                      "name": 1
                    }
                  }
                ],
              }
            },
            {
              "$lookup": {
                from: "theme",
                as: "theme",
                let: {
                  localID: '$theme'
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
                      "name": 1
                    }
                  }
                ],
              }
            },
            {
              "$lookup": {
                from: "mood",
                as: "mood",
                let: {
                  localID: '$mood'
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
                      "name": 1
                    }
                  }
                ],
              }
            },
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
                "musicTitle": 1,
                "artistName": 1,
                "albumName": 1,
                "apsaraMusic": 1,
                "apsaraThumnail": 1,
                "genre": "$genre.name",
                "theme": "$theme.name",
                "mood": "$mood.name",
              }
            },
            {
              $unwind: {
                path: "$genre",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$theme",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$mood",
                preserveNullAndEmptyArrays: true
              }
            },
          ],
        }
      },
      {
        $skip: skip
      },
      {
        $limit: row
      },
      {
        $unwind: {
          path: "$media",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$username",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$music",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        "$lookup": {
          from: "contentevents",
          as: "isLike",
          let: {
            localID: '$postID'
          },
          pipeline: [
            {
              $match:
              {
                $and: [
                  {
                    $expr: {
                      $eq: ['$postID', '$$localID']
                    }
                  },
                  {
                    "email": profile.email
                  },
                  {
                    "eventType": "LIKE"
                  }
                ]
              }
            },
            {
              $project: {
                "email": 1,
              }
            }
          ],

        }
      },
      {
        $project: {
          "isLike": "$isLike",
          "tagPeople": "$userTag",
          "mediaType": "$media.mediaType",
          "music": 1,
          "musicId": 1,
          "email": 1,
          "postType": 1,
          "postID": 1,
          "description": 1,
          "active": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "expiration": 1,
          "visibility": 1,
          "location": 1,
          "tags": 1,
          "allowComments": 1,
          "isSafe": 1,
          "isOwned": 1,
          "certified": 1,
          "saleAmount": 1,
          "saleLike": 1,
          "saleView": 1,
          "likes": 1,
          "views": 1,
          "shares": 1,
          "userProfile": 1,
          "contentMedias": 1,
          "category": 1,
          "tagDescription": 1,
          "metadata": 1,
          "boostDate": 1,
          "boostInterval": 1,
          "boostSession": 1,
          "isBoost": 1,
          "boostViewer": 1,
          "boostCount": 1,
          "contentModeration": 1,
          "reportedStatus": 1,
          "reportedUserCount": 1,
          "contentModerationResponse": 1,
          "reportedUser": 1,
          "timeStart": 1,
          "timeEnd": 1,
          "apsara": "$media.apsara",
          "apsaraId": "$media.apsaraId",
          "apsaraThumbId": "$media.apsaraThumbId",
          "mediaEndpoint": "$media.mediaEndpoint",
          "mediaUri": "$media.mediaUri",
          "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
          "mediaThumbUri": "$media.mediaThumbUri",
          "apsaraMusic": "$music.apsaraMusic",
          "apsaraThumnail": "$music.apsaraThumnail",
          "cats": 1,
          "insight": 1,
          "fullName": "$userBasic.fullName",
          "username": "$username.username",
          "avatar": 1,
          "boosted": 1,
          "privacy": [{ "isCelebrity": "$userBasic.isCelebrity" }, { "isIdVerified": "$userBasic.isIdVerified" }, { "isPrivate": "$userBasic.isPrivate" }]
        }
      }
    );

    let diary = new Array<any>(

      {
        $sort: {
          "timeStart": -1,
          "isBoost": -1,
          "createdAt": -1
        }
      },
      {
        $match:
        {
          $or: [
            {
              $and: [
                {
                  $or: [
                    { "reportedStatus": "ALL" },
                    { "reportedStatus": null },
                  ]
                },
                {
                  "visibility": "PUBLIC"
                },
                {
                  "active": true
                },
                {
                  "postType": "diary"
                },
                {
                  $expr: {
                    $lte: ["$boosted.boostSession.start", "$testDate"]
                  }
                },
                {
                  $expr: {
                    $gt: ["$boosted.boostSession.end", "$testDate",]
                  }
                },
                {
                  $expr: {
                    $lte: ["$timeStart", "$testDate"]
                  }
                },
                {
                  $expr: {
                    $gt: ["$timeEnd", "$testDate"]
                  }
                },
                {

                  "timeStart": {
                    $ne: null
                  }
                },
                {

                  "timeEnd": {
                    $ne: null
                  }
                },
                {
                  "reportedUser.email": {
                    $not: {
                      $regex: profile.email
                    }
                  }
                },
                {
                  $or: [
                    {
                      $and: [
                        {
                          "boosted.boostViewer.email": profile.email
                        },
                        {
                          "boosted.boostViewer.isLast": true
                        },
                        {
                          "boosted.boostViewer.timeEnd": {
                            $gt: "$testDate"
                          }
                        },
                      ]
                    },
                    {
                      $and: [
                        {
                          "boosted.boostViewer.email": {
                            $ne: profile.email
                          }
                        },
                      ]
                    }
                  ]
                }
              ]
            },
            {
              $and: [
                {
                  $or: [
                    { "reportedStatus": "ALL" },
                    { "reportedStatus": null },
                  ]
                },
                {
                  "visibility": "PUBLIC"
                },
                {
                  "active": true
                },
                {
                  "postType": "diary"
                },
                {
                  "isBoost": {
                    $ne: 5
                  }
                }
              ]
            },

          ]
        }
      },
      {
        "$lookup": {
          from: "mediadiaries",
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
                "mediaType": 1,
                "mediaThumbEndpoint": 1,
                "mediaThumbUri": 1,
              }
            }
          ],

        },
      },
      {
        "$lookup": {
          from: "interests_repo",
          as: "cats",
          let: {
            localID: '$category.$id'
          },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $eq: ['$id', '$$localID']
                }
              }
            },
            {
              $project: {
                "interestName": 1,
                "langIso": 1,
                "icon": 1,
                "createdAt": 1,
                "updatedAt": 1
              }
            }
          ],
        }
      },
      {
        "$lookup": {
          from: "insights",
          as: "insight",
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
                "followers": 1,
                "followings": 1,
                "unfollows": 1,
                "likes": 1,
                "views": 1,
                "comments": 1,
                "posts": 1,
                "shares": 1,
                "reactions": 1,
                "views_profile": 1
              }
            }
          ],
        }
      },
      {
        "$lookup": {
          from: "userauths",
          as: "userTag",
          let: {
            localID: '$tagPeople.$id'
          },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $in: ['$_id', '$$localID']
                }
              }
            },
            {
              $project: {

                "username": 1
              }
            }
          ],

        }
      },
      {
        "$lookup": {
          from: "userauths",
          as: "username",
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
                "username": 1
              }
            }
          ],

        }
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
      {
        $unwind: {
          path: "$userBasic",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        "$lookup": {
          from: "mediaprofilepicts",
          as: "avatar",
          let: {
            localID: '$userBasic.profilePict.$id'
          },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $eq: ['$mediaID', '$$localID']
                }
              }
            },
            {
              $project: {
                "mediaBasePath": 1,
                "mediaUri": 1,
                "originalName": 1,
                "fsSourceUri": 1,
                "fsSourceName": 1,
                "fsTargetUri": 1,
              }
            }
          ],
        }
      },
      {
        "$lookup": {
          from: "mediamusic",
          as: "music",
          let: {
            localID: '$musicId'
          },
          pipeline: [
            {
              "$lookup": {
                from: "genre",
                as: "genre",
                let: {
                  localID: '$genre'
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
                      "name": 1
                    }
                  }
                ],
              }
            },
            {
              "$lookup": {
                from: "theme",
                as: "theme",
                let: {
                  localID: '$theme'
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
                      "name": 1
                    }
                  }
                ],
              }
            },
            {
              "$lookup": {
                from: "mood",
                as: "mood",
                let: {
                  localID: '$mood'
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
                      "name": 1
                    }
                  }
                ],
              }
            },
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
                "musicTitle": 1,
                "artistName": 1,
                "albumName": 1,
                "apsaraMusic": 1,
                "apsaraThumnail": 1,
                "genre": "$genre.name",
                "theme": "$theme.name",
                "mood": "$mood.name",
              }
            },
            {
              $unwind: {
                path: "$genre",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$theme",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$mood",
                preserveNullAndEmptyArrays: true
              }
            },
          ],
        }
      },
      {
        $skip: skip
      },
      {
        $limit: row
      },
      {
        $unwind: {
          path: "$media",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$username",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$music",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        "$lookup": {
          from: "contentevents",
          as: "isLike",
          let: {
            localID: '$postID'
          },
          pipeline: [
            {
              $match:
              {
                $and: [
                  {
                    $expr: {
                      $eq: ['$postID', '$$localID']
                    }
                  },
                  {
                    "email": profile.email
                  },
                  {
                    "eventType": "LIKE"
                  }
                ]
              }
            },
            {
              $project: {
                "email": 1,
              }
            }
          ],

        }
      },
      {
        $project: {
          "isLike": "$isLike",
          "tagPeople": "$userTag",
          "mediaType": "$media.mediaType",
          "music": 1,
          "musicId": 1,
          "email": 1,
          "postType": 1,
          "postID": 1,
          "description": 1,
          "active": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "expiration": 1,
          "visibility": 1,
          "location": 1,
          "tags": 1,
          "allowComments": 1,
          "isSafe": 1,
          "isOwned": 1,
          "certified": 1,
          "saleAmount": 1,
          "saleLike": 1,
          "saleView": 1,
          "likes": 1,
          "views": 1,
          "shares": 1,
          "userProfile": 1,
          "contentMedias": 1,
          "category": 1,
          "tagDescription": 1,
          "metadata": 1,
          "boostDate": 1,
          "boostInterval": 1,
          "boostSession": 1,
          "isBoost": 1,
          "boostViewer": 1,
          "boostCount": 1,
          "contentModeration": 1,
          "reportedStatus": 1,
          "reportedUserCount": 1,
          "contentModerationResponse": 1,
          "reportedUser": 1,
          "timeStart": 1,
          "timeEnd": 1,
          "apsara": "$media.apsara",
          "apsaraId": "$media.apsaraId",
          "apsaraThumbId": "$media.apsaraThumbId",
          "mediaEndpoint": "$media.mediaEndpoint",
          "mediaUri": "$media.mediaUri",
          "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
          "mediaThumbUri": "$media.mediaThumbUri",
          "apsaraMusic": "$music.apsaraMusic",
          "apsaraThumnail": "$music.apsaraThumnail",
          "cats": 1,
          "insight": 1,
          "fullName": "$userBasic.fullName",
          "username": "$username.username",
          "avatar": 1,
          "boosted": 1,
          "privacy": [{ "isCelebrity": "$userBasic.isCelebrity" }, { "isIdVerified": "$userBasic.isIdVerified" }, { "isPrivate": "$userBasic.isPrivate" }]
        }
      }

    );

    let story = new Array<any>(

      {
        $sort: {
          "timeStart": -1,
          "isBoost": -1,
          "createdAt": -1
        }
      },
      {
        $match:
        {
          $or: [
            {
              $and: [
                {
                  $or: [
                    { "reportedStatus": "ALL" },
                    { "reportedStatus": null },
                  ]
                },
                {
                  "visibility": "PUBLIC"
                },
                {
                  "active": true
                },
                {
                  "postType": "story"
                },
                {
                  "boosted.boostSession.start": {
                    $lt: new Date()
                  }
                },
                {
                  "timeEnd": {
                    $gt: new Date()
                  }
                },
                {
                  "timeStart": {
                    $lt: new Date()
                  }
                },
                {
                  "boosted.boostSession.end": {
                    $gt: new Date()
                  }
                },
                {
                  "reportedUser.email": {
                    $not: {
                      $regex: profile.email
                    }
                  }
                },
                {
                  $or: [
                    {
                      $and: [
                        {
                          "boosted.boostViewer.email": profile.email
                        },
                        {
                          "boosted.boostViewer.isLast": true
                        },
                        {
                          "boosted.boostViewer.timeEnd": {
                            $gt: new Date()
                          }
                        },
                      ]
                    },
                    {
                      $and: [
                        {
                          "boosted.boostViewer.email": {
                            $ne: profile.email
                          }
                        },
                      ]
                    }
                  ]
                }
              ]
            },
            {
              $and: [
                {
                  $or: [
                    { "reportedStatus": "ALL" },
                    { "reportedStatus": null },
                  ]
                },
                {
                  "visibility": "PUBLIC"
                },
                {
                  "active": true
                },
                {
                  "postType": "story"
                },
                {
                  "isBoost": {
                    $ne: 5
                  }
                }
              ]
            },
          ]
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
                "mediaType": 1,
                "mediaThumbEndpoint": 1,
                "mediaThumbUri": 1,
              }
            }
          ],
        },
      },
      {
        "$lookup": {
          from: "interests_repo",
          as: "cats",
          let: {
            localID: '$category.$id'
          },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $eq: ['$id', '$$localID']
                }
              }
            },
            {
              $project: {
                "interestName": 1,
                "langIso": 1,
                "icon": 1,
                "createdAt": 1,
                "updatedAt": 1
              }
            }
          ],
        }
      },
      {
        "$lookup": {
          from: "insights",
          as: "insight",
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
                "followers": 1,
                "followings": 1,
                "unfollows": 1,
                "likes": 1,
                "views": 1,
                "comments": 1,
                "posts": 1,
                "shares": 1,
                "reactions": 1,
                "views_profile": 1
              }
            }
          ],
        }
      },
      {
        "$lookup": {
          from: "userauths",
          as: "userTag",
          let: {
            localID: '$tagPeople.$id'
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

                "username": 1
              }
            }
          ],

        }
      },
      {
        "$lookup": {
          from: "userauths",
          as: "username",
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

                "username": 1
              }
            }
          ],

        }
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
      {
        $unwind: {
          path: "$userBasic",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        "$lookup": {
          from: "mediaprofilepicts",
          as: "avatar",
          let: {
            localID: '$userBasic.profilePict.$id'
          },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $eq: ['$mediaID', '$$localID']
                }
              }
            },
            {
              $project: {
                "mediaBasePath": 1,
                "mediaUri": 1,
                "originalName": 1,
                "fsSourceUri": 1,
                "fsSourceName": 1,
                "fsTargetUri": 1,
              }
            }
          ],
        }
      },
      {
        "$lookup": {
          from: "mediamusic",
          as: "music",
          let: {
            localID: '$musicId'
          },
          pipeline: [
            {
              "$lookup": {
                from: "genre",
                as: "genre",
                let: {
                  localID: '$genre'
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
                      "name": 1
                    }
                  }
                ],
              }
            },
            {
              "$lookup": {
                from: "theme",
                as: "theme",
                let: {
                  localID: '$theme'
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
                      "name": 1
                    }
                  }
                ],
              }
            },
            {
              "$lookup": {
                from: "mood",
                as: "mood",
                let: {
                  localID: '$mood'
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
                      "name": 1
                    }
                  }
                ],
              }
            },
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
                "musicTitle": 1,
                "artistName": 1,
                "albumName": 1,
                "apsaraMusic": 1,
                "apsaraThumnail": 1,
                "genre": "$genre.name",
                "theme": "$theme.name",
                "mood": "$mood.name",
              }
            },
            {
              $unwind: {
                path: "$genre",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$theme",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$mood",
                preserveNullAndEmptyArrays: true
              }
            },
          ],
        }
      },
      {
        $skip: skip
      },
      {
        $limit: row
      },
      {
        $unwind: {
          path: "$media",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$username",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$music",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        "$lookup": {
          from: "contentevents",
          as: "isLike",
          let: {
            localID: '$postID'
          },
          pipeline: [
            {
              $match:
              {
                $and: [
                  {
                    $expr: {
                      $eq: ['$postID', '$$localID']
                    }
                  },
                  {
                    "email": profile.email
                  },
                  {
                    "eventType": "LIKE"
                  }
                ]
              }
            },
            {
              $project: {
                "email": 1,
              }
            }
          ],
        }
      },
      {
        "$lookup": {
          from: "contentevents",
          as: "isView",
          let: {
            localID: '$postID'
          },
          pipeline: [
            {
              $match:
              {
                $and: [
                  {
                    $expr: {
                      $eq: ['$postID', '$$localID']
                    }
                  },
                  {
                    "email": profile.email
                  },
                  {
                    "eventType": "VIEW"
                  }
                ]
              }
            },
            {
              $project: {
                "email": 1,
              }
            }
          ],

        }
      },
      {
        $project: {
          "isLike": "$isLike",
          "tagPeople": "$userTag",
          "mediaType": "$media.mediaType",
          "music": 1,
          "musicId": 1,
          "email": 1,
          "postType": 1,
          "postID": 1,
          "description": 1,
          "active": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "expiration": 1,
          "visibility": 1,
          "location": 1,
          "tags": 1,
          "allowComments": 1,
          "isSafe": 1,
          "isOwned": 1,
          "certified": 1,
          "saleAmount": 1,
          "saleLike": 1,
          "saleView": 1,
          "likes": 1,
          "views": 1,
          "shares": 1,
          "userProfile": 1,
          "contentMedias": 1,
          "category": 1,
          "tagDescription": 1,
          "metadata": 1,
          "boostDate": 1,
          "boostInterval": 1,
          "boostSession": 1,
          "isBoost": 1,
          "boostViewer": 1,
          "boostCount": 1,
          "contentModeration": 1,
          "reportedStatus": 1,
          "reportedUserCount": 1,
          "contentModerationResponse": 1,
          "reportedUser": 1,
          "timeStart": 1,
          "timeEnd": 1,
          "apsara": "$media.apsara",
          "apsaraId": "$media.apsaraId",
          "apsaraThumbId": "$media.apsaraThumbId",
          "mediaEndpoint": "$media.mediaEndpoint",
          "mediaUri": "$media.mediaUri",
          "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
          "mediaThumbUri": "$media.mediaThumbUri",
          "apsaraMusic": "$music.apsaraMusic",
          "apsaraThumnail": "$music.apsaraThumnail",
          "cats": 1,
          "insight": 1,
          "fullName": "$userBasic.fullName",
          "username": "$username.username",
          "avatar": 1,
          "boosted": 1,
          "privacy": [{ "isCelebrity": "$userBasic.isCelebrity" }, { "isIdVerified": "$userBasic.isIdVerified" }, { "isPrivate": "$userBasic.isPrivate" }]
        }
      }
    );

    let facet = {};
    if (body.postType == 'ALL' || body.postType == 'pict') {
      facet['pict'] = pict;
    }
    if (body.postType == 'ALL' || body.postType == 'vid') {
      facet['video'] = video;
    }
    if (body.postType == 'ALL' || body.postType == 'diary') {
      facet['diary'] = diary;
    }
    if (body.postType == 'ALL' || body.postType == 'story') {
      facet['story'] = story;
    }
    let wrapper = { $facet: facet };

    pipeline.push({
      $facet: {
        "video": [video]
      }
    });
    console.log(JSON.stringify(pipeline));

    let xvids: string[] = [];
    let xpics: string[] = [];
    let xuser: string[] = [];

    let query = await this.PostsModel.aggregate(pipeline).exec();

    let obj = query[0];

    let opic: PostData[] = [];
    let ovid: PostData[] = [];
    let odia: PostData[] = [];
    let osto: PostData[] = [];

    if (body.postType == 'ALL' || body.postType == 'pict') {
      opic = this.processData(obj.pict, xvids, xpics, xuser);
    }
    if (body.postType == 'ALL' || body.postType == 'vid') {
      ovid = this.processData(obj.video, xvids, xpics, xuser);
    }
    if (body.postType == 'ALL' || body.postType == 'diary') {
      odia = this.processData(obj.diary, xvids, xpics, xuser);
    }
    if (body.postType == 'ALL' || body.postType == 'story') {
      osto = this.processData(obj.story, xvids, xpics, xuser);
    }

    let vapsara = undefined;
    let papsara = undefined;
    let cuser = undefined;
    let ubs = undefined;

    let resVideo: PostData[] = [];
    let resPic: PostData[] = [];
    let resDiary: PostData[] = [];
    let resStory: PostData[] = [];

    if (xvids.length > 0) {
      vapsara = await this.postService.getVideoApsara(xvids);
    }

    if (xpics.length > 0) {
      papsara = await this.postService.getImageApsara(xpics);
    }

    if (xuser.length > 0) {
      cuser = await this.userAuthService.findIn(xuser);
      ubs = await this.userService.findIn(xuser);
    }

    if (vapsara != undefined) {
      if (ovid.length > 0) {
        for (let i = 0; i < ovid.length; i++) {
          let pdvv = ovid[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pdvv.apsaraId == vi.VideoId) {
              pdvv.mediaThumbEndpoint = vi.CoverURL;
            }
          }
          resVideo.push(pdvv);
        }
      }
      if (osto.length > 0) {
        for (let i = 0; i < osto.length; i++) {
          let pdss = osto[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pdss.apsaraId == vi.VideoId) {
              pdss.mediaThumbEndpoint = vi.CoverURL;
            }
          }
          resStory.push(pdss);
        }
      }
      if (odia.length > 0) {
        for (let i = 0; i < odia.length; i++) {
          let pddd = odia[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pddd.apsaraId == vi.VideoId) {
              pddd.mediaThumbEndpoint = vi.CoverURL;
            }
          }
          resDiary.push(pddd);
        }
      }
    }

    if (papsara != undefined) {
      if (ovid.length > 0) {
        for (let i = 0; i < ovid.length; i++) {
          let pdvv = ovid[i];
          for (let i = 0; i < papsara.ImageInfo.length; i++) {
            let vi = papsara.ImageInfo[i];
            if (pdvv.apsaraId == vi.ImageId) {
              pdvv.mediaThumbEndpoint = vi.URL;
              pdvv.mediaThumbUri = vi.URL;
            }
          }
          resVideo.push(pdvv);
        }
      }
      if (osto.length > 0) {
        for (let i = 0; i < osto.length; i++) {
          let pdss = osto[i];
          for (let i = 0; i < papsara.ImageInfo.length; i++) {
            let vi = papsara.ImageInfo[i];
            if (pdss.apsaraId == vi.ImageId) {
              pdss.mediaEndpoint = vi.URL;
              pdss.mediaUri = vi.URL;

              pdss.mediaThumbEndpoint = vi.URL;
              pdss.mediaThumbUri = vi.URL;

            }
          }
          resStory.push(pdss);
        }
      }
      if (odia.length > 0) {
        for (let i = 0; i < odia.length; i++) {
          let pddd = odia[i];
          for (let i = 0; i < papsara.ImageInfo.length; i++) {
            let vi = papsara.ImageInfo[i];
            if (pddd.apsaraId == vi.ImageId) {
              pddd.mediaThumbEndpoint = vi.URL;
              pddd.mediaThumbUri = vi.URL;

            }
          }
          resDiary.push(pddd);
        }
      }
      if (opic.length > 0) {
        for (let i = 0; i < opic.length; i++) {
          let pdpp = opic[i];
          let found = false;
          for (let i = 0; i < papsara.ImageInfo.length; i++) {
            let vi = papsara.ImageInfo[i];
            if (pdpp.apsaraId == vi.ImageId) {
              pdpp.mediaEndpoint = vi.URL;
              pdpp.mediaUri = vi.URL;

              pdpp.mediaThumbEndpoint = vi.URL;
              pdpp.mediaThumbUri = vi.URL;
            }
            if (pdpp.apsaraThumbId == vi.ImageId) {
              pdpp.mediaThumbEndpoint = vi.URL;
              pdpp.mediaThumbUri = vi.URL;

            }
          }
          resPic.push(pdpp);
        }
      }
    }


    let pld = new PostLandingData();
    pld.diary = resDiary;
    pld.pict = resPic;

    if (resStory.length > 0) {
      pld.story = resStory;
    } else {
      pld.story = null;
    }

    pld.video = resVideo;

    res.data = pld;

    var ver = await this.settingsService.findOneByJenis('AppsVersion');
    ver.value;
    res.version = String(ver.value);

    return res;
  }

  private processData(src: any[], xvids: string[], xpics: string[], user: string[]): PostData[] {
    let res: PostData[] = [];

    if (src == undefined) {
      return res;
    }

    for (let i = 0; i < src.length; i++) {
      let obj = src[i];

      let pd = new PostData();
      pd.active = obj.active;
      pd.allowComments = obj.allowComments;
      pd.apsaraId = obj.apsaraId;
      pd.apsaraThumbId = obj.apsaraThumbId;
      pd.avatar = obj.avatar[0];

      pd.cats = obj.cats;
      pd.certified = obj.certified;
      pd.createdAt = obj.createdAt;
      pd.description = obj.description;
      pd.email = obj.email;
      pd.insight = obj.insight[0];

      pd.isApsara = obj.apsara;
      pd.apsaraId = obj.apsaraId;
      //pd.isLiked =
      //pd.isViewed

      pd.location = obj.location;
      pd.mediaBasePath = obj.mediaBasePath;
      pd.mediaEndpoint = obj.mediaEndpoint;
      pd.mediaThumbEndpoint = obj.mediaThumbEndpoint;
      pd.mediaThumbUri = obj.mediaThumbUri;
      pd.mediaType = obj.mediaType;
      pd.mediaUri = obj.mediaUri;

      pd.postID = obj.postID;
      pd.postType = obj.postType;
      pd.privacy = obj.privacy;
      pd.saleAmount = obj.saleAmount;
      pd.saleLike = obj.saleLike;
      pd.saleView = obj.saleView;
      pd.tagPeople = obj.tagPeople;
      pd.tags = obj.tags;
      pd.title = obj.title;
      pd.updatedAt = obj.updatedAt;
      pd.username = obj.username;
      pd.visibility = obj.visibility;
      pd.boostViewer = obj.boostViewer;

      pd.isViewed = false;
      if (obj.isView != undefined && obj.isView.length > 0) {
        pd.isViewed = true;
      }

      pd.isLiked = false;
      if (obj.isLike != undefined && obj.isLike.length > 0) {
        pd.isLiked = true;
      }

      if (obj.tagPeople != undefined && obj.tagPeople.length > 0) {
        let atp1 = Array<TagPeople>();
        for (let i = 0; i < obj.tagPeople.length; i++) {
          let x = obj.tagPeople[i];
          let us = x.username;

          let tg = new TagPeople();
          tg.username = us;
          atp1.push(tg);
        }
        pd.tagPeople = atp1;
      }

      if (pd.isApsara == true) {
        if (pd.apsaraId != undefined) {
          if (obj.mediaType == 'video') {
            xvids.push(String(pd.apsaraId));
          } else {
            xpics.push(String(pd.apsaraId));
          }

        }
        if (pd.apsaraThumbId != undefined) {
          xpics.push(String(pd.apsaraThumbId));
        }
      }

      let privacy = new Privacy();
      privacy.isPostPrivate = false;
      privacy.isPrivate = false;
      privacy.isCelebrity = false;
      pd.privacy = privacy;

      pd.apsaraThumnail = null;
      pd.apsaraMusic = null;

      pd.isBoost = obj.isBoost;

      pd.music = null;
      if (obj.music != undefined) {
        if (Array.isArray(obj.music)) {
          if (obj.music.length > 0) {
            pd.music = obj.music[0];
          }
        } else {
          pd.music = obj.music;
        }

      }


      res.push(pd);

    }

    return res;
  }

  private async processDataV2(src: any[], xvids: string[], xpics: string[], isLike: any[], isView: any[], email: string): Promise<PostData[]> {
    let res: PostData[] = [];
    var boost = null;

    if (src == undefined) {
      return res;
    }

    for (let i = 0; i < src.length; i++) {
      let obj = src[i];
      // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",obj.boosted);
      // if (obj.boosted != undefined) {
      //   console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> leght", obj.boosted.leght);
      //   if (obj.boosted[0] !=undefined) {
      //     if (await this.utilService.ceckData(obj.boosted[0])) {
      //       console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> O", obj.boosted[0]);
      //       boost = obj.boosted[0];
      //     } else {
      //       boost = null;
      //     }
      //   } else {
      //     boost = null;
      //   }
      // } else {
      //   boost = null;
      // }
      // console.log("CECK BOOST", boost);

      let pd = new PostData();
      pd.active = obj.active;
      pd.allowComments = obj.allowComments;
      pd.apsaraId = obj.apsaraId;
      pd.apsaraThumbId = obj.apsaraThumbId;
      pd.avatar = obj.avatar[0];

      pd.cats = obj.category;
      pd.certified = obj.certified;
      pd.createdAt = obj.createdAt;
      pd.description = obj.description;
      pd.email = obj.email;
      pd.insight = obj.insight[0];

      pd.isApsara = obj.apsara;
      pd.apsaraId = obj.apsaraId;
      pd.isShared = obj.isShared;
      //pd.isLiked =
      //pd.isViewed

      pd.location = obj.location;
      pd.mediaBasePath = obj.mediaBasePath;
      if (obj.apsara) {
        pd.mediaEndpoint = obj.mediaEndpoint;
      } else {
        if (obj.mediaType == "image") {
          pd.mediaEndpoint = '/pict/' + obj.postID;
        } else {
          pd.mediaEndpoint = '/stream/' + obj.mediaUri;
        }
      }

      if (obj.apsara) {
        pd.mediaThumbEndpoint = obj.mediaThumbEndpoint;
      } else {
        pd.mediaThumbEndpoint = '/thumb/' + obj.postID;
      }

      pd.mediaThumbUri = obj.mediaThumbUri;
      pd.mediaType = obj.mediaType;
      pd.mediaUri = obj.mediaUri;
      pd.metadata = obj.metadata;

      pd.postID = obj.postID;
      pd.postType = obj.postType;
      pd.privacy = obj.privacy;
      pd.saleAmount = obj.saleAmount;
      pd.saleLike = obj.saleLike;
      pd.saleView = obj.saleView;
      pd.tagPeople = obj.tagPeople;
      pd.tags = obj.tags;
      pd.title = obj.title;
      pd.updatedAt = obj.updatedAt;
      pd.username = obj.username;
      pd.visibility = obj.visibility;
      pd.boostViewer = obj.boostViewer;
      pd.reportedStatus = obj.reportedStatus;
      pd.reportedUserCount = obj.reportedUserCount;

      pd.isViewed = false;
      if (isView != undefined && isView.length > 0) {
        for (let x = 0; x < isView.length; x++) {
          let ox = isView[x];
          if (ox.postID == obj.postID) {
            pd.isViewed = true;
            break;
          }
        }

      }

      pd.isLiked = false;
      if (isLike != undefined && isLike.length > 0) {
        for (let x = 0; x < isLike.length; x++) {
          let ox = isLike[x];
          if (ox.postID == obj.postID) {
            pd.isLiked = true;
            break;
          }
        }

      }

      if (obj.tagPeople != undefined && obj.tagPeople.length > 0) {
        let atp1 = Array<TagPeople>();
        for (let i = 0; i < obj.tagPeople.length; i++) {
          let x = obj.tagPeople[i];
          let us = x.username;

          let tg = new TagPeople();
          tg.username = us;
          atp1.push(tg);
        }
        pd.tagPeople = atp1;
      }

      if (pd.isApsara == true) {
        if (pd.apsaraId != undefined) {
          if (obj.mediaType == 'video') {
            xvids.push(String(pd.apsaraId));
          } else {
            xpics.push(String(pd.apsaraId));
          }

        }
        if (pd.apsaraThumbId != undefined) {
          xpics.push(String(pd.apsaraThumbId));
        }
      }

      let privacy = new Privacy();
      privacy.isPostPrivate = false;
      privacy.isPrivate = false;
      privacy.isCelebrity = false;
      pd.privacy = privacy;

      pd.apsaraThumnail = undefined;
      pd.apsaraMusic = undefined;

      pd.isBoost = obj.isBoost;

      pd.music = null;
      if (obj.music != undefined) {
        if (Array.isArray(obj.music)) {
          if (obj.music.length > 0) {
            pd.music = obj.music[0];
            if (pd.music.apsaraThumnail != undefined) {
              xpics.push(String(pd.music.apsaraThumnail));
            }
          }
        } else {
          pd.music = obj.music;
          if (pd.music.apsaraThumnail != undefined) {
            xpics.push(String(pd.music.apsaraThumnail));
          }
        }

      }

      if (obj.boosted != undefined) {
        console.log("boosted: " + pd.postID);
        this.postxService.updateBoostViewer(pd.postID, email);
        //pd.boostJangkauan = this.countBoosted(obj, email);
        if (obj.boosted.length > 0) {
          if (obj.boosted[0] != undefined) {
            pd.boostJangkauan = (obj.boosted[0].boostViewer != undefined) ? obj.boosted[0].boostViewer.length : 0;
            pd.boosted = obj.boosted;
          } else {
            pd.boostJangkauan = 0;
            pd.boosted = [];
          }
        } else {
          pd.boostJangkauan = 0;
          pd.boosted = [];
        }
      } else {
        pd.boostJangkauan = 0;
        pd.boosted = [];
      }

      if (obj.statusCB == undefined || obj.statusCB == 'PENDING') {
        console.log("statusCB: " + obj.statusCB);
        this.postService.cmodCheckResult(obj.postID);
      }


      res.push(pd);

    }

    return res;
  }

  private countBoosted(ps: any, email: string) {
    let bs = ps.boosted;
    let cnt = 0;
    if (bs != undefined) {
      if (bs.boostSession != undefined) {
        let bootSession = bs.boostSession;
        let bv: any[] = bs.boostViewer;
        if (bv != undefined) {
          if (bv.length > 0) {
            for (let x = 0; x < bv.length; x++) {
              let bbv = bv[x];
              if (String(bbv.email) == email) {
                cnt++;
              }
            }
          }
        }
      }
    }
    return cnt;
  }

  async sendSoketAds(email: string) {
    var dataAds = await this.adsLandingService.getAdsLanding(email);
    var JsonPayload = {
      event: "ads_landing",
      email: email,
      data: dataAds
    }
    return dataAds;
  }

  async getBoostV2(body: any, headers: any): Promise<PostLandingResponseApps> {
    var timestamps_start = await this.utilService.getDateTimeString();
    var fullurl = headers.host + "/api/posts/getuserposts/landing-page";
    var reqbody = JSON.parse(JSON.stringify(body));

    this.logger.log('getBoostV2 >>> started');
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    this.logger.log('getBoostV2 >>> profile: ' + profile);

    let res = new PostLandingResponseApps();
    let data = new PostLandingData();
    res.response_code = 202;

    let x = Date.now();
    // x = x + (7 * 3600 * 1000);
    let today = new Date();
    //today.setHours(today.getHours() + 4);
    //console.log(today);

    let row = 20;
    let page = 0;
    if (body.pageNumber != undefined) {
      page = parseInt(body.pageNumber);
    }
    if (body.pageRow != undefined) {
      row = parseInt(body.pageRow);
    }

    let vis = String(body.visibility);

    if (body.postType == undefined) {
      body.postType = 'ALL';
    }
    let skip = this.paging(page, row);
    var datatest = null;
    var lengdata = null;

    let xvids: string[] = [];
    let xpics: string[] = [];
    let xuser: string[] = [];

    let td = new Date();
    let stoday = new Date(td.getTime() - (td.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
    stoday = stoday.substring(0, 19);

    let query = await this.buildQuery(profile, vis, stoday, skip, row);


    let obj = query[0];

    let opic: PostData[] = [];
    let ovid: PostData[] = [];
    let odia: PostData[] = [];
    let osto: PostData[] = [];

    let isLike: [] = obj.isLike;
    let isView: [] = obj.isView;


    if (body.postType == 'ALL' || body.postType == 'pict') {
      opic = await this.processDataV2(obj.pict, xvids, xpics, isLike, isView, String(profile.email));
    }
    if (body.postType == 'ALL' || body.postType == 'vid') {
      ovid = await this.processDataV2(obj.video, xvids, xpics, isLike, isView, String(profile.email));
    }

    if (body.postType == 'ALL' || body.postType == 'diary') {
      odia = await this.processDataV2(obj.diary, xvids, xpics, isLike, isView, String(profile.email));
    }
    // if (body.postType == 'ALL' || body.postType == 'story') {
    //   osto = await this.processDataV2(obj.story, xvids, xpics, isLike, isView, String(profile.email));
    // }




    let vapsara = undefined;
    let papsara = undefined;
    let cuser = undefined;
    let ubs = undefined;

    let resVideo: PostData[] = [];
    let resPic: PostData[] = [];
    let resDiary: PostData[] = [];
    let resStory: PostData[] = [];

    if (xvids.length > 0) {
      vapsara = await this.postService.getVideoApsara(xvids);
    }

    if (xpics.length > 0) {
      papsara = await this.postService.getImageApsara(xpics);
    }

    if (xuser.length > 0) {
      cuser = await this.userAuthService.findIn(xuser);
      ubs = await this.userService.findIn(xuser);
    }

    if (ovid.length > 0) {
      for (let i = 0; i < ovid.length; i++) {
        let pdvv = ovid[i];
        this.generateThumbnail(pdvv, vapsara, papsara);
        resVideo.push(pdvv);
      }
    }

    // if (osto.length > 0) {
    //   for (let i = 0; i < osto.length; i++) {
    //     let pdss = osto[i];
    //     this.generateThumbnail(pdss, vapsara, papsara);
    //     resStory.push(pdss);
    //   }
    // }

    if (odia.length > 0) {
      for (let i = 0; i < odia.length; i++) {
        let pddd = odia[i];
        this.generateThumbnail(pddd, vapsara, papsara);
        resDiary.push(pddd);
      }
    }

    if (opic.length > 0) {
      for (let i = 0; i < opic.length; i++) {
        let pdpp = opic[i];
        this.generateThumbnail(pdpp, vapsara, papsara);
        resPic.push(pdpp);
      }
    }
    /*
    let valPost = new Map();

    if (vapsara != undefined) {
      if (ovid.length > 0) {
        for (let i = 0; i < ovid.length; i++) {
          let pdvv = ovid[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pdvv.apsaraId == vi.VideoId) {
              pdvv.mediaThumbEndpoint = vi.CoverURL;

              if (valPost.has(pdvv.postID) == false) {
                resVideo.push(pdvv);
                valPost.set(pdvv.postID, pdvv.postID);
              }

              break;
            }
          }
        }
      }
      if (osto.length > 0) {
        for (let i = 0; i < osto.length; i++) {
          let pdss = osto[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pdss.apsaraId == vi.VideoId) {
              pdss.mediaThumbEndpoint = vi.CoverURL;

              if (valPost.has(pdss.postID) == false) {
                resStory.push(pdss);
                valPost.set(pdss.postID, pdss.postID);
              }

              break;
            }
          }
        }
      }
      if (odia.length > 0) {
        for (let i = 0; i < odia.length; i++) {
          let pddd = odia[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pddd.apsaraId == vi.VideoId) {
              pddd.mediaThumbEndpoint = vi.CoverURL;

              if (valPost.has(pddd.postID) == false) {
                resDiary.push(pddd);
                valPost.set(pddd.postID, pddd.postID);
              }

              break;
            }
          }
        }
      }
      if (opic.length > 0) {
        for (let i = 0; i < opic.length; i++) {
          let pdpp = opic[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pdpp.apsaraId == vi.VideoId) {
              pdpp.mediaThumbEndpoint = vi.CoverURL;

              if (valPost.has(pdpp.postID) == false) {
                resPic.push(pdpp);
                valPost.set(pdpp.postID, pdpp.postID);
              }

              break;
            }
          }

        }
      }
    }

    if (papsara != undefined) {
      if (ovid.length > 0) {
        for (let i = 0; i < ovid.length; i++) {
          let pdvv = ovid[i];
          for (let i = 0; i < papsara.ImageInfo.length; i++) {
            let vi = papsara.ImageInfo[i];
            if (pdvv.apsaraId == vi.ImageId) {
              pdvv.mediaThumbEndpoint = vi.URL;
              pdvv.mediaThumbUri = vi.URL;

              if (pdvv.music != undefined && pdvv.music.apsaraThumnail != undefined) {
                let m = String(pdvv.music.apsaraThumnail);
                if (m == String(vi.ImageId)) {
                  pdvv.music.apsaraThumnailUrl = vi.URL;
                }
              }                          

              if (valPost.has(pdvv.postID) == false) {
                resVideo.push(pdvv);
                valPost.set(pdvv.postID, pdvv.postID);
              }

              break;
            }
          }
        }
      }
      if (osto.length > 0) {
        for (let i = 0; i < osto.length; i++) {
          let pdss = osto[i];
          for (let i = 0; i < papsara.ImageInfo.length; i++) {
            let vi = papsara.ImageInfo[i];
            if (pdss.apsaraId == vi.ImageId) {
              pdss.mediaEndpoint = vi.URL;
              pdss.mediaUri = vi.URL;

              pdss.mediaThumbEndpoint = vi.URL;
              pdss.mediaThumbUri = vi.URL;

              if (pdss.music != undefined && pdss.music.apsaraThumnail != undefined) {
                let m = String(pdss.music.apsaraThumnail);
                if (m == String(vi.ImageId)) {
                  pdss.music.apsaraThumnailUrl = vi.URL;
                }
              }                          

              if (valPost.has(pdss.postID) == false) {
                resStory.push(pdss);
                valPost.set(pdss.postID, pdss.postID);
              }

              break;
            }
          }
        }
      }
      if (odia.length > 0) {
        for (let i = 0; i < odia.length; i++) {
          let pddd = odia[i];
          for (let i = 0; i < papsara.ImageInfo.length; i++) {
            let vi = papsara.ImageInfo[i];
            if (pddd.apsaraId == vi.ImageId) {
              pddd.mediaThumbEndpoint = vi.URL;
              pddd.mediaThumbUri = vi.URL;

              if (pddd.music != undefined && pddd.music.apsaraThumnail != undefined) {
                let m = String(pddd.music.apsaraThumnail);
                if (m == String(vi.ImageId)) {
                  pddd.music.apsaraThumnailUrl = vi.URL;
                }
              }            

              if (valPost.has(pddd.postID) == false) {
                resDiary.push(pddd);
                valPost.set(pddd.postID, pddd.postID);
              }

              break;
            }
          }

        }
      }
      if (opic.length > 0) {
        for (let i = 0; i < opic.length; i++) {
          let pdpp = opic[i];
          for (let i = 0; i < papsara.ImageInfo.length; i++) {
            let vi = papsara.ImageInfo[i];
            if (pdpp.apsaraThumbId == vi.ImageId) {
              pdpp.mediaThumbEndpoint = vi.URL;
              pdpp.mediaThumbUri = vi.URL;
            }
            if (pdpp.music != undefined && pdpp.music.apsaraThumnail != undefined) {
              let m = String(pdpp.music.apsaraThumnail);
              if (m == String(vi.ImageId)) {
                pdpp.music.apsaraThumnailUrl = vi.URL;
              }
            }            
            if (pdpp.apsaraId == vi.ImageId) {
              pdpp.mediaEndpoint = vi.URL;
              pdpp.mediaUri = vi.URL;

              pdpp.mediaThumbEndpoint = vi.URL;
              pdpp.mediaThumbUri = vi.URL;

              if (valPost.has(pdpp.postID) == false) {
                resPic.push(pdpp);
                valPost.set(pdpp.postID, pdpp.postID);
              }
            }
          }
        }
      }
    }

    if (ovid.length > 0) {
      for (let i = 0; i < ovid.length; i++) {
        let pdvv = ovid[i];
        if (valPost.has(pdvv.postID) == false) {
          resVideo.push(pdvv);
        }
      }
    }
    if (osto.length > 0) {
      for (let i = 0; i < osto.length; i++) {
        let pdss = osto[i];
        if (valPost.has(pdss.postID) == false) {
          resStory.push(pdss);
        }
      }
    }
    if (odia.length > 0) {
      for (let i = 0; i < odia.length; i++) {
        let pddd = odia[i];
        if (valPost.has(pddd.postID) == false) {
          resDiary.push(pddd);
        }
      }
    }
    if (opic.length > 0) {
      for (let i = 0; i < opic.length; i++) {
        let pdpp = opic[i];
        if (valPost.has(pdpp.postID) == false) {
          resPic.push(pdpp);
        }
      }
    }
    */

    let pld = new PostLandingData();
    pld.diary = resDiary;
    pld.pict = resPic;

    // if (resStory.length > 0) {
    //   pld.story = resStory;
    // } else {
    //   pld.story = null;
    // }
    pld.story = null;
    pld.video = resVideo;

    res.data = pld;

    this.setViewed(obj, String(profile.email));

    var ver = await this.settingsService.findOneByJenis('AppsVersion');
    ver.value;
    res.version = String(ver.value);

    var timestamps_end = await this.utilService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);

    return res;
  }

  async getBoostV2_(body: any, headers: any): Promise<PostLandingResponseApps> {
    var timestamps_start = await this.utilService.getDateTimeString();
    var fullurl = headers.host + "/api/posts/getuserposts/landing-page";
    var reqbody = JSON.parse(JSON.stringify(body));
    
    this.logger.log('getBoostV2 >>> started');
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.basic2SS.findBymail(auth.email);
    this.logger.log('getBoostV2 >>> profile: ' + profile);

    let res = new PostLandingResponseApps();
    let data = new PostLandingData();
    res.response_code = 202;

    let x = Date.now();
    // x = x + (7 * 3600 * 1000);
    let today = new Date();
    //today.setHours(today.getHours() + 4);
    //console.log(today);

    let row = 20;
    let page = 0;
    if (body.pageNumber != undefined) {
      page = parseInt(body.pageNumber);
    }
    if (body.pageRow != undefined) {
      row = parseInt(body.pageRow);
    }

    let vis = String(body.visibility);

    if (body.postType == undefined) {
      body.postType = 'ALL';
    }
    let skip = this.paging(page, row);
    var datatest = null;
    var lengdata = null;

    let xvids: string[] = [];
    let xpics: string[] = [];
    let xuser: string[] = [];

    let td = new Date();
    let stoday = new Date(td.getTime() - (td.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
    stoday = stoday.substring(0, 19);

    let query = await this.buildQuery_(profile, vis, stoday, skip, row);


    let obj = query[0];

    let opic: PostData[] = [];
    let ovid: PostData[] = [];
    let odia: PostData[] = [];
    let osto: PostData[] = [];

    let isLike: [] = obj.isLike;
    let isView: [] = obj.isView;


    if (body.postType == 'ALL' || body.postType == 'pict') {
      opic = await this.processDataV2(obj.pict, xvids, xpics, isLike, isView, String(profile.email));
    }
    if (body.postType == 'ALL' || body.postType == 'vid') {
      ovid = await this.processDataV2(obj.video, xvids, xpics, isLike, isView, String(profile.email));
    }

    if (body.postType == 'ALL' || body.postType == 'diary') {
      odia = await this.processDataV2(obj.diary, xvids, xpics, isLike, isView, String(profile.email));
    }
    // if (body.postType == 'ALL' || body.postType == 'story') {
    //   osto = await this.processDataV2(obj.story, xvids, xpics, isLike, isView, String(profile.email));
    // }




    let vapsara = undefined;
    let papsara = undefined;
    let cuser = undefined;
    let ubs = undefined;

    let resVideo: PostData[] = [];
    let resPic: PostData[] = [];
    let resDiary: PostData[] = [];
    let resStory: PostData[] = [];

    if (xvids.length > 0) {
      vapsara = await this.postService.getVideoApsara(xvids);
    }

    if (xpics.length > 0) {
      papsara = await this.postService.getImageApsara(xpics);
    }

    if (xuser.length > 0) {
      cuser = await this.userAuthService.findIn(xuser);
      ubs = await this.userService.findIn(xuser);
    }

    if (ovid.length > 0) {
      for (let i = 0; i < ovid.length; i++) {
        let pdvv = ovid[i];
        this.generateThumbnail(pdvv, vapsara, papsara);
        resVideo.push(pdvv);
      }
    }

    // if (osto.length > 0) {
    //   for (let i = 0; i < osto.length; i++) {
    //     let pdss = osto[i];
    //     this.generateThumbnail(pdss, vapsara, papsara);
    //     resStory.push(pdss);
    //   }
    // }

    if (odia.length > 0) {
      for (let i = 0; i < odia.length; i++) {
        let pddd = odia[i];
        this.generateThumbnail(pddd, vapsara, papsara);
        resDiary.push(pddd);
      }
    }

    if (opic.length > 0) {
      for (let i = 0; i < opic.length; i++) {
        let pdpp = opic[i];
        this.generateThumbnail(pdpp, vapsara, papsara);
        resPic.push(pdpp);
      }
    }
    /*
    let valPost = new Map();

    if (vapsara != undefined) {
      if (ovid.length > 0) {
        for (let i = 0; i < ovid.length; i++) {
          let pdvv = ovid[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pdvv.apsaraId == vi.VideoId) {
              pdvv.mediaThumbEndpoint = vi.CoverURL;

              if (valPost.has(pdvv.postID) == false) {
                resVideo.push(pdvv);
                valPost.set(pdvv.postID, pdvv.postID);
              }

              break;
            }
          }
        }
      }
      if (osto.length > 0) {
        for (let i = 0; i < osto.length; i++) {
          let pdss = osto[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pdss.apsaraId == vi.VideoId) {
              pdss.mediaThumbEndpoint = vi.CoverURL;

              if (valPost.has(pdss.postID) == false) {
                resStory.push(pdss);
                valPost.set(pdss.postID, pdss.postID);
              }

              break;
            }
          }
        }
      }
      if (odia.length > 0) {
        for (let i = 0; i < odia.length; i++) {
          let pddd = odia[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pddd.apsaraId == vi.VideoId) {
              pddd.mediaThumbEndpoint = vi.CoverURL;

              if (valPost.has(pddd.postID) == false) {
                resDiary.push(pddd);
                valPost.set(pddd.postID, pddd.postID);
              }

              break;
            }
          }
        }
      }
      if (opic.length > 0) {
        for (let i = 0; i < opic.length; i++) {
          let pdpp = opic[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pdpp.apsaraId == vi.VideoId) {
              pdpp.mediaThumbEndpoint = vi.CoverURL;

              if (valPost.has(pdpp.postID) == false) {
                resPic.push(pdpp);
                valPost.set(pdpp.postID, pdpp.postID);
              }

              break;
            }
          }

        }
      }
    }

    if (papsara != undefined) {
      if (ovid.length > 0) {
        for (let i = 0; i < ovid.length; i++) {
          let pdvv = ovid[i];
          for (let i = 0; i < papsara.ImageInfo.length; i++) {
            let vi = papsara.ImageInfo[i];
            if (pdvv.apsaraId == vi.ImageId) {
              pdvv.mediaThumbEndpoint = vi.URL;
              pdvv.mediaThumbUri = vi.URL;

              if (pdvv.music != undefined && pdvv.music.apsaraThumnail != undefined) {
                let m = String(pdvv.music.apsaraThumnail);
                if (m == String(vi.ImageId)) {
                  pdvv.music.apsaraThumnailUrl = vi.URL;
                }
              }                          

              if (valPost.has(pdvv.postID) == false) {
                resVideo.push(pdvv);
                valPost.set(pdvv.postID, pdvv.postID);
              }

              break;
            }
          }
        }
      }
      if (osto.length > 0) {
        for (let i = 0; i < osto.length; i++) {
          let pdss = osto[i];
          for (let i = 0; i < papsara.ImageInfo.length; i++) {
            let vi = papsara.ImageInfo[i];
            if (pdss.apsaraId == vi.ImageId) {
              pdss.mediaEndpoint = vi.URL;
              pdss.mediaUri = vi.URL;

              pdss.mediaThumbEndpoint = vi.URL;
              pdss.mediaThumbUri = vi.URL;

              if (pdss.music != undefined && pdss.music.apsaraThumnail != undefined) {
                let m = String(pdss.music.apsaraThumnail);
                if (m == String(vi.ImageId)) {
                  pdss.music.apsaraThumnailUrl = vi.URL;
                }
              }                          

              if (valPost.has(pdss.postID) == false) {
                resStory.push(pdss);
                valPost.set(pdss.postID, pdss.postID);
              }

              break;
            }
          }
        }
      }
      if (odia.length > 0) {
        for (let i = 0; i < odia.length; i++) {
          let pddd = odia[i];
          for (let i = 0; i < papsara.ImageInfo.length; i++) {
            let vi = papsara.ImageInfo[i];
            if (pddd.apsaraId == vi.ImageId) {
              pddd.mediaThumbEndpoint = vi.URL;
              pddd.mediaThumbUri = vi.URL;

              if (pddd.music != undefined && pddd.music.apsaraThumnail != undefined) {
                let m = String(pddd.music.apsaraThumnail);
                if (m == String(vi.ImageId)) {
                  pddd.music.apsaraThumnailUrl = vi.URL;
                }
              }            

              if (valPost.has(pddd.postID) == false) {
                resDiary.push(pddd);
                valPost.set(pddd.postID, pddd.postID);
              }

              break;
            }
          }

        }
      }
      if (opic.length > 0) {
        for (let i = 0; i < opic.length; i++) {
          let pdpp = opic[i];
          for (let i = 0; i < papsara.ImageInfo.length; i++) {
            let vi = papsara.ImageInfo[i];
            if (pdpp.apsaraThumbId == vi.ImageId) {
              pdpp.mediaThumbEndpoint = vi.URL;
              pdpp.mediaThumbUri = vi.URL;
            }
            if (pdpp.music != undefined && pdpp.music.apsaraThumnail != undefined) {
              let m = String(pdpp.music.apsaraThumnail);
              if (m == String(vi.ImageId)) {
                pdpp.music.apsaraThumnailUrl = vi.URL;
              }
            }            
            if (pdpp.apsaraId == vi.ImageId) {
              pdpp.mediaEndpoint = vi.URL;
              pdpp.mediaUri = vi.URL;

              pdpp.mediaThumbEndpoint = vi.URL;
              pdpp.mediaThumbUri = vi.URL;

              if (valPost.has(pdpp.postID) == false) {
                resPic.push(pdpp);
                valPost.set(pdpp.postID, pdpp.postID);
              }
            }
          }
        }
      }
    }

    if (ovid.length > 0) {
      for (let i = 0; i < ovid.length; i++) {
        let pdvv = ovid[i];
        if (valPost.has(pdvv.postID) == false) {
          resVideo.push(pdvv);
        }
      }
    }
    if (osto.length > 0) {
      for (let i = 0; i < osto.length; i++) {
        let pdss = osto[i];
        if (valPost.has(pdss.postID) == false) {
          resStory.push(pdss);
        }
      }
    }
    if (odia.length > 0) {
      for (let i = 0; i < odia.length; i++) {
        let pddd = odia[i];
        if (valPost.has(pddd.postID) == false) {
          resDiary.push(pddd);
        }
      }
    }
    if (opic.length > 0) {
      for (let i = 0; i < opic.length; i++) {
        let pdpp = opic[i];
        if (valPost.has(pdpp.postID) == false) {
          resPic.push(pdpp);
        }
      }
    }
    */

    let pld = new PostLandingData();
    pld.diary = resDiary;
    pld.pict = resPic;

    // if (resStory.length > 0) {
    //   pld.story = resStory;
    // } else {
    //   pld.story = null;
    // }
    pld.story = null;
    pld.video = resVideo;

    res.data = pld;

    this.setViewed(obj, String(profile.email));

    var ver = await this.settingsService.findOneByJenis('AppsVersion');
    ver.value;
    res.version = String(ver.value);

    var timestamps_end = await this.utilService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);

    return res;
  }

  private async setViewed(obj: any, email: string) {
    this.logger.log("setViewed >>> pid: email: " + email);
    if (obj.video != null && obj.video.length > 0) {
      for (let i = 0; i < obj.video.length; i++) {
        let o = obj.video[i];
        this.markViewed(o, email, String(o.email));
      }
    }

    if (obj.pict != null && obj.pict.length > 0) {
      for (let i = 0; i < obj.pict.length; i++) {
        let o = obj.pict[i];
        this.markViewed(o, email, String(o.email));
      }
    }

    if (obj.diary != null && obj.diary.length > 0) {
      for (let i = 0; i < obj.diary.length; i++) {
        let o = obj.diary[i];
        this.markViewed(o, email, String(o.email));
      }
    }

    if (obj.story != null && obj.story.length > 0) {
      for (let i = 0; i < obj.story.length; i++) {
        let o = obj.story[i];
        this.markViewed(o, email, String(o.email));
      }
    }
  }

  private async markViewed(obj: any, email: string, receiver: string) {
    if (email !== receiver) {
      this.logger.log("markViewed >>> pid: " + obj.postID + ", email: " + email + ", receiver: " + receiver);
      let checkDone = await this.contentEventsService.ceckData(email, "VIEW", "DONE", receiver, "", obj.postID);
      var checkAccept = await this.contentEventsService.ceckData(receiver, "VIEW", "ACCEPT", "", email, obj.postID);
      if (checkDone == undefined && checkAccept == undefined) {
        this.logger.log("markViewed >>> pid: " + obj.postID + ", email: " + email + ", receiver: " + receiver + " create new");
        var _id_1 = await this.utilService.generateId();
        var _id_2 = await this.utilService.generateId();
        const current_date = await this.utilService.getDateTimeString();
        var CreateContenteventsDto1 = new CreateContenteventsDto();
        CreateContenteventsDto1._id = _id_1;
        CreateContenteventsDto1.contentEventID = _id_1;
        CreateContenteventsDto1.email = email;
        CreateContenteventsDto1.eventType = "VIEW";
        CreateContenteventsDto1.active = true;
        CreateContenteventsDto1.event = "DONE";
        CreateContenteventsDto1.createdAt = current_date;
        CreateContenteventsDto1.updatedAt = current_date;
        CreateContenteventsDto1.sequenceNumber = 1;
        CreateContenteventsDto1.flowIsDone = true;
        CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent";
        CreateContenteventsDto1.receiverParty = receiver;
        CreateContenteventsDto1.postID = obj.postID;

        var CreateContenteventsDto2 = new CreateContenteventsDto();
        CreateContenteventsDto2._id = _id_2;
        CreateContenteventsDto2.contentEventID = _id_2;
        CreateContenteventsDto2.email = receiver;
        CreateContenteventsDto2.eventType = "VIEW";
        CreateContenteventsDto2.active = true;
        CreateContenteventsDto2.event = "ACCEPT";
        CreateContenteventsDto2.createdAt = current_date;
        CreateContenteventsDto2.updatedAt = current_date;
        CreateContenteventsDto2.sequenceNumber = 1;
        CreateContenteventsDto2.flowIsDone = true;
        CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent";
        CreateContenteventsDto2.senderParty = email;
        CreateContenteventsDto2.postID = obj.postID;
        try {
          await this.contentEventsService.create(CreateContenteventsDto1);
          await this.contentEventsService.create(CreateContenteventsDto2);
          await this.postxService.updateView(receiver, obj.postID);
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed, ' +
            error,
          );
        }
      }
    }
  }

  public async markViewedNew(postid: string, email: string, receiver: string) {
    var userbasic1 = await this.userService.findOne(email);

    if (userbasic1 == null || userbasic1 == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, auth-user data not found',
      );
    }
    if (email !== receiver) {
      this.logger.log("markViewed >>> pid: " + postid + ", email: " + email + ", receiver: " + receiver);
      let checkDone = await this.contentEventsService.ceckData(email, "VIEW", "DONE", receiver, "", postid);
      var checkAccept = await this.contentEventsService.ceckData(receiver, "VIEW", "ACCEPT", "", email, postid);
      if (checkDone == undefined && checkAccept == undefined) {
        this.logger.log("markViewed >>> pid: " + postid + ", email: " + email + ", receiver: " + receiver + " create new");
        var _id_1 = await this.utilService.generateId();
        var _id_2 = await this.utilService.generateId();
        const current_date = await this.utilService.getDateTimeString();
        var CreateContenteventsDto1 = new CreateContenteventsDto();
        CreateContenteventsDto1._id = _id_1;
        CreateContenteventsDto1.contentEventID = _id_1;
        CreateContenteventsDto1.email = email;
        CreateContenteventsDto1.eventType = "VIEW";
        CreateContenteventsDto1.active = true;
        CreateContenteventsDto1.event = "DONE";
        CreateContenteventsDto1.createdAt = current_date;
        CreateContenteventsDto1.updatedAt = current_date;
        CreateContenteventsDto1.sequenceNumber = 1;
        CreateContenteventsDto1.flowIsDone = true;
        CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent";
        CreateContenteventsDto1.receiverParty = receiver;
        CreateContenteventsDto1.postID = postid;

        var CreateContenteventsDto2 = new CreateContenteventsDto();
        CreateContenteventsDto2._id = _id_2;
        CreateContenteventsDto2.contentEventID = _id_2;
        CreateContenteventsDto2.email = receiver;
        CreateContenteventsDto2.eventType = "VIEW";
        CreateContenteventsDto2.active = true;
        CreateContenteventsDto2.event = "ACCEPT";
        CreateContenteventsDto2.createdAt = current_date;
        CreateContenteventsDto2.updatedAt = current_date;
        CreateContenteventsDto2.sequenceNumber = 1;
        CreateContenteventsDto2.flowIsDone = true;
        CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent";
        CreateContenteventsDto2.senderParty = email;
        CreateContenteventsDto2.postID = postid;
        try {

          const resultdata1 = await this.contentEventsService.create(CreateContenteventsDto1);
          let idevent1 = resultdata1._id;
          let event1 = resultdata1.eventType.toString();
          // await this.utilService.counscore("CE", "prodAll", "contentevents", idevent1, event1, userbasic1._id);
          await this.contentEventsService.create(CreateContenteventsDto2);
          await this.postxService.updateView(receiver, postid);
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed, ' +
            error,
          );
        }
      }
    }
  }

  private generateThumbnail(pdvv: PostData, vapsara: ApsaraVideoResponse, papsara: ApsaraImageResponse) {
    if (pdvv == undefined) {
      return undefined;
    }


    if (vapsara != undefined) {
      for (let i = 0; i < vapsara.VideoList.length; i++) {
        let vi = vapsara.VideoList[i];
        if (pdvv.apsaraId == vi.VideoId) {
          pdvv.mediaThumbEndpoint = vi.CoverURL;

          if (papsara != undefined) {
            for (let i = 0; i < papsara.ImageInfo.length; i++) {
              let vi = papsara.ImageInfo[i];
              if (pdvv.apsaraId == vi.ImageId) {
                pdvv.mediaThumbEndpoint = vi.URL;
                pdvv.mediaThumbUri = vi.URL;
                break;
              }
            }

            for (let i = 0; i < papsara.ImageInfo.length; i++) {
              let vi = papsara.ImageInfo[i];
              if (pdvv.apsaraId == vi.ImageId) {
                pdvv.mediaEndpoint = vi.URL;
                pdvv.mediaUri = vi.URL;
                break;
              }
            }

            for (let i = 0; i < papsara.ImageInfo.length; i++) {
              let vi = papsara.ImageInfo[i];
              if (pdvv.apsaraThumbId == vi.ImageId) {
                pdvv.mediaThumbEndpoint = vi.URL;
                pdvv.mediaThumbUri = vi.URL;
                break;
              }
            }

            for (let i = 0; i < papsara.ImageInfo.length; i++) {
              let vi = papsara.ImageInfo[i];
              if (pdvv.music != undefined && pdvv.music.apsaraThumnail != undefined) {
                let m = String(pdvv.music.apsaraThumnail);
                if (m == String(vi.ImageId)) {
                  pdvv.music.apsaraThumnailUrl = vi.URL;
                  break;
                }
              }
            }
          }
          break;
        }
      }
    }

    if (papsara != undefined) {
      for (let i = 0; i < papsara.ImageInfo.length; i++) {
        let vi = papsara.ImageInfo[i];
        if (pdvv.apsaraId == vi.ImageId) {
          pdvv.mediaThumbEndpoint = vi.URL;
          pdvv.mediaThumbUri = vi.URL;
          break;
        }
      }

      for (let i = 0; i < papsara.ImageInfo.length; i++) {
        let vi = papsara.ImageInfo[i];
        if (pdvv.apsaraId == vi.ImageId) {
          pdvv.mediaEndpoint = vi.URL;
          pdvv.mediaUri = vi.URL;
          break;
        }
      }

      for (let i = 0; i < papsara.ImageInfo.length; i++) {
        let vi = papsara.ImageInfo[i];
        if (pdvv.apsaraThumbId == vi.ImageId) {
          pdvv.mediaThumbEndpoint = vi.URL;
          pdvv.mediaThumbUri = vi.URL;
          break;
        }
      }

      for (let i = 0; i < papsara.ImageInfo.length; i++) {
        let vi = papsara.ImageInfo[i];
        if (pdvv.music != undefined && pdvv.music.apsaraThumnail != undefined) {
          let m = String(pdvv.music.apsaraThumnail);
          if (m == String(vi.ImageId)) {
            pdvv.music.apsaraThumnailUrl = vi.URL;
            break;
          }
        }
      }
    }

  }

  private paging(page: number, row: number) {
    if (page == 0 || page == 1) {
      return 0;
    }
    let num = ((page - 1) * row);
    return num;
  }

  private buildQuery(profile: Userbasic, vis: string, stoday: string, skip: number, row: number) {
    if (vis == 'PUBLIC') {
      return this.buildQueryPublic(profile, vis, stoday, skip, row);
    } else if (vis == 'FOLLOWING') {
      return this.contentEventsService.buildQueryFollowing(profile, vis, stoday, skip, row);
    } else {
      return this.buildQueryPrivate(profile, vis, stoday, skip, row);
    }
  }

  private buildQuery_(profile: Userbasicnew, vis: string, stoday: string, skip: number, row: number) {
    if (vis == 'PUBLIC') {
      return this.buildQueryPublic_(profile, vis, stoday, skip, row);
    } else if (vis == 'FOLLOWING') {
      return this.contentEventsService.buildQueryFollowing_(profile, vis, stoday, skip, row);
    } else {
      return this.buildQueryPrivate_(profile, vis, stoday, skip, row);
    }
  }

  private buildQueryPublic(profile: Userbasic, vis: string, stoday: string, skip: number, row: number) {
    return this.PostsModel.aggregate([

      {
        "$unwind": {
          "path": "$boosted",
          "preserveNullAndEmptyArrays": true
        }
      },
      {
        "$unwind": {
          "path": "$boosted.boostSession",
          "preserveNullAndEmptyArrays": true
        }
      },
      {
        "$set": {
          "timeStart": {

            "$concat": [
              {
                "$dateToString": {
                  "format": "%Y-%m-%d",
                  "date": new Date()
                }
              },
              " ",
              "$boosted.boostSession.timeStart"
            ]
          }
        }
      },
      {
        "$set": {
          "timeEnd": {
            "$concat": [
              {
                "$dateToString": {
                  "format": "%Y-%m-%d",
                  "date": new Date()
                }
              },
              " ",
              "$boosted.boostSession.timeEnd"
            ]
          }
        }
      },
      {
        $set: {

          "testDate":
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
        $set: {
          "storyDate":
          {
            "$dateToString": {
              "format": "%Y-%m-%d %H:%M:%S",
              "date": {
                $add: [new Date(), -61200000]
              }
            }
          }
        }
      },
      {
        $facet:
        {
          //pic
          "pict": [
            {
              $sort: {
                "isBoost": - 1,
                "createdAt": - 1
              }
            },
            {
              $match:
              {
                $or: [
                  {
                    $and: [
                      {
                        "reportedStatus": {
                          $ne: "OWNED"
                        }
                      },
                      {
                        "visibility": "PUBLIC"
                      },
                      {
                        "active": true
                      },
                      {
                        "postType": "pict"
                      },
                      {
                        $expr: {
                          $lte: ["$boosted.boostSession.start", "$testDate",]
                        }
                      },
                      {
                        $expr: {
                          $gt: ["$boosted.boostSession.end", "$testDate",]
                        }
                      },
                      {
                        $expr: {
                          $lte: ["$timeStart", "$testDate",]
                        }
                      },
                      {
                        $expr: {
                          $gt: ["$timeEnd", "$testDate",]
                        }
                      },
                      {

                        "timeStart": {
                          $ne: null
                        }
                      },
                      {

                        "timeEnd": {
                          $ne: null
                        }
                      },
                      {
                        $or: [
                          {
                            "reportedUser": {
                              "$elemMatch": {
                                "email": profile.email,
                                "active": false,

                              }
                            }
                          },
                          {
                            "reportedUser.email": {
                              $not: {
                                $regex: profile.email
                              }
                            }
                          },

                        ]
                      },
                      {
                        $or: [
                          {
                            "boosted.boostViewer": {
                              "$elemMatch": {
                                "email": profile.email,
                                "isLast": true,
                                "timeEnd": {
                                  $lte: stoday
                                }
                              }
                            }
                          },
                          {
                            $and: [
                              {
                                "boosted.boostViewer.email": {
                                  $ne: profile.email
                                }
                              },

                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    $and: [
                      {
                        "reportedStatus": {
                          $ne: "OWNED"
                        }
                      },
                      {
                        "visibility": "PUBLIC"
                      },
                      {
                        "active": true
                      },
                      {
                        "postType": "pict"
                      },
                      {
                        "timeStart": null
                      },
                      {
                        $or: [
                          {
                            "reportedUser": {
                              "$elemMatch": {
                                "email": profile.email,
                                "active": false,

                              }
                            }
                          },
                          {
                            "reportedUser.email": {
                              $not: {
                                $regex: profile.email,
                              }
                            }
                          },

                        ]
                      },

                    ]
                  },

                ]
              }
            },
            {
              "$lookup": {
                from: "mediapicts",
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
                      "mediaUri": 1,
                      "postID": 1,
                      "mediaEndpoint": {
                        "$concat": ["/pict/", "$mediaUri"]
                      },
                      "mediaThumbEndpoint": {
                        "$concat": ["/thumb/", "$postID"]
                      },
                      "mediaThumbUri": "$mediaThumb",
                      "mediaType": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "interests_repo",
                as: "cats",
                let: {
                  localID: '$category.$id'
                },
                pipeline: [
                  {
                    $match: {

                      $expr: {
                        $and: [
                          {
                            $in: ['$_id', {
                              $ifNull: ['$$localID', []]
                            }]
                          },

                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      "interestName": 1,
                      "langIso": 1,
                      "icon": 1,
                      "createdAt": 1,
                      "updatedAt": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "userTag",
                let: {
                  localID: '$tagPeople.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      }
                    }
                  },
                  {
                    $project: {

                      "username": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "username",
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

                      "username": 1
                    }
                  }
                ],

              }
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
            {
              $unwind: {
                path: "$userBasic",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "mediaprofilepicts",
                as: "avatar",
                let: {
                  localID: '$userBasic.profilePict.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $eq: ['$mediaID', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      "mediaBasePath": 1,
                      "mediaUri": 1,
                      "originalName": 1,
                      "fsSourceUri": 1,
                      "fsSourceName": 1,
                      "fsTargetUri": 1,
                      "mediaType": 1,
                      "mediaEndpoint": {
                        "$concat": ["/profilepict/", "$mediaID"]
                      }
                    }
                  }
                ],

              }
            },
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
                      "musicTitle": 1,
                      "artistName": 1,
                      "albumName": 1,
                      "apsaraMusic": 1,
                      "apsaraThumnail": 1,
                      "genre": "$genre.name",
                      "theme": "$theme.name",
                      "mood": "$mood.name",

                    }
                  },
                  {
                    $unwind: {
                      path: "$genre",
                      preserveNullAndEmptyArrays: true
                    }
                  },
                  {
                    $unwind: {
                      path: "$theme",
                      preserveNullAndEmptyArrays: true
                    }
                  },
                  {
                    $unwind: {
                      path: "$mood",
                      preserveNullAndEmptyArrays: true
                    }
                  }
                ],

              }
            },
            {
              $skip: skip
            },
            {
              $limit: row
            },
            {
              $unwind: {
                path: "$media",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$username",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$music",
                preserveNullAndEmptyArrays: true
              }
            },
            // {
            //   $unwind: {
            //     path: "$cats",
            //     preserveNullAndEmptyArrays: true
            //   }
            // },
            {
              $project: {
                "musicTitle": "$music.musicTitle",
                "postID": 1,
                "artistName": "$music.artistName",
                "albumName": "$music.albumName",
                "apsaraMusic": "$music.apsaraMusic",
                "apsaraThumnail": "$music.apsaraThumnail",
                "genre": "$music.genre.name",
                "theme": "$music.theme.name",
                "mood": "$music.mood.name",
                "testDate": 1,
                "musicId": 1,
                "music": 1,
                "tagPeople": "$userTag",
                "mediaType": "$media.mediaType",
                "email": 1,
                "postType": 1,
                "description": 1,
                "active": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "expiration": 1,
                "visibility": 1,
                "location": 1,
                "tags": 1,
                "allowComments": 1,
                "isSafe": 1,
                "isOwned": 1,
                "certified": 1,
                "saleAmount": 1,
                "saleLike": 1,
                "saleView": 1,
                "isShared": 1,
                "insight": [
                  {
                    "likes": "$likes",
                    "views": "$views",
                    "shares": "$shares",
                    "comments": "$comments",

                  }
                ],
                "userProfile": 1,
                "contentMedias": 1,
                "category": "$cats",
                "tagDescription": 1,
                "metadata": 1,
                "boostDate": 1,
                "end": "$boosted.boostSession.end",
                "start": "$boosted.boostSession.start",
                "isBoost": 1,
                "boostViewer": 1,
                "boostCount": 1,
                "boosted":
                  [{
                    $cond: {
                      if: {
                        $gt: [{
                          "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                              $add: [new Date(), 25200000]
                            }
                          }
                        }, "$boosted.boostSession.end"]
                      },
                      then: "$kampretTaslim",
                      else: '$boosted'
                    }
                  }],
                "contentModeration": 1,
                "reportedStatus": 1,
                "reportedUserCount": 1,
                "contentModerationResponse": 1,
                "reportedUser": 1,
                "timeStart": 1,
                "timeEnd": 1,
                "apsara": "$media.apsara",
                "apsaraId": "$media.apsaraId",
                "apsaraThumbId": "$media.apsaraThumbId",
                "mediaEndpoint": "$media.mediaEndpoint",
                "mediaUri": "$media.mediaUri",
                "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
                "mediaThumbUri": "$media.mediaThumbUri",
                "fullName": "$userBasic.fullName",
                "username": "$username.username",
                "avatar": 1,
                "statusCB": 1,
                "privacy": [{
                  "isCelebrity": "$userBasic.isCelebrity"
                }, {
                  "isIdVerified": "$userBasic.isIdVerified"
                }, {
                  "isPrivate": "$userBasic.isPrivate"
                }]
              }
            }
          ],
          //video
          "video": [
            {
              $sort: {
                "isBoost": - 1,
                "createdAt": - 1
              }
            },
            {
              $match:
              {
                $or: [
                  {
                    $and: [
                      {
                        "reportedStatus": {
                          $ne: "OWNED"
                        }
                      },
                      {
                        "visibility": "PUBLIC"
                      },
                      {
                        "active": true
                      },
                      {
                        "postType": "vid"
                      },
                      {
                        $expr: {
                          $lte: ["$boosted.boostSession.start", "$testDate",]
                        }
                      },
                      {
                        $expr: {
                          $gt: ["$boosted.boostSession.end", "$testDate",]
                        }
                      },
                      {
                        $expr: {
                          $lte: ["$timeStart", "$testDate",]
                        }
                      },
                      {
                        $expr: {
                          $gt: ["$timeEnd", "$testDate",]
                        }
                      },
                      {

                        "timeStart": {
                          $ne: null
                        }
                      },
                      {

                        "timeEnd": {
                          $ne: null
                        }
                      },
                      {
                        $or: [
                          {
                            "reportedUser": {
                              "$elemMatch": {
                                "email": profile.email,
                                "active": false,

                              }
                            }
                          },
                          {
                            "reportedUser.email": {
                              $not: {
                                $regex: profile.email
                              }
                            }
                          },

                        ]
                      },
                      {
                        $or: [
                          {
                            $or: [
                              {
                                "boosted.boostViewer": {
                                  "$elemMatch": {
                                    "email": profile.email,
                                    "isLast": true,
                                    "timeEnd": {
                                      $lte: stoday
                                    }
                                  }
                                }
                              },
                              {
                                $and: [
                                  {
                                    "boosted.boostViewer.email": {
                                      $ne: profile.email
                                    }
                                  },

                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    $and: [
                      {
                        "reportedStatus": {
                          $ne: "OWNED"
                        }
                      },
                      {
                        "visibility": "PUBLIC"
                      },
                      {
                        "active": true
                      },
                      {
                        "postType": "vid"
                      },
                      {
                        "timeStart": null
                      },
                      {
                        $or: [
                          {
                            "reportedUser": {
                              "$elemMatch": {
                                "email": profile.email,
                                "active": false,

                              }
                            }
                          },
                          {
                            "reportedUser.email": {
                              $not: {
                                $regex: profile.email,
                              }
                            }
                          },

                        ]
                      },

                    ]
                  },

                ]
              }
            },
            {
              "$lookup": {
                from: "mediavideos",
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
                      "mediaUri": 1,
                      "mediaEndpoint": {
                        "$concat": ["/stream/", "$mediaUri"]
                      },
                      "mediaThumbEndpoint": {
                        "$concat": ["/thumb/", "$postID"]
                      },
                      "mediaThumbUri": "$mediaThumb",
                      "mediaType": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "interests_repo",
                as: "cats",
                let: {
                  localID: '$category.$id'
                },
                pipeline: [
                  {
                    $match: {

                      $expr: {
                        $and: [
                          {
                            $in: ['$_id', {
                              $ifNull: ['$$localID', []]
                            }]
                          },

                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      "interestName": 1,
                      "langIso": 1,
                      "icon": 1,
                      "createdAt": 1,
                      "updatedAt": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "userTag",
                let: {
                  localID: '$tagPeople.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      }
                    }
                  },
                  {
                    $project: {

                      "username": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "username",
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

                      "username": 1
                    }
                  }
                ],

              }
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
            {
              $unwind: {
                path: "$userBasic",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "mediaprofilepicts",
                as: "avatar",
                let: {
                  localID: '$userBasic.profilePict.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $eq: ['$mediaID', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      "mediaBasePath": 1,
                      "mediaUri": 1,
                      "originalName": 1,
                      "fsSourceUri": 1,
                      "fsSourceName": 1,
                      "fsTargetUri": 1,
                      "mediaType": 1,
                      "mediaEndpoint": {
                        "$concat": ["/profilepict/", "$mediaID"]
                      }
                    }
                  }
                ],

              }
            },
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
                      "musicTitle": 1,
                      "artistName": 1,
                      "albumName": 1,
                      "apsaraMusic": 1,
                      "apsaraThumnail": 1,
                      "genre": "$genre.name",
                      "theme": "$theme.name",
                      "mood": "$mood.name",

                    }
                  },
                  {
                    $unwind: {
                      path: "$genre",
                      preserveNullAndEmptyArrays: true
                    }
                  },
                  {
                    $unwind: {
                      path: "$theme",
                      preserveNullAndEmptyArrays: true
                    }
                  },
                  {
                    $unwind: {
                      path: "$mood",
                      preserveNullAndEmptyArrays: true
                    }
                  }
                ],

              }
            },
            {
              $skip: skip
            },
            {
              $limit: row
            },
            {
              $unwind: {
                path: "$media",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$username",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                "musicTitle": "$music.musicTitle",
                "postID": 1,
                "artistName": "$music.artistName",
                "albumName": "$music.albumName",
                "apsaraMusic": "$music.apsaraMusic",
                "apsaraThumnail": "$music.apsaraThumnail",
                "genre": "$music.genre.name",
                "theme": "$music.theme.name",
                "mood": "$music.mood.name",
                "testDate": 1,
                "musicId": 1,
                "music": 1,
                "tagPeople": "$userTag",
                "mediaType": "$media.mediaType",
                "email": 1,
                "postType": 1,
                "description": 1,
                "active": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "expiration": 1,
                "visibility": 1,
                "location": 1,
                "tags": 1,
                "allowComments": 1,
                "isSafe": 1,
                "isOwned": 1,
                "certified": 1,
                "saleAmount": 1,
                "saleLike": 1,
                "saleView": 1,
                "isShared": 1,
                "userProfile": 1,
                "contentMedias": 1,
                "category": "$cats",
                "tagDescription": 1,
                "metadata": 1,
                "boostDate": 1,
                "end": "$boosted.boostSession.end",
                "start": "$boosted.boostSession.start",
                "isBoost": 1,
                "boostViewer": 1,
                "boostCount": 1,
                "boosted":
                  [{
                    $cond: {
                      if: {
                        $gt: [{
                          "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                              $add: [new Date(), 25200000]
                            }
                          }
                        }, "$boosted.boostSession.end"]
                      },
                      then: "$kampretTaslim",
                      else: '$boosted'
                    }
                  }],
                "contentModeration": 1,
                "reportedStatus": 1,
                "reportedUserCount": 1,
                "contentModerationResponse": 1,
                "reportedUser": 1,
                "timeStart": 1,
                "timeEnd": 1,
                "apsara": "$media.apsara",
                "apsaraId": "$media.apsaraId",
                "apsaraThumbId": "$media.apsaraThumbId",
                "mediaEndpoint": "$media.mediaEndpoint",
                "mediaUri": "$media.mediaUri",
                "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
                "mediaThumbUri": "$media.mediaThumbUri",
                "insight": [
                  {
                    "likes": "$likes",
                    "views": "$views",
                    "shares": "$shares",
                    "comments": "$comments",

                  }
                ],
                "fullName": "$userBasic.fullName",
                "username": "$username.username",
                "avatar": 1,
                "statusCB": 1,
                "privacy": [{
                  "isCelebrity": "$userBasic.isCelebrity"
                }, {
                  "isIdVerified": "$userBasic.isIdVerified"
                }, {
                  "isPrivate": "$userBasic.isPrivate"
                }]
              }
            }
          ],
          //diary
          "diary": [
            {
              $sort: {
                "isBoost": - 1,
                "createdAt": - 1
              }
            },
            {
              $match:
              {
                $or: [
                  {
                    $and: [
                      {
                        "reportedStatus": {
                          $ne: "OWNED"
                        }
                      },
                      {
                        "visibility": "PUBLIC"
                      },
                      {
                        "active": true
                      },
                      {
                        "postType": "diary"
                      },
                      {
                        $expr: {
                          $lte: ["$boosted.boostSession.start", "$testDate",]
                        }
                      },
                      {
                        $expr: {
                          $gt: ["$boosted.boostSession.end", "$testDate",]
                        }
                      },
                      // {
                      //   $expr: {
                      //     $lte: ["$timeStart", "$testDate",]
                      //   }
                      // },
                      // {
                      //   $expr: {
                      //     $gt: ["$timeEnd", "$testDate",]
                      //   }
                      // },
                      {

                        "timeStart": {
                          $ne: null
                        }
                      },
                      {

                        "timeEnd": {
                          $ne: null
                        }
                      },
                      {
                        $or: [
                          {
                            "reportedUser": {
                              "$elemMatch": {
                                "email": profile.email,
                                "active": false,

                              }
                            }
                          },
                          {
                            "reportedUser.email": {
                              $not: {
                                $regex: profile.email
                              }
                            }
                          },

                        ]
                      },
                      {
                        $or: [
                          {
                            $or: [
                              {
                                "boosted.boostViewer": {
                                  "$elemMatch": {
                                    "email": profile.email,
                                    "isLast": true,
                                    "timeEnd": {
                                      $lte: stoday
                                    }
                                  }
                                }
                              },
                              {
                                $and: [
                                  {
                                    "boosted.boostViewer.email": {
                                      $ne: profile.email
                                    }
                                  },

                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    $and: [
                      {
                        "reportedStatus": {
                          $ne: "OWNED"
                        }
                      },
                      {
                        "visibility": "PUBLIC"
                      },
                      {
                        "active": true
                      },
                      {
                        "postType": "diary"
                      },
                      {
                        "timeStart": null
                      },
                      {
                        $or: [
                          {
                            "reportedUser": {
                              "$elemMatch": {
                                "email": profile.email,
                                "active": false,

                              }
                            }
                          },
                          {
                            "reportedUser.email": {
                              $not: {
                                $regex: profile.email,
                              }
                            }
                          },

                        ]
                      },

                    ]
                  },

                ]
              }
            },
            {
              "$lookup": {
                from: "mediadiaries",
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
                      "mediaUri": 1,
                      "mediaEndpoint": {
                        "$concat": ["/stream/", "$mediaUri"]
                      },
                      "mediaThumbEndpoint": {
                        "$concat": ["/thumb/", "$postID"]
                      },
                      "mediaThumbUri": "$mediaThumb",
                      "mediaType": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "interests_repo",
                as: "cats",
                let: {
                  localID: '$category.$id'
                },
                pipeline: [
                  {
                    $match: {

                      $expr: {
                        $and: [
                          {
                            $in: ['$_id', {
                              $ifNull: ['$$localID', []]
                            }]
                          },

                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      "interestName": 1,
                      "langIso": 1,
                      "icon": 1,
                      "createdAt": 1,
                      "updatedAt": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "userTag",
                let: {
                  localID: '$tagPeople.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      }
                    }
                  },
                  {
                    $project: {

                      "username": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "username",
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

                      "username": 1
                    }
                  }
                ],

              }
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
            {
              $unwind: {
                path: "$userBasic",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "mediaprofilepicts",
                as: "avatar",
                let: {
                  localID: '$userBasic.profilePict.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $eq: ['$mediaID', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      "mediaBasePath": 1,
                      "mediaUri": 1,
                      "originalName": 1,
                      "fsSourceUri": 1,
                      "fsSourceName": 1,
                      "fsTargetUri": 1,
                      "mediaType": 1,
                      "mediaEndpoint": {
                        "$concat": ["/profilepict/", "$mediaID"]
                      }
                    }
                  }
                ],

              }
            },
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
                      "musicTitle": 1,
                      "artistName": 1,
                      "albumName": 1,
                      "apsaraMusic": 1,
                      "apsaraThumnail": 1,
                      "genre": "$genre.name",
                      "theme": "$theme.name",
                      "mood": "$mood.name",

                    }
                  },
                  {
                    $unwind: {
                      path: "$genre",
                      preserveNullAndEmptyArrays: true
                    }
                  },
                  {
                    $unwind: {
                      path: "$theme",
                      preserveNullAndEmptyArrays: true
                    }
                  },
                  {
                    $unwind: {
                      path: "$mood",
                      preserveNullAndEmptyArrays: true
                    }
                  }
                ],

              }
            },
            {
              $skip: skip
            },
            {
              $limit: row
            },
            {
              $unwind: {
                path: "$media",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$username",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                "musicTitle": "$music.musicTitle",
                "postID": 1,
                "artistName": "$music.artistName",
                "albumName": "$music.albumName",
                "apsaraMusic": "$music.apsaraMusic",
                "apsaraThumnail": "$music.apsaraThumnail",
                "genre": "$music.genre.name",
                "theme": "$music.theme.name",
                "mood": "$music.mood.name",
                "testDate": 1,
                "musicId": 1,
                "music": 1,
                "tagPeople": "$userTag",
                "mediaType": "$media.mediaType",
                "email": 1,
                "postType": 1,
                "description": 1,
                "active": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "expiration": 1,
                "visibility": 1,
                "location": 1,
                "tags": 1,
                "allowComments": 1,
                "isSafe": 1,
                "isOwned": 1,
                "certified": 1,
                "saleAmount": 1,
                "saleLike": 1,
                "saleView": 1,
                "isShared": 1,
                "userProfile": 1,
                "contentMedias": 1,
                "category": "$cats",
                "tagDescription": 1,
                "metadata": 1,
                "boostDate": 1,
                "end": "$boosted.boostSession.end",
                "start": "$boosted.boostSession.start",
                "isBoost": 1,
                "boostViewer": 1,
                "boostCount": 1,
                "boosted":
                  [{
                    $cond: {
                      if: {
                        $gt: [{
                          "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                              $add: [new Date(), 25200000]
                            }
                          }
                        }, "$boosted.boostSession.end"]
                      },
                      then: "$kampretTaslim",
                      else: '$boosted'
                    }
                  }],
                "contentModeration": 1,
                "reportedStatus": 1,
                "reportedUserCount": 1,
                "contentModerationResponse": 1,
                "reportedUser": 1,
                "timeStart": 1,
                "timeEnd": 1,
                "apsara": "$media.apsara",
                "apsaraId": "$media.apsaraId",
                "apsaraThumbId": "$media.apsaraThumbId",
                "mediaEndpoint": "$media.mediaEndpoint",
                "mediaUri": "$media.mediaUri",
                "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
                "mediaThumbUri": "$media.mediaThumbUri",
                "insight": [
                  {
                    "likes": "$likes",
                    "views": "$views",
                    "shares": "$shares",
                    "comments": "$comments",

                  }
                ],
                "fullName": "$userBasic.fullName",
                "username": "$username.username",
                "avatar": 1,
                "statusCB": 1,
                "privacy": [{
                  "isCelebrity": "$userBasic.isCelebrity"
                }, {
                  "isIdVerified": "$userBasic.isIdVerified"
                }, {
                  "isPrivate": "$userBasic.isPrivate"
                }]
              }
            }
          ],
          //story
          // "story": [
          //   {
          //     $sort: {
          //       "isBoost": - 1,
          //       "createdAt": - 1
          //     }
          //   },
          //   {
          //     $match:
          //     {
          //       $or: [
          //         {
          //           $and: [
          //             {
          //               "email": {
          //                 $not: {
          //                   $regex: profile.email
          //                 }
          //               }
          //             },
          //             {
          //               "reportedStatus": {
          //                 $ne: "OWNED"
          //               }
          //             },
          //             {
          //               "visibility": "PUBLIC"
          //             },
          //             {
          //               "active": true
          //             },
          //             {
          //               "postType": "story"
          //             },
          //             {
          //               $expr: {
          //                 $gte: ["$createdAt", "$storyDate",]
          //               }
          //             },
          //             {
          //               $or: [
          //                 {
          //                   "reportedUser": {
          //                     "$elemMatch": {
          //                       "email": profile.email,
          //                       "active": false,

          //                     }
          //                   }
          //                 },
          //                 {
          //                   "reportedUser.email": {
          //                     $not: {
          //                       $regex: profile.email,
          //                     }
          //                   }
          //                 },

          //               ]
          //             },

          //           ]
          //         },

          //       ]
          //     }
          //   },
          //   {
          //     "$lookup": {
          //       from: "mediastories",
          //       as: "media",
          //       let: {
          //         localID: '$postID'
          //       },
          //       pipeline: [
          //         {
          //           $match:
          //           {


          //             $expr: {
          //               $eq: ['$postID', '$$localID']
          //             }
          //           }
          //         },
          //         {
          //           $project: {

          //             "apsara": 1,
          //             "apsaraId": 1,
          //             "apsaraThumbId": 1,
          //             "mediaEndpoint": 1,
          //             "mediaUri": 1,
          //             "mediaThumbEndpoint": 1,
          //             "mediaThumbUri": 1,
          //             "mediaType": 1,

          //           }
          //         }
          //       ],

          //     },

          //   },
          //   {
          //     "$lookup": {
          //       from: "interests_repo",
          //       as: "cats",
          //       let: {
          //         localID: '$category.$id'
          //       },
          //       pipeline: [
          //         {
          //           $match: {

          //             $expr: {
          //               $and: [
          //                 {
          //                   $in: ['$_id', {
          //                     $ifNull: ['$$localID', []]
          //                   }]
          //                 },

          //               ]
          //             }
          //           }
          //         },
          //         {
          //           $project: {
          //             "interestName": 1,
          //             "langIso": 1,
          //             "icon": 1,
          //             "createdAt": 1,
          //             "updatedAt": 1
          //           }
          //         }
          //       ],

          //     }
          //   },
          //   {
          //     "$lookup": {
          //       from: "userauths",
          //       as: "userTag",
          //       let: {
          //         localID: '$tagPeople.$id'
          //       },
          //       pipeline: [
          //         {
          //           $match:
          //           {


          //             $expr: {
          //               $in: ['$_id', {
          //                 $ifNull: ['$$localID', []]
          //               }]
          //             }
          //           }
          //         },
          //         {
          //           $project: {

          //             "username": 1
          //           }
          //         }
          //       ],

          //     }
          //   },
          //   {
          //     "$lookup": {
          //       from: "userauths",
          //       as: "username",
          //       let: {
          //         localID: '$email'
          //       },
          //       pipeline: [
          //         {
          //           $match:
          //           {


          //             $expr: {
          //               $eq: ['$email', '$$localID']
          //             }
          //           }
          //         },
          //         {
          //           $project: {

          //             "username": 1
          //           }
          //         }
          //       ],

          //     }
          //   },
          //   {
          //     "$lookup": {
          //       from: "userbasics",
          //       as: "userBasic",
          //       let: {
          //         localID: '$email'
          //       },
          //       pipeline: [
          //         {
          //           $match:
          //           {


          //             $expr: {
          //               $eq: ['$email', '$$localID']
          //             }
          //           }
          //         },
          //         {
          //           $project: {
          //             "fullName": 1,
          //             "profilePict": 1,
          //             "isCelebrity": 1,
          //             "isIdVerified": 1,
          //             "isPrivate": 1,

          //           }
          //         }
          //       ],

          //     }
          //   },
          //   {
          //     $unwind: {
          //       path: "$userBasic",
          //       preserveNullAndEmptyArrays: true
          //     }
          //   },
          //   {
          //     "$lookup": {
          //       from: "mediaprofilepicts",
          //       as: "avatar",
          //       let: {
          //         localID: '$userBasic.profilePict.$id'
          //       },
          //       pipeline: [
          //         {
          //           $match:
          //           {


          //             $expr: {
          //               $eq: ['$mediaID', '$$localID']
          //             }
          //           }
          //         },
          //         {
          //           $project: {
          //             "mediaBasePath": 1,
          //             "mediaUri": 1,
          //             "originalName": 1,
          //             "fsSourceUri": 1,
          //             "fsSourceName": 1,
          //             "fsTargetUri": 1,
          //             "mediaType": 1,
          //             "mediaEndpoint": {
          //               "$concat": ["/profilepict/", "$mediaID"]
          //             }
          //           }
          //         }
          //       ],

          //     }
          //   },
          //   {
          //     "$lookup": {
          //       from: "mediamusic",
          //       as: "music",
          //       let: {
          //         localID: '$musicId'
          //       },
          //       pipeline: [
          //         {
          //           $match:
          //           {
          //             $expr: {
          //               $eq: ['$_id', '$$localID']
          //             }
          //           }
          //         },
          //         {
          //           $project: {
          //             "musicTitle": 1,
          //             "artistName": 1,
          //             "albumName": 1,
          //             "apsaraMusic": 1,
          //             "apsaraThumnail": 1,
          //             "genre": "$genre.name",
          //             "theme": "$theme.name",
          //             "mood": "$mood.name",

          //           }
          //         }
          //       ],

          //     }
          //   },
          //   {
          //     $skip: skip
          //   },
          //   {
          //     $limit: row
          //   },
          //   {
          //     $unwind: {
          //       path: "$media",
          //       preserveNullAndEmptyArrays: true
          //     }
          //   },
          //   {
          //     $unwind: {
          //       path: "$username",
          //       preserveNullAndEmptyArrays: true
          //     }
          //   },
          //   {
          //     $project: {
          //       "storyDate": 1,
          //       "postID": 1,
          //       "musicTitle": "$music.musicTitle",
          //       "artistName": "$music.artistName",
          //       "albumName": "$music.albumName",
          //       "apsaraMusic": "$music.apsaraMusic",
          //       "apsaraThumnail": "$music.apsaraThumnail",
          //       "genre": "$music.genre.name",
          //       "theme": "$music.theme.name",
          //       "mood": "$music.mood.name",
          //       "testDate": 1,
          //       "musicId": 1,
          //       "music": 1,
          //       "tagPeople": "$userTag",
          //       "mediaType": "$media.mediaType",
          //       "email": 1,
          //       "postType": 1,
          //       "description": 1,
          //       "active": 1,
          //       "createdAt": 1,
          //       "updatedAt": 1,
          //       "expiration": 1,
          //       "visibility": 1,
          //       "location": 1,
          //       "tags": 1,
          //       "allowComments": 1,
          //       "isSafe": 1,
          //       "isOwned": 1,
          //       "certified": 1,
          //       "saleAmount": 1,
          //       "saleLike": 1,
          //       "saleView": 1,
          //       "isShared": 1,
          //       "userProfile": 1,
          //       "contentMedias": 1,
          //       "category": "$cats",
          //       "tagDescription": 1,
          //       "metadata": 1,
          //       "boostDate": 1,
          //       "boosted":
          //         [{
          //           $cond: {
          //             if: {
          //               $gt: [{
          //                 "$dateToString": {
          //                   "format": "%Y-%m-%d %H:%M:%S",
          //                   "date": {
          //                     $add: [new Date(), 25200000]
          //                   }
          //                 }
          //               }, "$boosted.boostSession.end"]
          //             },
          //             then: "$kampretTaslim",
          //             else: '$boosted'
          //           }
          //         }],
          //       "end": "$boosted.boostSession.end",
          //       "start": "$boosted.boostSession.start",
          //       "isBoost": 1,
          //       "boostViewer": 1,
          //       "boostCount": 1,
          //       "contentModeration": 1,
          //       "reportedStatus": 1,
          //       "reportedUserCount": 1,
          //       "contentModerationResponse": 1,
          //       "reportedUser": 1,
          //       "timeStart": 1,
          //       "timeEnd": 1,
          //       "apsara": "$media.apsara",
          //       "apsaraId": "$media.apsaraId",
          //       "apsaraThumbId": "$media.apsaraThumbId",
          //       "mediaEndpoint": "$media.mediaEndpoint",
          //       "mediaUri": "$media.mediaUri",
          //       "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
          //       "mediaThumbUri": "$media.mediaThumbUri",
          //       "insight": [
          //         {
          //           "likes": "$likes",
          //           "views": "$views",
          //           "shares": "$shares",
          //           "comments": "$comments",

          //         }
          //       ],
          //       "fullName": "$userBasic.fullName",
          //       "username": "$username.username",
          //       "avatar": 1,
          //       "statusCB": 1,
          //       "privacy": [{
          //         "isCelebrity": "$userBasic.isCelebrity"
          //       }, {
          //         "isIdVerified": "$userBasic.isIdVerified"
          //       }, {
          //         "isPrivate": "$userBasic.isPrivate"
          //       }]
          //     }
          //   }
          // ],

        }
      },
      {
        "$lookup": {
          from: "contentevents",
          as: "isLike",
          let: {
            picts: '$pict.postID',
            vids: '$video.postID',
            diarys: '$diary.postID',
            //  storys: '$story.postID',

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
                          $in: ['$postID', '$$picts']
                        }
                      },
                      {
                        "email": profile.email,
                      },
                      {
                        "eventType": "LIKE"
                      },
                      {
                        "active": true
                      },

                    ]
                  },
                  {
                    $and: [
                      {
                        $expr: {
                          $in: ['$postID', '$$vids']
                        }
                      },
                      {
                        "email": profile.email,
                      },
                      {
                        "eventType": "LIKE"
                      },
                      {
                        "active": true
                      }
                    ]
                  },
                  // {
                  //   $and: [
                  //     {
                  //       $expr: {
                  //         $in: ['$postID', '$$storys']
                  //       }
                  //     },
                  //     {
                  //       "email": profile.email,
                  //     },
                  //     {
                  //       "eventType": "LIKE"
                  //     }
                  //   ]
                  // },
                  {
                    $and: [
                      {
                        $expr: {
                          $in: ['$postID', '$$diarys']
                        }
                      },
                      {
                        "email": profile.email,
                      },
                      {
                        "eventType": "LIKE"
                      },
                      {
                        "active": true
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
        "$lookup": {
          from: "contentevents",
          as: "isView",
          let: {
            picts: '$pict.postID',
            vids: '$video.postID',
            diarys: '$diary.postID',
            // storys: '$story.postID',

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
                          $in: ['$postID', '$$picts']
                        }
                      },
                      {
                        "email": profile.email,
                      },
                      {
                        "eventType": "VIEW"
                      }
                    ]
                  },
                  {
                    $and: [
                      {
                        $expr: {
                          $in: ['$postID', '$$vids']
                        }
                      },
                      {
                        "email": profile.email,
                      },
                      {
                        "eventType": "VIEW"
                      }
                    ]
                  },
                  // {
                  //   $and: [
                  //     {
                  //       $expr: {
                  //         $in: ['$postID', '$$storys']
                  //       }
                  //     },
                  //     {
                  //       "email": profile.email,
                  //     },
                  //     {
                  //       "eventType": "VIEW"
                  //     }
                  //   ]
                  // },
                  {
                    $and: [
                      {
                        $expr: {
                          $in: ['$postID', '$$diarys']
                        }
                      },
                      {
                        "email": profile.email,
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


    ]).exec();
  }

  private buildQueryPublic_(profile: Userbasicnew, vis: string, stoday: string, skip: number, row: number) {
    return this.PostsModel.aggregate([

      {
        "$unwind": {
          "path": "$boosted",
          "preserveNullAndEmptyArrays": true
        }
      },
      {
        "$unwind": {
          "path": "$boosted.boostSession",
          "preserveNullAndEmptyArrays": true
        }
      },
      {
        "$set": {
          "timeStart": {

            "$concat": [
              {
                "$dateToString": {
                  "format": "%Y-%m-%d",
                  "date": new Date()
                }
              },
              " ",
              "$boosted.boostSession.timeStart"
            ]
          }
        }
      },
      {
        "$set": {
          "timeEnd": {
            "$concat": [
              {
                "$dateToString": {
                  "format": "%Y-%m-%d",
                  "date": new Date()
                }
              },
              " ",
              "$boosted.boostSession.timeEnd"
            ]
          }
        }
      },
      {
        $set: {

          "testDate":
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
        $set: {
          "storyDate":
          {
            "$dateToString": {
              "format": "%Y-%m-%d %H:%M:%S",
              "date": {
                $add: [new Date(), -61200000]
              }
            }
          }
        }
      },
      {
        $facet:
        {
          //pic
          "pict": [
            {
              $sort: {
                "isBoost": - 1,
                "createdAt": - 1
              }
            },
            {
              $match:
              {
                $or: [
                  {
                    $and: [
                      {
                        "reportedStatus": {
                          $ne: "OWNED"
                        }
                      },
                      {
                        "visibility": "PUBLIC"
                      },
                      {
                        "active": true
                      },
                      {
                        "postType": "pict"
                      },
                      {
                        $expr: {
                          $lte: ["$boosted.boostSession.start", "$testDate",]
                        }
                      },
                      {
                        $expr: {
                          $gt: ["$boosted.boostSession.end", "$testDate",]
                        }
                      },
                      {
                        $expr: {
                          $lte: ["$timeStart", "$testDate",]
                        }
                      },
                      {
                        $expr: {
                          $gt: ["$timeEnd", "$testDate",]
                        }
                      },
                      {

                        "timeStart": {
                          $ne: null
                        }
                      },
                      {

                        "timeEnd": {
                          $ne: null
                        }
                      },
                      {
                        $or: [
                          {
                            "reportedUser": {
                              "$elemMatch": {
                                "email": profile.email,
                                "active": false,

                              }
                            }
                          },
                          {
                            "reportedUser.email": {
                              $not: {
                                $regex: profile.email
                              }
                            }
                          },

                        ]
                      },
                      {
                        $or: [
                          {
                            "boosted.boostViewer": {
                              "$elemMatch": {
                                "email": profile.email,
                                "isLast": true,
                                "timeEnd": {
                                  $lte: stoday
                                }
                              }
                            }
                          },
                          {
                            $and: [
                              {
                                "boosted.boostViewer.email": {
                                  $ne: profile.email
                                }
                              },

                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    $and: [
                      {
                        "reportedStatus": {
                          $ne: "OWNED"
                        }
                      },
                      {
                        "visibility": "PUBLIC"
                      },
                      {
                        "active": true
                      },
                      {
                        "postType": "pict"
                      },
                      {
                        "timeStart": null
                      },
                      {
                        $or: [
                          {
                            "reportedUser": {
                              "$elemMatch": {
                                "email": profile.email,
                                "active": false,

                              }
                            }
                          },
                          {
                            "reportedUser.email": {
                              $not: {
                                $regex: profile.email,
                              }
                            }
                          },

                        ]
                      },

                    ]
                  },

                ]
              }
            },
            {
              "$lookup": {
                from: "mediapicts",
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
                      "mediaUri": 1,
                      "postID": 1,
                      "mediaEndpoint": {
                        "$concat": ["/pict/", "$mediaUri"]
                      },
                      "mediaThumbEndpoint": {
                        "$concat": ["/thumb/", "$postID"]
                      },
                      "mediaThumbUri": "$mediaThumb",
                      "mediaType": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "interests_repo",
                as: "cats",
                let: {
                  localID: '$category.$id'
                },
                pipeline: [
                  {
                    $match: {

                      $expr: {
                        $and: [
                          {
                            $in: ['$_id', {
                              $ifNull: ['$$localID', []]
                            }]
                          },

                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      "interestName": 1,
                      "langIso": 1,
                      "icon": 1,
                      "createdAt": 1,
                      "updatedAt": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "userTag",
                let: {
                  localID: '$tagPeople.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      }
                    }
                  },
                  {
                    $project: {

                      "username": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "username",
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

                      "username": 1
                    }
                  }
                ],

              }
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
            {
              $unwind: {
                path: "$userBasic",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "mediaprofilepicts",
                as: "avatar",
                let: {
                  localID: '$userBasic.profilePict.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $eq: ['$mediaID', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      "mediaBasePath": 1,
                      "mediaUri": 1,
                      "originalName": 1,
                      "fsSourceUri": 1,
                      "fsSourceName": 1,
                      "fsTargetUri": 1,
                      "mediaType": 1,
                      "mediaEndpoint": {
                        "$concat": ["/profilepict/", "$mediaID"]
                      }
                    }
                  }
                ],

              }
            },
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
                      "musicTitle": 1,
                      "artistName": 1,
                      "albumName": 1,
                      "apsaraMusic": 1,
                      "apsaraThumnail": 1,
                      "genre": "$genre.name",
                      "theme": "$theme.name",
                      "mood": "$mood.name",

                    }
                  },
                  {
                    $unwind: {
                      path: "$genre",
                      preserveNullAndEmptyArrays: true
                    }
                  },
                  {
                    $unwind: {
                      path: "$theme",
                      preserveNullAndEmptyArrays: true
                    }
                  },
                  {
                    $unwind: {
                      path: "$mood",
                      preserveNullAndEmptyArrays: true
                    }
                  }
                ],

              }
            },
            {
              $skip: skip
            },
            {
              $limit: row
            },
            {
              $unwind: {
                path: "$media",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$username",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$music",
                preserveNullAndEmptyArrays: true
              }
            },
            // {
            //   $unwind: {
            //     path: "$cats",
            //     preserveNullAndEmptyArrays: true
            //   }
            // },
            {
              $project: {
                "musicTitle": "$music.musicTitle",
                "postID": 1,
                "artistName": "$music.artistName",
                "albumName": "$music.albumName",
                "apsaraMusic": "$music.apsaraMusic",
                "apsaraThumnail": "$music.apsaraThumnail",
                "genre": "$music.genre.name",
                "theme": "$music.theme.name",
                "mood": "$music.mood.name",
                "testDate": 1,
                "musicId": 1,
                "music": 1,
                "tagPeople": "$userTag",
                "mediaType": "$media.mediaType",
                "email": 1,
                "postType": 1,
                "description": 1,
                "active": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "expiration": 1,
                "visibility": 1,
                "location": 1,
                "tags": 1,
                "allowComments": 1,
                "isSafe": 1,
                "isOwned": 1,
                "certified": 1,
                "saleAmount": 1,
                "saleLike": 1,
                "saleView": 1,
                "isShared": 1,
                "insight": [
                  {
                    "likes": "$likes",
                    "views": "$views",
                    "shares": "$shares",
                    "comments": "$comments",

                  }
                ],
                "userProfile": 1,
                "contentMedias": 1,
                "category": "$cats",
                "tagDescription": 1,
                "metadata": 1,
                "boostDate": 1,
                "end": "$boosted.boostSession.end",
                "start": "$boosted.boostSession.start",
                "isBoost": 1,
                "boostViewer": 1,
                "boostCount": 1,
                "boosted":
                  [{
                    $cond: {
                      if: {
                        $gt: [{
                          "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                              $add: [new Date(), 25200000]
                            }
                          }
                        }, "$boosted.boostSession.end"]
                      },
                      then: "$kampretTaslim",
                      else: '$boosted'
                    }
                  }],
                "contentModeration": 1,
                "reportedStatus": 1,
                "reportedUserCount": 1,
                "contentModerationResponse": 1,
                "reportedUser": 1,
                "timeStart": 1,
                "timeEnd": 1,
                "apsara": "$media.apsara",
                "apsaraId": "$media.apsaraId",
                "apsaraThumbId": "$media.apsaraThumbId",
                "mediaEndpoint": "$media.mediaEndpoint",
                "mediaUri": "$media.mediaUri",
                "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
                "mediaThumbUri": "$media.mediaThumbUri",
                "fullName": "$userBasic.fullName",
                "username": "$username.username",
                "avatar": 1,
                "statusCB": 1,
                "privacy": [{
                  "isCelebrity": "$userBasic.isCelebrity"
                }, {
                  "isIdVerified": "$userBasic.isIdVerified"
                }, {
                  "isPrivate": "$userBasic.isPrivate"
                }]
              }
            }
          ],
          //video
          "video": [
            {
              $sort: {
                "isBoost": - 1,
                "createdAt": - 1
              }
            },
            {
              $match:
              {
                $or: [
                  {
                    $and: [
                      {
                        "reportedStatus": {
                          $ne: "OWNED"
                        }
                      },
                      {
                        "visibility": "PUBLIC"
                      },
                      {
                        "active": true
                      },
                      {
                        "postType": "vid"
                      },
                      {
                        $expr: {
                          $lte: ["$boosted.boostSession.start", "$testDate",]
                        }
                      },
                      {
                        $expr: {
                          $gt: ["$boosted.boostSession.end", "$testDate",]
                        }
                      },
                      {
                        $expr: {
                          $lte: ["$timeStart", "$testDate",]
                        }
                      },
                      {
                        $expr: {
                          $gt: ["$timeEnd", "$testDate",]
                        }
                      },
                      {

                        "timeStart": {
                          $ne: null
                        }
                      },
                      {

                        "timeEnd": {
                          $ne: null
                        }
                      },
                      {
                        $or: [
                          {
                            "reportedUser": {
                              "$elemMatch": {
                                "email": profile.email,
                                "active": false,

                              }
                            }
                          },
                          {
                            "reportedUser.email": {
                              $not: {
                                $regex: profile.email
                              }
                            }
                          },

                        ]
                      },
                      {
                        $or: [
                          {
                            $or: [
                              {
                                "boosted.boostViewer": {
                                  "$elemMatch": {
                                    "email": profile.email,
                                    "isLast": true,
                                    "timeEnd": {
                                      $lte: stoday
                                    }
                                  }
                                }
                              },
                              {
                                $and: [
                                  {
                                    "boosted.boostViewer.email": {
                                      $ne: profile.email
                                    }
                                  },

                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    $and: [
                      {
                        "reportedStatus": {
                          $ne: "OWNED"
                        }
                      },
                      {
                        "visibility": "PUBLIC"
                      },
                      {
                        "active": true
                      },
                      {
                        "postType": "vid"
                      },
                      {
                        "timeStart": null
                      },
                      {
                        $or: [
                          {
                            "reportedUser": {
                              "$elemMatch": {
                                "email": profile.email,
                                "active": false,

                              }
                            }
                          },
                          {
                            "reportedUser.email": {
                              $not: {
                                $regex: profile.email,
                              }
                            }
                          },

                        ]
                      },

                    ]
                  },

                ]
              }
            },
            {
              "$lookup": {
                from: "mediavideos",
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
                      "mediaUri": 1,
                      "mediaEndpoint": {
                        "$concat": ["/stream/", "$mediaUri"]
                      },
                      "mediaThumbEndpoint": {
                        "$concat": ["/thumb/", "$postID"]
                      },
                      "mediaThumbUri": "$mediaThumb",
                      "mediaType": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "interests_repo",
                as: "cats",
                let: {
                  localID: '$category.$id'
                },
                pipeline: [
                  {
                    $match: {

                      $expr: {
                        $and: [
                          {
                            $in: ['$_id', {
                              $ifNull: ['$$localID', []]
                            }]
                          },

                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      "interestName": 1,
                      "langIso": 1,
                      "icon": 1,
                      "createdAt": 1,
                      "updatedAt": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "userTag",
                let: {
                  localID: '$tagPeople.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      }
                    }
                  },
                  {
                    $project: {

                      "username": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "username",
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

                      "username": 1
                    }
                  }
                ],

              }
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
            {
              $unwind: {
                path: "$userBasic",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "mediaprofilepicts",
                as: "avatar",
                let: {
                  localID: '$userBasic.profilePict.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $eq: ['$mediaID', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      "mediaBasePath": 1,
                      "mediaUri": 1,
                      "originalName": 1,
                      "fsSourceUri": 1,
                      "fsSourceName": 1,
                      "fsTargetUri": 1,
                      "mediaType": 1,
                      "mediaEndpoint": {
                        "$concat": ["/profilepict/", "$mediaID"]
                      }
                    }
                  }
                ],

              }
            },
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
                      "musicTitle": 1,
                      "artistName": 1,
                      "albumName": 1,
                      "apsaraMusic": 1,
                      "apsaraThumnail": 1,
                      "genre": "$genre.name",
                      "theme": "$theme.name",
                      "mood": "$mood.name",

                    }
                  },
                  {
                    $unwind: {
                      path: "$genre",
                      preserveNullAndEmptyArrays: true
                    }
                  },
                  {
                    $unwind: {
                      path: "$theme",
                      preserveNullAndEmptyArrays: true
                    }
                  },
                  {
                    $unwind: {
                      path: "$mood",
                      preserveNullAndEmptyArrays: true
                    }
                  }
                ],

              }
            },
            {
              $skip: skip
            },
            {
              $limit: row
            },
            {
              $unwind: {
                path: "$media",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$username",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                "musicTitle": "$music.musicTitle",
                "postID": 1,
                "artistName": "$music.artistName",
                "albumName": "$music.albumName",
                "apsaraMusic": "$music.apsaraMusic",
                "apsaraThumnail": "$music.apsaraThumnail",
                "genre": "$music.genre.name",
                "theme": "$music.theme.name",
                "mood": "$music.mood.name",
                "testDate": 1,
                "musicId": 1,
                "music": 1,
                "tagPeople": "$userTag",
                "mediaType": "$media.mediaType",
                "email": 1,
                "postType": 1,
                "description": 1,
                "active": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "expiration": 1,
                "visibility": 1,
                "location": 1,
                "tags": 1,
                "allowComments": 1,
                "isSafe": 1,
                "isOwned": 1,
                "certified": 1,
                "saleAmount": 1,
                "saleLike": 1,
                "saleView": 1,
                "isShared": 1,
                "userProfile": 1,
                "contentMedias": 1,
                "category": "$cats",
                "tagDescription": 1,
                "metadata": 1,
                "boostDate": 1,
                "end": "$boosted.boostSession.end",
                "start": "$boosted.boostSession.start",
                "isBoost": 1,
                "boostViewer": 1,
                "boostCount": 1,
                "boosted":
                  [{
                    $cond: {
                      if: {
                        $gt: [{
                          "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                              $add: [new Date(), 25200000]
                            }
                          }
                        }, "$boosted.boostSession.end"]
                      },
                      then: "$kampretTaslim",
                      else: '$boosted'
                    }
                  }],
                "contentModeration": 1,
                "reportedStatus": 1,
                "reportedUserCount": 1,
                "contentModerationResponse": 1,
                "reportedUser": 1,
                "timeStart": 1,
                "timeEnd": 1,
                "apsara": "$media.apsara",
                "apsaraId": "$media.apsaraId",
                "apsaraThumbId": "$media.apsaraThumbId",
                "mediaEndpoint": "$media.mediaEndpoint",
                "mediaUri": "$media.mediaUri",
                "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
                "mediaThumbUri": "$media.mediaThumbUri",
                "insight": [
                  {
                    "likes": "$likes",
                    "views": "$views",
                    "shares": "$shares",
                    "comments": "$comments",

                  }
                ],
                "fullName": "$userBasic.fullName",
                "username": "$username.username",
                "avatar": 1,
                "statusCB": 1,
                "privacy": [{
                  "isCelebrity": "$userBasic.isCelebrity"
                }, {
                  "isIdVerified": "$userBasic.isIdVerified"
                }, {
                  "isPrivate": "$userBasic.isPrivate"
                }]
              }
            }
          ],
          //diary
          "diary": [
            {
              $sort: {
                "isBoost": - 1,
                "createdAt": - 1
              }
            },
            {
              $match:
              {
                $or: [
                  {
                    $and: [
                      {
                        "reportedStatus": {
                          $ne: "OWNED"
                        }
                      },
                      {
                        "visibility": "PUBLIC"
                      },
                      {
                        "active": true
                      },
                      {
                        "postType": "diary"
                      },
                      {
                        $expr: {
                          $lte: ["$boosted.boostSession.start", "$testDate",]
                        }
                      },
                      {
                        $expr: {
                          $gt: ["$boosted.boostSession.end", "$testDate",]
                        }
                      },
                      // {
                      //   $expr: {
                      //     $lte: ["$timeStart", "$testDate",]
                      //   }
                      // },
                      // {
                      //   $expr: {
                      //     $gt: ["$timeEnd", "$testDate",]
                      //   }
                      // },
                      {

                        "timeStart": {
                          $ne: null
                        }
                      },
                      {

                        "timeEnd": {
                          $ne: null
                        }
                      },
                      {
                        $or: [
                          {
                            "reportedUser": {
                              "$elemMatch": {
                                "email": profile.email,
                                "active": false,

                              }
                            }
                          },
                          {
                            "reportedUser.email": {
                              $not: {
                                $regex: profile.email
                              }
                            }
                          },

                        ]
                      },
                      {
                        $or: [
                          {
                            $or: [
                              {
                                "boosted.boostViewer": {
                                  "$elemMatch": {
                                    "email": profile.email,
                                    "isLast": true,
                                    "timeEnd": {
                                      $lte: stoday
                                    }
                                  }
                                }
                              },
                              {
                                $and: [
                                  {
                                    "boosted.boostViewer.email": {
                                      $ne: profile.email
                                    }
                                  },

                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    $and: [
                      {
                        "reportedStatus": {
                          $ne: "OWNED"
                        }
                      },
                      {
                        "visibility": "PUBLIC"
                      },
                      {
                        "active": true
                      },
                      {
                        "postType": "diary"
                      },
                      {
                        "timeStart": null
                      },
                      {
                        $or: [
                          {
                            "reportedUser": {
                              "$elemMatch": {
                                "email": profile.email,
                                "active": false,

                              }
                            }
                          },
                          {
                            "reportedUser.email": {
                              $not: {
                                $regex: profile.email,
                              }
                            }
                          },

                        ]
                      },

                    ]
                  },

                ]
              }
            },
            {
              "$lookup": {
                from: "mediadiaries",
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
                      "mediaUri": 1,
                      "mediaEndpoint": {
                        "$concat": ["/stream/", "$mediaUri"]
                      },
                      "mediaThumbEndpoint": {
                        "$concat": ["/thumb/", "$postID"]
                      },
                      "mediaThumbUri": "$mediaThumb",
                      "mediaType": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "interests_repo",
                as: "cats",
                let: {
                  localID: '$category.$id'
                },
                pipeline: [
                  {
                    $match: {

                      $expr: {
                        $and: [
                          {
                            $in: ['$_id', {
                              $ifNull: ['$$localID', []]
                            }]
                          },

                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      "interestName": 1,
                      "langIso": 1,
                      "icon": 1,
                      "createdAt": 1,
                      "updatedAt": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "userTag",
                let: {
                  localID: '$tagPeople.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      }
                    }
                  },
                  {
                    $project: {

                      "username": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "username",
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

                      "username": 1
                    }
                  }
                ],

              }
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
            {
              $unwind: {
                path: "$userBasic",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "mediaprofilepicts",
                as: "avatar",
                let: {
                  localID: '$userBasic.profilePict.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $eq: ['$mediaID', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      "mediaBasePath": 1,
                      "mediaUri": 1,
                      "originalName": 1,
                      "fsSourceUri": 1,
                      "fsSourceName": 1,
                      "fsTargetUri": 1,
                      "mediaType": 1,
                      "mediaEndpoint": {
                        "$concat": ["/profilepict/", "$mediaID"]
                      }
                    }
                  }
                ],

              }
            },
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
                      "musicTitle": 1,
                      "artistName": 1,
                      "albumName": 1,
                      "apsaraMusic": 1,
                      "apsaraThumnail": 1,
                      "genre": "$genre.name",
                      "theme": "$theme.name",
                      "mood": "$mood.name",

                    }
                  },
                  {
                    $unwind: {
                      path: "$genre",
                      preserveNullAndEmptyArrays: true
                    }
                  },
                  {
                    $unwind: {
                      path: "$theme",
                      preserveNullAndEmptyArrays: true
                    }
                  },
                  {
                    $unwind: {
                      path: "$mood",
                      preserveNullAndEmptyArrays: true
                    }
                  }
                ],

              }
            },
            {
              $skip: skip
            },
            {
              $limit: row
            },
            {
              $unwind: {
                path: "$media",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$username",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                "musicTitle": "$music.musicTitle",
                "postID": 1,
                "artistName": "$music.artistName",
                "albumName": "$music.albumName",
                "apsaraMusic": "$music.apsaraMusic",
                "apsaraThumnail": "$music.apsaraThumnail",
                "genre": "$music.genre.name",
                "theme": "$music.theme.name",
                "mood": "$music.mood.name",
                "testDate": 1,
                "musicId": 1,
                "music": 1,
                "tagPeople": "$userTag",
                "mediaType": "$media.mediaType",
                "email": 1,
                "postType": 1,
                "description": 1,
                "active": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "expiration": 1,
                "visibility": 1,
                "location": 1,
                "tags": 1,
                "allowComments": 1,
                "isSafe": 1,
                "isOwned": 1,
                "certified": 1,
                "saleAmount": 1,
                "saleLike": 1,
                "saleView": 1,
                "isShared": 1,
                "userProfile": 1,
                "contentMedias": 1,
                "category": "$cats",
                "tagDescription": 1,
                "metadata": 1,
                "boostDate": 1,
                "end": "$boosted.boostSession.end",
                "start": "$boosted.boostSession.start",
                "isBoost": 1,
                "boostViewer": 1,
                "boostCount": 1,
                "boosted":
                  [{
                    $cond: {
                      if: {
                        $gt: [{
                          "$dateToString": {
                            "format": "%Y-%m-%d %H:%M:%S",
                            "date": {
                              $add: [new Date(), 25200000]
                            }
                          }
                        }, "$boosted.boostSession.end"]
                      },
                      then: "$kampretTaslim",
                      else: '$boosted'
                    }
                  }],
                "contentModeration": 1,
                "reportedStatus": 1,
                "reportedUserCount": 1,
                "contentModerationResponse": 1,
                "reportedUser": 1,
                "timeStart": 1,
                "timeEnd": 1,
                "apsara": "$media.apsara",
                "apsaraId": "$media.apsaraId",
                "apsaraThumbId": "$media.apsaraThumbId",
                "mediaEndpoint": "$media.mediaEndpoint",
                "mediaUri": "$media.mediaUri",
                "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
                "mediaThumbUri": "$media.mediaThumbUri",
                "insight": [
                  {
                    "likes": "$likes",
                    "views": "$views",
                    "shares": "$shares",
                    "comments": "$comments",

                  }
                ],
                "fullName": "$userBasic.fullName",
                "username": "$username.username",
                "avatar": 1,
                "statusCB": 1,
                "privacy": [{
                  "isCelebrity": "$userBasic.isCelebrity"
                }, {
                  "isIdVerified": "$userBasic.isIdVerified"
                }, {
                  "isPrivate": "$userBasic.isPrivate"
                }]
              }
            }
          ],
          //story
          // "story": [
          //   {
          //     $sort: {
          //       "isBoost": - 1,
          //       "createdAt": - 1
          //     }
          //   },
          //   {
          //     $match:
          //     {
          //       $or: [
          //         {
          //           $and: [
          //             {
          //               "email": {
          //                 $not: {
          //                   $regex: profile.email
          //                 }
          //               }
          //             },
          //             {
          //               "reportedStatus": {
          //                 $ne: "OWNED"
          //               }
          //             },
          //             {
          //               "visibility": "PUBLIC"
          //             },
          //             {
          //               "active": true
          //             },
          //             {
          //               "postType": "story"
          //             },
          //             {
          //               $expr: {
          //                 $gte: ["$createdAt", "$storyDate",]
          //               }
          //             },
          //             {
          //               $or: [
          //                 {
          //                   "reportedUser": {
          //                     "$elemMatch": {
          //                       "email": profile.email,
          //                       "active": false,

          //                     }
          //                   }
          //                 },
          //                 {
          //                   "reportedUser.email": {
          //                     $not: {
          //                       $regex: profile.email,
          //                     }
          //                   }
          //                 },

          //               ]
          //             },

          //           ]
          //         },

          //       ]
          //     }
          //   },
          //   {
          //     "$lookup": {
          //       from: "mediastories",
          //       as: "media",
          //       let: {
          //         localID: '$postID'
          //       },
          //       pipeline: [
          //         {
          //           $match:
          //           {


          //             $expr: {
          //               $eq: ['$postID', '$$localID']
          //             }
          //           }
          //         },
          //         {
          //           $project: {

          //             "apsara": 1,
          //             "apsaraId": 1,
          //             "apsaraThumbId": 1,
          //             "mediaEndpoint": 1,
          //             "mediaUri": 1,
          //             "mediaThumbEndpoint": 1,
          //             "mediaThumbUri": 1,
          //             "mediaType": 1,

          //           }
          //         }
          //       ],

          //     },

          //   },
          //   {
          //     "$lookup": {
          //       from: "interests_repo",
          //       as: "cats",
          //       let: {
          //         localID: '$category.$id'
          //       },
          //       pipeline: [
          //         {
          //           $match: {

          //             $expr: {
          //               $and: [
          //                 {
          //                   $in: ['$_id', {
          //                     $ifNull: ['$$localID', []]
          //                   }]
          //                 },

          //               ]
          //             }
          //           }
          //         },
          //         {
          //           $project: {
          //             "interestName": 1,
          //             "langIso": 1,
          //             "icon": 1,
          //             "createdAt": 1,
          //             "updatedAt": 1
          //           }
          //         }
          //       ],

          //     }
          //   },
          //   {
          //     "$lookup": {
          //       from: "userauths",
          //       as: "userTag",
          //       let: {
          //         localID: '$tagPeople.$id'
          //       },
          //       pipeline: [
          //         {
          //           $match:
          //           {


          //             $expr: {
          //               $in: ['$_id', {
          //                 $ifNull: ['$$localID', []]
          //               }]
          //             }
          //           }
          //         },
          //         {
          //           $project: {

          //             "username": 1
          //           }
          //         }
          //       ],

          //     }
          //   },
          //   {
          //     "$lookup": {
          //       from: "userauths",
          //       as: "username",
          //       let: {
          //         localID: '$email'
          //       },
          //       pipeline: [
          //         {
          //           $match:
          //           {


          //             $expr: {
          //               $eq: ['$email', '$$localID']
          //             }
          //           }
          //         },
          //         {
          //           $project: {

          //             "username": 1
          //           }
          //         }
          //       ],

          //     }
          //   },
          //   {
          //     "$lookup": {
          //       from: "userbasics",
          //       as: "userBasic",
          //       let: {
          //         localID: '$email'
          //       },
          //       pipeline: [
          //         {
          //           $match:
          //           {


          //             $expr: {
          //               $eq: ['$email', '$$localID']
          //             }
          //           }
          //         },
          //         {
          //           $project: {
          //             "fullName": 1,
          //             "profilePict": 1,
          //             "isCelebrity": 1,
          //             "isIdVerified": 1,
          //             "isPrivate": 1,

          //           }
          //         }
          //       ],

          //     }
          //   },
          //   {
          //     $unwind: {
          //       path: "$userBasic",
          //       preserveNullAndEmptyArrays: true
          //     }
          //   },
          //   {
          //     "$lookup": {
          //       from: "mediaprofilepicts",
          //       as: "avatar",
          //       let: {
          //         localID: '$userBasic.profilePict.$id'
          //       },
          //       pipeline: [
          //         {
          //           $match:
          //           {


          //             $expr: {
          //               $eq: ['$mediaID', '$$localID']
          //             }
          //           }
          //         },
          //         {
          //           $project: {
          //             "mediaBasePath": 1,
          //             "mediaUri": 1,
          //             "originalName": 1,
          //             "fsSourceUri": 1,
          //             "fsSourceName": 1,
          //             "fsTargetUri": 1,
          //             "mediaType": 1,
          //             "mediaEndpoint": {
          //               "$concat": ["/profilepict/", "$mediaID"]
          //             }
          //           }
          //         }
          //       ],

          //     }
          //   },
          //   {
          //     "$lookup": {
          //       from: "mediamusic",
          //       as: "music",
          //       let: {
          //         localID: '$musicId'
          //       },
          //       pipeline: [
          //         {
          //           $match:
          //           {
          //             $expr: {
          //               $eq: ['$_id', '$$localID']
          //             }
          //           }
          //         },
          //         {
          //           $project: {
          //             "musicTitle": 1,
          //             "artistName": 1,
          //             "albumName": 1,
          //             "apsaraMusic": 1,
          //             "apsaraThumnail": 1,
          //             "genre": "$genre.name",
          //             "theme": "$theme.name",
          //             "mood": "$mood.name",

          //           }
          //         }
          //       ],

          //     }
          //   },
          //   {
          //     $skip: skip
          //   },
          //   {
          //     $limit: row
          //   },
          //   {
          //     $unwind: {
          //       path: "$media",
          //       preserveNullAndEmptyArrays: true
          //     }
          //   },
          //   {
          //     $unwind: {
          //       path: "$username",
          //       preserveNullAndEmptyArrays: true
          //     }
          //   },
          //   {
          //     $project: {
          //       "storyDate": 1,
          //       "postID": 1,
          //       "musicTitle": "$music.musicTitle",
          //       "artistName": "$music.artistName",
          //       "albumName": "$music.albumName",
          //       "apsaraMusic": "$music.apsaraMusic",
          //       "apsaraThumnail": "$music.apsaraThumnail",
          //       "genre": "$music.genre.name",
          //       "theme": "$music.theme.name",
          //       "mood": "$music.mood.name",
          //       "testDate": 1,
          //       "musicId": 1,
          //       "music": 1,
          //       "tagPeople": "$userTag",
          //       "mediaType": "$media.mediaType",
          //       "email": 1,
          //       "postType": 1,
          //       "description": 1,
          //       "active": 1,
          //       "createdAt": 1,
          //       "updatedAt": 1,
          //       "expiration": 1,
          //       "visibility": 1,
          //       "location": 1,
          //       "tags": 1,
          //       "allowComments": 1,
          //       "isSafe": 1,
          //       "isOwned": 1,
          //       "certified": 1,
          //       "saleAmount": 1,
          //       "saleLike": 1,
          //       "saleView": 1,
          //       "isShared": 1,
          //       "userProfile": 1,
          //       "contentMedias": 1,
          //       "category": "$cats",
          //       "tagDescription": 1,
          //       "metadata": 1,
          //       "boostDate": 1,
          //       "boosted":
          //         [{
          //           $cond: {
          //             if: {
          //               $gt: [{
          //                 "$dateToString": {
          //                   "format": "%Y-%m-%d %H:%M:%S",
          //                   "date": {
          //                     $add: [new Date(), 25200000]
          //                   }
          //                 }
          //               }, "$boosted.boostSession.end"]
          //             },
          //             then: "$kampretTaslim",
          //             else: '$boosted'
          //           }
          //         }],
          //       "end": "$boosted.boostSession.end",
          //       "start": "$boosted.boostSession.start",
          //       "isBoost": 1,
          //       "boostViewer": 1,
          //       "boostCount": 1,
          //       "contentModeration": 1,
          //       "reportedStatus": 1,
          //       "reportedUserCount": 1,
          //       "contentModerationResponse": 1,
          //       "reportedUser": 1,
          //       "timeStart": 1,
          //       "timeEnd": 1,
          //       "apsara": "$media.apsara",
          //       "apsaraId": "$media.apsaraId",
          //       "apsaraThumbId": "$media.apsaraThumbId",
          //       "mediaEndpoint": "$media.mediaEndpoint",
          //       "mediaUri": "$media.mediaUri",
          //       "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
          //       "mediaThumbUri": "$media.mediaThumbUri",
          //       "insight": [
          //         {
          //           "likes": "$likes",
          //           "views": "$views",
          //           "shares": "$shares",
          //           "comments": "$comments",

          //         }
          //       ],
          //       "fullName": "$userBasic.fullName",
          //       "username": "$username.username",
          //       "avatar": 1,
          //       "statusCB": 1,
          //       "privacy": [{
          //         "isCelebrity": "$userBasic.isCelebrity"
          //       }, {
          //         "isIdVerified": "$userBasic.isIdVerified"
          //       }, {
          //         "isPrivate": "$userBasic.isPrivate"
          //       }]
          //     }
          //   }
          // ],

        }
      },
      {
        "$lookup": {
          from: "contentevents",
          as: "isLike",
          let: {
            picts: '$pict.postID',
            vids: '$video.postID',
            diarys: '$diary.postID',
            //  storys: '$story.postID',

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
                          $in: ['$postID', '$$picts']
                        }
                      },
                      {
                        "email": profile.email,
                      },
                      {
                        "eventType": "LIKE"
                      },
                      {
                        "active": true
                      },

                    ]
                  },
                  {
                    $and: [
                      {
                        $expr: {
                          $in: ['$postID', '$$vids']
                        }
                      },
                      {
                        "email": profile.email,
                      },
                      {
                        "eventType": "LIKE"
                      },
                      {
                        "active": true
                      }
                    ]
                  },
                  // {
                  //   $and: [
                  //     {
                  //       $expr: {
                  //         $in: ['$postID', '$$storys']
                  //       }
                  //     },
                  //     {
                  //       "email": profile.email,
                  //     },
                  //     {
                  //       "eventType": "LIKE"
                  //     }
                  //   ]
                  // },
                  {
                    $and: [
                      {
                        $expr: {
                          $in: ['$postID', '$$diarys']
                        }
                      },
                      {
                        "email": profile.email,
                      },
                      {
                        "eventType": "LIKE"
                      },
                      {
                        "active": true
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
        "$lookup": {
          from: "contentevents",
          as: "isView",
          let: {
            picts: '$pict.postID',
            vids: '$video.postID',
            diarys: '$diary.postID',
            // storys: '$story.postID',

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
                          $in: ['$postID', '$$picts']
                        }
                      },
                      {
                        "email": profile.email,
                      },
                      {
                        "eventType": "VIEW"
                      }
                    ]
                  },
                  {
                    $and: [
                      {
                        $expr: {
                          $in: ['$postID', '$$vids']
                        }
                      },
                      {
                        "email": profile.email,
                      },
                      {
                        "eventType": "VIEW"
                      }
                    ]
                  },
                  // {
                  //   $and: [
                  //     {
                  //       $expr: {
                  //         $in: ['$postID', '$$storys']
                  //       }
                  //     },
                  //     {
                  //       "email": profile.email,
                  //     },
                  //     {
                  //       "eventType": "VIEW"
                  //     }
                  //   ]
                  // },
                  {
                    $and: [
                      {
                        $expr: {
                          $in: ['$postID', '$$diarys']
                        }
                      },
                      {
                        "email": profile.email,
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


    ]).exec();
  }

  private buildQueryPrivate(profile: Userbasic, vis: string, stoday: string, skip: number, row: number) {
    return this.PostsModel.aggregate([

      {
        $facet: {

          //pict
          "pict": [
            {
              $sort: {
                "createdAt": - 1
              }
            },
            {
              $match:
              {
                $and: [
                  {
                    "email": profile.email
                  },
                  {
                    $or: [
                      {
                        "reportedStatus": "ALL"
                      },
                      {
                        "reportedStatus": null
                      },

                    ]
                  },
                  // {
                  //   "visibility": "PUBLIC"
                  // },
                  {
                    "active": true
                  },
                  {
                    "postType": "pict"
                  },
                  {
                    "reportedUser.email": {
                      $not: {
                        $regex: profile.email
                      }
                    }
                  },

                ]
              }
            },
            {
              "$lookup": {
                from: "mediapicts",
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
                      "mediaType": 1
                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "interests_repo",
                as: "cats",
                let: {
                  localID: '$category.$id'
                },
                pipeline: [
                  {
                    $match: {

                      $expr: {
                        $and: [
                          {
                            $in: ['$_id', {
                              $ifNull: ['$$localID', []]
                            }]
                          },

                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      "interestName": 1,
                      "langIso": 1,
                      "icon": 1,
                      "createdAt": 1,
                      "updatedAt": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "userTag",
                let: {
                  localID: '$tagPeople.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      }
                    }
                  },
                  {
                    $project: {

                      "username": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "username",
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

                      "username": 1
                    }
                  }
                ],

              }
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
            {
              $unwind: {
                path: "$userBasic",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "mediaprofilepicts",
                as: "avatar",
                let: {
                  localID: '$userBasic.profilePict.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $eq: ['$mediaID', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      "mediaBasePath": 1,
                      "mediaUri": 1,
                      "originalName": 1,
                      "fsSourceUri": 1,
                      "fsSourceName": 1,
                      "fsTargetUri": 1,
                      "mediaType": 1,
                      "mediaEndpoint": {
                        "$concat": ["/profilepict/", "$_id"]
                      }

                    }
                  }
                ],

              }
            },
            {
              $skip: skip
            },
            {
              $limit: row
            },
            {
              $unwind: {
                path: "$media",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$username",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "contentevents",
                as: "isLike",
                let: {
                  localID: '$postID'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $eq: ['$postID', '$$localID']
                          }
                        },
                        {
                          "email": profile.email
                        },
                        {
                          "eventType": "LIKE"
                        }
                      ]
                    }
                  },
                  {
                    $project: {
                      "email": 1,

                    }
                  }
                ],

              }
            },
            {
              $project: {
                "postID": 1,
                "isLike": "$isLike",
                "tagPeople": "$userTag",
                "mediaType": "$media.mediaType",
                "email": 1,
                "postType": 1,
                "description": 1,
                "active": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "expiration": 1,
                "visibility": 1,
                "location": 1,
                "tags": 1,
                "allowComments": 1,
                "isSafe": 1,
                "isOwned": 1,
                "certified": 1,
                "saleAmount": 1,
                "saleLike": 1,
                "saleView": 1,
                "isShared": 1,
                "likes": 1,
                "views": 1,
                "shares": 1,
                "userProfile": 1,
                "contentMedias": 1,
                "category": "$cats",
                "tagDescription": 1,
                "metadata": 1,
                "boostDate": 1,
                "boostInterval": 1,
                "boostSession": 1,
                "boosted":
                {
                  $cond: {
                    if: {
                      $gt: [{
                        "$dateToString": {
                          "format": "%Y-%m-%d %H:%M:%S",
                          "date": {
                            $add: [new Date(), 25200000]
                          }
                        }
                      }, "$boosted.boostSession.end"]
                    },
                    then: "$kampretTaslim",
                    else: '$boosted'
                  }
                },
                "isBoost": 1,
                "boostViewer": 1,
                "boostCount": 1,
                "contentModeration": 1,
                "reportedStatus": 1,
                "reportedUserCount": 1,
                "contentModerationResponse": 1,
                "reportedUser": 1,
                "timeStart": 1,
                "timeEnd": 1,
                "apsara": "$media.apsara",
                "apsaraId": "$media.apsaraId",
                "apsaraThumbId": "$media.apsaraThumbId",
                "mediaEndpoint": "$media.mediaEndpoint",
                "mediaUri": "$media.mediaUri",
                "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
                "mediaThumbUri": "$media.mediaThumbUri",
                "insight": [
                  {
                    "likes": "$likes",
                    "views": "$views",
                    "shares": "$shares",
                    "comments": "$comments",
                  }
                ],
                "fullName": "$userBasic.fullName",
                "username": "$username.username",
                "avatar": 1,
                "privacy": [{
                  "isCelebrity": "$userBasic.isCelebrity"
                }, {
                  "isIdVerified": "$userBasic.isIdVerified"
                }, {
                  "isPrivate": "$userBasic.isPrivate"
                }]
              },

            }
          ],
          //vid
          "video": [
            {
              $sort: {
                "createdAt": - 1
              }
            },
            {
              $match:
              {
                $and: [
                  {
                    "email": profile.email
                  },
                  {
                    $or: [
                      {
                        "reportedStatus": "ALL"
                      },
                      {
                        "reportedStatus": null
                      },

                    ]
                  },
                  // {
                  //   "visibility": "PUBLIC"
                  // },
                  {
                    "active": true
                  },
                  {
                    "postType": "vid"
                  },
                  {
                    "reportedUser.email": {
                      $not: {
                        $regex: profile.email
                      }
                    }
                  },

                ]
              }
            },
            {
              "$lookup": {
                from: "mediavideos",
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
                      "mediaType": 1


                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "interests_repo",
                as: "cats",
                let: {
                  localID: '$category.$id'
                },
                pipeline: [
                  {
                    $match: {

                      $expr: {
                        $and: [
                          {
                            $in: ['$_id', {
                              $ifNull: ['$$localID', []]
                            }]
                          },

                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      "interestName": 1,
                      "langIso": 1,
                      "icon": 1,
                      "createdAt": 1,
                      "updatedAt": 1
                    }
                  }
                ],

              }
            },

            {
              "$lookup": {
                from: "userauths",
                as: "userTag",
                let: {
                  localID: '$tagPeople.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      }
                    }
                  },
                  {
                    $project: {

                      "username": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "username",
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

                      "username": 1
                    }
                  }
                ],

              }
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
            {
              $unwind: {
                path: "$userBasic",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "mediaprofilepicts",
                as: "avatar",
                let: {
                  localID: '$userBasic.profilePict.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $eq: ['$mediaID', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      "mediaBasePath": 1,
                      "mediaUri": 1,
                      "originalName": 1,
                      "fsSourceUri": 1,
                      "fsSourceName": 1,
                      "fsTargetUri": 1,
                      "mediaType": 1,
                      "mediaEndpoint": {
                        "$concat": ["/profilepict/", "$_id"]
                      }

                    }
                  }
                ],

              }
            },
            {
              $skip: skip
            },
            {
              $limit: row
            },
            {
              $unwind: {
                path: "$media",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$username",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "contentevents",
                as: "isLike",
                let: {
                  localID: '$postID'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $eq: ['$postID', '$$localID']
                          }
                        },
                        {
                          "email": profile.email
                        },
                        {
                          "eventType": "LIKE"
                        }
                      ]
                    }
                  },
                  {
                    $project: {
                      "email": 1,

                    }
                  }
                ],

              }
            },
            {
              $project: {
                "postID": 1,
                "isLike": "$isLike",
                "tagPeople": "$userTag",
                "mediaType": "$media.mediaType",
                "email": 1,
                "postType": 1,
                "description": 1,
                "active": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "expiration": 1,
                "visibility": 1,
                "location": 1,
                "tags": 1,
                "allowComments": 1,
                "isSafe": 1,
                "isOwned": 1,
                "certified": 1,
                "saleAmount": 1,
                "saleLike": 1,
                "saleView": 1,
                "isShared": 1,
                "boosted":
                {
                  $cond: {
                    if: {
                      $gt: [{
                        "$dateToString": {
                          "format": "%Y-%m-%d %H:%M:%S",
                          "date": {
                            $add: [new Date(), 25200000]
                          }
                        }
                      }, "$boosted.boostSession.end"]
                    },
                    then: "$kampretTaslim",
                    else: '$boosted'
                  }
                },
                "likes": 1,
                "views": 1,
                "shares": 1,
                "userProfile": 1,
                "contentMedias": 1,
                "category": "$cats",
                "tagDescription": 1,
                "metadata": 1,
                "boostDate": 1,
                "boostInterval": 1,
                "boostSession": 1,
                "isBoost": 1,
                "boostViewer": 1,
                "boostCount": 1,
                "contentModeration": 1,
                "reportedStatus": 1,
                "reportedUserCount": 1,
                "contentModerationResponse": 1,
                "reportedUser": 1,
                "timeStart": 1,
                "timeEnd": 1,
                "apsara": "$media.apsara",
                "apsaraId": "$media.apsaraId",
                "apsaraThumbId": "$media.apsaraThumbId",
                "mediaEndpoint": "$media.mediaEndpoint",
                "mediaUri": "$media.mediaUri",
                "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
                "mediaThumbUri": "$media.mediaThumbUri",
                "insight": [
                  {
                    "likes": "$likes",
                    "views": "$views",
                    "shares": "$shares",
                    "comments": "$comments",
                  }
                ],
                "fullName": "$userBasic.fullName",
                "username": "$username.username",
                "avatar": 1,
                "privacy": [{
                  "isCelebrity": "$userBasic.isCelebrity"
                }, {
                  "isIdVerified": "$userBasic.isIdVerified"
                }, {
                  "isPrivate": "$userBasic.isPrivate"
                }]
              },

            }
          ],
          //diary
          "diary": [
            {
              $sort: {
                "createdAt": - 1
              }
            },
            {
              $match:
              {
                $and: [
                  {
                    "email": profile.email
                  },
                  {
                    $or: [
                      {
                        "reportedStatus": "ALL"
                      },
                      {
                        "reportedStatus": null
                      },

                    ]
                  },
                  // {
                  //   "visibility": "PUBLIC"
                  // },
                  {
                    "active": true
                  },
                  {
                    "postType": "diary"
                  },
                  {
                    "reportedUser.email": {
                      $not: {
                        $regex: profile.email
                      }
                    }
                  },

                ]
              }
            },
            {
              "$lookup": {
                from: "mediadiaries",
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
                from: "interests_repo",
                as: "cats",
                let: {
                  localID: '$category.$id'
                },
                pipeline: [
                  {
                    $match: {

                      $expr: {
                        $and: [
                          {
                            $in: ['$_id', {
                              $ifNull: ['$$localID', []]
                            }]
                          },

                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      "interestName": 1,
                      "langIso": 1,
                      "icon": 1,
                      "createdAt": 1,
                      "updatedAt": 1
                    }
                  }
                ],

              }
            },

            {
              "$lookup": {
                from: "userauths",
                as: "userTag",
                let: {
                  localID: '$tagPeople.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      }
                    }
                  },
                  {
                    $project: {

                      "username": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "username",
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

                      "username": 1
                    }
                  }
                ],

              }
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
            {
              $unwind: {
                path: "$userBasic",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "mediaprofilepicts",
                as: "avatar",
                let: {
                  localID: '$userBasic.profilePict.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $eq: ['$mediaID', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      "mediaBasePath": 1,
                      "mediaUri": 1,
                      "originalName": 1,
                      "fsSourceUri": 1,
                      "fsSourceName": 1,
                      "fsTargetUri": 1,
                      "mediaType": 1,
                      "mediaEndpoint": {
                        "$concat": ["/profilepict/", "$_id"]
                      }

                    }
                  }
                ],

              }
            },
            {
              $skip: skip
            },
            {
              $limit: row
            },
            {
              $unwind: {
                path: "$media",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$username",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "contentevents",
                as: "isLike",
                let: {
                  localID: '$postID'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $eq: ['$postID', '$$localID']
                          }
                        },
                        {
                          "email": profile.email
                        },
                        {
                          "eventType": "LIKE"
                        }
                      ]
                    }
                  },
                  {
                    $project: {
                      "email": 1,

                    }
                  }
                ],

              }
            },
            {
              $project: {
                "postID": 1,
                "isLike": "$isLike",
                "tagPeople": "$userTag",
                "mediaType": "$media.mediaType",
                "email": 1,
                "postType": 1,
                "description": 1,
                "active": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "expiration": 1,
                "visibility": 1,
                "location": 1,
                "tags": 1,
                "allowComments": 1,
                "isSafe": 1,
                "isOwned": 1,
                "certified": 1,
                "saleAmount": 1,
                "saleLike": 1,
                "saleView": 1,
                "isShared": 1,
                "likes": 1,
                "views": 1,
                "boosted":
                {
                  $cond: {
                    if: {
                      $gt: [{
                        "$dateToString": {
                          "format": "%Y-%m-%d %H:%M:%S",
                          "date": {
                            $add: [new Date(), 25200000]
                          }
                        }
                      }, "$boosted.boostSession.end"]
                    },
                    then: "$kampretTaslim",
                    else: '$boosted'
                  }
                },
                "shares": 1,
                "userProfile": 1,
                "contentMedias": 1,
                "category": "$cats",
                "tagDescription": 1,
                "metadata": 1,
                "boostDate": 1,
                "boostInterval": 1,
                "boostSession": 1,
                "isBoost": 1,
                "boostViewer": 1,
                "boostCount": 1,
                "contentModeration": 1,
                "reportedStatus": 1,
                "reportedUserCount": 1,
                "contentModerationResponse": 1,
                "reportedUser": 1,
                "timeStart": 1,
                "timeEnd": 1,
                "apsara": "$media.apsara",
                "apsaraId": "$media.apsaraId",
                "apsaraThumbId": "$media.apsaraThumbId",
                "mediaEndpoint": "$media.mediaEndpoint",
                "mediaUri": "$media.mediaUri",
                "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
                "mediaThumbUri": "$media.mediaThumbUri",
                "insight": [
                  {
                    "likes": "$likes",
                    "views": "$views",
                    "shares": "$shares",
                    "comments": "$comments",
                  }
                ],
                "fullName": "$userBasic.fullName",
                "username": "$username.username",
                "avatar": 1,
                "privacy": [{
                  "isCelebrity": "$userBasic.isCelebrity"
                }, {
                  "isIdVerified": "$userBasic.isIdVerified"
                }, {
                  "isPrivate": "$userBasic.isPrivate"
                }]
              },

            }
          ],
          //story
          "story": [
            {
              $sort: {
                "createdAt": - 1
              }
            },
            {
              $match:
              {
                $and: [
                  {
                    'email': profile.email
                  },
                  {
                    $or: [
                      {
                        "reportedStatus": "ALL"
                      },
                      {
                        "reportedStatus": null
                      },

                    ]
                  },
                  // {
                  //   "visibility": "PUBLIC"
                  // },
                  {
                    "active": true
                  },
                  {
                    "postType": "story"
                  },
                  {
                    "reportedUser.email": {
                      $not: {
                        $regex: profile.email
                      }
                    }
                  },
                  {
                    "boosted.boostSession.start": {
                      $lte: {
                        $add: [new Date(), 25200000]
                      }
                    }
                  },

                ]
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
                      "mediaType": 1

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "interests_repo",
                as: "cats",
                let: {
                  localID: '$category.$id'
                },
                pipeline: [
                  {
                    $match: {

                      $expr: {
                        $and: [
                          {
                            $in: ['$_id', {
                              $ifNull: ['$$localID', []]
                            }]
                          },

                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      "interestName": 1,
                      "langIso": 1,
                      "icon": 1,
                      "createdAt": 1,
                      "updatedAt": 1
                    }
                  }
                ],

              }
            },

            {
              "$lookup": {
                from: "userauths",
                as: "userTag",
                let: {
                  localID: '$tagPeople.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      }
                    }
                  },
                  {
                    $project: {

                      "username": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "username",
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

                      "username": 1
                    }
                  }
                ],

              }
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
            {
              $unwind: {
                path: "$userBasic",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "mediaprofilepicts",
                as: "avatar",
                let: {
                  localID: '$userBasic.profilePict.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $eq: ['$mediaID', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      "mediaBasePath": 1,
                      "mediaUri": 1,
                      "originalName": 1,
                      "fsSourceUri": 1,
                      "fsSourceName": 1,
                      "fsTargetUri": 1,
                      "mediaType": 1,
                      "mediaEndpoint": {
                        "$concat": ["/profilepict/", "$_id"]
                      }

                    }
                  }
                ],

              }
            },
            {
              $skip: skip
            },
            {
              $limit: row
            },
            {
              $unwind: {
                path: "$media",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$username",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "contentevents",
                as: "isLike",
                let: {
                  localID: '$postID'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $eq: ['$postID', '$$localID']
                          }
                        },
                        {
                          "email": profile.email
                        },
                        {
                          "eventType": "LIKE"
                        }
                      ]
                    }
                  },
                  {
                    $project: {
                      "email": 1,

                    }
                  }
                ],

              }
            },
            {
              $project: {
                "postID": 1,
                "isLike": "$isLike",
                "tagPeople": "$userTag",
                "mediaType": "$media.mediaType",
                "email": 1,
                "postType": 1,
                "description": 1,
                "active": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "expiration": 1,
                "visibility": 1,
                "location": 1,
                "tags": 1,
                "allowComments": 1,
                "isSafe": 1,
                "isOwned": 1,
                "certified": 1,
                "saleAmount": 1,
                "saleLike": 1,
                "saleView": 1,
                "isShared": 1,
                "likes": 1,
                "views": 1,
                "shares": 1,
                "userProfile": 1,
                "contentMedias": 1,
                "category": "$cats",
                "tagDescription": 1,
                "metadata": 1,
                "boostDate": 1,
                "boostInterval": 1,
                "boostSession": 1,
                "isBoost": 1,
                "boostViewer": 1,
                "boostCount": 1,
                "contentModeration": 1,
                "reportedStatus": 1,
                "reportedUserCount": 1,
                "contentModerationResponse": 1,
                "reportedUser": 1,
                "timeStart": 1,
                "timeEnd": 1,
                "apsara": "$media.apsara",
                "apsaraId": "$media.apsaraId",
                "apsaraThumbId": "$media.apsaraThumbId",
                "mediaEndpoint": "$media.mediaEndpoint",
                "mediaUri": "$media.mediaUri",
                "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
                "mediaThumbUri": "$media.mediaThumbUri",
                "insight": [
                  {
                    "likes": "$likes",
                    "views": "$views",
                    "shares": "$shares",
                    "comments": "$comments",
                  }
                ],
                "fullName": "$userBasic.fullName",
                "username": "$username.username",
                "avatar": 1,
                "privacy": [{
                  "isCelebrity": "$userBasic.isCelebrity"
                }, {
                  "isIdVerified": "$userBasic.isIdVerified"
                }, {
                  "isPrivate": "$userBasic.isPrivate"
                }]
              },

            }
          ],

        }
      },

    ]).exec();
  }

  private buildQueryPrivate_(profile: Userbasicnew, vis: string, stoday: string, skip: number, row: number) {
    return this.PostsModel.aggregate([

      {
        $facet: {

          //pict
          "pict": [
            {
              $sort: {
                "createdAt": - 1
              }
            },
            {
              $match:
              {
                $and: [
                  {
                    "email": profile.email
                  },
                  {
                    $or: [
                      {
                        "reportedStatus": "ALL"
                      },
                      {
                        "reportedStatus": null
                      },

                    ]
                  },
                  // {
                  //   "visibility": "PUBLIC"
                  // },
                  {
                    "active": true
                  },
                  {
                    "postType": "pict"
                  },
                  {
                    "reportedUser.email": {
                      $not: {
                        $regex: profile.email
                      }
                    }
                  },

                ]
              }
            },
            {
              "$lookup": {
                from: "mediapicts",
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
                      "mediaType": 1
                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "interests_repo",
                as: "cats",
                let: {
                  localID: '$category.$id'
                },
                pipeline: [
                  {
                    $match: {

                      $expr: {
                        $and: [
                          {
                            $in: ['$_id', {
                              $ifNull: ['$$localID', []]
                            }]
                          },

                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      "interestName": 1,
                      "langIso": 1,
                      "icon": 1,
                      "createdAt": 1,
                      "updatedAt": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "userTag",
                let: {
                  localID: '$tagPeople.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      }
                    }
                  },
                  {
                    $project: {

                      "username": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "username",
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

                      "username": 1
                    }
                  }
                ],

              }
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
            {
              $unwind: {
                path: "$userBasic",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "mediaprofilepicts",
                as: "avatar",
                let: {
                  localID: '$userBasic.profilePict.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $eq: ['$mediaID', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      "mediaBasePath": 1,
                      "mediaUri": 1,
                      "originalName": 1,
                      "fsSourceUri": 1,
                      "fsSourceName": 1,
                      "fsTargetUri": 1,
                      "mediaType": 1,
                      "mediaEndpoint": {
                        "$concat": ["/profilepict/", "$_id"]
                      }

                    }
                  }
                ],

              }
            },
            {
              $skip: skip
            },
            {
              $limit: row
            },
            {
              $unwind: {
                path: "$media",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$username",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "contentevents",
                as: "isLike",
                let: {
                  localID: '$postID'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $eq: ['$postID', '$$localID']
                          }
                        },
                        {
                          "email": profile.email
                        },
                        {
                          "eventType": "LIKE"
                        }
                      ]
                    }
                  },
                  {
                    $project: {
                      "email": 1,

                    }
                  }
                ],

              }
            },
            {
              $project: {
                "postID": 1,
                "isLike": "$isLike",
                "tagPeople": "$userTag",
                "mediaType": "$media.mediaType",
                "email": 1,
                "postType": 1,
                "description": 1,
                "active": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "expiration": 1,
                "visibility": 1,
                "location": 1,
                "tags": 1,
                "allowComments": 1,
                "isSafe": 1,
                "isOwned": 1,
                "certified": 1,
                "saleAmount": 1,
                "saleLike": 1,
                "saleView": 1,
                "isShared": 1,
                "likes": 1,
                "views": 1,
                "shares": 1,
                "userProfile": 1,
                "contentMedias": 1,
                "category": "$cats",
                "tagDescription": 1,
                "metadata": 1,
                "boostDate": 1,
                "boostInterval": 1,
                "boostSession": 1,
                "boosted":
                {
                  $cond: {
                    if: {
                      $gt: [{
                        "$dateToString": {
                          "format": "%Y-%m-%d %H:%M:%S",
                          "date": {
                            $add: [new Date(), 25200000]
                          }
                        }
                      }, "$boosted.boostSession.end"]
                    },
                    then: "$kampretTaslim",
                    else: '$boosted'
                  }
                },
                "isBoost": 1,
                "boostViewer": 1,
                "boostCount": 1,
                "contentModeration": 1,
                "reportedStatus": 1,
                "reportedUserCount": 1,
                "contentModerationResponse": 1,
                "reportedUser": 1,
                "timeStart": 1,
                "timeEnd": 1,
                "apsara": "$media.apsara",
                "apsaraId": "$media.apsaraId",
                "apsaraThumbId": "$media.apsaraThumbId",
                "mediaEndpoint": "$media.mediaEndpoint",
                "mediaUri": "$media.mediaUri",
                "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
                "mediaThumbUri": "$media.mediaThumbUri",
                "insight": [
                  {
                    "likes": "$likes",
                    "views": "$views",
                    "shares": "$shares",
                    "comments": "$comments",
                  }
                ],
                "fullName": "$userBasic.fullName",
                "username": "$username.username",
                "avatar": 1,
                "privacy": [{
                  "isCelebrity": "$userBasic.isCelebrity"
                }, {
                  "isIdVerified": "$userBasic.isIdVerified"
                }, {
                  "isPrivate": "$userBasic.isPrivate"
                }]
              },

            }
          ],
          //vid
          "video": [
            {
              $sort: {
                "createdAt": - 1
              }
            },
            {
              $match:
              {
                $and: [
                  {
                    "email": profile.email
                  },
                  {
                    $or: [
                      {
                        "reportedStatus": "ALL"
                      },
                      {
                        "reportedStatus": null
                      },

                    ]
                  },
                  // {
                  //   "visibility": "PUBLIC"
                  // },
                  {
                    "active": true
                  },
                  {
                    "postType": "vid"
                  },
                  {
                    "reportedUser.email": {
                      $not: {
                        $regex: profile.email
                      }
                    }
                  },

                ]
              }
            },
            {
              "$lookup": {
                from: "mediavideos",
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
                      "mediaType": 1


                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "interests_repo",
                as: "cats",
                let: {
                  localID: '$category.$id'
                },
                pipeline: [
                  {
                    $match: {

                      $expr: {
                        $and: [
                          {
                            $in: ['$_id', {
                              $ifNull: ['$$localID', []]
                            }]
                          },

                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      "interestName": 1,
                      "langIso": 1,
                      "icon": 1,
                      "createdAt": 1,
                      "updatedAt": 1
                    }
                  }
                ],

              }
            },

            {
              "$lookup": {
                from: "userauths",
                as: "userTag",
                let: {
                  localID: '$tagPeople.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      }
                    }
                  },
                  {
                    $project: {

                      "username": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "username",
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

                      "username": 1
                    }
                  }
                ],

              }
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
            {
              $unwind: {
                path: "$userBasic",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "mediaprofilepicts",
                as: "avatar",
                let: {
                  localID: '$userBasic.profilePict.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $eq: ['$mediaID', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      "mediaBasePath": 1,
                      "mediaUri": 1,
                      "originalName": 1,
                      "fsSourceUri": 1,
                      "fsSourceName": 1,
                      "fsTargetUri": 1,
                      "mediaType": 1,
                      "mediaEndpoint": {
                        "$concat": ["/profilepict/", "$_id"]
                      }

                    }
                  }
                ],

              }
            },
            {
              $skip: skip
            },
            {
              $limit: row
            },
            {
              $unwind: {
                path: "$media",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$username",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "contentevents",
                as: "isLike",
                let: {
                  localID: '$postID'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $eq: ['$postID', '$$localID']
                          }
                        },
                        {
                          "email": profile.email
                        },
                        {
                          "eventType": "LIKE"
                        }
                      ]
                    }
                  },
                  {
                    $project: {
                      "email": 1,

                    }
                  }
                ],

              }
            },
            {
              $project: {
                "postID": 1,
                "isLike": "$isLike",
                "tagPeople": "$userTag",
                "mediaType": "$media.mediaType",
                "email": 1,
                "postType": 1,
                "description": 1,
                "active": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "expiration": 1,
                "visibility": 1,
                "location": 1,
                "tags": 1,
                "allowComments": 1,
                "isSafe": 1,
                "isOwned": 1,
                "certified": 1,
                "saleAmount": 1,
                "saleLike": 1,
                "saleView": 1,
                "isShared": 1,
                "boosted":
                {
                  $cond: {
                    if: {
                      $gt: [{
                        "$dateToString": {
                          "format": "%Y-%m-%d %H:%M:%S",
                          "date": {
                            $add: [new Date(), 25200000]
                          }
                        }
                      }, "$boosted.boostSession.end"]
                    },
                    then: "$kampretTaslim",
                    else: '$boosted'
                  }
                },
                "likes": 1,
                "views": 1,
                "shares": 1,
                "userProfile": 1,
                "contentMedias": 1,
                "category": "$cats",
                "tagDescription": 1,
                "metadata": 1,
                "boostDate": 1,
                "boostInterval": 1,
                "boostSession": 1,
                "isBoost": 1,
                "boostViewer": 1,
                "boostCount": 1,
                "contentModeration": 1,
                "reportedStatus": 1,
                "reportedUserCount": 1,
                "contentModerationResponse": 1,
                "reportedUser": 1,
                "timeStart": 1,
                "timeEnd": 1,
                "apsara": "$media.apsara",
                "apsaraId": "$media.apsaraId",
                "apsaraThumbId": "$media.apsaraThumbId",
                "mediaEndpoint": "$media.mediaEndpoint",
                "mediaUri": "$media.mediaUri",
                "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
                "mediaThumbUri": "$media.mediaThumbUri",
                "insight": [
                  {
                    "likes": "$likes",
                    "views": "$views",
                    "shares": "$shares",
                    "comments": "$comments",
                  }
                ],
                "fullName": "$userBasic.fullName",
                "username": "$username.username",
                "avatar": 1,
                "privacy": [{
                  "isCelebrity": "$userBasic.isCelebrity"
                }, {
                  "isIdVerified": "$userBasic.isIdVerified"
                }, {
                  "isPrivate": "$userBasic.isPrivate"
                }]
              },

            }
          ],
          //diary
          "diary": [
            {
              $sort: {
                "createdAt": - 1
              }
            },
            {
              $match:
              {
                $and: [
                  {
                    "email": profile.email
                  },
                  {
                    $or: [
                      {
                        "reportedStatus": "ALL"
                      },
                      {
                        "reportedStatus": null
                      },

                    ]
                  },
                  // {
                  //   "visibility": "PUBLIC"
                  // },
                  {
                    "active": true
                  },
                  {
                    "postType": "diary"
                  },
                  {
                    "reportedUser.email": {
                      $not: {
                        $regex: profile.email
                      }
                    }
                  },

                ]
              }
            },
            {
              "$lookup": {
                from: "mediadiaries",
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
                from: "interests_repo",
                as: "cats",
                let: {
                  localID: '$category.$id'
                },
                pipeline: [
                  {
                    $match: {

                      $expr: {
                        $and: [
                          {
                            $in: ['$_id', {
                              $ifNull: ['$$localID', []]
                            }]
                          },

                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      "interestName": 1,
                      "langIso": 1,
                      "icon": 1,
                      "createdAt": 1,
                      "updatedAt": 1
                    }
                  }
                ],

              }
            },

            {
              "$lookup": {
                from: "userauths",
                as: "userTag",
                let: {
                  localID: '$tagPeople.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      }
                    }
                  },
                  {
                    $project: {

                      "username": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "username",
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

                      "username": 1
                    }
                  }
                ],

              }
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
            {
              $unwind: {
                path: "$userBasic",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "mediaprofilepicts",
                as: "avatar",
                let: {
                  localID: '$userBasic.profilePict.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $eq: ['$mediaID', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      "mediaBasePath": 1,
                      "mediaUri": 1,
                      "originalName": 1,
                      "fsSourceUri": 1,
                      "fsSourceName": 1,
                      "fsTargetUri": 1,
                      "mediaType": 1,
                      "mediaEndpoint": {
                        "$concat": ["/profilepict/", "$_id"]
                      }

                    }
                  }
                ],

              }
            },
            {
              $skip: skip
            },
            {
              $limit: row
            },
            {
              $unwind: {
                path: "$media",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$username",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "contentevents",
                as: "isLike",
                let: {
                  localID: '$postID'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $eq: ['$postID', '$$localID']
                          }
                        },
                        {
                          "email": profile.email
                        },
                        {
                          "eventType": "LIKE"
                        }
                      ]
                    }
                  },
                  {
                    $project: {
                      "email": 1,

                    }
                  }
                ],

              }
            },
            {
              $project: {
                "postID": 1,
                "isLike": "$isLike",
                "tagPeople": "$userTag",
                "mediaType": "$media.mediaType",
                "email": 1,
                "postType": 1,
                "description": 1,
                "active": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "expiration": 1,
                "visibility": 1,
                "location": 1,
                "tags": 1,
                "allowComments": 1,
                "isSafe": 1,
                "isOwned": 1,
                "certified": 1,
                "saleAmount": 1,
                "saleLike": 1,
                "saleView": 1,
                "isShared": 1,
                "likes": 1,
                "views": 1,
                "boosted":
                {
                  $cond: {
                    if: {
                      $gt: [{
                        "$dateToString": {
                          "format": "%Y-%m-%d %H:%M:%S",
                          "date": {
                            $add: [new Date(), 25200000]
                          }
                        }
                      }, "$boosted.boostSession.end"]
                    },
                    then: "$kampretTaslim",
                    else: '$boosted'
                  }
                },
                "shares": 1,
                "userProfile": 1,
                "contentMedias": 1,
                "category": "$cats",
                "tagDescription": 1,
                "metadata": 1,
                "boostDate": 1,
                "boostInterval": 1,
                "boostSession": 1,
                "isBoost": 1,
                "boostViewer": 1,
                "boostCount": 1,
                "contentModeration": 1,
                "reportedStatus": 1,
                "reportedUserCount": 1,
                "contentModerationResponse": 1,
                "reportedUser": 1,
                "timeStart": 1,
                "timeEnd": 1,
                "apsara": "$media.apsara",
                "apsaraId": "$media.apsaraId",
                "apsaraThumbId": "$media.apsaraThumbId",
                "mediaEndpoint": "$media.mediaEndpoint",
                "mediaUri": "$media.mediaUri",
                "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
                "mediaThumbUri": "$media.mediaThumbUri",
                "insight": [
                  {
                    "likes": "$likes",
                    "views": "$views",
                    "shares": "$shares",
                    "comments": "$comments",
                  }
                ],
                "fullName": "$userBasic.fullName",
                "username": "$username.username",
                "avatar": 1,
                "privacy": [{
                  "isCelebrity": "$userBasic.isCelebrity"
                }, {
                  "isIdVerified": "$userBasic.isIdVerified"
                }, {
                  "isPrivate": "$userBasic.isPrivate"
                }]
              },

            }
          ],
          //story
          "story": [
            {
              $sort: {
                "createdAt": - 1
              }
            },
            {
              $match:
              {
                $and: [
                  {
                    'email': profile.email
                  },
                  {
                    $or: [
                      {
                        "reportedStatus": "ALL"
                      },
                      {
                        "reportedStatus": null
                      },

                    ]
                  },
                  // {
                  //   "visibility": "PUBLIC"
                  // },
                  {
                    "active": true
                  },
                  {
                    "postType": "story"
                  },
                  {
                    "reportedUser.email": {
                      $not: {
                        $regex: profile.email
                      }
                    }
                  },
                  {
                    "boosted.boostSession.start": {
                      $lte: {
                        $add: [new Date(), 25200000]
                      }
                    }
                  },

                ]
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
                      "mediaType": 1

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "interests_repo",
                as: "cats",
                let: {
                  localID: '$category.$id'
                },
                pipeline: [
                  {
                    $match: {

                      $expr: {
                        $and: [
                          {
                            $in: ['$_id', {
                              $ifNull: ['$$localID', []]
                            }]
                          },

                        ]
                      }
                    }
                  },
                  {
                    $project: {
                      "interestName": 1,
                      "langIso": 1,
                      "icon": 1,
                      "createdAt": 1,
                      "updatedAt": 1
                    }
                  }
                ],

              }
            },

            {
              "$lookup": {
                from: "userauths",
                as: "userTag",
                let: {
                  localID: '$tagPeople.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $in: ['$_id', {
                          $ifNull: ['$$localID', []]
                        }]
                      }
                    }
                  },
                  {
                    $project: {

                      "username": 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "username",
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

                      "username": 1
                    }
                  }
                ],

              }
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
            {
              $unwind: {
                path: "$userBasic",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "mediaprofilepicts",
                as: "avatar",
                let: {
                  localID: '$userBasic.profilePict.$id'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $eq: ['$mediaID', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      "mediaBasePath": 1,
                      "mediaUri": 1,
                      "originalName": 1,
                      "fsSourceUri": 1,
                      "fsSourceName": 1,
                      "fsTargetUri": 1,
                      "mediaType": 1,
                      "mediaEndpoint": {
                        "$concat": ["/profilepict/", "$_id"]
                      }

                    }
                  }
                ],

              }
            },
            {
              $skip: skip
            },
            {
              $limit: row
            },
            {
              $unwind: {
                path: "$media",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$username",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              "$lookup": {
                from: "contentevents",
                as: "isLike",
                let: {
                  localID: '$postID'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $eq: ['$postID', '$$localID']
                          }
                        },
                        {
                          "email": profile.email
                        },
                        {
                          "eventType": "LIKE"
                        }
                      ]
                    }
                  },
                  {
                    $project: {
                      "email": 1,

                    }
                  }
                ],

              }
            },
            {
              $project: {
                "postID": 1,
                "isLike": "$isLike",
                "tagPeople": "$userTag",
                "mediaType": "$media.mediaType",
                "email": 1,
                "postType": 1,
                "description": 1,
                "active": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "expiration": 1,
                "visibility": 1,
                "location": 1,
                "tags": 1,
                "allowComments": 1,
                "isSafe": 1,
                "isOwned": 1,
                "certified": 1,
                "saleAmount": 1,
                "saleLike": 1,
                "saleView": 1,
                "isShared": 1,
                "likes": 1,
                "views": 1,
                "shares": 1,
                "userProfile": 1,
                "contentMedias": 1,
                "category": "$cats",
                "tagDescription": 1,
                "metadata": 1,
                "boostDate": 1,
                "boostInterval": 1,
                "boostSession": 1,
                "isBoost": 1,
                "boostViewer": 1,
                "boostCount": 1,
                "contentModeration": 1,
                "reportedStatus": 1,
                "reportedUserCount": 1,
                "contentModerationResponse": 1,
                "reportedUser": 1,
                "timeStart": 1,
                "timeEnd": 1,
                "apsara": "$media.apsara",
                "apsaraId": "$media.apsaraId",
                "apsaraThumbId": "$media.apsaraThumbId",
                "mediaEndpoint": "$media.mediaEndpoint",
                "mediaUri": "$media.mediaUri",
                "mediaThumbEndpoint": "$media.mediaThumbEndpoint",
                "mediaThumbUri": "$media.mediaThumbUri",
                "insight": [
                  {
                    "likes": "$likes",
                    "views": "$views",
                    "shares": "$shares",
                    "comments": "$comments",
                  }
                ],
                "fullName": "$userBasic.fullName",
                "username": "$username.username",
                "avatar": 1,
                "privacy": [{
                  "isCelebrity": "$userBasic.isCelebrity"
                }, {
                  "isIdVerified": "$userBasic.isIdVerified"
                }, {
                  "isPrivate": "$userBasic.isPrivate"
                }]
              },

            }
          ],

        }
      },

    ]).exec();
  }
}