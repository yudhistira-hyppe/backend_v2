import { Logger, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { newPosts, NewpostsDocument } from './schemas/newPost.schema';
import { PostContentService } from '../posts/postcontent.service';
import { Userbasicnew } from 'src/trans/userbasicnew/schemas/userbasicnew.schema';
import { UtilsService } from 'src/utils/utils.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import { CreateNewPostDTO, PostResponseApps, PostData, Avatar, Metadata, TagPeople, Cat, Privacy } from './dto/create-newPost.dto'; 
import { ContenteventsService } from '../contentevents/contentevents.service';
import { ErrorHandler } from 'src/utils/error.handler';

@Injectable()
export class NewPostService {
  private readonly logger = new Logger(NewPostService.name);

    constructor(
        @InjectModel(newPosts.name, 'SERVER_FULL')
        private readonly loaddata: Model<NewpostsDocument>,
        private readonly postContentService: PostContentService,
        private readonly utilService: UtilsService,
        private readonly logapiSS: LogapisService,
        private readonly errorHandler: ErrorHandler,
        private readonly basic2SS: UserbasicnewService,
        private readonly contentEventService: ContenteventsService,
    ) { }

  async findOne(id: string) {
    var data = await this.loaddata.findOne({ postID: id }).exec();

        return data;
    }
  async findUserPost(email: string): Promise<number> {
    return this.loaddata.where('email', email).where('active', true).where('postType').ne('story').count();
  }
    async databasenew(buy: string, report: string, iduser: Object, username: string, description: string, kepemilikan: any[], statusjual: any[], postType: any[], kategori: any[], hashtag: any[], startdate: string, enddate: string, startmount: number, endmount: number, descending: boolean, page: number, limit: number, popular: any) {

        try {
          var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));
    
          var dateend = currentdate.toISOString();
    
          var dt = dateend.substring(0, 10);
        } catch (e) {
          dateend = "";
        }
    
        var order = null;
    
        if (descending === true) {
          order = -1;
        } else {
          order = 1;
        }
    
        var arrkategori = [];
        var idkategori = null;
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var lengkategori = null;
    
        try {
          lengkategori = kategori.length;
        } catch (e) {
          lengkategori = 0;
        }
        if (lengkategori > 0) {
    
          for (let i = 0; i < lengkategori; i++) {
            let idkat = kategori[i];
            idkategori = mongoose.Types.ObjectId(idkat);
            arrkategori.push(idkategori);
          }
        }
    
        var pipeline = [];
        if (popular !== undefined && popular === true) {
          pipeline.push({
            $sort: {
              views: - 1,
              likes: - 1
            },
    
          },);
        } else {
          pipeline.push({
            $sort: {
              createdAt: order
            },
    
          },);
        }
    
        //start improvisasi disini
    
        var listmatchingand = [];
    
        listmatchingand.push({
          "active": true
        });
    
        //baru. search by hashtags
        if (hashtag && hashtag !== undefined) {
          var converthashtag = [];
          for (var i = 0; i < hashtag.length; i++) {
            converthashtag.push(hashtag[i].toLowerCase());
          }
    
          pipeline.push(
            {
              "$set": {
                "tag2": {
                  "$map": {
                    "input": "$tags",
                    "as": "arrayElems",
                    "in": {
                      "$toLower": "$$arrayElems"
                    }
                  }
                }
              }
            },
            {
              "$project": {
                "_id": 1,
                "postID": 1,
                "email": 1,
                "postType": 1,
                "description": 1,
                "active": 1,
                "createdAt": 1,
                "updated": 1,
                "expiration": 1,
                "visibility": 1,
                "location": 1,
                "tags": 1,
                "tag2": "$tag2",
                "allowComments": 1,
                "isSafe": 1,
                "isOwned": 1,
                "certified": 1,
                "saleAmount": 1,
                "saleLike": 1,
                "isShared": 1,
                "saleView": 1,
                "likes": 1,
                "views": 1,
                "shares": 1,
                "userProfile": 1,
                "contentMedias": 1,
                "category": 1,
                "tagPeople": 1,
                "tagDescription": 1,
                "reportedUser": 1,
                "reportedUserHandle": 1,
                "musicId": 1,
                "boosted": 1,
                "viewer": 1,
                "contentModeration": 1,
                "contentModerationDate": 1,
                "contentModerationResponse": 1,
                "moderationReason": 1,
                "reportedStatus": 1,
              }
            },
          );
    
          listmatchingand.push({
            tag2:
            {
              "$in": converthashtag
    
            }
          }
          );
        }
    
        if (description && description !== undefined) {
    
          listmatchingand.push({
            description: {
              $regex: description,
              $options: 'i'
            },
          },);
    
        }
    
        pipeline.push({
          "$match":
          {
            "$and": listmatchingand
          }
        }
        );
    
        //end improvisasi
    
        pipeline.push(
          {
            "$addFields":
            {
              "mediaSource":
              {
                "$arrayElemAt":
                [
                  "$mediaSource", 0
                ]
              }
            }
          },
        );
    
        if (iduser && iduser !== undefined) {
          pipeline.push(
            {
              "$lookup": {
                "from": "newUserBasics",
                "as": "databasic",
                "let": {
                  "local_id": "$idUser",
    
                },
                "pipeline": [
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
                      iduser: "$_id",
                      username: "$username",
                      pict:"$mediaEndpoint"
                    }
                  },
    
                ],
    
              },
    
            },
            {
              $unwind: {
                path: "$databasic",
    
              }
            },
            {
              $match: {
                'databasic.iduser': iduser,
    
              }
            },
            {
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
                reportedCount: {
                  $cmp: ["$reportedUserCount", 0]
                },
    
              }
            },
            {
              "$lookup": {
                "from": "transactions",
                "as": "trans",
                "let": {
                  "local_id": "$postID",
    
                },
                "pipeline": [
                  {
                    $match:
                    {
                      $expr: {
                        $eq: ['$postid', '$$local_id']
                      }
                    }
                  },
                  {
                    $project: {
                      iduserbuyer: 1,
                      idusersell: 1,
                      noinvoice: 1,
                      status: 1,
                      amount: 1,
                      timestamp: 1
                    }
                  },
                  {
                    $match: {
                      "iduserbuyer": iduser,
                      "status": "Success"
                    }
                  },
                  {
                    $sort: {
                      timestamp: - 1
                    },
    
                  },
                  {
                    $limit: 1
                  },
                  {
                    "$lookup": {
                      "from": "newUserBasics",
                      "as": "penjual",
                      "let": {
                        "local_id": "$idusersell"
                      },
                      "pipeline": [
                        {
                          "$match": {
                            "$expr": {
                              "$eq": [
                                "$_id",
                                "$$local_id"
                              ]
                            }
                          }
                        },
                        {
                          $project: {
                            email: 1
                          }
                        },
    
                      ],
    
                    }
                  },
                  {
                    $project: {
                      penjual: {
                        $arrayElemAt: ['$penjual.username', 0]
                      },
                      amount: 1,
                      status: 1,
                      noinvoice: 1,
                      timestamp: 1
                    }
                  },
    
                ],
    
              },
    
            },
            {
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
    
            },
            {
              $project: {
                username: "$databasic.username",
			          iduser:"$databasic.iduser",
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                email: 1,
                postType: 1,
                views: 1,
                likes: 1,
                comments: 1,
                shares: 1,
                description: 1,
                title: 1,
                active: 1,
                kategori: 1,
                reportedUserCount: 1,
                tags: 1,
                trans:
                {
                  $size: "$trans"
                },
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
                tr: "$trans",
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
                reported: {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$reportedCount", - 1]
                      }, {
                        $eq: ["$reportedCount", 0]
                      }]
                    },
                    then: "TIDAK",
                    else: "YA"
                  }
                },
                mediaSource: 1,
              }
            },
            {
              $project: {
                username: 1,
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                iduser: 1,
                email: 1,
                reported: 1,
                views: 1,
                likes: 1,
                shares: 1,
                comments: 1,
                tags: 1,
                tr: 1,
                buy: {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$trans", 0]
                      }]
                    },
                    then: "TIDAK",
                    else: "YA"
                  }
                },
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
                    then: "TIDAK",
                    else: "YA"
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
                    then: "TIDAK",
                    else: "YA"
                  }
                },
                mediaSource: 1,
              }
            },
            {
              $project: {
                username: 1,
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                iduser: 1,
                email: 1,
                views: 1,
                likes: 1,
                shares: 1,
                comments: 1,
                type: 1,
                description: 1,
                title: 1,
                active: 1,
                kategori: 1,
                kepemilikan: 1,
                visibility: 1,
                amount: "$saleAmount",
                statusJual: 1,
                reported: 1,
                buy: 1,
                tr: 1,
                tags: 1,
                mediaSource: 1,
              }
            },
            {
              $addFields: {
                pict: {
                  $replaceOne: {
                    input: "$auth.mediaUri",
                    find: "_0001.jpeg",
                    replacement: ""
                  }
                },
              },
    
            },
            {
              $project: {
    
                username: 1,
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                iduser: 1,
                tr: 1,
                email: 1,
                type: 1,
                description: 1,
                title: 1,
                active: 1,
                kategori: 1,
                kepemilikan: 1,
                visibility: 1,
                saleAmount: {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$buy", "TIDAK"]
                      },]
                    },
                    then: "$amount",
                    else: {
                      $arrayElemAt: ['$tr.amount', 0]
                    }
                  }
                },
                penjual: {
                  $arrayElemAt: ['$tr.penjual', 0]
                },
                statusJual: 1,
                reported: 1,
                buy: 1,
                views: 1,
                likes: 1,
                shares: 1,
                comments: 1,
                tags: 1,
                "mediaBasePath": "$mediaSource.mediaBasePath",
                  "mediaUri": "$mediaSource.mediaUri",
                  "mediaType": "$mediaSource.mediaType",
                  "mediaThumbEndpoint": {
                    "$switch": {
                      "branches": [
                        {
                          "case": {
                            "$eq": [
                              "$type",
                              "HyppePic"
                            ]
                          },
                          "then": "$mediaSource.mediaThumb"
                        },
                        {
                          "case": {
                            "$eq": [
                              "$type",
                              "HyppeDiary"
                            ]
                          },
                          "then": {
                            "$concat": [
                              "/thumb/",
                              "$postID"
                            ]
                          }
                        },
                        {
                          "case": {
                            "$eq": [
                                "$type",
                                "HyppeVid"
                            ]
                          },
                          "then": {
                            "$concat": [
                              "/thumb/",
                              "$postID"
                            ]
                          }
                        },
                        {
                          "case": {
                            "$eq": [
                                "$type",
                                "HyppeDiary"
                            ]
                          },
                          "then": {
                            "$concat": [
                              "/thumb/",
                              "$postID"
                            ]
                          }
                        }
                      ],
                      "default": ""
                    }
                  },
                  "mediaEndpoint": {
                    "$switch": {
                      "branches": [
                        {
                          "case": {
                            "$eq": [
                              "$type",
                              "HyppePic"
                            ]
                          },
                          "then": {
                            "$concat":
                            [
                              "/pict/",
                              "$postID"
                            ]
                          }
                        },
                        {
                          "case": {
                            "$eq": [
                              "$type",
                              "HyppeDiary"
                            ]
                          },
                          "then": {
                            "$concat": [
                              "/thumb/",
                              "$postID"
                            ]
                          }
                        },
                        {
                          "case": {
                            "$eq": [
                                "$type",
                                "HyppeVid"
                            ]
                          },
                          "then": {
                            "$concat": [
                              "/thumb/",
                              "$postID"
                            ]
                          }
                        },
                        {
                          "case": {
                            "$eq": [
                                "$type",
                                "HyppeDiary"
                            ]
                          },
                          "then": {
                            "$cond":
                            {
                              if:
                              {
                                "$eq":
                                [
                                  "$mediaSource.mediaType",
                                  "image"
                                ]
                              },
                              then:
                              {
                                "$concat":
                                [
                                  "/pict/",
                                  "$postID"
                                ]
                              },
                              else:
                              {
                                "$concat":
                                [
                                  "/stream/",
                                  "$postID"
                                ]
                              }
                            }
                          }
                        }
                      ],
                      "default": ""
                    }
                  },
                  "mediaThumbUri": "$mediaSource.mediaThumb",
                  "apsaraId": {
                    "$ifNull":
                    [
                      "$mediaSource.apsaraId",
                      false
                    ]
                  },
                  "apsara": {
                    "$ifNull":
                    [
                      "$mediaSource.apsara",
                      false
                    ]
                  },
    
              }
            },
            {
              $project: {
    
                username: 1,
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                postType: 1,
                iduser: 1,
                email: 1,
                type: 1,
                description: 1,
                title: 1,
                active: 1,
                kategori: 1,
                kepemilikan: 1,
                visibility: 1,
                saleAmount: {
                  $cond: {
                    if: {
                      $or: [{
                        $eq: ["$saleAmount", null]
                      },]
                    },
                    then: 0,
                    else: "$saleAmount"
                  }
                },
                statusJual: 1,
                reported: 1,
                buy: 1,
                views: 1,
                likes: 1,
                shares: 1,
                comments: 1,
                mediaBasePath: 1,
                mediaUri: 1,
                mediaType: 1,
                mediaThumbEndpoint: 1,
                mediaEndpoint: 1,
                mediaThumbUri: 1,
                apsaraId: 1,
                apsara: 1,
                penjual: 1,
                tags: 1,
              }
            },
          );
    
        }
        else {
          pipeline.push(
            {
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
                reportedCount: {
                  $cmp: ["$reportedUserCount", 0]
                },
    
              }
            },
    
            {
              $lookup: {
                from: 'newUserBasics',
                localField: 'idUser',
                foreignField: '_id',
                as: 'authdata',
    
              }
            },
    
            {
              $addFields: {
    
    
                'auth': {
                  $arrayElemAt: ['$authdata', 0]
                },
    
              }
            },
            {
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
    
            },
            {
              $project: {
                "username": "$auth.username",
                "createdAt": 1,
                "updatedAt": 1,
                "postID": 1,
                "email": 1,
                "postType": 1,
                "type": {
                  "$switch": {
                    "branches": [
                      {
                        "case": {
                          "$eq": [
                            "$postType",
                            "pict"
                          ]
                        },
                        "then": "HyppePic"
                      },
                      {
                        "case": {
                          "$eq": [
                            "$postType",
                            "vid"
                          ]
                        },
                        "then": "HyppeVid"
                      },
                      {
                        "case": {
                          "$eq": [
                            "$postType",
                            "diary"
                          ]
                        },
                        "then": "HyppeDiary"
                      },
                      {
                        "case": {
                          "$eq": [
                            "$postType",
                            "story"
                          ]
                        },
                        "then": "HyppeStory"
                      }
                    ],
                    "default": ""
                  }
                },
                "description": 1,
                "title": 1,
                "active": 1,
                "kategori": 1,
                "reportedUserCount": 1,
                "views": 1,
                "likes": 1,
                "shares": 1,
                "comments": 1,
                "certified": {
                  "$cond": {
                    "if": {
                      "$or": [
                        {
                          "$eq": [
                            "$certi",
                            -1
                          ]
                        },
                        {
                          "$eq": [
                            "$certi",
                            0
                          ]
                        }
                      ]
                    },
                    "then": false,
                    "else": "$certified"
                  }
                },
                "visibility": 1,
                "saleAmount": {
                  "$cond": {
                    "if": {
                      "$or": [
                        {
                          "$eq": [
                            "$salePrice",
                            -1
                          ]
                        },
                        {
                          "$eq": [
                            "$salePrice",
                            0
                          ]
                        }
                      ]
                    },
                    "then": 0,
                    "else": "$saleAmount"
                  }
                },
                "monetize": {
                  "$cond": {
                    "if": {
                      "$or": [
                        {
                          "$eq": [
                            "$salePrice",
                            -1
                          ]
                        },
                        {
                          "$eq": [
                            "$salePrice",
                            0
                          ]
                        }
                      ]
                    },
                    "then": false,
                    "else": true
                  }
                },
                "reported": {
                  "$cond": {
                    "if": {
                      "$or": [
                        {
                          "$eq": [
                            "$reportedCount",
                            -1
                          ]
                        },
                        {
                          "$eq": [
                            "$reportedCount",
                            0
                          ]
                        }
                      ]
                    },
                    "then": "TIDAK",
                    "else": "YA"
                  }
                },
                "tags": 1,
                "mediaSource": 1
              }
            },
            {
              $project: {
                "username": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "postID": 1,
                "postType": 1,
                "email": 1,
                "reported": 1,
                "views": 1,
                "likes": 1,
                "shares": 1,
                "comments": 1,
                "type": 1,
                "description": 1,
                "title": 1,
                "active": 1,
                "kategori": 1,
                "kepemilikan": {
                  "$cond": {
                    "if": {
                      "$or": [
                        {
                          "$eq": [
                            "$certified",
                            false
                          ]
                        },
                        {
                          "$eq": [
                            "$certified",
                            ""
                          ]
                        }
                      ]
                    },
                    "then": "TIDAK",
                    "else": "YA"
                  }
                },
                "visibility": 1,
                "saleAmount": 1,
                "statusJual": {
                  "$cond": {
                    "if": {
                      "$eq": [
                        "$monetize",
                        false
                      ]
                    },
                    "then": "TIDAK",
                    "else": "YA"
                  }
                },
                "tags": 1,
                "mediaSource": 1
              }
            },
            {
              $addFields: {
                pict: {
                  $replaceOne: {
                    input: "$auth.mediaUri",
                    find: "_0001.jpeg",
                    replacement: ""
                  }
                },
              },
    
            },
            {
                "$project": {
                  "username": 1,
                  "createdAt": 1,
                  "updatedAt": 1,
                  "postID": 1,
                  "postType": 1,
                  "email": 1,
                  "type": 1,
                  "description": 1,
                  "title": 1,
                  "active": 1,
                  "kategori": 1,
                  "kepemilikan": 1,
                  "visibility": 1,
                  "saleAmount": 1,
                  "statusJual": 1,
                  "reported": 1,
                  "views": 1,
                  "likes": 1,
                  "shares": 1,
                  "comments": 1,
                  "tags": 1,
                  "mediaBasePath": "$mediaSource.mediaBasePath",
                  "mediaUri": "$mediaSource.mediaUri",
                  "mediaType": "$mediaSource.mediaType",
                  "mediaThumbEndpoint": {
                    "$switch": {
                      "branches": [
                        {
                          "case": {
                            "$eq": [
                              "$type",
                              "HyppePic"
                            ]
                          },
                          "then": "$mediaSource.mediaThumb"
                        },
                        {
                          "case": {
                            "$eq": [
                              "$type",
                              "HyppeDiary"
                            ]
                          },
                          "then": {
                            "$concat": [
                              "/thumb/",
                              "$postID"
                            ]
                          }
                        },
                        {
                          "case": {
                            "$eq": [
                              "$refs",
                              "mediavideos"
                            ]
                          },
                          "then": {
                            "$concat": [
                              "/thumb/",
                              "$postID"
                            ]
                          }
                        },
                        {
                          "case": {
                            "$eq": [
                              "$refs",
                              "mediastories"
                            ]
                          },
                          "then": {
                            "$concat": [
                              "/thumb/",
                              "$postID"
                            ]
                          }
                        }
                      ],
                      "default": ""
                    }
                  },
                  "mediaEndpoint": {
                    "$switch": {
                      "branches": [
                        {
                          "case": {
                            "$eq": [
                              "$type",
                              "HyppePic"
                            ]
                          },
                          "then": {
                            "$concat":
                            [
                              "/pict/",
                              "$postID"
                            ]
                          }
                        },
                        {
                          "case": {
                            "$eq": [
                              "$type",
                              "HyppeDiary"
                            ]
                          },
                          "then": {
                            "$concat": [
                              "/thumb/",
                              "$postID"
                            ]
                          }
                        },
                        {
                          "case": {
                            "$eq": [
                              "$refs",
                              "mediavideos"
                            ]
                          },
                          "then": {
                            "$concat": [
                              "/thumb/",
                              "$postID"
                            ]
                          }
                        },
                        {
                          "case": {
                            "$eq": [
                              "$refs",
                              "mediastories"
                            ]
                          },
                          "then": {
                            "$cond":
                            {
                              if:
                              {
                                "$eq":
                                [
                                  "$mediaSource.mediaType",
                                  "image"
                                ]
                              },
                              then:
                              {
                                "$concat":
                                [
                                  "/pict/",
                                  "$postID"
                                ]
                              },
                              else:
                              {
                                "$concat":
                                [
                                  "/stream/",
                                  "$postID"
                                ]
                              }
                            }
                          }
                        }
                      ],
                      "default": ""
                    }
                  },
                  "mediaThumbUri": "$mediaSource.mediaThumb",
                  "apsaraId": {
                    "$ifNull":
                    [
                      "$mediaSource.apsaraId",
                      false
                    ]
                  },
                  "apsara": {
                    "$ifNull":
                    [
                      "$mediaSource.apsara",
                      false
                    ]
                  },
                }
            },
          );
        }
    
    
        if (username && username !== undefined) {
    
          pipeline.push({
            $match: {
              username: {
                $regex: username,
                $options: 'i'
              },
    
            }
          },);
    
        }
    
    
        if (kepemilikan && kepemilikan !== undefined) {
          pipeline.push({
            $match: {
              $or: [
                {
                  kepemilikan: {
                    $in: kepemilikan
                  }
                },
    
              ]
            }
          },);
        }
    
        if (statusjual && statusjual !== undefined) {
          pipeline.push({
            $match: {
              $or: [
                {
                  statusJual: {
                    $in: statusjual
                  }
                },
    
              ]
            }
          },);
        }
    
        if (buy !== undefined && buy === "YA") {
          pipeline.push({
            $match: {
              buy: buy
            }
          },);
        }
        if (report && report !== undefined) {
          pipeline.push({
            $match: {
              reported: report
            }
          },);
        }
    
        if (kategori && kategori !== undefined) {
          pipeline.push({
            $match: {
              $or: [
                {
                  'kategori._id': {
                    $in: arrkategori
                  }
                },
    
              ]
            }
          },);
        }
        if (postType && postType !== undefined) {
          pipeline.push({
            $match: {
              $or: [
                {
                  type: {
                    $in: postType
                  }
                },
    
              ]
            }
          },);
        }
        if (startmount && startmount !== undefined) {
          pipeline.push({ $match: { saleAmount: { $gte: startmount } } });
        }
        if (endmount && endmount !== undefined) {
          pipeline.push({ $match: { saleAmount: { $lte: endmount } } });
        }
        if (startdate && startdate !== undefined) {
          pipeline.push({ $match: { createdAt: { $gte: startdate } } });
        }
        if (enddate && enddate !== undefined) {
          pipeline.push({ $match: { createdAt: { $lte: dt } } });
        }
    
    
    
        if (page > 0) {
          pipeline.push({ $skip: (page * limit) });
        }
        if (limit > 0) {
          pipeline.push({ $limit: limit });
        }
    
    
        let query = await this.loaddata.aggregate(pipeline);
        // console.log(query);
    
        var listdata = [];
        var tempresult = null;
        var tempdata = null;
        for (var i = 0; i < query.length; i++) {
          tempdata = query[i];
          if (tempdata.apsara == true) {
            listdata.push(tempdata.apsaraId);
          }
          else {
            listdata.push(undefined);
          }
        }
    
        //console.log(listdata);
        var apsaraimagedata = await this.postContentService.getImageApsara(listdata);
        // console.log(resultdata.ImageInfo[0]);
        tempresult = apsaraimagedata.ImageInfo;
        for (var i = 0; i < query.length; i++) {
          for (var j = 0; j < tempresult.length; j++) {
            if (tempresult[j].ImageId == query[i].apsaraId) {
              query[i].media =
              {
                "ImageInfo": [tempresult[j]]
              }
            }
            else if (query[i].apsara == false && (query[i].mediaType == "image" || query[i].mediaType == "images")) {
              query[i].media =
              {
                "ImageInfo": []
              }
            }
          }
        }
    
        var apsaravideodata = await this.postContentService.getVideoApsara(listdata);
        // console.log(apsaravideodata);
        // console.log(resultdata.ImageInfo[0]);
        tempresult = apsaravideodata.VideoList;
        for (var i = 0; i < query.length; i++) {
          for (var j = 0; j < tempresult.length; j++) {
            if (tempresult[j].VideoId == query[i].apsaraId) {
              query[i].media =
              {
                "VideoList": [tempresult[j]]
              }
            }
            else if (query[i].apsara == false && query[i].mediaType == "video") {
              query[i].media =
              {
                "VideoList": []
              }
            }
          }
        }
    
        return query;
    }

    async detailcontent(target: string, page: number, limit: number) {
      var query = await this.loaddata.aggregate([
        {
          "$match":
          {
            "postID": target
          }
        },
        {
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
        },
        {
            $lookup: {
                from: 'newUserBasics',
                localField: 'idUser',
                foreignField: '_id',
                as: 'authdata',
      
            }
        },
        {
            "$lookup": {
                "from": "mediamusic",
                "as": "music",
                "let": {
                "local_id": "$musicId",
      
                },
                "pipeline": [
                {
                    $match:
                    {
                        _id: "$$local_id"
                    }
                },
                {
                    $project: {
                    musicTitle: 1,
                    albumName: 1
                    }
                },
      
                ],
      
            },
      
        },
        {
            $addFields: {
      
      
                'auth': {
                $arrayElemAt: ['$authdata', 0]
                },
                'basic': {
                $arrayElemAt: ['$basicdata', 0]
                },
      
            }
        },
        {
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
      
        },
        {
            $project: {
                music: {
                $arrayElemAt: ['$music', 0]
                },
                userView: 1,
                username: "$auth.username",
                authdata: "$auth",
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                musicId: 1,
                email: 1,
                postType: 1,
                description: 1,
                title: 1,
                active: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                kategori: 1,
                tagPeople: 1,
                tagDescription: 1,
                visibility: 1,
                location: 1,
                tags: 1,
                allowComments: 1,
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
                saleView: {
                $cond: {
                    if: {
                    $or: [{
                        $eq: ["$sView", - 1]
                    }, {
                        $eq: ["$sView", 0]
                    }]
                    },
                    then: false,
                    else: "$saleView"
                }
                },
                saleLike: {
                $cond: {
                    if: {
                    $or: [{
                        $eq: ["$sLike", - 1]
                    }, {
                        $eq: ["$sLike", 0]
                    }]
                    },
                    then: false,
                    else: "$saleLike"
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
                mediaSource:
                {
                  "$arrayElemAt":
                  [
                      "$mediaSource", 0
                  ]
                }
      
            }
        },
        {
            $project: {
                musicTitle: '$music.musicTitle',
                albumName: '$music.albumName',
                username: 1,
                userView: 1,
                authdata: 1,
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                musicId: 1,
                postType: 1,
                likes: 1,
                views: 1,
                shares: 1,
                saleView: 1,
                saleLike: 1,
                comments: 1,
                email: 1,
                tagPeople: 1,
                tagDescription: 1,
                visibility: 1,
                location: 1,
                tags: 1,
                allowComments: 1,
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
                      then: "TIDAK",
                      else: "YA"
                  }
                },
                saleAmount: 1,
                statusJual:
                {
                  $cond: {
                      if: {
      
                      $eq: ["$monetize", false]
                      },
                      then: "TIDAK",
                      else: "YA"
                  }
                },
                mediaSource: 1
      
            }
        },
        {
            $project: {
                username: 1,
                authdata: 1,
                userView: 1,
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                musicId: 1,
                postType: 1,
                email: 1,
                type: 1,
                description: 1,
                title: 1,
                active: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                kategori: 1,
                kepemilikan: 1,
                visibility: 1,
                saleAmount: 1,
                statusJual: 1,
                saleView: 1,
                saleLike: 1,
                tagPeople: 1,
                tagDescription: 1,
                location: 1,
                tags: 1,
                allowComments: 1,
                musicTitle: 1,
                albumName: 1,
                mediaSource: 1
            }
        },
        {
            $addFields: {
      
      
                pict: {
                $replaceOne: {
                    input: "$authdata.mediaUri",
                    find: "_0001.jpeg",
                    replacement: ""
                }
                },
            },
      
        },
        {
            $project: {
                authdata: 1,
                username: 1,
                userView: 1,
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                musicId: 1,
                postType: 1,
                email: 1,
                type: 1,
                description: 1,
                title: 1,
                active: 1,
                kategori: 1,
                kepemilikan: 1,
                visibility: 1,
                likes: 1,
                views: 1,
                shares: 1,
                comments: 1,
                saleAmount: 1,
                statusJual: 1,
                saleView: 1,
                saleLike: 1,
                tagPeople: 1,
                tagDescription: 1,
                location: 1,
                tags: 1,
                allowComments: 1,
                musicTitle: 1,
                albumName: 1,
                  "mediaBasePath": "$mediaSource.mediaBasePath",
                  "mediaUri": "$mediaSource.mediaUri",
                  "mediaType": "$mediaSource.mediaType",
                  "mediaThumbEndpoint": {
                  "$switch": {
                      "branches": [
                      {
                          "case": {
                          "$eq": [
                              "$type",
                              "HyppePic"
                          ]
                          },
                          "then": "$mediaSource.mediaThumb"
                      },
                      {
                          "case": {
                          "$eq": [
                              "$type",
                              "HyppeDiary"
                          ]
                          },
                          "then": {
                          "$concat": [
                              "/thumb/",
                              "$postID"
                          ]
                          }
                      },
                      {
                          "case": {
                          "$eq": [
                              "$type",
                              "HyppeVid"
                          ]
                          },
                          "then": {
                          "$concat": [
                              "/thumb/",
                              "$postID"
                          ]
                          }
                      },
                      {
                          "case": {
                          "$eq": [
                              "$type",
                              "HyppeStory"
                          ]
                          },
                          "then": {
                          "$concat": [
                              "/thumb/",
                              "$postID"
                          ]
                          }
                      }
                      ],
                      "default": ""
                  }
                  },
                  "mediaEndpoint": {
                  "$switch": {
                      "branches": [
                      {
                          "case": {
                          "$eq": [
                              "$type",
                              "HyppePic"
                          ]
                          },
                          "then": {
                          "$concat":
                          [
                              "/pict/",
                              "$postID"
                          ]
                          }
                      },
                      {
                          "case": {
                          "$eq": [
                              "$type",
                              "HyppeDiary"
                          ]
                          },
                          "then": {
                          "$concat": [
                              "/thumb/",
                              "$postID"
                          ]
                          }
                      },
                      {
                          "case": {
                          "$eq": [
                              "$type",
                              "HyppeVid"
                          ]
                          },
                          "then": {
                          "$concat": [
                              "/thumb/",
                              "$postID"
                          ]
                          }
                      },
                      {
                          "case": {
                          "$eq": [
                              "$type",
                              "HyppeDiary"
                          ]
                          },
                          "then": {
                          "$cond":
                          {
                              if:
                              {
                              "$eq":
                              [
                                  "$mediaSource.mediaType",
                                  "image"
                              ]
                              },
                              then:
                              {
                              "$concat":
                              [
                                  "/pict/",
                                  "$postID"
                              ]
                              },
                              else:
                              {
                              "$concat":
                              [
                                  "/stream/",
                                  "$postID"
                              ]
                              }
                          }
                          }
                      }
                      ],
                      "default": ""
                  }
                  },
                  "mediaThumbUri": "$mediaSource.mediaThumb",
                  "apsaraId": {
                      "$ifNull":
                      [
                          "$mediaSource.apsaraId",
                          false
                      ]
                  },
                  "apsara": {
                      "$ifNull":
                      [
                          "$mediaSource.apsara",
                          false
                      ]
                  },
                originalName: "$mediaSource.originalName",
                rotate: "$mediaSource.rotate"
      
            }
        },
        {
            "$lookup": {
                "from": "disquslogs",
                "as": "comment",
                "let": {
                "local_id": "$postID"
                },
                "pipeline": [
                {
                    "$match": {
                    "$expr": {
                        "$eq": [
                        "$postID",
                        "$$local_id"
                        ]
                    }
                    }
                },
                {
                    $project: {
                    postID: 1,
                    txtMessages: 1,
                    sender: 1,
                    receiver: 1,
                    createdAt: 1,
                    active: 1
                    }
                },
                {
                    $match: {
                    active: true
                    }
                },
                { $sort: { createdAt: -1 } },
                {
                    $skip: (page * limit)
                },
                {
                    $limit: (limit)
                },
                {
                    "$lookup": {
                    "from": "newUserBasics",
                    "as": "authsender",
                    "let": {
                        "local_id": "$sender"
                    },
                    "pipeline": [
                        {
                        "$match": {
                            "$expr": {
                            "$eq": [
                                "$email",
                                "$$local_id"
                            ]
                            }
                        }
                        },
      
                    ],
      
                    }
                },
                {
                    $project: {
                    
                    emailsender:  
                    {
                          $arrayElemAt: ['$authsender.email', 0]
                    },
                    sender:  
                    {
                          $arrayElemAt: ['$authsender.username', 0]
                    },
                    profilePict:
                    {
                          $arrayElemAt: ['$authsender.profilePict.$id', 0]
                    },
                    avatar:
                    [
                      {
                          mediaBasePath:
                          {
                              "$arrayElemAt":
                              [
                                  "$authsender.mediaBasePath", 0
                              ]
                          },
                          mediaUri:
                          {
                              "$arrayElemAt":
                              [
                                  "$authsender.mediaUri", 0
                              ]
                          },
                          mediaEndpoint:
                          {
                              "$arrayElemAt":
                              [
                                  "$authsender.mediaEndpoint", 0
                              ]
                          }
                      }
                    ],
                    receiver: 1,
                    postID: 1,
                    txtMessages: 1,
                    createdAt: 1,
                    active: 1
                    }
                },
      
                ],
      
            }
        },
        {
            "$lookup": {
              "from": "transactions",
              "as": "riwayat",
              "let": {
                "local_id": "$postID",
      
              },
              "pipeline": [
                {
                  $match:
                  {
      
                    $expr: {
      
                      $eq: ['$postid', '$$local_id']
                    }
                  }
                },
                {
                  $project: {
                    idusersell: 1,
                    iduserbuyer: 1,
                    postID: '$postid',
                    amount: 1,
                    status: 1,
                    noinvoice: 1,
                    timestamp: 1
                  }
                },
                {
                  $match: {
                    status: "Success"
                  }
                },
                { $sort: { timestamp: -1 } },
                {
                  $skip: (page * limit)
                },
                {
                  $limit: (limit)
                },
                {
                  "$lookup": {
                    "from": "newUserBasics",
                    "as": "penjual",
                    "let": {
                      "local_id": "$idusersell"
                    },
                    "pipeline": [
                      {
                        "$match": {
                          "$expr": {
                            "$eq": [
                              "$_id",
                              "$$local_id"
                            ]
                          }
                        }
                      },
      
                    ],
      
                  }
                },
                {
                  "$lookup": {
                    "from": "newUserBasics",
                    "as": "pembeli",
                    "let": {
                      "local_id": "$iduserbuyer"
                    },
                    "pipeline": [
                      {
                        "$match": {
                          "$expr": {
                            "$eq": [
                              "$_id",
                              "$$local_id"
                            ]
                          }
                        }
                      },
      
                    ],
      
                  }
                },
                {
                  $project: {
                    penjual: {
                      $arrayElemAt: ['$penjual.username', 0]
                    },
                    pembeli: {
                      $arrayElemAt: ['$pembeli.username', 0]
                    },
                    postID: 1,
                    amount: 1,
                    status: 1,
                    noinvoice: 1,
                    timestamp: 1
                  }
                },
      
              ],
      
            },
      
        },
        {
            "$project":
            {
                _id: 1,
                postID: 1,
                email: 1,
                postType: 1,
                description: 1,
                active: 1,
                createdAt: 1,
                updatedAt: 1,
                visibility: 1,
                location: 1,
                tags: 1,
                allowComments: 1,
                likes: 1,
                views: 1,
                shares: 1,
                tagPeople: 1,
                tagDescription: 1,
                comments: 1,
                kategori: 1,
                username: 1,
                saleAmount: 1,
                saleView: 1,
                saleLike: 1,
                type: 1,
                kepemilikan: 1,
                statusJual: 1,
                mediaType: 1,
                mediaThumbEndpoint: 1,
                mediaEndpoint: 1,
                apsaraId: 1,
                apsara: 1,
                originalName: 1,
                comment: 1,
                riwayat: 1,
                userView: 1
            }
        },
        {
            "$facet":
            {
                "detail":
                [
                    {
                        "$project":
                        {
                            _id: 1,
                            postID: 1,
                            email: 1,
                            postType: 1,
                            description: 1,
                            active: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            visibility: 1,
                            location: 1,
                            tags: 1,
                            allowComments: 1,
                            likes: 1,
                            views: 1,
                            shares: 1,
                            tagPeople: 1,
                            tagDescription: 1,
                            comments: 1,
                            kategori: 1,
                            username: 1,
                            saleAmount: 1,
                            saleView: 1,
                            saleLike: 1,
                            type: 1,
                            kepemilikan: 1,
                            statusJual: 1,
                            mediaType: 1,
                            mediaThumbEndpoint: 1,
                            mediaEndpoint: 1,
                            apsaraId: 1,
                            apsara: 1,
                            originalName: 1,
                            comment: 1,
                            riwayat: 1,
                        }
                    }
                ],
                "age":
                [
                    {
                        "$unwind":
                        {
                            path: "$userView"
                        }
                    },
                    {
                      "$project":
                      {
                          userView: 1
                      }
                    },
                    {
                        "$lookup": {
                            "from": "newUserBasics",
                            "as": "basic_data",
                            "let": {
                                "local_id": "$userView"
                            },
                            "pipeline": [
                                {
                                    "$match":
                                    {
                                        "$expr":
                                        {
                                            "$eq":
                                            [
                                                "$email", "$$local_id"
                                            ]
                                        }
                                    }
                                },
                                {
                                    "$project":
                                    {
                                        _id: 1,
                                        ageQualication: {
                                            "$switch": {
                                              "branches": [{
                                                "case": {
                                                  "$and": [{
                                                    "$gte": [{
                                                      "$cond": {
                                                        "if": {
                                                          "$and": ["$dob", {
                                                            "$ne": ["$dob", ""]
                                                          }]
                                                        },
                                                        "then": {
                                                          "$toInt": {
                                                            "$divide": [{
                                                              "$subtract": [new Date(), {
                                                                "$toDate": "$dob"
                                                              }]
                                                            }, 31536000000]
                                                          }
                                                        },
                                                        "else": 0
                                                      }
                                                    }, 1]
                                                  }, {
                                                    "$lte": [{
                                                      "$cond": {
                                                        "if": {
                                                          "$and": ["$dob", {
                                                            "$ne": ["$dob", ""]
                                                          }]
                                                        },
                                                        "then": {
                                                          "$toInt": {
                                                            "$divide": [{
                                                              "$subtract": [new Date(), {
                                                                "$toDate": "$dob"
                                                              }]
                                                            }, 31536000000]
                                                          }
                                                        },
                                                        "else": 0
                                                      }
                                                    }, 14]
                                                  }]
                                                },
                                                "then": "< 14 Tahun"
                                              }, {
                                                "case": {
                                                  "$and": [{
                                                    "$gte": [{
                                                      "$cond": {
                                                        "if": {
                                                          "$and": ["$dob", {
                                                            "$ne": ["$dob", ""]
                                                          }]
                                                        },
                                                        "then": {
                                                          "$toInt": {
                                                            "$divide": [{
                                                              "$subtract": [new Date(), {
                                                                "$toDate": "$dob"
                                                              }]
                                                            }, 31536000000]
                                                          }
                                                        },
                                                        "else": 0
                                                      }
                                                    }, 14]
                                                  }, {
                                                    "$lte": [{
                                                      "$cond": {
                                                        "if": {
                                                          "$and": ["$dob", {
                                                            "$ne": ["$dob", ""]
                                                          }]
                                                        },
                                                        "then": {
                                                          "$toInt": {
                                                            "$divide": [{
                                                              "$subtract": [new Date(), {
                                                                "$toDate": "$dob"
                                                              }]
                                                            }, 31536000000]
                                                          }
                                                        },
                                                        "else": 0
                                                      }
                                                    }, 24]
                                                  }]
                                                },
                                                "then": "14 - 24 Tahun"
                                              }, {
                                                "case": {
                                                  "$and": [{
                                                    "$gte": [{
                                                      "$cond": {
                                                        "if": {
                                                          "$and": ["$dob", {
                                                            "$ne": ["$dob", ""]
                                                          }]
                                                        },
                                                        "then": {
                                                          "$toInt": {
                                                            "$divide": [{
                                                              "$subtract": [new Date(), {
                                                                "$toDate": "$dob"
                                                              }]
                                                            }, 31536000000]
                                                          }
                                                        },
                                                        "else": 0
                                                      }
                                                    }, 25]
                                                  }, {
                                                    "$lte": [{
                                                      "$cond": {
                                                        "if": {
                                                          "$and": ["$dob", {
                                                            "$ne": ["$dob", ""]
                                                          }]
                                                        },
                                                        "then": {
                                                          "$toInt": {
                                                            "$divide": [{
                                                              "$subtract": [new Date(), {
                                                                "$toDate": "$dob"
                                                              }]
                                                            }, 31536000000]
                                                          }
                                                        },
                                                        "else": 0
                                                      }
                                                    }, 35]
                                                  }]
                                                },
                                                "then": "24 - 35 Tahun"
                                              }, {
                                                "case": {
                                                  "$and": [{
                                                    "$gte": [{
                                                      "$cond": {
                                                        "if": {
                                                          "$and": ["$dob", {
                                                            "$ne": ["$dob", ""]
                                                          }]
                                                        },
                                                        "then": {
                                                          "$toInt": {
                                                            "$divide": [{
                                                              "$subtract": [new Date(), {
                                                                "$toDate": "$dob"
                                                              }]
                                                            }, 31536000000]
                                                          }
                                                        },
                                                        "else": 0
                                                      }
                                                    }, 35]
                                                  }, {
                                                    "$lte": [{
                                                      "$cond": {
                                                        "if": {
                                                          "$and": ["$dob", {
                                                            "$ne": ["$dob", ""]
                                                          }]
                                                        },
                                                        "then": {
                                                          "$toInt": {
                                                            "$divide": [{
                                                              "$subtract": [new Date(), {
                                                                "$toDate": "$dob"
                                                              }]
                                                            }, 31536000000]
                                                          }
                                                        },
                                                        "else": 0
                                                      }
                                                    }, 44]
                                                  }]
                                                },
                                                "then": "35 - 44 Tahun"
                                              }, {
                                                "case": {
                                                  "$gt": [{
                                                    "$cond": {
                                                      "if": {
                                                        "$and": ["$dob", {
                                                          "$ne": ["$dob", ""]
                                                        }]
                                                      },
                                                      "then": {
                                                        "$toInt": {
                                                          "$divide": [{
                                                            "$subtract": [new Date(), {
                                                              "$toDate": "$dob"
                                                            }]
                                                          }, 31536000000]
                                                        }
                                                      },
                                                      "else": 0
                                                    }
                                                  }, 43]
                                                },
                                                "then": "> 44 Tahun"
                                              }],
                                              "default": "OTHER"
                                            }
                                        },
                                    }
                                },
                                {
                                    "$project":
                                    {
                                        _id: 1,
                                        ageQualication: 1
                                    }
                                },
                            ]
                        }
                    },
                    {
                        "$project":
                        {
                            age:
                            {
                                "$ifNull":
                                [
                                  {
                                      "$arrayElemAt":
                                      [
                                          "$basic_data.ageQualication", 0
                                      ]
                                  },
                                  "OTHER"
                                ]
                            }
                        }
                    },
                    {
                        "$group":
                        {
                            _id: "$age",
                            count:
                            {
                                "$sum": 1
                            }
                        }
                    },
                    {
                        "$sort":
                        {
                            _id: -1
                        }
                    }
                ],
                "wilayah":
                [
                  {
                      "$unwind":
                      {
                          path: "$userView"
                      }
                  },
                  {
                    "$project":
                    {
                        userView: 1
                    }
                  },
                    {
                        "$lookup": {
                            "from": "newUserBasics",
                            "as": "basic_data",
                            "let": {
                                "local_id": "$userView"
                            },
                            "pipeline": [
                                {
                                    "$match":
                                    {
                                        "$expr":
                                        {
                                            "$eq":
                                            [
                                                "$email", "$$local_id"
                                            ]
                                        }
                                    }
                                },
                                {
                                    "$project":
                                    {
                                        _id: 1,
                                        statesName: 1,
                                    }
                                },
                                // {
                                //     $lookup: 
                                //     {
                                //         from: 'areas',
                                //         localField: 'states.$id',
                                //         foreignField: '_id',
                                //         as: 'areas_data',
                                //     },
                                // },
                                {
                                    "$project":
                                    {
                                        _id: 1,
                                        stateName:
                                        {
                                            "$ifNull":
                                            [
                                                "$statesName",
                                                "LAINNYA"
                                            ]
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "$project":
                        {
                            wilayah:
                            {
                                "$ifNull":
                                [
                                  {
                                      "$arrayElemAt":
                                      [
                                          "$basic_data.stateName", 0
                                      ]
                                  },
                                  "LAINNYA"
                                ]
                            }
                        }
                    },
                    {
                        "$group":
                        {
                            _id: "$wilayah",
                            count:
                            {
                                "$sum": 1
                            }
                        }
                    },
                    {
                        "$sort":
                        {
                            _id: -1
                        }
                    }
                ],
                "gender":
                [
                  {
                      "$unwind":
                      {
                          path: "$userView"
                      }
                  },
                  {
                    "$project":
                    {
                        userView: 1
                    }
                  },
                    {
                        "$lookup": {
                            "from": "newUserBasics",
                            "as": "basic_data",
                            "let": {
                                "local_id": "$userView"
                            },
                            "pipeline": [
                                {
                                    "$match":
                                    {
                                        "$expr":
                                        {
                                            "$eq":
                                            [
                                                "$email", "$$local_id"
                                            ]
                                        }
                                    }
                                },
                                {
                                    "$project":
                                    {
                                        _id: 1,
                                        gender: {
                                            $switch: {
                                                branches: [
                                                    {
                                                        case: {
                                                            $eq: ['$gender', 'FEMALE']
                                                        },
                                                        then: 'FEMALE',
                                
                                                    },
                                                    {
                                                        case: {
                                                            $eq: ['$gender', ' FEMALE']
                                                        },
                                                        then: 'FEMALE',
                                
                                                    },
                                                    {
                                                        case: {
                                                            $eq: ['$gender', 'Perempuan']
                                                        },
                                                        then: 'FEMALE',
                                
                                                    },
                                                    {
                                                        case: {
                                                            $eq: ['$gender', 'Wanita']
                                                        },
                                                        then: 'FEMALE',
                                
                                                    },
                                                    {
                                                        case: {
                                                            $eq: ['$gender', 'MALE']
                                                        },
                                                        then: 'MALE',
                                
                                                    },
                                                    {
                                                        case: {
                                                            $eq: ['$gender', ' MALE']
                                                        },
                                                        then: 'MALE',
                                
                                                    },
                                                    {
                                                        case: {
                                                            $eq: ['$gender', 'Laki-laki']
                                                        },
                                                        then: 'MALE',
                                
                                                    },
                                                    {
                                                        case: {
                                                            $eq: ['$gender', 'Pria']
                                                        },
                                                        then: 'MALE',
                                
                                                    },
                                
                                                ],
                                                default: "OTHER",
                                            },
                                        },
                                    }
                                },
                                {
                                    "$project":
                                    {
                                        _id: 1,
                                        gender: 1,
                                    }
                                },
                            ]
                        }
                    },
                    {
                        "$project":
                        {
                            gender:
                            {
                                "$ifNull":
                                [
                                  {
                                      "$arrayElemAt":
                                      [
                                          "$basic_data.gender", 0
                                      ]
                                  },
                                  "OTHER"
                                ]
                            }
                        }
                    },
                    {
                        "$group":
                        {
                            _id: "$gender",
                            count:
                            {
                                "$sum": 1
                            }
                        }
                    },
                    {
                        "$sort":
                        {
                            _id: -1
                        }
                    }
                ],
                "listtag":
                [
                      {
                          "$project":
                          {
                              tagPeople: 1
                          }
                      },
                      {
                          "$unwind":
                          {
                              path: "$tagPeople",
                          }
                      },
                      {
                          $lookup: 
                          {
                              from: 'newUserBasics',
                              let: 
                              {
                                  local: '$tagPeople.$id'
                              },
                              as: 'authdata',
                              pipeline:
                              [
                                  {
                                      "$match":
                                      {
                                          "$or":
                                          [
                                              {
                                                  "$expr":
                                                  {
                                                      "$eq":
                                                      [
                                                          "$_idAuth", "$$local"
                                                      ]
                                                  }
                                              },
                                              {
                                                  "$expr":
                                                  {
                                                      "$eq":
                                                      [
                                                          "$_id", "$$local"
                                                      ]
                                                  }
                                              },
                                          ]
                                      }
                                  }
                              ]
                          }
                      },
                      {
                          "$unwind":
                          {
                              path: "$authdata"
                          }
                      },
                      {
                          "$project":
                          {
                              username: "$authdata.username"
                          }
                      },
                      {
                          "$group":
                          {
                              _id: null,
                              data:
                              {
                                  "$push": "$username"
                              }
                          }
                      },
                ]
            }
        },
        {
            "$project":
            {
              _id:
              {
                  "$arrayElemAt":
                  [
                      "$detail._id", 0
                  ]
              },
              postID:
              {
                  "$arrayElemAt":
                  [
                      "$detail.postID", 0
                  ]
              },
              email:
              {
                  "$arrayElemAt":
                  [
                      "$detail.email", 0
                  ]
              },
              postType:
              {
                  "$arrayElemAt":
                  [
                      "$detail.postType", 0
                  ]
              },
              description:
              {
                  "$arrayElemAt":
                  [
                      "$detail.description", 0
                  ]
              },
              active:
              {
                  "$arrayElemAt":
                  [
                      "$detail.active", 0
                  ]
              },
              createdAt:
              {
                  "$arrayElemAt":
                  [
                      "$detail.createdAt", 0
                  ]
              },
              updatedAt:
              {
                  "$arrayElemAt":
                  [
                      "$detail.updatedAt", 0
                  ]
              },
              visibility:
              {
                  "$arrayElemAt":
                  [
                      "$detail.visibility", 0
                  ]
              },
              location:
              {
                  "$arrayElemAt":
                  [
                      "$detail.location", 0
                  ]
              },
              tags:
              {
                  "$arrayElemAt":
                  [
                      "$detail.tags", 0
                  ]
              },
              allowComments:
              {
                  "$arrayElemAt":
                  [
                      "$detail.allowComments", 0
                  ]
              },
              likes:
              {
                  "$arrayElemAt":
                  [
                      "$detail.likes", 0
                  ]
              },
              views:
              {
                  "$arrayElemAt":
                  [
                      "$detail.views", 0
                  ]
              },
              shares:
              {
                  "$arrayElemAt":
                  [
                      "$detail.shares", 0
                  ]
              },
              tagPeople:
              {
                  "$arrayElemAt":
                  [
                      "$listtag.data", 0
                  ]
              },
              tagDescription:
              {
                  "$arrayElemAt":
                  [
                      "$detail.tagDescription", 0
                  ]
              },
              kategori:
              {
                  "$arrayElemAt":
                  [
                      "$detail.kategori", 0
                  ]
              },
              username:
              {
                  "$arrayElemAt":
                  [
                      "$detail.username", 0
                  ]
              },
              saleAmount:
              {
                  "$arrayElemAt":
                  [
                      "$detail.saleAmount", 0
                  ]
              },
              saleView:
              {
                  "$arrayElemAt":
                  [
                      "$detail.saleView", 0
                  ]
              },
              saleLike:
              {
                  "$arrayElemAt":
                  [
                      "$detail.saleLike", 0
                  ]
              },
              type:
              {
                  "$arrayElemAt":
                  [
                      "$detail.type", 0
                  ]
              },
              kepemilikan:
              {
                  "$arrayElemAt":
                  [
                      "$detail.kepemilikan", 0
                  ]
              },
              statusJual:
              {
                  "$arrayElemAt":
                  [
                      "$detail.statusJual", 0
                  ]
              },
              mediaBasePath:
              {
                  "$arrayElemAt":
                  [
                      "$detail.mediaBasePath", 0
                  ]
              },
              mediaUri:
              {
                  "$arrayElemAt":
                  [
                      "$detail.mediaUri", 0
                  ]
              },
              mediaType:
              {
                  "$arrayElemAt":
                  [
                      "$detail.mediaType", 0
                  ]
              },
              mediaThumbEndpoint:
              {
                  "$arrayElemAt":
                  [
                      "$detail.mediaThumbEndpoint", 0
                  ]
              },
              mediaEndpoint:
              {
                  "$arrayElemAt":
                  [
                      "$detail.mediaEndpoint", 0
                  ]
              },
              apsaraId:
              {
                  "$arrayElemAt":
                  [
                      "$detail.apsaraId", 0
                  ]
              },
              apsara:
              {
                  "$arrayElemAt":
                  [
                      "$detail.apsara", 0
                  ]
              },
              originalName:
              {
                  "$arrayElemAt":
                  [
                      "$detail.originalName", 0
                  ]
              },
              comment:
              {
                  "$arrayElemAt":
                  [
                      "$detail.comment", 0
                  ]
              },
              riwayat:
              {
                  "$arrayElemAt":
                  [
                      "$detail.riwayat", 0
                  ]
              },
              age: "$age",
              wilayah: "$wilayah",
              gender: "$gender"
            }
        }
      ]);

      return query;
    }

    async findcontentbysearch(key: string, email: string, skip: number, limit: number, pict: any, vid: any, diary: any, user: any) {
      var pipeline = [];
      pipeline.push(
        {
          "$project":
          {
            "dedy": key
          }
        },
        {
          "$limit": 1
        }
      );

      var facet = {};
      if (user == true) {
        facet['user'] = [
          {
              "$lookup":
              {
                  from: "newUserBasics",
                  let:
                  {
                      name: "$dedy"
                  },
                  as: "userdata",
                  pipeline:
                  [
                      {
                          "$match":
                          {
                              "$expr":
                              {
                                  "$regexMatch":
                                  {
                                      input: "$username",
                                      regex: "$$name",
                                      options: "i"
                                  }
                              }
                          }
                      }
                  ]
              }
          },
          {
              "$unwind":
              {
                  path: "$userdata",
                  // preserveNullAndEmptyArrays: true
              }
          },
          {
              "$project":
              {
                  fullName: "$userdata.fullName",
                  profilePict: "$userdata.profilePict",
                  username: "$userdata.username",
                  email: "$userdata.email",
                  avatar:
                  {
                      mediaBasePath: 
                      {
                        "$ifNull":
                        [
                          "$userdata.mediaBasePath",
                          null
                        ]
                      },
                      mediaUri: 
                      {
                        "$ifNull":
                        [
                          "$userdata.mediaUri",
                          null
                        ]
                      },
                      mediaType: 
                      {
                        "$ifNull":
                        [
                          "$userdata.mediaType",
                          null
                        ]
                      },
                      mediaEndpoint: 
                      {
                        "$ifNull":
                        [
                          "$userdata.mediaEndpoint",
                          null
                        ]
                      },
                  },
                  urluserBadge:
                  {
                      "$ifNull":
                      [
                          {
                              "$filter":
                              {
                                  input:
                                  {
                                      "$arrayElemAt":
                                      [
                                          "$userdata.userBadge", 0
                                      ]
                                  },
                                  as: "listbadge",
                                  cond:
                                  {
                                      "$and":
                                      [
                                          {
                                              "$eq":
                                              [
                                                  "$$listbadge.isActive", true
                                              ]
                                          },
                                          {
                                              "$lte": [
                                              {
                                                  "$dateToString": {
                                                  "format": "%Y-%m-%d %H:%M:%S",
                                                  "date": {
                                                      "$add": [
                                                      new Date(),
                                                      25200000
                                                      ]
                                                  }
                                                  }
                                              },
                                              "$$listbadge.endDatetime"
                                              ]
                                          }
                                      ]
                                  }
                              }
                          },
                          []
                      ]
                  },
              }       
          },
          {
              "$project":
              {
                  fullName: 1,
                  profilePict: 1,
                  username: 1,
                  email: 1,
                  avatar: 1,
                  urluserBadge:
                  {
                      "$ifNull":
                      [
                          {
                              "$arrayElemAt":
                              [
                                  "$urluserBadge", 0
                              ]
                          },
                          "$$REMOVE"
                      ]
                  }
              }
          },
          {
              "$skip": (skip * limit)
          },
          {
              "$limit": limit
          },
        ];
      }

      if (pict == true) {
        facet['pict'] = [
          {
              "$lookup":
              {
                  from: "newPosts",
                  let:
                  {
                      name: "$dedy"
                  },
                  as: "postdata",
                  pipeline:
                  [
                      {
                          "$match":
                          {
                              "$and":
                              [
                                  {
                                      "$expr":
                                      {
                                          "$regexMatch":
                                          {
                                              input: "$description",
                                              regex: "$$name",
                                              options: "i"
                                          }
                                      }
                                  },
                                  {
                                      "reportedStatus":
                                      {
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
                                      "postType": "pict"
                                  },
                                  {
                                      "reportedUser.email":
                                      {
                                          "$not":
                                          {
                                              "$regex": email
                                          }
                                      }
                                  }
                              ]
                          }
                      },
                      {
                          "$project":
                          {
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
                                      }, "$boosted.boostSession.timeEnd"]
                                    },
                                    then: [],
                                    else: '$boosted'
                                  }
                              },
                              "reportedStatus": 1,
                              "insight": {
                                  "shares": "$shares",
                                  "comments": "$comments",
                                  "views": "$views",
                                  "likes": "$likes",

                              },
                              "_id": 1,
                              "postID": 1,
                              "createdAt": 1,
                              "updatedAt": 1,
                              "email": 1,
                              "postType": 1,
                              "description": 1,
                              "active": 1,
                              "metadata": 1,
                              "location": 1,
                              "isOwned": 1,
                              "visibility": 1,
                              "isViewed": 1,
                              "allowComments": 1,
                              "saleAmount": 1,
                              "certified": 1,
                              "mediaSource": 
                              {
                                  "$arrayElemAt":
                                  [
                                      "$mediaSource", 0
                                  ]
                              },
                              "isLiked":
                              {
                                  "$ifNull":
                                  [
                                      {
                                          "$filter":
                                          {
                                              input: "$userLike",
                                              as: "datalike",
                                              cond:
                                              {
                                                  "$eq":
                                                  [
                                                      "$$datalike",
                                                      email
                                                  ]
                                              }
                                          }
                                      },
                                      []
                                  ]
                              },
                              "idUser":1
                          }
                      },
                      {
                          "$lookup":
                          {
                              from: "newUserBasics",
                              localField: "idUser",
                              foreignField: "_id",
                              as: "authdata"
                          }
                      },
                      {
                          "$addFields":
                          {
                              "cleanUri":
                              { 
                                  $replaceOne: 
                                  { 
                                      input: "$mediaSource.mediaUri", 
                                      find: "_0001.jpeg", 
                                      replacement: "" 
                                  }
                              }
                          }
                      },
                      {
                          "$project":
                          {
                              "boosted": 1,
                              "reportedStatus": 1,
                              "insight": 1,
                              "_id": 1,
                              "postID": 1,
                              "createdAt": 1,
                              "updatedAt": 1,
                              "email": 1,
                              "postType": 1,
                              "description": 1,
                              "active": 1,
                              "metadata": 1,
                              "location": 1,
                              "isOwned": 1,
                              "visibility": 1,
                              "isViewed": 1,
                              "allowComments": 1,
                              "saleAmount": 1,
                              "isLiked": 
                              {
                                  "$cond":
                                  {
                                      if:
                                      {
                                          "eq":
                                          [
                                              {
                                                  "$size": "$isLiked"
                                              },
                                              0
                                          ]
                                      },
                                      then: false,
                                      else: true
                                  }
                              },
                              "certified": 1,
                              "username":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$authdata.username", 0
                                  ]
                              },
                              "profilepictid":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$authdata.profilePict", 0
                                  ]
                              },
                              "urluserBadge":
                              {
                                  "$ifNull":
                                  [
                                      {
                                          "$filter":
                                          {
                                              input:
                                              {
                                                  "$arrayElemAt":
                                                  [
                                                      "$authdata.userBadge", 0
                                                  ]
                                              },
                                              as: "listbadge",
                                              cond:
                                              {
                                                  "$and":
                                                  [
                                                      {
                                                      "$eq":
                                                          [
                                                              "$$listbadge.isActive", true
                                                          ]
                                                      },
                                                      {
                                                          "$lte": [
                                                              {
                                                                  "$dateToString": {
                                                                      "format": "%Y-%m-%d %H:%M:%S",
                                                                      "date": {
                                                                          "$add": [
                                                                              new Date(),
                                                                              25200000
                                                                          ]
                                                                      }
                                                                  }
                                                              },
                                                              "$$listbadge.endDatetime"
                                                          ]
                                                      }
                                                  ]
                                              }
                                          }
                                      },
                                      []
                                  ]
                              },
                              "avatar":
                              {
                                  "mediaEndpoint":
                                  {
                                      "$ifNull":
                                      [
                                          {
                                              "$arrayElemAt":
                                              [
                                                  "$authdata.mediaEndpoint", 0
                                              ]
                                          },
                                          null
                                      ]
                                  }
                              },
                              mediaBasePath:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.mediaBasePath",
                                      null
                                  ]
                              },
                              mediaUri:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.mediaUri",
                                      null
                                  ]
                              },
                              mediaType:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.mediaType",
                                      null
                                  ]
                              },
                              mediaThumbEndpoint:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.mediaThumbEndpoint",
                                      {
                                          "$concat":
                                          [
                                              "/thumb/",
                                              "$cleanUri"
                                          ]
                                      }
                                  ]
                              },
                              mediaEndpoint:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.mediaEndpoint",
                                      {
                                          "$cond":
                                          {
                                              if:
                                              {
                                                  "$eq":
                                                  [
                                                      "$postType", "pict"
                                                  ]
                                              },
                                              then:
                                              {
                                                  "$concat":
                                                  [
                                                      "/pict/",
                                                      "$cleanUri"
                                                  ]
                                              },
                                              else:
                                              {
                                                  "$concat":
                                                  [
                                                      "/stream/",
                                                      "$cleanUri"
                                                  ]
                                              }
                                          }
                                      }
                                  ]
                              },
                              isApsara:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.apsara",
                                      false
                                  ]
                              },
                              apsaraId:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.apsaraId",
                                      null
                                  ]
                              }
                          }
                      },
                      {
                          "$skip": (skip * limit)
                      },
                      {
                          "$limit": limit
                      }
                  ]
              }
          },
          {
              "$unwind":
              {
                  path: "$postdata",
                  // preserveNullAndEmptyArrays: true
              }
          },
          {
              "$project":
              {
                  boosted: "$postdata.boosted",
                  reportedStatus: "$postdata.reportedStatus",
                  insight: "$postdata.insight",
                  _id: "$postdata._id",
                  postID: "$postdata.postID",
                  createdAt: "$postdata.createdAt",
                  updatedAt: "$postdata.updatedAt",
                  email: "$postdata.email",
                  postType: "$postdata.postType",
                  description: "$postdata.description",
                  active: "$postdata.active",
                  metadata: "$postdata.metadata",
                  location: "$postdata.location",
                  isOwned: "$postdata.isOwned",
                  visibility: "$postdata.visibility",
                  isViewed: "$postdata.isViewed",
                  allowComments: "$postdata.allowComments",
                  saleAmount: "$postdata.saleAmount",
                  isLiked: "$postdata.isLiked",
                  certified: "$postdata.certified",
                  username: "$postdata.username",
                  profilepictid: "$postdata.profilepictid",
                  urluserBadge:
                  {
                      "$ifNull":
                      [
                          {
                              "$arrayElemAt":
                              [
                                  "$postdata.urluserBadge", 0
                              ]
                          },
                          null
                      ]
                  },
                  avatar: "$postdata.avatar",
                  mediaThumbEndpoint: "$postdata.mediaThumbEndpoint",
                  mediaEndpoint: "$postdata.mediaEndpoint",
                  mediaType: "$postdata.mediaType",
                  isApsara: "$postdata.isApsara",
                  apsaraId: "$postdata.apsaraId",
              }
          }
        ];
      }

      if (vid == true) {
        facet['vid'] = [
          {
              "$lookup":
              {
                  from: "newPosts",
                  let:
                  {
                      name: "$dedy"
                  },
                  as: "postdata",
                  pipeline:
                  [
                      {
                          "$match":
                          {
                              "$and":
                              [
                                  {
                                      "$expr":
                                      {
                                          "$regexMatch":
                                          {
                                              input: "$description",
                                              regex: "$$name",
                                              options: "i"
                                          }
                                      }
                                  },
                                  {
                                      "reportedStatus":
                                      {
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
                                      "postType": "vid"
                                  },
                                  {
                                      "reportedUser.email":
                                      {
                                          "$not":
                                          {
                                              "$regex": email
                                          }
                                      }
                                  }
                              ]
                          }
                      },
                      {
                          "$project":
                          {
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
                                      }, "$boosted.boostSession.timeEnd"]
                                    },
                                    then: [],
                                    else: '$boosted'
                                  }
                              },
                              "reportedStatus": 1,
                              "insight": {
                                  "shares": "$shares",
                                  "comments": "$comments",
                                  "views": "$views",
                                  "likes": "$likes",

                              },
                              "_id": 1,
                              "postID": 1,
                              "createdAt": 1,
                              "updatedAt": 1,
                              "email": 1,
                              "postType": 1,
                              "description": 1,
                              "active": 1,
                              "metadata": 1,
                              "location": 1,
                              "isOwned": 1,
                              "visibility": 1,
                              "isViewed": 1,
                              "allowComments": 1,
                              "saleAmount": 1,
                              "certified": 1,
                              "mediaSource": 
                              {
                                  "$arrayElemAt":
                                  [
                                      "$mediaSource", 0
                                  ]
                              },
                              "isLiked":
                              {
                                  "$ifNull":
                                  [
                                      {
                                          "$filter":
                                          {
                                              input: "$userLike",
                                              as: "datalike",
                                              cond:
                                              {
                                                  "$eq":
                                                  [
                                                      "$$datalike",
                                                      email
                                                  ]
                                              }
                                          }
                                      },
                                      []
                                  ]
                              },
                              "idUser":1
                          }
                      },
                      {
                          "$lookup":
                          {
                              from: "newUserBasics",
                              localField: "idUser",
                              foreignField: "_id",
                              as: "authdata"
                          }
                      },
                      {
                          "$addFields":
                          {
                              "cleanUri":
                              { 
                                  $replaceOne: 
                                  { 
                                      input: "$mediaSource.mediaUri", 
                                      find: "_0001.jpeg", 
                                      replacement: "" 
                                  }
                              }
                          }
                      },
                      {
                          "$project":
                          {
                              "boosted": 1,
                              "reportedStatus": 1,
                              "insight": 1,
                              "_id": 1,
                              "postID": 1,
                              "createdAt": 1,
                              "updatedAt": 1,
                              "email": 1,
                              "postType": 1,
                              "description": 1,
                              "active": 1,
                              "metadata": 1,
                              "location": 1,
                              "isOwned": 1,
                              "visibility": 1,
                              "isViewed": 1,
                              "allowComments": 1,
                              "saleAmount": 1,
                              "isLiked": 
                              {
                                  "$cond":
                                  {
                                      if:
                                      {
                                          "eq":
                                          [
                                              {
                                                  "$size": "$isLiked"
                                              },
                                              0
                                          ]
                                      },
                                      then: false,
                                      else: true
                                  }
                              },
                              "certified": 1,
                              "username":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$authdata.username", 0
                                  ]
                              },
                              "profilepictid":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$authdata.profilePict", 0
                                  ]
                              },
                              "urluserBadge":
                              {
                                  "$ifNull":
                                  [
                                      {
                                          "$filter":
                                          {
                                              input:
                                              {
                                                  "$arrayElemAt":
                                                  [
                                                      "$authdata.userBadge", 0
                                                  ]
                                              },
                                              as: "listbadge",
                                              cond:
                                              {
                                                  "$and":
                                                  [
                                                      {
                                                      "$eq":
                                                          [
                                                              "$$listbadge.isActive", true
                                                          ]
                                                      },
                                                      {
                                                          "$lte": [
                                                              {
                                                                  "$dateToString": {
                                                                      "format": "%Y-%m-%d %H:%M:%S",
                                                                      "date": {
                                                                          "$add": [
                                                                              new Date(),
                                                                              25200000
                                                                          ]
                                                                      }
                                                                  }
                                                              },
                                                              "$$listbadge.endDatetime"
                                                          ]
                                                      }
                                                  ]
                                              }
                                          }
                                      },
                                      []
                                  ]
                              },
                              "avatar":
                              {
                                  "mediaEndpoint":
                                  {
                                      "$ifNull":
                                      [
                                          {
                                              "$arrayElemAt":
                                              [
                                                  "$authdata.mediaEndpoint", 0
                                              ]
                                          },
                                          null
                                      ]
                                  }
                              },
                              mediaBasePath:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.mediaBasePath",
                                      null
                                  ]
                              },
                              mediaUri:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.mediaUri",
                                      null
                                  ]
                              },
                              mediaType:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.mediaType",
                                      null
                                  ]
                              },
                              mediaThumbEndpoint:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.mediaThumbEndpoint",
                                      {
                                          "$concat":
                                          [
                                              "/thumb/",
                                              "$cleanUri"
                                          ]
                                      }
                                  ]
                              },
                              mediaEndpoint:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.mediaEndpoint",
                                      {
                                          "$cond":
                                          {
                                              if:
                                              {
                                                  "$eq":
                                                  [
                                                      "$postType", "pict"
                                                  ]
                                              },
                                              then:
                                              {
                                                  "$concat":
                                                  [
                                                      "/pict/",
                                                      "$cleanUri"
                                                  ]
                                              },
                                              else:
                                              {
                                                  "$concat":
                                                  [
                                                      "/stream/",
                                                      "$cleanUri"
                                                  ]
                                              }
                                          }
                                      }
                                  ]
                              },
                              isApsara:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.apsara",
                                      false
                                  ]
                              },
                              apsaraId:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.apsaraId",
                                      null
                                  ]
                              }
                          }
                      },
                      {
                          "$skip": (skip * limit)
                      },
                      {
                          "$limit": limit
                      }
                  ]
              }
          },
          {
              "$unwind":
              {
                  path: "$postdata",
                  // preserveNullAndEmptyArrays: true
              }
          },
          {
              "$project":
              {
                  boosted: "$postdata.boosted",
                  reportedStatus: "$postdata.reportedStatus",
                  insight: "$postdata.insight",
                  _id: "$postdata._id",
                  postID: "$postdata.postID",
                  createdAt: "$postdata.createdAt",
                  updatedAt: "$postdata.updatedAt",
                  email: "$postdata.email",
                  postType: "$postdata.postType",
                  description: "$postdata.description",
                  active: "$postdata.active",
                  metadata: "$postdata.metadata",
                  location: "$postdata.location",
                  isOwned: "$postdata.isOwned",
                  visibility: "$postdata.visibility",
                  isViewed: "$postdata.isViewed",
                  allowComments: "$postdata.allowComments",
                  saleAmount: "$postdata.saleAmount",
                  isLiked: "$postdata.isLiked",
                  certified: "$postdata.certified",
                  username: "$postdata.username",
                  profilepictid: "$postdata.profilepictid",
                  urluserBadge:
                  {
                      "$ifNull":
                      [
                          {
                              "$arrayElemAt":
                              [
                                  "$postdata.urluserBadge", 0
                              ]
                          },
                          null
                      ]
                  },
                  avatar: "$postdata.avatar",
                  mediaThumbEndpoint: "$postdata.mediaThumbEndpoint",
                  mediaEndpoint: "$postdata.mediaEndpoint",
                  mediaType: "$postdata.mediaType",
                  isApsara: "$postdata.isApsara",
                  apsaraId: "$postdata.apsaraId",
              }
          }
        ]
      }

      if (diary == true) {
        facet['diary'] = [
          {
              "$lookup":
              {
                  from: "newPosts",
                  let:
                  {
                      name: "$dedy"
                  },
                  as: "postdata",
                  pipeline:
                  [
                      {
                          "$match":
                          {
                              "$and":
                              [
                                  {
                                      "$expr":
                                      {
                                          "$regexMatch":
                                          {
                                              input: "$description",
                                              regex: "$$name",
                                              options: "i"
                                          }
                                      }
                                  },
                                  {
                                      "reportedStatus":
                                      {
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
                                      "postType": "diary"
                                  },
                                  {
                                      "reportedUser.email":
                                      {
                                          "$not":
                                          {
                                              "$regex": email
                                          }
                                      }
                                  }
                              ]
                          }
                      },
                      {
                          "$project":
                          {
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
                                      }, "$boosted.boostSession.timeEnd"]
                                    },
                                    then: [],
                                    else: '$boosted'
                                  }
                              },
                              "reportedStatus": 1,
                              "insight": {
                                  "shares": "$shares",
                                  "comments": "$comments",
                                  "views": "$views",
                                  "likes": "$likes",

                              },
                              "_id": 1,
                              "postID": 1,
                              "createdAt": 1,
                              "updatedAt": 1,
                              "email": 1,
                              "postType": 1,
                              "description": 1,
                              "active": 1,
                              "metadata": 1,
                              "location": 1,
                              "isOwned": 1,
                              "visibility": 1,
                              "isViewed": 1,
                              "allowComments": 1,
                              "saleAmount": 1,
                              "certified": 1,
                              "mediaSource": 
                              {
                                  "$arrayElemAt":
                                  [
                                      "$mediaSource", 0
                                  ]
                              },
                              "isLiked":
                              {
                                  "$ifNull":
                                  [
                                      {
                                          "$filter":
                                          {
                                              input: "$userLike",
                                              as: "datalike",
                                              cond:
                                              {
                                                  "$eq":
                                                  [
                                                      "$$datalike",
                                                      email
                                                  ]
                                              }
                                          }
                                      },
                                      []
                                  ]
                              },
                              "idUser":1
                          }
                      },
                      {
                          "$lookup":
                          {
                              from: "newUserBasics",
                              localField: "idUser",
                              foreignField: "_id",
                              as: "authdata"
                          }
                      },
                      {
                          "$addFields":
                          {
                              "cleanUri":
                              { 
                                  $replaceOne: 
                                  { 
                                      input: "$mediaSource.mediaUri", 
                                      find: "_0001.jpeg", 
                                      replacement: "" 
                                  }
                              }
                          }
                      },
                      {
                          "$project":
                          {
                              "boosted": 1,
                              "reportedStatus": 1,
                              "insight": 1,
                              "_id": 1,
                              "postID": 1,
                              "createdAt": 1,
                              "updatedAt": 1,
                              "email": 1,
                              "postType": 1,
                              "description": 1,
                              "active": 1,
                              "metadata": 1,
                              "location": 1,
                              "isOwned": 1,
                              "visibility": 1,
                              "isViewed": 1,
                              "allowComments": 1,
                              "saleAmount": 1,
                              "isLiked": 
                              {
                                  "$cond":
                                  {
                                      if:
                                      {
                                          "eq":
                                          [
                                              {
                                                  "$size": "$isLiked"
                                              },
                                              0
                                          ]
                                      },
                                      then: false,
                                      else: true
                                  }
                              },
                              "certified": 1,
                              "username":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$authdata.username", 0
                                  ]
                              },
                              "profilepictid":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$authdata.profilePict", 0
                                  ]
                              },
                              "urluserBadge":
                              {
                                  "$ifNull":
                                  [
                                      {
                                          "$filter":
                                          {
                                              input:
                                              {
                                                  "$arrayElemAt":
                                                  [
                                                      "$authdata.userBadge", 0
                                                  ]
                                              },
                                              as: "listbadge",
                                              cond:
                                              {
                                                  "$and":
                                                  [
                                                      {
                                                      "$eq":
                                                          [
                                                              "$$listbadge.isActive", true
                                                          ]
                                                      },
                                                      {
                                                          "$lte": [
                                                              {
                                                                  "$dateToString": {
                                                                      "format": "%Y-%m-%d %H:%M:%S",
                                                                      "date": {
                                                                          "$add": [
                                                                              new Date(),
                                                                              25200000
                                                                          ]
                                                                      }
                                                                  }
                                                              },
                                                              "$$listbadge.endDatetime"
                                                          ]
                                                      }
                                                  ]
                                              }
                                          }
                                      },
                                      []
                                  ]
                              },
                              "avatar":
                              {
                                  "mediaEndpoint":
                                  {
                                      "$ifNull":
                                      [
                                          {
                                              "$arrayElemAt":
                                              [
                                                  "$authdata.mediaEndpoint", 0
                                              ]
                                          },
                                          null
                                      ]
                                  }
                              },
                              mediaBasePath:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.mediaBasePath",
                                      null
                                  ]
                              },
                              mediaUri:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.mediaUri",
                                      null
                                  ]
                              },
                              mediaType:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.mediaType",
                                      null
                                  ]
                              },
                              mediaThumbEndpoint:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.mediaThumbEndpoint",
                                      {
                                          "$concat":
                                          [
                                              "/thumb/",
                                              "$cleanUri"
                                          ]
                                      }
                                  ]
                              },
                              mediaEndpoint:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.mediaEndpoint",
                                      {
                                          "$cond":
                                          {
                                              if:
                                              {
                                                  "$eq":
                                                  [
                                                      "$postType", "pict"
                                                  ]
                                              },
                                              then:
                                              {
                                                  "$concat":
                                                  [
                                                      "/pict/",
                                                      "$cleanUri"
                                                  ]
                                              },
                                              else:
                                              {
                                                  "$concat":
                                                  [
                                                      "/stream/",
                                                      "$cleanUri"
                                                  ]
                                              }
                                          }
                                      }
                                  ]
                              },
                              isApsara:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.apsara",
                                      false
                                  ]
                              },
                              apsaraId:
                              {
                                  "$ifNull":
                                  [
                                      "$mediaSource.apsaraId",
                                      null
                                  ]
                              }
                          }
                      },
                      {
                          "$skip": (skip * limit)
                      },
                      {
                          "$limit": limit
                      }
                  ]
              }
          },
          {
              "$unwind":
              {
                  path: "$postdata",
                  // preserveNullAndEmptyArrays: true
              }
          },
          {
              "$project":
              {
                  boosted: "$postdata.boosted",
                  reportedStatus: "$postdata.reportedStatus",
                  insight: "$postdata.insight",
                  _id: "$postdata._id",
                  postID: "$postdata.postID",
                  createdAt: "$postdata.createdAt",
                  updatedAt: "$postdata.updatedAt",
                  email: "$postdata.email",
                  postType: "$postdata.postType",
                  description: "$postdata.description",
                  active: "$postdata.active",
                  metadata: "$postdata.metadata",
                  location: "$postdata.location",
                  isOwned: "$postdata.isOwned",
                  visibility: "$postdata.visibility",
                  isViewed: "$postdata.isViewed",
                  allowComments: "$postdata.allowComments",
                  saleAmount: "$postdata.saleAmount",
                  isLiked: "$postdata.isLiked",
                  certified: "$postdata.certified",
                  username: "$postdata.username",
                  profilepictid: "$postdata.profilepictid",
                  urluserBadge:
                  {
                      "$ifNull":
                      [
                          {
                              "$arrayElemAt":
                              [
                                  "$postdata.urluserBadge", 0
                              ]
                          },
                          null
                      ]
                  },
                  avatar: "$postdata.avatar",
                  mediaThumbEndpoint: "$postdata.mediaThumbEndpoint",
                  mediaEndpoint: "$postdata.mediaEndpoint",
                  mediaType: "$postdata.mediaType",
                  isApsara: "$postdata.isApsara",
                  apsaraId: "$postdata.apsaraId",
              }
          }
        ]
      }

      pipeline.push(
        {
          "$facet": facet
        }
      );

      var setutil = require('util');
      console.log(setutil.inspect(pipeline, { showHidden:false, depth:null }));

      var query = await this.loaddata.aggregate(pipeline);

      return query;
    }

    async findalldatakontenmultiple(userid: string, email: string, ownership: any, monetesisasi: boolean, buy: boolean, archived: boolean, reported: boolean, postType: string, startdate: string, enddate: string, skip: number, limit: number) {
      try {
        var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));
  
        var dateend = currentdate.toISOString();
      } catch (e) {
        dateend = "";
      }

      var mongo = require('mongoose');
      var konvertid = mongo.Types.ObjectId(userid);

      var pipeline = [];
      if (buy && buy != undefined) {
        pipeline.push(
          {
              "$project":
              {
                  "idUser": konvertid
              }
          },
          {
              "$limit": 1
          },
          {
              "$lookup":
              {
                  from: "transactions",
                  as: "trans_data",
                  let:
                  {
                      trans_fk: "$idUser"
                  },
                  pipeline:
                  [
                      {
                          "$match":
                          {
                              "$and":
                              [
                                  {
                                      "$expr":
                                      {
                                          "$eq":
                                          [
                                              "$iduserbuyer", "$$trans_fk"
                                          ]
                                      }
                                  },
                                  {
                                      "status": "Success"
                                  }
                              ]
                          }
                      }
                  ]
              }
          },
          {
              "$unwind":
              {
                  path: "$trans_data",
                  preserveNullAndEmptyArrays: true
              }
          },
          {
              "$lookup": 
              {
                  "from": "newPosts",
                  "localField": "trans_data.postid",
                  "foreignField": "postID",
                  "as": "post_data"
              }
          },
          {
              "$unwind":
              {
                  path: "$post_data",
                  // preserveNullAndEmptyArrays:true
              }
          },
          {
              "$lookup": 
              {
                from: 'newUserBasics',
                localField: 'post_data.idUser',
                foreignField: '_id',
                as: 'basicdata',
              }
          },
          {
              "$addFields":
              {
                  "auth":
                  {
                      "$arrayElemAt":
                      [
                          "$basicdata", 0
                      ]
                  },
                  "insight":
                  {
                      "$arrayElemAt":
                      [
                          "$basicdata.insight.$id", 0
                      ]
                  },
                  "cleanUri":
                  {
                      "$replaceOne":
                      {
                          input:
                          {
                              "$arrayElemAt":
                              [
                                  "$post_data.mediaSource.mediaUri", 0
                              ]
                          },
                          find: "_0001.jpeg",
                          replacement: ""
                      }
                  },
                  "tempmediaSource":
                  {
                      "$arrayElemAt":
                      [
                          "$post_data.mediaSource", 0
                      ]
                  },
                  "monetize": true,
                  "trans_data": "$trans_data",
                  "tempreportedUserCount":
                  {
                      "$ifNull":
                      [
                          {
                              "$filter":
                              {
                                  input: "$reportedUser",
                                  as: "listuser",
                                  cond:
                                  {
                                  "$eq":
                                      [
                                      "$$listuser.active",
                                      true
                                      ]
                                  }
                              }
                          },
                          []
                      ]
                  }
              }
          },
          {
              "$lookup": 
              {
                from: 'insights',
                localField: 'insight',
                foreignField: '_id',
                as: 'insight_data',
              }
          },
          {
              "$project":
              {
                  trans: "$trans_data",
                  _id: "$post_data._id",
                  insight:
                  {
                      "shares":
                      {
                          "$arrayElemAt":
                          [
                              "$insight_data.shares", 0
                          ]
                      },
                      "followers":
                      {
                          "$arrayElemAt":
                          [
                              "$insight_data.followers", 0
                          ]
                      },
                      "comments":
                      {
                          "$arrayElemAt":
                          [
                              "$insight_data.comments", 0
                          ]
                      },
                      "followings":
                      {
                          "$arrayElemAt":
                          [
                              "$insight_data.followings", 0
                          ]
                      },
                      "reactions":
                      {
                          "$arrayElemAt":
                          [
                              "$insight_data.reactions", 0
                          ]
                      },
                      "posts":
                      {
                          "$arrayElemAt":
                          [
                              "$insight_data.posts", 0
                          ]
                      },
                      "views":
                      {
                          "$arrayElemAt":
                          [
                              "$insight_data.views", 0
                          ]
                      },
                      "likes":
                      {
                          "$arrayElemAt":
                          [
                              "$insight_data.likes", 0
                          ]
                      },
                  },
                  "avatar": 
                  {
                      mediaBasePath: "$auth.mediaBasePath",
                      mediaUri: "$auth.mediaUri",
                      mediaType: "$auth.mediaType",
                      mediaEndpoint: "$auth.mediaEndpoint",
                  },
                  "fullName": "$auth.fullName",
                  "username": "$auth.username",
                  "createdAt": "$post_data.createdAt",
                  "updatedAt": "$post_data.updatedAt",
                  "postID": "$post_data.postID",
                  "email": "$auth.email",
                  "postType": "$post_data.postType",
                  "description": "$post_data.description",
                  "title": "$post_data.title",
                  "active": "$post_data.action",
                  "metadata": "$post_data.metadata",
                  "location": "$post_data.location",
                  "tags": "$post_data.tags",
                  "likes": "$post_data.likes",
                  "views": "$post_data.views",
                  "shares": "$post_data.shares",
                  "comments": "$post_data.comments",
                  "isOwned": "$post_data.isOwned",
                  "certified": "$post_data.certified",
                  "privacy": {
                      "isPostPrivate": "$auth.isPostPrivate",
                      "isCelebrity": "$auth.isCelebrity",
                      "isPrivate": "$auth.isPrivate"
                  },
                  "isViewed": 
                  {
                      "$cond": 
                      {
                        "if": 
                        {
                        "$eq": 
                        [
                          "$post_data.views",
                          0
                        ]
                      },
                      "then": false,
                      "else": true
                    }
                },
                "allowComments": "$post_data.allowComments",
                "isSafe": "$post_data.isSafe",
                "saleLike": "$post_data.saleLike",
                "saleView": "$post_data.saleView",
                "monetize": "$monetize",
                "salePrice": "$post_data.salePrice",
                "rotate": 
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.rotate",
                        null
                    ]
                },
                "mediaBasePath":
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.mediaBasePath",
                        null
                    ]
                },
                mediaUri:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.mediaUri",
                        null
                    ]
                },
                mediaType:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.mediaType",
                        null
                    ]
                },
                mediaThumbEndpoint:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.mediaThumbEndpoint",
                        {
                            "$concat":
                            [
                                "/thumb/",
                                "$cleanUri"
                            ]
                        }
                    ]
                },
                mediaEndpoint:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.mediaEndpoint",
                        {
                            "$cond":
                            {
                                if:
                                {
                                    "$eq":
                                    [
                                        "$postType", "pict"
                                    ]
                                },
                                then:
                                {
                                    "$concat":
                                    [
                                        "/pict/",
                                        "$cleanUri"
                                    ]
                                },
                                else:
                                {
                                    "$concat":
                                    [
                                        "/stream/",
                                        "$cleanUri"
                                    ]
                                }
                            }
                        }
                    ]
                },
                mediaThumbUri:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.mediaThumbUri",
                        null
                    ]
                },
                apsaraId:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.apsaraId",
                        null
                    ]
                },
                apsara:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.apsara",
                        false
                    ]
                },
                reportedUserCount: 
                {
                  "$ifNull":
                  [
                    "$reportedUserCount",
                    {
                      "$size":"$tempreportedUserCount"
                    }
                  ]
                },
            }
          }
        );
      }
      else {
        pipeline.push(
          {
            $lookup: {
              from: 'newUserBasics',
              localField: 'idUser',
              foreignField: '_id',
              as: 'basicdata',
            }
          },
          {
            $addFields: {
              'basic': { $arrayElemAt: ['$basicdata', 0] },
              'insightid': { $arrayElemAt: ['$basicdata.insight.$id', 0] },
              'isViewed': {
                '$cond': { if: { '$eq': ['$views', 0] }, then: false, else: true }
              },
              salePrice: "$saleAmount",
              monetize: {
                $cond: { if: { $eq: ["$saleAmount", 0] }, then: false, else: true }
              },
              "tempmediaSource": { $arrayElemAt: ['$mediaSource', 0] }
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
            $addFields: {
              'avatar': 
              { 
                mediaBasePath: "$basic.mediaBasePath",
                mediaUri: "$basic.mediaUri",
                mediaType: "$basic.mediaType",
                mediaEndpoint: "$basic.mediaEndpoint"
              },
              'insight': { $arrayElemAt: ['$insightdata', 0] },
              "cleanUri":
              {
                  "$replaceOne":
                  {
                      input: "$tempmediaSource.mediaUri",
                      find: "_0001.jpeg",
                      replacement: ""
                  }
              },
              "tempreportedUserCount":
              {
                  "$ifNull":
                  [
                      {
                          "$filter":
                          {
                              input: "$reportedUser",
                              as: "listuser",
                              cond:
                              {
                              "$eq":
                                  [
                                  "$$listuser.active",
                                  true
                                  ]
                              }
                          }
                      },
                      []
                  ]
              }
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
                avatar: "$avatar",
                fullName: "$basic.fullName",
                username: "$basic.username",
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
                certified: 1,
                privacy: {
                    isPostPrivate: '$basic.isPostPrivate',
                    isCelebrity: '$basic.isCelebrity',
                    isPrivate: '$basic.isPrivate'
                },
                isViewed: '$isViewed',
                allowComments: 1,
                isSafe: 1,
                saleLike: 1,
                idUser: 1,
                saleView: 1,
                reportedUserCount: 
                {
                  "$ifNull":
                  [
                    "$reportedUserCount",
                    {
                      "$size":"$tempreportedUserCount"
                    }
                  ]
                },
                monetize: "$monetize",
                salePrice: "$salePrice",
                // mediaref: "$mediaref",
                "rotate": 
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.rotate",
                        null
                    ]
                },
                "mediaBasePath":
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.mediaBasePath",
                        null
                    ]
                },
                mediaUri:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.mediaUri",
                        null
                    ]
                },
                mediaType:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.mediaType",
                        null
                    ]
                },
                mediaThumbEndpoint:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.mediaThumbEndpoint",
                        {
                            "$concat":
                            [
                                "/thumb/",
                                "$cleanUri"
                            ]
                        }
                    ]
                },
                mediaEndpoint:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.mediaEndpoint",
                        {
                            "$cond":
                            {
                                if:
                                {
                                    "$eq":
                                    [
                                        "$postType", "pict"
                                    ]
                                },
                                then:
                                {
                                    "$concat":
                                    [
                                        "/pict/",
                                        "$cleanUri"
                                    ]
                                },
                                else:
                                {
                                    "$concat":
                                    [
                                        "/stream/",
                                        "$cleanUri"
                                    ]
                                }
                            }
                        }
                    ]
                },
                mediaThumbUri:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.mediaThumbUri",
                        null
                    ]
                },
                apsaraId:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.apsaraId",
                        null
                    ]
                },
                apsara:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.apsara",
                        false
                    ]
                },
            }
          },
          {
            "$match":
            {
                "$and":
                [
                    {
                        idUser:konvertid
                    },
                    {
                        active:true
                    },
                ]
            }
          }
        );

        if (ownership !== undefined && ownership === true) {
          pipeline.push({ $match: { certified: true } });
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

      var query = await this.loaddata.aggregate(pipeline);
      var setutil = require('util');
      console.log(setutil.inspect(pipeline, { showHidden:false, depth:null }));
      var listdata = [];
      var tempresult = null;
      var tempdata = null;
      for (var i = 0; i < query.length; i++) {
        tempdata = query[i];
        if (tempdata.apsara == true) {
          listdata.push(tempdata.apsaraId);
        }
        else {
          listdata.push(undefined);
        }
      }

      //console.log(listdata);
      var apsaraimagedata = await this.postContentService.getImageApsara(listdata);
      // console.log(apsaraimagedata);
      // console.log(resultdata.ImageInfo[0]);
      tempresult = apsaraimagedata.ImageInfo;
      for (var i = 0; i < query.length; i++) {
        for (var j = 0; j < tempresult.length; j++) {
          if (tempresult[j].ImageId == query[i].apsaraId) {
            query[i].media =
            {
              "ImageInfo": [tempresult[j]]
            }
          }
        }
        if (query[i].apsara == false && (query[i].mediaType == "image" || query[i].mediaType == "images")) {
          query[i].media =
          {
            "ImageInfo": []
          }
        }
      }
  
      var apsaravideodata = await this.postContentService.getVideoApsara(listdata);
      // console.log(apsaravideodata);
      // console.log(resultdata.ImageInfo[0]);
      tempresult = apsaravideodata.VideoList;
      for (var i = 0; i < query.length; i++) {
        for (var j = 0; j < tempresult.length; j++) {
          if (tempresult[j].VideoId == query[i].apsaraId) {
            query[i].media =
            {
              "VideoList": [tempresult[j]]
            }
          }
        }
        if (query[i].apsara == false && query[i].mediaType == "video") {
          query[i].media =
          {
            "VideoList": []
          }
        }
      }

      return query;
    }

    async findcountfilter(email: string) {
      const data = await this.loaddata.aggregate([
        {
          "$match":
          {
            "email": email
          }
        },
        {
          "$group":
          {
            _id: "$email",
            totalpost: {
              "$sum": 1
            }
          }
        }
      ]);

      return data;
    }

    async boostdetail2(postID: string, startdate: string, enddate: string, page: number, limit: number) {
      try {
        var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));
  
        var dateend = currentdate.toISOString();
  
        var dt = dateend.substring(0, 10);
      } catch (e) {
        dt = "";
      }
      var query = await this.loaddata.aggregate(
        [
          {
  
            $match: {
              $and: [{
                boosted: {
                  $ne: []
                }
              }, {
                boosted: {
                  $ne: null
                }
              }],
              active: true,
              postID: postID
            }
          },
          {
            $set: {
              datenow:
              {
                "$dateToString": {
                  "format": "%Y-%m-%d %H:%M:%S",
                  "date": {
                    $add: [new Date(), + 25200000]
                  }
                }
              },
              salePrice: {
                $cmp: ["$saleAmount", 0]
              },
              sComments: {
                $cmp: ["$comments", 0]
              },
        
            }
          },
          {
            $facet: {
              "data": [
                {
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
                    likes: 1,
                    views: 1,
                    active: 1,
                    datenow: 1,
                    kategori: 1,
                    jangkauan: {
                      $size: {
                        $arrayElemAt: ['$boosted.boostViewer', 0]
                      },
        
                    },
                    typeboost: {
                      $arrayElemAt: ['$boosted.type', 0]
                    },
                    interval: {
                      $arrayElemAt: ['$boosted.boostInterval.value', 0]
                    },
                    start: {
                      $arrayElemAt: ['$boosted.boostSession.start', 0]
                    },
                    end: {
                      $arrayElemAt: ['$boosted.boostSession.end', 0]
                    },
                    boostSessionid: {
                      $arrayElemAt: ['$boosted.boostSession.id', 0]
                    },
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
                    comments: {
                      $cond: {
                        if: {
                          $or: [{
                            $eq: ["$sComments", - 1]
                          }, {
                            $eq: ["$sComments", 0]
                          }]
                        },
                        then: 0,
                        else: "$sComments"
                      }
                    },
                    mediaSource: {
                        "$arrayElemAt":
                        [
                            "$mediaSource", 0
                        ]
                    },
                    idUser:1,
                  }
                },
                {
                  $lookup: {
                    from: 'newUserBasics',
                    localField: 'idUser',
                    foreignField: '_id',
                    as: 'databasic',
        
                  },
        
                },
                {
                  $unwind: {
                    path: "$databasic",
        
                  }
                },
                {
                  $lookup: {
                    from: 'boostSession',
                    localField: 'boostSessionid',
                    foreignField: '_id',
                    as: 'boostSesidata',
        
                  },
        
                },
                {
                  "$lookup": {
                    "from": "transactions",
                    "as": "trans",
                    "let": {
                      "local_id": "$postID",
        
                    },
                    "pipeline": [
                      {
                        $match:
                        {
                          $expr: {
                            $eq: ['$postid', '$$local_id']
                          }
                        }
                      },
                      {
                        $project: {
                          iduserbuyer: 1,
                          idusersell: 1,
                          noinvoice: 1,
                          status: 1,
                          amount: 1,
                          timestamp: 1,
                          postid: 1
                        }
                      },
                      {
                        $match: {
                          idusersell: '$databasic._id',
                          status: "Success"
                        }
                      },
        
                    ],
        
                  },
        
                },
                {
                  $project: {
                    refs: '$refs.$ref',
                    idmedia: '$refs.$id',
                    iduser: '$databasic._id',
                    createdAt: 1,
                    updatedAt: 1,
                    postID: 1,
                    postType: 1,
                    email: 1,
                    likes: 1,
                    views: 1,
                    comments: 1,
                    jangkauan: 1,
                    interval: 1,
                    start: 1,
                    end: 1,
                    typeboost: 1,
                    kategori: 1,
                    saleAmount: 1,
                    statusJual:
                    {
                      $cond: {
                        if: {
        
                          $eq: ["$monetize", false]
                        },
                        then: "TIDAK",
                        else: "YA"
                      }
                    },
                    sessionName: {
                      $arrayElemAt: ['$boostSesidata.name', 0]
                    },
                    sessionType: {
                      $arrayElemAt: ['$boostSesidata.type', 0]
                    },
                    sessionStart: {
                      $arrayElemAt: ['$boostSesidata.start', 0]
                    },
                    sessionEnd: {
                      $arrayElemAt: ['$boostSesidata.end', 0]
                    },
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
                    datenow: 1,
                    trans: 1,
                    boostSessionid: 1,
                    mediaSource: 1
                  }
                },
                {
                  $project: {
                    refs: 1,
                    idmedia: 1,
                    iduser: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    postID: 1,
                    postType: 1,
                    email: 1,
                    type: 1,
                    description: 1,
                    title: 1,
                    active: 1,
                    jangkauan: 1,
                    interval: 1,
                    likes: 1,
                    views: 1,
                    comments: 1,
                    start: 1,
                    end: 1,
                    sessionName: 1,
                    sessionType: 1,
                    sessionStart: 1,
                    sessionEnd: 1,
                    datenow: 1,
                    typeboost: 1,
                    boostSessionid: 1,
                    kategori: 1,
                    saleAmount: 1,
                    dataview: 1,
                    statusJual: 1,
                    keterangan:
                    {
                      $cond: {
                        if: {
        
                          $eq: ["$trans", []]
                        },
                        then: 'Belum Terjual',
                        else: 'Terjual',
        
                      }
                    },
                    statusPengajuan: {
                      $switch: {
                        branches: [
                          {
                            'case': {
                              '$lt': ['$datenow', '$start'],
        
                            },
                            'then': 'Dijadwalkan'
                          },
                          {
                            'case': {
                              $and: [
                                {
                                  '$gt': ['$datenow', '$start'],
        
                                },
                                {
                                  '$lt': ['$datenow', '$end'],
        
                                }
                              ]
                            },
                            'then': 'Sedang Berlangsung'
                          },
                          {
                            'case': {
                              '$gt': ['$datenow', '$end'],
        
                            },
                            'then': 'Selesai'
                          },
        
                        ],
                        default: 'Dijadwalkan'
                      }
                    },
                    trans: 1,
                    mediaSource: 1
                  }
                },
                {
                    "$addFields":
                    {
                        "cleanUri":
                        { 
                            $replaceOne: 
                            { 
                                input: "$mediaSource.mediaUri", 
                                find: "_0001.jpeg", 
                                replacement: "" 
                            }
                        }
                    }
                },
                {
                  $project: {
                    iduser: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    postID: 1,
                    postType: 1,
                    email: 1,
                    type: 1,
                    description: 1,
                    title: 1,
                    active: 1,
                    jangkauan: 1,
                    interval: 1,
                    likes: 1,
                    views: 1,
                    comments: 1,
                    start: 1,
                    end: 1,
                    sessionName: 1,
                    sessionType: 1,
                    sessionStart: 1,
                    sessionEnd: 1,
                    statusPengajuan: 1,
                    datenow: 1,
                    keterangan: 1,
                    typeboost: 1,
                    boostSessionid: 1,
                    kategori: 1,
                    saleAmount: 1,
                    statusJual: 1,
                    dataview: 1,
                    mediaBasePath:
                    {
                        "$ifNull":
                        [
                            "$mediaSource.mediaBasePath",
                            null
                        ]
                    },
                    mediaUri:
                    {
                        "$ifNull":
                        [
                            "$mediaSource.mediaUri",
                            null
                        ]
                    },
                    mediaType:
                    {
                        "$ifNull":
                        [
                            "$mediaSource.mediaType",
                            null
                        ]
                    },
                    mediaThumbEndpoint:
                    {
                        "$ifNull":
                        [
                            "$mediaSource.mediaThumbEndpoint",
                            {
                                "$concat":
                                [
                                    "/thumb/",
                                    "$cleanUri"
                                ]
                            }
                        ]
                    },
                    mediaEndpoint:
                    {
                        "$ifNull":
                        [
                            "$mediaSource.mediaEndpoint",
                            {
                                "$cond":
                                {
                                    if:
                                    {
                                        "$eq":
                                        [
                                            "$postType", "pict"
                                        ]
                                    },
                                    then:
                                    {
                                        "$concat":
                                        [
                                            "/pict/",
                                            "$cleanUri"
                                        ]
                                    },
                                    else:
                                    {
                                        "$concat":
                                        [
                                            "/stream/",
                                            "$cleanUri"
                                        ]
                                    }
                                }
                            }
                        ]
                    },
                    mediaThumbUri:
                    {
                        "$ifNull":
                        [
                            "$mediaSource.mediaThumbUri",
                            null
                        ]
                    },
                    apsaraId:
                    {
                        "$ifNull":
                        [
                            "$mediaSource.apsaraId",
                            null
                        ]
                    },
                    apsara:
                    {
                        "$ifNull":
                        [
                            "$mediaSource.apsara",
                            false
                        ]
                    },
                  }
                },
        
              ],
              "gender": [
                {
                  $unwind: {
                    path: "$boosted",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $unwind: {
                    path: "$boosted.boostViewer",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $project: {
                    userEmail: "$boosted.boostViewer.email",
        
                  }
                },
                {
                  "$lookup": {
                    "from": "newUserBasics",
                    "as": "dataview",
                    let: {
                      localID: '$userEmail'
                    },
                    "pipeline": [
                      {
                        $match:
                        {
                          $and: [
                            {
                              $expr: {
                                $eq: ["$email", "$$localID"]
                              }
                            },
        
                          ],
        
                        }
                      },
                      {
                        $project: {
        
                          gender: 1,
        
                        }
                      },
        
                    ],
        
                  },
        
                },
                {
                  $unwind: {
                    path: "$dataview",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $project: {
                    gender: {
                      "$ifNull":
                      [
                        "$dataview.gender",
                        "Other"
                      ]
                    },
        
                  }
                },
                {
                  "$group": {
                    "_id": "$gender",
                    "count": {
                      "$sum": 1
                    }
                  }
                },
                {
                  "$project":
                  {
                    _id:
                    {
                      "$switch":
                      {
                        branches:
                        [
                          {
                            case:
                            {
                              "$eq":
                              [
                                "$_id", "Laki-laki"
                              ]
                            },
                            then: "MALE"
                          },
                          {
                            case:
                            {
                              "$eq":
                              [
                                "$_id", "Perempuan"
                              ]
                            },
                            then: "FEMALE"
                          }
                        ],
                        default: "OTHER"
                      }
                    },
                    count: 1
                  }
                }
              ],
              "wilayah": [
                {
                  $unwind: {
                    path: "$boosted",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $unwind: {
                    path: "$boosted.boostViewer",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $project: {
                    userEmail: "$boosted.boostViewer.email",
        
                  }
                },
                {
                  "$lookup": {
                    "from": "newUserBasics",
                    "as": "dataview",
                    let: {
                      localID: '$userEmail'
                    },
                    "pipeline": [
                      {
                        $match:
                        {
                          $and: [
                            {
                              $expr: {
                                $eq: ["$email", "$$localID"]
                              }
                            },
        
                          ],
        
                        }
                      },
                      {
                        $project: {
        
                          statesName: 1,
        
                        }
                      },
        
                    ],
        
                  },
        
                },
                {
                  $unwind: {
                    path: "$dataview",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $project: {
                    stateName: '$dataview.statesName'
                  }
                },
                {
                  "$group": {
                    "_id": "$stateName",
                    "count": {
                      "$sum": 1
                    }
                  }
                }
              ],
              "age": [
                {
                  $unwind: {
                    path: "$boosted",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $unwind: {
                    path: "$boosted.boostViewer",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $project: {
                    userEmail: "$boosted.boostViewer.email",
        
                  }
                },
                {
                  "$lookup": {
                    "from": "newUserBasics",
                    "as": "dataview",
                    let: {
                      localID: '$userEmail'
                    },
                    "pipeline": [
                      {
                        $match:
                        {
                          $and: [
                            {
                              $expr: {
                                $eq: ["$email", "$$localID"]
                              }
                            },
        
                          ],
        
                        }
                      },
                      {
                        $project: {
                          dob: 1,
        
                        }
                      },
                      {
                        $project: {
        
                          age: {
                            $cond: {
                              if: {
                                $and: [
                                  '$dob',
                                  {
                                    $ne: ["$dob", ""]
                                  }
                                ]
                              },
                              then: {
                                $toInt: {
                                  $divide: [{
                                    $subtract: [new Date(), {
                                      $toDate: "$dob"
                                    }]
                                  }, (365 * 24 * 60 * 60 * 1000)]
                                }
                              },
                              else: 0
                            }
                          },
        
                        }
                      },
        
                    ],
        
                  },
        
                },
                {
                  $unwind: {
                    path: "$dataview",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $project: {
                    _id: 1,
                    userID: "$dataview._id",
                    age: "$dataview.age",
        
                  }
                },
                {
                  $project: {
        
                    ageQualication: {
                      $switch: {
                        branches: [
                          {
                            case: {
                              $gt: ["$age", 44]
                            },
                            then: "< 44 Tahun"
                          },
                          {
                            case: {
                              $and: [{
                                $gte: ["$age", 36]
                              }, {
                                $lte: ["$age", 44]
                              }]
                            },
                            then: "35-44 Tahun"
                          },
                          {
                            case: {
                              $and: [{
                                $gte: ["$age", 25]
                              }, {
                                $lte: ["$age", 35]
                              }]
                            },
                            then: "24-35 Tahun"
                          },
                          {
                            case: {
                              $and: [{
                                $gte: ["$age", 14]
                              }, {
                                $lte: ["$age", 24]
                              }]
                            },
                            then: "14-24 Tahun"
                          },
                          {
                            case: {
                              $and: [{
                                $gte: ["$age", 1]
                              }, {
                                $lt: ["$age", 14]
                              }]
                            },
                            then: "< 14 Tahun"
                          }
                        ],
                        "default": "other"
                      }
                    },
        
                  }
                },
                {
                  "$group": {
                    "_id": "$ageQualication",
                    "count": {
                      "$sum": 1
                    }
                  }
                }
              ],
              "summary": [
                {
                  $unwind: {
                    path: "$boosted",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $unwind: {
                    path: "$boosted.boostViewer",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $project: {
                    userEmail: "$boosted.boostViewer.email",
                    createAt: "$boosted.boostViewer.createAt",
        
                  }
                },
                {
                  $match: {
                    createAt: { $gte: startdate, $lt: dt }
                  }
                },
                {
                  $group: {
                    _id: {
                      tgl: {
                        $substrCP: ['$createAt', 0, 10]
                      }
                    },
                    count: {
                      $sum: 1
                    },
        
                  },
        
                },
                {
                  $project: {
                    _id: 0,
                    date: "$_id.tgl",
                    jangkauan: "$count"
                  }
                },
                {
                  $sort: { date: 1 }
                }
              ],
        
            }
          },
        ]
  
      );
  
      return query;
    }

    async countReportStatus(startdate: string, enddate: string) {
      try {
        var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));
  
        var dateend = currentdate.toISOString();
      } catch (e) {
        dateend = "";
      }
  
      var pipeline = [];
  
      if (startdate === undefined && enddate === undefined) {
        pipeline.push(
          {
            $addFields: {
  
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
            $facet: {
              "moderation": [
                {
                  $addFields: {
                    createdAtReportLast: "$createdAt",
  
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
                  $match: {
  
  
                    active: true,
                    contentModeration: true
                  }
                },
  
                {
                  $group: {
                    _id: "$reportStatusLast",
                    myCount: {
                      $sum: 1
                    },
  
                  }
                },
  
              ],
  
              "report": [
                {
                  "$unwind":
                  {
                    path: "$reportedUser"
                  }
                },
                {
                  $addFields: {
                    createdAtReportLast: "$reportedUser.createdAt",
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
                  $match:
                  {
                    "$and":
                      [
                        {
                          reportedUser: {
                            $ne: null
                          },
                        },
                        {
                          "reportedUser.active": true
                        },
                        {
                          active: true,
                        },
                        // {
                        //   contentModeration: false
                        // }
                      ]
                  }
                },
                // {
                //   $match: {
  
                //     reportedUser: {
                //       $ne: null
                //     },
                //     active: true,
                //     // contentModeration: false
                //   }
                // },
                // {
                //   $match: {
                //     reportedUser: {
                //       $ne: []
                //     },
                //     active: true,
                //     // contentModeration: false
                //   }
                // },
  
                {
                  $group: {
                    _id: "$reportStatusLast",
                    myCount: {
                      $sum: 1
                    },
  
                  }
                },
  
              ],
              "appeal": [
                {
                  $addFields: {
                    createdAtReportLast: {
                      $last: "$reportedUserHandle.createdAt"
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
                  $match: {
  
                    reportedUserHandle: {
                      $ne: null
                    },
                    active: true,
  
                  }
                },
                {
                  $match: {
                    reportedUserHandle: {
                      $ne: []
                    },
                    active: true,
                  }
                },
  
                {
                  $group: {
                    _id: "$reportStatusLast",
                    myCount: {
                      $sum: 1
                    }
                  }
                },
  
              ]
            },
  
          }
        );
      }
      else if (startdate !== undefined && enddate !== undefined) {
        pipeline.push({
          $addFields: {
  
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
            $facet: {
              "moderation": [
                {
                  $addFields: {
                    createdAtReportLast: "$createdAt",
  
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
                  $match: {
  
  
                    active: true,
                    contentModeration: true
                  }
                },
                { $match: { createdAtReportLast: { "$gte": startdate, "$lte": dateend } } },
                {
                  $group: {
                    _id: "$reportStatusLast",
                    myCount: {
                      $sum: 1
                    },
  
                  }
                },
  
              ],
  
              "report": [
                {
                  "$unwind":
                  {
                    path: "$reportedUser"
                  }
                },
                {
                  $addFields: {
                    createdAtReportLast: "$reportedUser.createdAt",
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
                  $match:
                  {
                    "$and":
                      [
                        {
                          reportedUser: {
                            $ne: null
                          },
                        },
                        {
                          "reportedUser.active": true
                        },
                        {
                          active: true,
                        },
                        // {
                        //   contentModeration: false
                        // }
                      ]
                  }
                },
                // {
                //   $match: {
  
                //     reportedUser: {
                //       $ne: null
                //     },
                //     active: true,
                //     contentModeration: false
                //   }
                // },
                // {
                //   $match: {
                //     reportedUser: {
                //       $ne: []
                //     },
                //     active: true,
                //     contentModeration: false
                //   }
                // },
                { $match: { createdAtReportLast: { "$gte": startdate, "$lte": dateend } } },
                {
                  $group: {
                    _id: "$reportStatusLast",
                    myCount: {
                      $sum: 1
                    },
  
                  }
                },
  
              ],
              "appeal": [
                {
                  $addFields: {
                    createdAtReportLast: {
                      $last: "$reportedUserHandle.createdAt"
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
                  $match: {
  
                    reportedUserHandle: {
                      $ne: null
                    },
                    active: true,
                    contentModeration: false
                  }
                },
                {
                  $match: {
                    reportedUserHandle: {
                      $ne: []
                    },
                    active: true,
                    contentModeration: false
                  }
                },
                { $match: { createdAtReportLast: { "$gte": startdate, "$lte": dateend } } },
                {
                  $group: {
                    _id: "$reportStatusLast",
                    myCount: {
                      $sum: 1
                    }
                  }
                },
  
              ]
            },
  
          });
      }
  
      let query = await this.loaddata.aggregate(pipeline);
  
      return query;
    }

    async findreport(keys: string, postType: string, startdate: string, enddate: string, page: number, limit: number, startreport: number, endreport: number, status: any[], reason: any[], descending: boolean, reasonAppeal: any[], username: string, jenis: string, email: string) {
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
  
  
      pipeline = [
        {
            '$lookup': {
                from: 'newUserBasics',
                localField: 'idUser',
                foreignField: '_id',
                as: 'basicdata'
            }
        },
        {
            "$addFields":
            {
                basic: { '$arrayElemAt': ['$basicdata', 0] },
                mediaSource: { '$arrayElemAt': ['$mediaSource', 0] }
            }
        },
        {
            "$project":
            {
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
                reportedUserCount: {
                    '$ifNull': [
                        {
                            '$filter': {
                                input: '$reportedUser',
                                as: 'listuser',
                                cond: 
                                { 
                                    '$eq': ['$$listuser.active', true] 
                                }
                            }
                        },
                        []
                    ]
                },
                reportedUserHandle: 1,
                reportedUser: 1,
                fullName: '$basic.fullName',
                username: '$basic.username',
                avatar: 
                {
                    mediaBasePath: 
                    {
                        "$ifNull":
                        [
                            '$basic.mediaBasePath',
                            null
                        ]
                    },
                    mediaUri:
                    {
                        "$ifNull":
                        [
                            '$basic.mediaUri',
                            null
                        ]
                    },
                    mediaType:
                    {
                        "$ifNull":
                        [
                            '$basic.mediaType',
                            null
                        ]
                    },
                    mediaEndpoint: 
                    {
                        "$ifNull":
                        [
                            '$basic.mediaEndpoint',
                            null
                        ]
                    },
                },
                mediaSource: 1
            }
        },
        {
            "$addFields":
            {
                "cleanUri":
                { 
                    $replaceOne: 
                    { 
                        input: "$mediaSource.mediaUri", 
                        find: "_0001.jpeg", 
                        replacement: "" 
                    }
                }
            }
        },
        {
            "$project":
            {
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
                reportedUserCount: { '$size': '$reportedUserCount' },
                reportedUserHandle: 1,
                reportedUser: 1,
                fullName: 1,
                username: 1,
                avatar: 1,
                rotate:
                {
                    "$ifNull":
                    [
                        "$mediaSource.rotate",
                        null
                    ]
                },
                mediaBasePath:
                {
                    "$ifNull":
                    [
                        "$mediaSource.mediaBasePath",
                        null
                    ]
                },
                mediaUri:
                {
                    "$ifNull":
                    [
                        "$mediaSource.mediaUri",
                        null
                    ]
                },
                mediaType:
                {
                    "$ifNull":
                    [
                        "$mediaSource.mediaType",
                        null
                    ]
                },
                mediaThumbEndpoint:
                {
                    "$ifNull":
                    [
                        "$mediaSource.mediaThumbEndpoint",
                        {
                            "$concat":
                            [
                                "/thumb/",
                                "$cleanUri"
                            ]
                        }
                    ]
                },
                mediaEndpoint:
                {
                    "$ifNull":
                    [
                        "$mediaSource.mediaEndpoint",
                        {
                            "$cond":
                            {
                                if:
                                {
                                    "$eq":
                                    [
                                        "$postType", "pict"
                                    ]
                                },
                                then:
                                {
                                    "$concat":
                                    [
                                        "/pict/",
                                        "$cleanUri"
                                    ]
                                },
                                else:
                                {
                                    "$concat":
                                    [
                                        "/stream/",
                                        "$cleanUri"
                                    ]
                                }
                            }
                        }
                    ]
                },
                mediaThumbUri:
                {
                    "$ifNull":
                    [
                        "$mediaSource.mediaThumbUri",
                        null
                    ]
                },
                apsaraId:
                {
                    "$ifNull":
                    [
                        "$mediaSource.apsaraId",
                        null
                    ]
                },
                apsara:
                {
                    "$ifNull":
                    [
                        "$mediaSource.apsara",
                        false
                    ]
                },
                reportReasonIdLast: 
                { 
                    '$last': '$reportedUser.reportReasonId' 
                },
                reasonLast: 
                { 
                    '$last': '$reportedUser.description' 
                },
                lastAppeal: 
                {
                    '$cond': {
                        if: {
                            '$and': [
                                { '$eq': ['$reportedUserHandle.reason', null] },
                                { '$eq': ['$reportedUserHandle.reason', ''] },
                                { '$eq': ['$reportedUserHandle.reason', 'Lainnya'] }
                            ]
                        },
                        then: 'Lainnya',
                        else: { 
                            '$last': '$reportedUserHandle.reason' 
                        }
                    }
                },
                createdAtReportLast: 
                { 
                    '$last': '$reportedUser.createdAt' 
                },
                createdAtAppealLast: 
                { 
                    '$last': '$reportedUserHandle.createdAt' 
                },
                statusLast: 
                {
                    '$cond': {
                        if: {
                            '$or': [
                                { '$eq': ['$reportedUserHandle', null] },
                                { '$eq': ['$reportedUserHandle', ''] },
                                { '$eq': ['$reportedUserHandle', []] }
                            ]
                        },
                        then: 'BARU',
                        else: { 
                            '$last': '$reportedUserHandle.status' 
                        }
                    }
                }
            }
        },
        {
            "$project":
            {
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
                fullName: 1,
                username: 1,
                avatar: 1,
                rotate: 1,
                mediaBasePath: 1,
                mediaUri: 1,
                mediaType: 1,
                mediaThumbEndpoint: 1,
                mediaEndpoint: 1,
                mediaThumbUri: 1,
                apsaraId: 1,
                apsara: 1,
                reportReasonIdLast: 1,
                reasonLast: 1,
                lastAppeal: 1,
                createdAtReportLast: 1,
                createdAtAppealLast: 1,
                statusLast: 1,
                reasonLastAppeal: {
                    '$cond': {
                      if: {
                        '$or': [
                          { '$eq': ['$lastAppeal', null] },
                          { '$eq': ['$lastAppeal', ''] },
                          { '$eq': ['$lastAppeal', 'Lainnya'] }
                        ]
                      },
                      then: 'Lainnya',
                      else: { '$last': '$reportedUserHandle.reason' }
                    }
                },
                reportStatusLast: {
                    '$cond': {
                      if: {
                        '$or': [
                          { '$eq': ['$statusLast', null] },
                          { '$eq': ['$statusLast', ''] },
                          { '$eq': ['$statusLast', []] },
                          { '$eq': ['$statusLast', 'BARU'] }
                        ]
                      },
                      then: 'BARU',
                      else: { '$last': '$reportedUserHandle.status' }
                    }
                }
            }
        },
      ];
  
      if (jenis === "report") {
        pipeline.push(
          {
            $match: {
              $and: [
                {
                  reportedUser: {
                    $ne: null
                  }, active: true
                },
                {
                  reportedUser: {
                    $ne: []
                  }, active: true
                },
  
              ]
            }
          },
  
        );
      } else if (jenis === "appeal") {
        pipeline.push({
          $match: {
            $and: [
              {
                reportedUserHandle: {
                  $ne: []
                },
              },
              {
                reportedUserHandle: {
                  $ne: null
                },
              },
  
            ]
          }
        },);
      }
  
      if (email && email !== undefined) {
        pipeline.push({ $match: { email: email } });
      }
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
      if (username && username !== undefined) {
  
        pipeline.push({
          $match: {
            username: {
              $regex: username,
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
        if (jenis === "report") {
          pipeline.push({ $match: { createdAtReportLast: { "$gte": startdate } } });
        }
        else if (jenis === "appeal") {
          pipeline.push({ $match: { createdAtAppealLast: { "$gte": startdate } } });
        }
      }
      if (enddate && enddate !== undefined) {
  
  
        if (jenis === "report") {
          pipeline.push({ $match: { createdAtReportLast: { "$lte": dateend } } });
        }
        else if (jenis === "appeal") {
          pipeline.push({ $match: { createdAtAppealLast: { "$lte": dateend } } });
        }
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
      if (reasonAppeal && reasonAppeal !== undefined) {
  
        pipeline.push(
          {
            $match: {
              $or: [
                {
                  reasonLastAppeal: {
                    $in: reasonAppeal
                  }
                },
  
              ]
            }
          });
  
      }
      if (jenis === "report") {
        pipeline.push({
          $sort: {
            createdAtReportLast: order
          },
  
        });
      }
      else if (jenis === "appeal") {
        pipeline.push({
          $sort: {
            createdAtAppealLast: order
          },
  
        });
      }
      if (page > 0) {
        pipeline.push({ $skip: (page * limit) });
      }
      if (limit > 0) {
        pipeline.push({ $limit: limit });
      }
  
      // console.log(JSON.stringify(pipeline))
  
      let query = await this.loaddata.aggregate(pipeline);
  
      return query;
    }

    async find200(value: number): Promise<newPosts[]> {
      return this.loaddata.aggregate([
        {
          "$match":
          {
            "$and":
            [
              {
                "reportedUser":
                {
                  "$ne": null
                }
              },
              {
                "reportedUser":
                {
                  "$ne": ""
                }
              },
              {
                "$expr":
                {
                  "$gte":
                  [
                    {
                      "$size": "$reportedUser"
                    },
                    value
                  ]
                }
              }
            ]
          }
        },
      ]).exec();
    }

    async updateStatusOwned(id: string, updatedAt: string) {
      let data = await this.loaddata.updateMany({ "_id": id },
        { $set: { "reportedStatus": "OWNED", "updatedAt": updatedAt, "reportedUserHandle.$[].status": "DITANGGUHKAN", "reportedUserHandle.$[].updatedAt": updatedAt } });
      return data;
    }

    async getmusicCard() {
      var query = await this.loaddata.aggregate(
        [
          {
              "$match":
              {
                  musicId:
                  {	
                      "$exists": true
                  }
              }
          },
          {
              "$group":
              {
                  _id: "$musicId",
                  total:
                  {
                      "$sum": 1
                  }
              }
          },
          {
              $lookup: 
              {
                  from: 'mediamusic',
                  localField: '_id',
                  foreignField: '_id',
                  as: 'music_data',
              },
          },
          {
              "$unwind":
              {
                  path: "$music_data"
              }
          },
          {
              $lookup: 
              {
                  from: 'theme',
                  localField: 'music_data.theme',
                  foreignField: '_id',
                  as: 'theme_data',
              },
          },
          {
              $lookup: 
              {
                  from: 'genre',
                  localField: 'music_data.genre',
                  foreignField: '_id',
                  as: 'genre_data',
              },
          },
          {
              $lookup: 
              {
                  from: 'mood',
                  localField: 'music_data.mood',
                  foreignField: '_id',
                  as: 'mood_data',
              },
          },
          {
              $project: 
              {
                  musicTitle: '$music_data.musicTitle',
                  artistName: '$music_data.artistName',
                  albumName: '$music_data.albumName',
                  genre: 
                  { 
                      "$arrayElemAt": 
                      [
                          '$genre_data', 0
                      ] 
                  },
                  theme: 
                  { 
                      "$arrayElemAt": 
                      [
                          '$theme_data', 0
                      ] 
                  },
                  mood: 
                  { 
                      "$arrayElemAt": 
                      [
                          '$mood_data', 0
                      ] 
                  },
                  releaseDate: '$music_data.releaseDate',
                  apsaraMusic: '$music_data.apsaraMusic',
                  apsaraThumnail: '$music_data.apsaraThumnail',
                  _id: 1,
                  total: 1
              }
          },
          {
              "$facet":
              {
                  "artistPopuler": 
                  [
                      {
                          "$group": 
                          {
                              _id: "$artistName",
                              apsaraMusic: 
                              {
                                  "$first": "$apsaraMusic"
                              },
                              apsaraThumnail: 
                              {
                                  "$first": "$apsaraThumnail"
                              },
                              count: 
                              { 
                                  "$sum": "$total"
                              }
                          }
                      },
                      { 
                          $sort: 
                          { 
                              count: -1,
                              _id: 1
                          } 
                      },
                      { 
                          $skip: 0 
                      },
                      { 
                          $limit: 5 
                      },
                      {
                          "$project":
                          {
                              _id:
                              {
                                  artistName: "$_id",
                                  apsaraMusic: "$apsaraMusic",
                                  apsaraThumnail: "$apsaraThumnail"
                              },
                              count: 1
                          }
                      }
                  ],
                  "musicPopuler": 
                  [
                      {
                          "$group": 
                          {
                              _id: 
                              {
                                  "musicTitle": "$musicTitle",
                                  "apsaraMusic": "$apsaraMusic",
                                  "apsaraThumnail": "$apsaraThumnail"
                              },
                              count: 
                              { 
                                  "$sum": "$total"
                              }
                          }
                      },
                      { 
                          $sort: 
                          { 
                              count: -1,
                              _id: 1
                          } 
                      },
                      { 
                          $skip: 0 
                      },
                      { 
                          $limit: 5 
                      },
                  ],
                  "genrePopuler": 
                  [
                      {
                          "$group": 
                          {
                              _id: "$genre",
                              count: 
                              { 
                                  "$sum": "$total"
                              }
                          }
                      },
                      { 
                          $sort: 
                          { 
                              count: -1,
                              _id: 1
                          } 
                      },
                      { 
                          $skip: 0 
                      },
                      { 
                          $limit: 5 
                      },
                  ],
                  "themePopuler": 
                  [
                      {
                          "$group": 
                          {
                              _id: "$theme",
                              count: 
                              { 
                                  "$sum": "$total"
                              }
                          }
                      },
                      { 
                          $sort: 
                          { 
                              count: -1,
                              _id: 1
                          } 
                      },
                      { 
                          $skip: 0 
                      },
                      { 
                          $limit: 5 
                      },
                  ],
                  "moodPopuler": 
                  [
                      {
                          "$group": 
                          {
                              _id: "$mood",
                              count: 
                              { 
                                  "$sum": "$total"
                              }
                          }
                      },
                      { 
                          $sort: 
                          { 
                              count: -1,
                              _id: 1
                          } 
                      },
                      { 
                          $skip: 0 
                      },
                      { 
                          $limit: 5 
                      },
                  ],
              }
          }
        ]
      );

      return query;
    }

    async findreportuserdetail(target: string) {
      var result = await this.loaddata.aggregate([
        {
            $match: { postID: target }
        },
        {
            "$lookup":
            {
                from: "newUserBasics",
                localField: "idUser",
                foreignField: "_id",
                as: "basicdata",
            }
        },
        {
            "$addFields":
            {
                'salePrice': {
                    $cmp: ["$saleAmount", 0]
                },
                'komen': {
                    $cmp: ["$comments", 0]
                },
                'basic': {
                    $arrayElemAt: ['$basicdata', 0]
                },
                // 'profilepictid': {
                //     $arrayElemAt: ['$basicdata.profilePict.$id', 0]
                // },
                // 'proofpictid': {
                //     $arrayElemAt: ['$basicdata.proofPict.$id', 0]
                // },
                'insightid': {
                    $arrayElemAt: ['$basicdata.insight.$id', 0]
                },
                // 'mediaid': {
                //     $arrayElemAt: ['$contentMedias.$id', 0]
                // },
                // 'mediaref': {
                //     $arrayElemAt: ['$contentMedias.$ref', 0]
                // },
                'isViewed': {
                    '$cond': {
                      if: {
                        '$eq': ['$views', 0]
                      },
                      then: false,
                      else: true
                    }
                },
                'mediaSource': {
                    '$arrayElemAt': ['$mediaSource', 0]
                },
                'listTag': 
                {
                    "$ifNull":
                    [
                        '$tagPeople.$id',
                        []
                    ]
                }
            }
        },
        {
            "$lookup":
            {
                from: "insights",
                localField: "insightid",
                foreignField: "_id",
                as: "insightdata",
            }
        },
        {
            "$lookup":
            {
                from: "newUserBasics",
                as: "tagpeople_data",
                let:
                {
                    local:"$listTag"
                },
                pipeline:
                [
                    {
                        "$match":
                        {
                            "$or":
                            [
                                {
                                    "$expr":
                                    {
                                        "$in":
                                        [
                                            "$_idAuth","$$local"
                                        ]
                                    }
                                },
                                {
                                    "$expr":
                                    {
                                        "$in":
                                        [
                                            "$_id","$$local"
                                        ]
                                    }
                                },
                            ]
                        }
                    },
                    {
                        "$project":
                        {
                            username: 1
                        }
                    },
                    {
                        "$group":
                        {
                            _id: null,
                            username:
                            {
                                "$push": "$username"
                            }
                        }
                    }
                ]
            }
        },
        {
            "$addFields":
            {
                'insight': {
                    '$arrayElemAt': ['$insightdata', 0]
                },
                'avatar': {
                    mediaBasePath:
                    {
                        "$ifNull":
                        [
                            '$basic.mediaBasePath',
                            null
                        ]
                    },
                    mediaUri:
                    {
                        "$ifNull":
                        [
                            '$basic.mediaUri',
                            null
                        ]
                    },
                    mediaType:
                    {
                        "$ifNull":
                        [
                            '$basic.mediaType',
                            null
                        ]
                    },
                    mediaEndpoint:
                    {
                        "$ifNull":
                        [
                            '$basic.mediaEndpoint',
                            null
                        ]
                    }
                },
                'cleanUri':
                {
                    "$replaceOne":
                    {
                        input: "$mediaSource.mediaUri",
                        find: "_0001.jpeg",
                        replacement: ""
                    }
                },
            }
        },
        {
            "$project":
            {
                _id: 1,
                insight: 
                {
                    shares: '$insight.shares',
                    followers: '$insight.followers',
                    comments: '$insight.comments',
                    followings: '$insight.followings',
                    reactions: '$insight.reactions',
                    posts: '$insight.posts',
                    views: '$insight.views',
                    likes: '$insight.likes'
                },
                avatar: 1,
                fullName: "$basic.fullName",
                username: "$basic.username",
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
                tagPeople: 
                {
                    "$ifNull":
                    [
                        {
                            "$arrayElemAt":
                            [
                              "$tagpeople_data.username", 0
                            ]
                        },
                        []
                    ]
                },
                reportedUserCount:
                {
                    "$ifNull":
                    [
                        {
                            "$filter":
                            {
                                input: "$reportedUser",
                                as: "listuser",
                                cond:
                                {
                                "$eq":
                                    [
                                    "$$listuser.active",
                                    true
                                    ]
                                }
                            }
                        },
                        []
                    ]
                },
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
                rotate:
                {
                    "$ifNull":
                    [
                        "$mediaSource.rotate",
                        null
                    ]
                },
                mediaBasePath:
                {
                    "$ifNull":
                    [
                        "$mediaSource.mediaBasePath",
                        null
                    ]
                },
                mediaUri:
                {
                    "$ifNull":
                    [
                        "$mediaSource.mediaUri",
                        null
                    ]
                },
                mediaType:
                {
                    "$ifNull":
                    [
                        "$mediaSource.mediaType",
                        null
                    ]
                },
                mediaThumbEndpoint:
                {
                    "$ifNull":
                    [
                        "$mediaSource.mediaThumbEndpoint",
                        {
                            "$concat":
                            [
                                "/thumb/",
                                "$cleanUri"
                            ]
                        }
                    ]
                },
                mediaEndpoint:
                {
                    "$ifNull":
                    [
                        "$mediaSource.mediaEndpoint",
                        {
                            "$cond":
                            {
                                if:
                                {
                                    "$eq":
                                    [
                                        "$postType", "pict"
                                    ]
                                },
                                then:
                                {
                                    "$concat":
                                    [
                                        "/pict/",
                                        "$cleanUri"
                                    ]
                                },
                                else:
                                {
                                    "$concat":
                                    [
                                        "/stream/",
                                        "$cleanUri"
                                    ]
                                }
                            }
                        }
                    ]
                },
                mediaThumbUri:
                {
                    "$ifNull":
                    [
                        "$mediaSource.mediaThumbUri",
                        null
                    ]
                },
                apsaraId:
                {
                    "$ifNull":
                    [
                        "$mediaSource.apsaraId",
                        null
                    ]
                },
                apsara:
                {
                    "$ifNull":
                    [
                        "$mediaSource.apsara",
                        false
                    ]
                },
                proofpict:
                [
                    {
                        _id: "$basic._id",
                        createdAt:
                        {
                            "$arrayElemAt":
                            [
                                "$basic.kyc.createdAt", 0
                            ]
                        },
                        nama:
                        {
                            "$arrayElemAt":
                            [
                                "$basic.kyc.nama", 0
                            ]
                        }
                    }
                ]
            }
        },
        {
            "$project":
            {
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
                reportedUserCount:
                {
                    "$size": "$reportedUserCount"
                },
                reportedUserHandle: 1,
                reportedUser: 1,
                reportedStatus: 1,
                lastReasonReport: {
                $cond: {
                    if: {
                        $or: [{
                            $eq: ["$reportedUser", null]
                        }, {
                            $eq: ["$reportedUser", ""]
                        }, {
                            $eq: ["$reportedUser", []]
                        },]
                    },
                    then: "Lainnya",
                    else: {
                        $last: "$reportedUser.description"
                    }
                },
    
                },
                lastAppeal: {
                $cond: {
                    if: {
                        $or: [{
                            $eq: ["$reportedUserHandle", null]
                        }, {
                            $eq: ["$reportedUserHandle", ""]
                        }, {
                            $eq: ["$reportedUserHandle", []]
                        },]
                    },
                    then: "Lainnya",
                    else: {
                        $last: "$reportedUserHandle.reason"
                    }
                },
    
                },
                lastAppealAdmin: {
                $cond: {
                    if: {
                        $or: [{
                            $eq: ["$reportedUserHandle", null]
                        }, {
                            $eq: ["$reportedUserHandle", ""]
                        }, {
                            $eq: ["$reportedUserHandle", []]
                        },]
                    },
                    then: "Lainnya",
                    else: {
                        $last: "$reportedUserHandle.reasonAdmin"
                    }
                },
    
                },
                createdAtReportLast: {
                $last: "$reportedUser.createdAt"
                },
                createdAtAppealLast: {
                $last: "$reportedUserHandle.createdAt"
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
            "$project":
            {
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
                createdAtReportLast: 1,
                createdAtAppealLast: 1,
                lastAppeal: 1,
                lastAppealAdmin: 1,
                lastReasonReport: 1,
                statusLast: 1,
                reasonLastReport: {
                $cond: {
                    if: {
                        $or: [{
                            $eq: ["$lastReasonReport", null]
                        }, {
                            $eq: ["$lastReasonReport", ""]
                        }, {
                            $eq: ["$lastReasonReport", "Lainnya"]
                        }]
                    },
                    then: "Lainnya",
                    else: {
                        $last: "$reportedUser.description"
                    }
                },
    
                },
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
                reasonLastAppealAdmin: {
                $cond: {
                    if: {
                        $or: [{
                            $eq: ["$lastAppealAdmin", null]
                        }, {
                            $eq: ["$lastAppealAdmin", ""]
                        }, {
                            $eq: ["$lastAppealAdmin", "Lainnya"]
                        }]
                    },
                    then: "Lainnya",
                    else: {
                        $last: "$reportedUserHandle.reasonAdmin"
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
      ]);
      return result;
    }

    async countReason(postID: string) {
      let query = await this.loaddata.aggregate([
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

    async detailuserreport(target: string) {
      var result = await this.loaddata.aggregate([
        {
          "$match":
          {
            "postID": target
          }
        },
        {
            $lookup: 
            {
                from: 'newUserBasics',
                localField: 'idUser',
                foreignField: '_id',
                as: 'basicdata',
            }
        },
        {
            "$addFields":
            {
                'salePrice': {
                    $cmp: ["$saleAmount", 0]
                },
                'komen': {
                    $cmp: ["$comments", 0]
                },
                'basic': {
                    $arrayElemAt: ['$basicdata', 0]
                },
                // 'profilepictid': {
                // $arrayElemAt: ['$basicdata.profilePict.$id', 0]
                // },
                // 'proofpictid': {
                // $arrayElemAt: ['$basicdata.proofPict.$id', 0]
                // },
                'insightid': {
                    $arrayElemAt: ['$basicdata.insight.$id', 0]
                },
                // 'mediaid': {
                // $arrayElemAt: ['$contentMedias.$id', 0]
                // },
                // 'mediaref': {
                // $arrayElemAt: ['$contentMedias.$ref', 0]
                // },
                'isViewed': {
                    '$cond': {
                        if: {
                            '$eq': ['$views', 0]
                        },
                        then: false,
                        else: true
                    }
                },
                'tempmediaSource': {
                    '$arrayElemAt': [
                        '$mediaSource', 0
                    ]
                }
            }
        },
        {
            $lookup: 
            {
                from: 'insights',
                localField: 'insightid',
                foreignField: '_id',
                as: 'insightdata',
            }
        },
        {
            "$addFields":
            {
                "insight":
                {
                    "$arrayElemAt":
                    [
                        "$insightdata", 0
                    ]
                },
                "cleanUri":
                {
                    $replaceOne: 
                    { 
                        input: "$tempmediaSource.mediaUri", 
                        find: "_0001.jpeg", 
                        replacement: "" 
                    }   
                },
                "tempkyc":
                {
                    "$arrayElemAt":
                    [
                        "$basic.kyc", 0
                    ]
                }
            }
        },
        {
            "$project":
            {
                _id: 1,
                insight: 
                {
                    shares: '$insight.shares',
                    followers: '$insight.followers',
                    comments: '$insight.comments',
                    followings: '$insight.followings',
                    reactions: '$insight.reactions',
                    posts: '$insight.posts',
                    views: '$insight.views',
                    likes: '$insight.likes'
                },
                avatar: 
                {
                    mediaBasePath: 
                    {
                        "$ifNull":
                        [
                            '$basic.mediaBasePath',
                            null
                        ]
                    },
                    mediaUri: 
                    {
                        "$ifNull":
                        [
                            '$basic.mediaUri',
                            null
                        ]
                    },
                    mediaType: 
                    {
                        "$ifNull":
                        [
                            '$basic.mediaType',
                            null
                        ]
                    },
                    mediaEndpoint: 
                    {
                        "$ifNull":
                        [
                            '$basic.mediaEndpoint',
                            null
                        ]
                    },
                    medreplace: 
                    {
                        $replaceOne: 
                        {
                            input: "$basic.mediaUri",
                            find: "_0001.jpeg",
                            replacement: ""
                        }
                    },
                },
                fullName: "$basic.fullName",
                username: "$basic.username",
                privacy: 
                {
                    isPostPrivate: '$basic.isPostPrivate',
                    isCelebrity: '$basic.isCelebrity',
                    isPrivate: '$basic.isPrivate'
                },
                proofpict:
                [
                    {
                        _id: "$basic._id",
                        createdAt: "$tempkyc.createdAt",
                        nama: "$tempkyc.nama"
                    }
                ],
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                email: 1,
                postType: 1,
                description: 1,
                visibility: 1,
                title: 1,
                likes: 1,
                views: 1,
                active: 1,
                location: 1,
                tags: 1,
                shares: 1,
                komen: 1,
                isOwned: 1,
                tagPeople: 1,
                reportedUser: 1,
                reportedUserCount:
                {
                    "$ifNull":
                    [
                        {
                            "$filter":
                            {
                                input: "$reportedUser",
                                as: "listuser",
                                cond:
                                {
                                    "$eq":
                                    [
                                        "$$listuser.active",
                                        true
                                    ]
                                }
                            }
                        },
                        []
                    ]
                },
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
                lastReasonReport: {
                    $cond: {
                        if: {
                            $or: [{
                                $eq: ["$reportedUser", null]
                            }, {
                                $eq: ["$reportedUser", ""]
                            }, {
                                $eq: ["$reportedUser", []]
                            },]
                        },
                        then: "Lainnya",
                        else: 
                        {
                            $last: "$reportedUser.description"
                        }
                    },
                },
                lastAppeal: {
                    $cond: {
                        if: {
                            $or: [{
                                $eq: ["$reportedUserHandle", null]
                            }, {
                                $eq: ["$reportedUserHandle", ""]
                            }, {
                                $eq: ["$reportedUserHandle", []]
                            },]
                        },
                        then: "Lainnya",
                        else: {
                            $last: "$reportedUserHandle.reason"
                        }
                    },
                },
                lastAppealAdmin: {
                    $cond: {
                        if: {
                            $or: [{
                                $eq: ["$reportedUserHandle", null]
                            }, {
                                $eq: ["$reportedUserHandle", ""]
                            }, {
                                $eq: ["$reportedUserHandle", []]
                            },]
                        },
                        then: "Lainnya",
                        else: {
                            $last: "$reportedUserHandle.reasonAdmin"
                        }
                    },
                },
                createdAtReportLast: {
                    $last: "$reportedUser.createdAt"
                },
                createdAtAppealLast: {
                    $last: "$reportedUserHandle.createdAt"
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
                rotate:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.rotate",
                        null
                    ]
                },
                mediaBasePath:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.mediaBasePath",
                        null
                    ]
                },
                mediaUri:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.mediaUri",
                        null
                    ]
                },
                mediaType:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.mediaType",
                        null
                    ]
                },
                mediaThumbEndpoint:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.mediaThumbEndpoint",
                        {
                            "$concat":
                            [
                                "/thumb/",
                                "$cleanUri"
                            ]
                        }
                    ]
                },
                mediaEndpoint:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.mediaEndpoint",
                        {
                            "$cond":
                            {
                                if:
                                {
                                    "$eq":
                                    [
                                        "$postType", "pict"
                                    ]
                                },
                                then:
                                {
                                    "$concat":
                                    [
                                        "/pict/",
                                        "$cleanUri"
                                    ]
                                },
                                else:
                                {
                                    "$concat":
                                    [
                                        "/stream/",
                                        "$cleanUri"
                                    ]
                                }
                            }
                        }
                    ]
                },
                mediaThumbUri:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.mediaThumbUri",
                        null
                    ]
                },
                apsaraId:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.apsaraId",
                        null
                    ]
                },
                apsara:
                {
                    "$ifNull":
                    [
                        "$tempmediaSource.apsara",
                        false
                    ]
                },
            }
        },
        {
            "$project":
            {
                _id: 1,
                insight: 1,
                avatar: 1,
                fullName: 1,
                username: 1,
                privacy: 1,
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                email: 1,
                proofpict: 1,
                postType: 1,
                description: 1,
                title: 1,
                likes: 1,
                views: 1,
                active: 1,
                shares: 1,
                visibility: 1,
                isOwned: 1,
                location: 1,
                tagPeople: 1,
                reportedUser: 1,
                reportedUserCount:
                {
                    "$size": "$reportedUserCount"
                },
                isIdVerified: 1,
                reportedUserHandle: 1,
                reportedStatus: 1,
                statusUser: 1,
                lastReasonReport: 1,
                lastAppeal: 1,
                lastAppealAdmin: 1,
                reasonLastReport: {
                    $cond: {
                      if: {
                        $or: [{
                          $eq: ["$lastReasonReport", null]
                        }, {
                          $eq: ["$lastReasonReport", ""]
                        }, {
                          $eq: ["$lastReasonReport", "Lainnya"]
                        }]
                      },
                      then: "Lainnya",
                      else: {
                        $last: "$reportedUser.description"
                      }
                    },
                },
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
                reasonLastAppealAdmin: {
                    $cond: {
                      if: {
                        $or: [{
                          $eq: ["$lastAppealAdmin", null]
                        }, {
                          $eq: ["$lastAppealAdmin", ""]
                        }, {
                          $eq: ["$lastAppealAdmin", "Lainnya"]
                        }]
                      },
                      then: "Lainnya",
                      else: {
                        $last: "$reportedUserHandle.reasonAdmin"
                      }
                    },
          
                },
                createdAtReportLast: 1,
                createdAtAppealLast: 1,
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
                isViewed: 1,
                allowComments: 1,
                isSafe: 1,
                saleLike: 1,
                saleView: 1,
                monetize: 1,
                comments: 1,
                salePrice: 1,
                saleAmount: 1,
                rotate: 1,
                mediaBasePath: 1,
                mediaUri: 1,
                mediaType: 1,
                mediaThumbEndpoint: 1,
                mediaEndpoint: 1,
                mediaThumbUri: 1,
                apsaraId: 1,
                apsara: 1,
            }
        }
      ]);
      return result;
    }

    async findByMusicId(postid: string) {
      var mongo = require('mongoose');
      var result = await this.loaddata.aggregate([
        {
          $match: {
            $expr:
            {
              $eq: ["$musicId", new mongo.Types.ObjectId(postid)]
            },
    
          }
        },
        {
          $project: {
            _id: "sean",
            postID: 1,
            viewer: 1
          }
        },
        {
          $group: {
            _id: "$_id",
            postMusic: {
              $push: "$postID"
            },
            "count": {
              "$sum": 1
            },
            "viewerdata": {
                "$push": "$viewer"
            }
          }
        },
        {
          $facet: {
            posted: [
              {
                $project:
                {
                  _id: "rere ahoy",
                  postID: "$count",
    
                }
              }
            ],
            user: [
                //opsi 1
            //   {
            //     "$lookup": {
            //       "from": "contentevents",
            //       "let": {
            //         "postID": "$postMusic",
            //         //"countPost":"$postMusic"
            //       },
            //       as: "event",
            //       "pipeline": [
            //         {
            //           "$match": {
            //             "$expr": {
            //               "$and": [
            //                 {
            //                   "$in": ["$postID", "$$postID"]
            //                 },
            //                 {
            //                   "$eq": ["$eventType", "VIEW"]
            //                 },
            //                 {
            //                   "$eq": ["$event", "ACCEPT"]
            //                 }
            //               ]
            //             }
            //           }
            //         },
    
            //       ]
            //     }
            //   },
            //   {
            //     $project: {
            //       _id: "$kampret",
            //       email: "$event.senderParty",
            //       //countPost:"$postID"
            //     }
            //   },
            //   {
            //     $unwind: {
            //       path: "$email"
            //     }
            //   },
            //   {
            //     $group: {
            //       _id: "$email",
            //       "totEmail": {
            //         "$sum": 1
            //       },
            //       //postID:{ $push:"$postID"}
            //     }
            //   },
    
              //opsi 2
              {
                "$unwind":
                {
                    path: "$viewerdata"
                }
              },
              {
                "$unwind":
                {
                    path: "$viewerdata"
                }
              },
              {
                "$group":
                {
                    _id: "$viewerdata",
                    totEmail: {
                        "$sum": 1
                    }
                }
              },
    
              {
                "$lookup": {
                  "from": "newUserBasics",
                  "as": "userbasics_data",
                  "let": {
                    "local_id": "$_id"
                  },
                  "pipeline": [
                    {
                      "$match": {
                        "$expr": {
                          "$eq": ["$email", "$$local_id"]
                        }
                      }
                    },
                    {
                      "$project": {
                        "_id": 1,
                        "email": 1,
                        "fullName": 1,
                        "username": 1,
                        "gender": {
                          "$cond": {
                            "if": {
                              "$ne": ["$gender", null]
                            },
                            "then": {
                              "$switch": {
                                "branches": [{
                                  "case": {
                                    "$or": [{
                                      "$eq": ["$gender", "Male"]
                                    }, {
                                      "$eq": ["$gender", "Laki-laki"]
                                    }, {
                                      "$eq": ["$gender", "MALE"]
                                    }]
                                  },
                                  "then": "FEMALE"
                                }, {
                                  "case": {
                                    "$or": [{
                                      "$eq": ["$gender", " Perempuan"]
                                    }, {
                                      "$eq": ["$gender", "Perempuan"]
                                    }, {
                                      "$eq": ["$gender", "PEREMPUAN"]
                                    }, {
                                      "$eq": ["$gender", "FEMALE"]
                                    }, {
                                      "$eq": ["$gender", " FEMALE"]
                                    }]
                                  },
                                  "then": "MALE"
                                }, {
                                  "case": {
                                    "$or": [{
                                      "$eq": ["$gender", null]
                                    }]
                                  },
                                  "then": "OTHER"
                                }],
                                "default": "OTHER"
                              }
                            },
                            "else": "OTHER"
                          }
                        },
                        "age": {
                          "$cond": {
                            "if": {
                              "$and": ["$dob", {
                                "$ne": ["$dob", ""]
                              }]
                            },
                            "then": {
                              "$toInt": {
                                "$divide": [{
                                  "$subtract": [new Date(), {
                                    "$toDate": "$dob"
                                  }]
                                }, 31536000000]
                              }
                            },
                            "else": 0
                          }
                        },
                        "ageQualication": {
                          "$switch": {
                            "branches": [{
                              "case": {
                                "$and": [{
                                  "$gte": [{
                                    "$cond": {
                                      "if": {
                                        "$and": ["$dob", {
                                          "$ne": ["$dob", ""]
                                        }]
                                      },
                                      "then": {
                                        "$toInt": {
                                          "$divide": [{
                                            "$subtract": [new Date(), {
                                              "$toDate": "$dob"
                                            }]
                                          }, 31536000000]
                                        }
                                      },
                                      "else": 0
                                    }
                                  }, 1]
                                }, {
                                  "$lte": [{
                                    "$cond": {
                                      "if": {
                                        "$and": ["$dob", {
                                          "$ne": ["$dob", ""]
                                        }]
                                      },
                                      "then": {
                                        "$toInt": {
                                          "$divide": [{
                                            "$subtract": [new Date(), {
                                              "$toDate": "$dob"
                                            }]
                                          }, 31536000000]
                                        }
                                      },
                                      "else": 0
                                    }
                                  }, 14]
                                }]
                              },
                              "then": "< 14 Tahun"
                            }, {
                              "case": {
                                "$and": [{
                                  "$gte": [{
                                    "$cond": {
                                      "if": {
                                        "$and": ["$dob", {
                                          "$ne": ["$dob", ""]
                                        }]
                                      },
                                      "then": {
                                        "$toInt": {
                                          "$divide": [{
                                            "$subtract": [new Date(), {
                                              "$toDate": "$dob"
                                            }]
                                          }, 31536000000]
                                        }
                                      },
                                      "else": 0
                                    }
                                  }, 14]
                                }, {
                                  "$lte": [{
                                    "$cond": {
                                      "if": {
                                        "$and": ["$dob", {
                                          "$ne": ["$dob", ""]
                                        }]
                                      },
                                      "then": {
                                        "$toInt": {
                                          "$divide": [{
                                            "$subtract": [new Date(), {
                                              "$toDate": "$dob"
                                            }]
                                          }, 31536000000]
                                        }
                                      },
                                      "else": 0
                                    }
                                  }, 24]
                                }]
                              },
                              "then": "14 - 24 Tahun"
                            }, {
                              "case": {
                                "$and": [{
                                  "$gte": [{
                                    "$cond": {
                                      "if": {
                                        "$and": ["$dob", {
                                          "$ne": ["$dob", ""]
                                        }]
                                      },
                                      "then": {
                                        "$toInt": {
                                          "$divide": [{
                                            "$subtract": [new Date(), {
                                              "$toDate": "$dob"
                                            }]
                                          }, 31536000000]
                                        }
                                      },
                                      "else": 0
                                    }
                                  }, 25]
                                }, {
                                  "$lte": [{
                                    "$cond": {
                                      "if": {
                                        "$and": ["$dob", {
                                          "$ne": ["$dob", ""]
                                        }]
                                      },
                                      "then": {
                                        "$toInt": {
                                          "$divide": [{
                                            "$subtract": [new Date(), {
                                              "$toDate": "$dob"
                                            }]
                                          }, 31536000000]
                                        }
                                      },
                                      "else": 0
                                    }
                                  }, 35]
                                }]
                              },
                              "then": "24 - 35 Tahun"
                            }, {
                              "case": {
                                "$and": [{
                                  "$gte": [{
                                    "$cond": {
                                      "if": {
                                        "$and": ["$dob", {
                                          "$ne": ["$dob", ""]
                                        }]
                                      },
                                      "then": {
                                        "$toInt": {
                                          "$divide": [{
                                            "$subtract": [new Date(), {
                                              "$toDate": "$dob"
                                            }]
                                          }, 31536000000]
                                        }
                                      },
                                      "else": 0
                                    }
                                  }, 35]
                                }, {
                                  "$lte": [{
                                    "$cond": {
                                      "if": {
                                        "$and": ["$dob", {
                                          "$ne": ["$dob", ""]
                                        }]
                                      },
                                      "then": {
                                        "$toInt": {
                                          "$divide": [{
                                            "$subtract": [new Date(), {
                                              "$toDate": "$dob"
                                            }]
                                          }, 31536000000]
                                        }
                                      },
                                      "else": 0
                                    }
                                  }, 44]
                                }]
                              },
                              "then": "35 - 44 Tahun"
                            }, {
                              "case": {
                                "$gt": [{
                                  "$cond": {
                                    "if": {
                                      "$and": ["$dob", {
                                        "$ne": ["$dob", ""]
                                      }]
                                    },
                                    "then": {
                                      "$toInt": {
                                        "$divide": [{
                                          "$subtract": [new Date(), {
                                            "$toDate": "$dob"
                                          }]
                                        }, 31536000000]
                                      }
                                    },
                                    "else": 0
                                  }
                                }, 43]
                              },
                              "then": "> 44 Tahun"
                            }],
                            "default": "OTHER"
                          }
                        },
                        "userInterests_array": {
                          "$map": {
                            "input": {
                              "$map": {
                                "input": "$userInterests",
                                "in": {
                                  "$arrayElemAt": [{
                                    "$objectToArray": "$$this"
                                  }, 1]
                                }
                              }
                            },
                            "in": "$$this.v"
                          }
                        },
                        "statesName": 1
                      }
                    },
                    {
                      "$lookup": {
                        "from": "interests_repo",
                        "localField": "userInterests_array",
                        "foreignField": "_id",
                        "as": "interests"
                      }
                    },
                    // {
                    //   "$lookup": {
                    //     "from": "areas",
                    //     "as": "areas",
                    //     "let": {
                    //       "local_id": "$states.$id"
                    //     },
                    //     "pipeline": [
                    //       {
                    //         "$match": {
                    //           "$expr": {
                    //             "$eq": ["$_id", "$$local_id"]
                    //           }
                    //         }
                    //       }
                    //     ]
                    //   }
                    // }
                  ]
                },
    
              },
              {
                "$project": {
                  _id: "$kampret",
                  email: "$_id",
                  totEmail: 1,
                  "senderParty": 1,
                  "gender": {
                    "$ifNull": [{
                      "$let": {
                        "vars": {
                          "tmp": {
                            "$arrayElemAt": ["$userbasics_data", 0]
                          }
                        },
                        "in": "$$tmp.gender"
                      }
                    }, "OTHER"]
                  },
                  "ageQualication": {
                    "$ifNull": [{
                      "$let": {
                        "vars": {
                          "tmp": {
                            "$arrayElemAt": ["$userbasics_data", 0]
                          }
                        },
                        "in": "$$tmp.ageQualication"
                      }
                    }, "OTHER"]
                  },
                  "interest": {
                    "$map": {
                      "input": {
                        "$map": {
                          "input": {
                            "$let": {
                              "vars": {
                                "tmp": {
                                  "$arrayElemAt": ["$userbasics_data", 0]
                                }
                              },
                              "in": "$$tmp.interests"
                            }
                          },
                          "in": {
                            "$arrayElemAt": [{
                              "$objectToArray": "$$this"
                            }, 1]
                          }
                        }
                      },
                      "in": "$$this.v"
                    }
                  },
                  "areas": {
                    "$ifNull":
                    [
                        {
                            "$arrayElemAt":
                            [
                                "$userbasics_data.statesName", 0
                            ]
                        },
                        "OTHER"
                    ]
                  }
                }
              }
            ],
    
          }
        },
        {
          $project: {
            _id: "rere",
            posted: 1,
            user: 1,
    
          }
        },
        {
           "$unwind": {
               "path": "$posted"
           }
        },
        {
          "$facet": {
            "wilayah": [
    
              {
                "$unwind": {
                  "path": "$user"
                }
              },
              {
                "$group": {
                  "_id": "$user.areas",
                  "count": {
                    "$sum": 1,//"$user.totEmail"
                  },
                  //tot:{ $push: "$user.totEmail"},
                  //emaik:{ $push: "$user.email"}
                }
              }
            ],
            "gender": [{
              "$unwind": {
                "path": "$user"
              }
            },
            {
              "$group": {
                "_id": "$user.gender",
                "count": {
                  "$sum": 1
                },
                //tot:{ $push: "$user.totEmail"}
              }
            }
            ],
            "age": [
              {
                "$unwind": {
                  "path": "$user"
                }
              },
              {
                "$group": {
                  "_id": "$user.ageQualication",
                  "count": {
                    "$sum": 1,//"$user.totEmail"
                  },
                  //tot:{ $push: "$user.totEmail"}
                }
              }
            ],
            "view": [
              {
                "$unwind": {
                  "path": "$user"
                }
              },
              {
                "$project": {
                  "_id": "$user.email",
                  "count": {
                    "$sum": 1
                  },
                  //tot:{ $push: "$user.totEmail"}
                }
              },
              {
                $group: {
                  _id: "total user",
                  "count": {
                    "$sum": "$count"
                  },
                }
              }
            ],
            "used": [
              {
                "$unwind": {
                  "path": "$posted"
                }
              },
              {
                "$project": {
                  "_id": "$posted._id",
                  "count": "$posted.postID",
                  //tot:{ $push: "$user.totEmail"}
                }
              }
            ]
          }
        },
        {
          $project: {
            wilayah: 1,
            gender: 1,
            age: 1,
            view: {
              "$let": {
                "vars": {
                  "tmp": {
                    "$arrayElemAt": ["$view", 0]
                  }
                },
                "in": "$$tmp.count"
              }
            },
            used: {
              "$let": {
                "vars": {
                  "tmp": {
                    "$arrayElemAt": ["$used", 0]
                  }
                },
                "in": "$$tmp.count"
              }
            },
          }
    
        }
      ]);

      return result
    }

    async findcontenbuy(postID: string) {
      const query = await this.loaddata.aggregate([
        { $match: { postID: postID } },
        {
          $addFields: {
            salePrice: { $cmp: ["$saleAmount", 0] }
    
          },
        },
        {
          $lookup: {
            from: 'newUserBasics',
            localField: 'idUser',
            foreignField: '_id',
            as: 'userbasics_data',
          },
        },
    
        {
          $project: {
            user: { $arrayElemAt: ['$userbasics_data', 0] },
    
            insight_id: '$user.insight.$id',
            fullName: '$user.fullName',
            username: '$user.username',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
            postID: '$postID',
            email: '$email',
            postType: '$postType',
            description: '$description',
            title: '$description',
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
            mediaSource:{
                "$arrayElemAt":[
                    "$mediaSource", 0
                ]
            }
          }
        },
        {
          $project: {
            user: "$user",
            insight_id: '$user.insight.$id',
            fullName: '$user.fullName',
            username: '$user.username',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
            postID: '$postID',
            email: '$email',
            postType: '$postType',
            description: '$description',
            title: '$description',
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
            mediaSource: "$mediaSource"
          }
        },
        {
            "$addFields":
            {
                'cleanUri':
                {
                    "$replaceOne":
                    {
                        input:"$mediaSource.mediaUri",
                        find:"_0001.jpeg",
                        replacement:""
                    }
                },
            }
        },
        {
          $project: {
            fullName: '$fullName',
            username: '$username',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
            postID: '$postID',
            email: '$email',
            postType: '$postType',
            description: '$description',
            title: '$description',
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
            rotate: 
            {
                "$ifNull":
                [
                    "$mediaSource.rotate",
                    null
                ]
            },
            mediaBasePath:
            {
                "$ifNull":
                [
                    "$mediaSource.mediaBasePath",
                    null
                ]
            },
            mediaUri:
            {
                "$ifNull":
                [
                    "$mediaSource.mediaUri",
                    null
                ]
            },
            mediaType:
            {
                "$ifNull":
                [
                    "$mediaSource.mediaType",
                    null
                ]
            },
            mediaThumbEndpoint:
            {
                "$ifNull":
                [
                    "$mediaSource.mediaThumbEndpoint",
                    {
                        "$concat":
                        [
                            "/thumb/",
                            "$cleanUri"
                        ]
                    }
                ]
            },
            mediaEndpoint:
            {
                "$ifNull":
                [
                    "$mediaSource.mediaEndpoint",
                    {
                        "$cond":
                        {
                            if:
                            {
                                "$eq":
                                [
                                    "$postType", "pict"
                                ]
                            },
                            then:
                            {
                                "$concat":
                                [
                                    "/pict/",
                                    "$cleanUri"
                                ]
                            },
                            else:
                            {
                                "$concat":
                                [
                                    "/stream/",
                                    "$cleanUri"
                                ]
                            }
                        }
                    }
                ]
            },
            mediaThumbUri:
            {
                "$ifNull":
                [
                    "$mediaSource.mediaThumbUri",
                    null
                ]
            }
    
            // belum diganti!!
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
  
      ]);
      return query;
    }

    async updateNoneActive(email: string) {
      this.loaddata.updateMany(
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

    async getUserPostBoost(pageNumber: number, pageRow: number, headers: any) {
      var timestamps_start = await this.utilService.getDateTimeString();
      var fullurl = headers.host + "/api/posts/getboost/v2";
      var setdata = {
        "pageNumber": pageNumber,
        "pageRow": pageRow,
      };
      var reqbody = JSON.parse(JSON.stringify(setdata));
  
      var token = headers['x-auth-token'];
      var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
          await this.errorHandler.generateNotAcceptableException(
              'Unauthorized',
          );
      }
      if (!(await this.utilService.validasiTokenEmail(headers))) {
          await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed email header dan token not match',
          );
      }
      
      let res = new PostResponseApps();
      res.response_code = 202;
      let pd = await this.doGetUserPostBoost2(pageNumber, pageRow, auth.email);
      res.data = pd;
  
      var timestamps_end = await this.utilService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);
  
      return res;
    }

    private async doGetUserPostBoost2(pageNumber: number, pageRow: number, whoami: string): Promise<PostData[]>{
      // var currentDateString = await this.utilService.getDateTimeISOString();
      // var currentDate = new Date(currentDateString);
      // var currentDateFormat = currentDate.toISOString().split('T')[0] + " " + currentDate.toISOString().split('T')[1].split('.')[0];
      var perPage = Math.max(0, pageRow), page = Math.max(0, pageNumber);

      const query = await this.loaddata.aggregate([
        {
            "$match":
            {
                "$and":
                [
                    {
                        email: whoami
                    },
                    {
                        active: true
                    },
                    {
                        boosted:
                        {
                            "$exists":true
                        }
                    },
                    {
                        "$expr":
                        {
                            "$gt":
                            [
                                {
                                    "$size":"$boosted"
                                },
                                0
                            ]
                        }
                    }
                ]
            }
        },
        {
            $lookup: 
            {
                from: 'newUserBasics',
                localField: 'email',
                foreignField: 'email',
                as: 'basic_data',
            },
        },
        {
            $set: 
            {
                nowDate:
                {
                    "$dateToString": 
                    {
                        "format": "%Y-%m-%d %H:%M:%S",
                        "date": 
                        {
                            $add: 
                            [
                                new Date(), 25200000
                            ]
                        }
                    }
                }
            }
        },
        {
            "$addFields":
            {
                "tempmediasource":
                {
                    "$arrayElemAt":
                    [
                        "$mediaSource", 0
                    ]
                },
                "tempinterest":"$category.$id",
                "tempboost":
                {
                    "$arrayElemAt":
                    [
                        "$boosted", 0
                    ]
                },
                "tempuser":
                {
                    "$arrayElemAt":
                    [
                        "$basic_data", 0
                    ]
                }
            }
        },
        {
            $lookup: 
            {
                from: 'interests',
                as: 'cats',
                let:
                {
                    catid:"$tempinterest"
                },
                pipeline:
                [
                    {
                        "$match":
                        {
                            "$expr":
                            {
                                "$in":
                                [
                                    "$_id", "$$catid"
                                ]
                            }
                        }
                    }
                ]
            },
        },
        {
            $lookup:
            {
                from:'contentevents',
                as:"isLike",
                let:
                {
                    email:"$email",
                    post:"$postID"
                },
                pipeline:
                [
                    {
                        "$match":
                        {
                            "$and":
                            [
                                {
                                    "$expr":
                                    {
                                        "$eq":
                                        [
                                            "$email", "$$email"
                                        ]
                                    }
                                },
                                {
                                    "$expr":
                                    {
                                        "$eq":
                                        [
                                            "$postID", "$$post"
                                        ]
                                    }
                                },
                                {
                                    "active":true
                                },
                                {
                                    "eventType":"LIKE"
                                },
                                {
                                    "event":"DONE"
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            $lookup:
            {
                from:'contentevents',
                as:"isView",
                let:
                {
                    email:"$email",
                    post:"$postID"
                },
                pipeline:
                [
                    {
                        "$match":
                        {
                            "$and":
                            [
                                {
                                    "$expr":
                                    {
                                        "$eq":
                                        [
                                            "$email", "$$email"
                                        ]
                                    }
                                },
                                {
                                    "$expr":
                                    {
                                        "$eq":
                                        [
                                            "$postID", "$$post"
                                        ]
                                    }
                                },
                                {
                                    "active":true
                                },
                                {
                                    "eventType":"VIEW"
                                },
                                {
                                    "event":"DONE"
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            $lookup:
            {
                from:'contentevents',
                as:"isLike",
                let:
                {
                    email:"$email",
                    post:"$postID"
                },
                pipeline:
                [
                    {
                        "$match":
                        {
                            "$and":
                            [
                                {
                                    "$expr":
                                    {
                                        "$eq":
                                        [
                                            "$email", "$$email"
                                        ]
                                    }
                                },
                                {
                                    "$expr":
                                    {
                                        "$eq":
                                        [
                                            "$postID", "$$post"
                                        ]
                                    }
                                },
                                {
                                    "active":true
                                },
                                {
                                    "eventType":"LIKE"
                                },
                                {
                                    "event":"DONE"
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            "$project":
            {
                "active": 1,
                "allowComments": 1,
                "certified": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "description": 1,
                "email": 1,
                "boosted": 1,
                "boostDate": "$tempboost.boostDate",
                "isBoost": 1,
                "boostJangkauan": 
                {
                    "$size":"$tempboost.boostViewer"
                },
                "statusBoost": 
                {
                    $switch: 
                    {
                        branches: 
                        [
                            { 
                                case: 
                                { 
                                    $and: 
                                    [
                                        { 
                                            $lte: 
                                            [
                                                "$tempboost.boostSession.start", "$nowDate"
                                            ] 
                                        }, 
                                        { 
                                            $gte: 
                                            [
                                                "$tempboost.boostSession.end", "$nowDate"
                                            ] 
                                        }
                                    ] 
                                }, 
                                then: "BERLANGSUNG" 
                            },
                            { 
                                case: 
                                { 
                                    $and: 
                                    [
                                        { 
                                            $gte: 
                                            [
                                                "$tempboost.boostSession.start", "$nowDate"
                                            ] 
                                        }, 
                                        { 
                                            $gte: 
                                            [
                                                "$tempboost.boostSession.end", "$nowDate"
                                            ] 
                                        }
                                    ] 
                                }, 
                                then: "AKAN DATANG" 
                            },
                        ],
                        "default": "SELESAI"
                    }
                },
                "reportedStatus": 1,
                "username": "$tempuser.username",
                "avatar": 
                {
                    "mediaBasePath": 
                    {
                        "$ifNull":
                        [
                            "$tempuser.mediaBasePath",
                            null,
                        ]
                    },
                    "mediaType":
                    {
                        "$ifNull":
                        [
                            "$tempuser.mediaType",
                            null,
                        ]
                    },
                    "mediaUri":
                    {
                        "$ifNull":
                        [
                            "$tempuser.mediaUri",
                            null,
                        ]
                    },
                    "mediaEndpoint":
                    {
                        "$ifNull":
                        [
                            "$tempuser.mediaEndpoint",
                            null,
                        ]
                    },
                },
                "location": 1,
                "visibility": 1,
                "postID": 1,
                "postType": 1,
                "saleAmount": 1,
                "saleLike": 1,
                "saleView": 1,
                "cats": "$cats",
                "privacy": 
                {
                    "isPostPrivate": "$tempuser.isPostPrivate",
                    "isPrivate": "$tempuser.isPrivate",
                    "isCelebrity": "$tempuser.isCelebrity"
                },
                "isApsara": 
                {
                    "$ifNull":
                    [
                        "$tempmediasource.apsara",
                        false
                    ]
                },
                "apsaraId": 
                {
                    "$ifNull":
                    [
                        "$tempmediasource.apsaraId",
                        ""
                    ]
                },
                "mediaEndpoint":
                {
                    "$ifNull":
                    [
                        "$tempmediasource.mediaEndpoint",
                        null
                    ]
                },
                "mediaUri":
                {
                    "$ifNull":
                    [
                        "$tempmediasource.mediaUri",
                        null
                    ]
                },
                "mediaType":
                {
                    "$ifNull":
                    [
                        "$tempmediasource.mediaType",
                        null
                    ]
                },
                "isViewed": 
                {
                    "$cond":
                    {
                        if:
                        {
                            "$eq":
                            [
                                "$isView",
                                []
                            ]
                        },
                        then:false,
                        else:true
                    }
                },
                "isLiked": 
                {
                    "$cond":
                    {
                        if:
                        {
                            "$eq":
                            [
                                "$isLike",
                                []
                            ]
                        },
                        then:false,
                        else:true
                    }
                },
            }
        },
        { 
            $sort: 
            { 
                status: -1, 
                boostDate: -1 
            } 
        },
        { 
            $skip: (perPage * page) 
        },
        { 
            $limit: perPage 
        },
        {
            "$project":
            {
              "active": 1,
              "allowComments": 1,
              "certified": 1,
              "createdAt": 1,
              "updatedAt": 1,
              "description": 1,
              "email": 1,
              "boosted": 1,
              "boostDate": 1,
              "isBoost": 1,
              "boostJangkauan": 1,
              "statusBoost": 1,
              "reportedStatus": 1,
              "username": 1,
              "avatar": 1,
              "location": 1,
              "visibility": 1,
              "postID": 1,
              "postType": 1,
              "saleAmount": 1,
              "saleLike": 1,
              "saleView": 1,
              "cats": 1,
              "privacy": 1,
              "isApsara": 1,
              "apsaraId": 1,
              "mediaEndpoint": 1,
              "mediaUri": 1,
              "mediaType": 1,
              "isViewed": 1,
              "isLiked": 1
            }
        }
      ]);

      // console.log(query);

      var listdata = [];
      var tempresult = null;
      var tempdata = null;
      for (var i = 0; i < query.length; i++) {
        tempdata = query[i];
        if (tempdata.isApsara == true) {
          listdata.push(tempdata.apsaraId);
        }
        else {
          listdata.push(undefined);
        }
      }

      //console.log(listdata);
      var apsaraimagedata = await this.postContentService.getImageApsara(listdata);
      // console.log(apsaraimagedata);
      // console.log(resultdata.ImageInfo[0]);
      tempresult = apsaraimagedata.ImageInfo;
      for (var i = 0; i < query.length; i++) {
        for (var j = 0; j < tempresult.length; j++) {
          if (tempresult[j].ImageId == query[i].apsaraId) {
            query[i].apsaraThumbId = tempresult[j].apsaraThumbId;
          }
        }
        if (query[i].apsara == false && (query[i].mediaType == "image" || query[i].mediaType == "images")) {
          query[i].apsaraThumbId = '/thumb/' + query[i].postID;
        }
      }

      var apsaravideodata = await this.postContentService.getVideoApsara(listdata);
      // console.log(apsaravideodata);
      // console.log(resultdata.ImageInfo[0]);
      tempresult = apsaravideodata.VideoList;
      for (var i = 0; i < query.length; i++) {
        for (var j = 0; j < tempresult.length; j++) {
          if (tempresult[j].VideoId == query[i].apsaraId) {
            query[i].mediaThumbEndpoint = tempresult[j].CoverURL;
          }
          else if (query[i].apsara == false && query[i].mediaType == "video") {
            query[i].mediaThumbEndpoint = '/thumb/' + query[i].postID;
          }
        }
      }

      return query;
    }
}
