import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { newPosts, NewpostsDocument } from './schemas/newPost.schema';
import { PostContentService } from '../posts/postcontent.service';

@Injectable()
export class NewPostService {
    constructor(
        @InjectModel(newPosts.name, 'SERVER_FULL')
        private readonly loaddata: Model<NewpostsDocument>,
        private readonly postContentService:PostContentService
    ) { }

    async findOne(id:string)
    {
        var data = await this.loaddata.findOne({ postID:id }).exec();

        return data;
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
                  "local_id": "$email",
    
                },
                "pipeline": [
                  {
                    $match:
                    {
                      $expr: {
                        $eq: ['$email', '$$local_id']
                      }
                    }
                  },
                  {
                    $project: {
                      iduser: "$_id",
    
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
              $addFields: {
    
    
                'auth': {
                  $arrayElemAt: ['$authdata', 0]
                },
                'iduser': {
                  $arrayElemAt: ['$basicdata.iduser', 0]
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
                username: "$auth.username",
                createdAt: 1,
                updatedAt: 1,
                postID: 1,
                iduser: 1,
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
                mediaSource:1,
                auth:1
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
                mediaSource:1,
                auth:1
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
                mediaSource:1,
                auth:1
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
                  "mediaEndpoint":{
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
                localField: 'email',
                foreignField: 'email',
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
                  "mediaEndpoint":{
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
    
        // console.log(JSON.stringify(pipeline));
    
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

    async detailcontent(target:string, page:number, limit:number)
    {
      var query = await this.loaddata.aggregate([
        {
          "$match":
          {
            "postID":target
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
                localField: 'email',
                foreignField: 'email',
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
                        _id:"$$local_id"
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
                userView:1,
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
                userView:1,
                authdata:1,
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
                mediaSource:1
      
            }
        },
        {
            $project: {
                username: 1,
                authdata:1,
                userView:1,
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
                mediaSource:1
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
                authdata:1,
                username: 1,
                userView:1,
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
                  "mediaEndpoint":{
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
                riwayat:1,
                userView:1
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
                            riwayat:1,
                        }
                    }
                ],
                "age":
                [
                    {
                        "$unwind":
                        {
                            path:"$userView"
                        }
                    },
                    {
                      "$project":
                      {
                          userView:1
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
                                        _id:1,
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
                                        _id:1,
                                        ageQualication:1
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
                                          "$basic_data.ageQualication",0
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
                            _id:"$age",
                            count:
                            {
                                "$sum":1
                            }
                        }
                    },
                    {
                        "$sort":
                        {
                            _id:-1
                        }
                    }
                ],
                "wilayah":
                [
                  {
                      "$unwind":
                      {
                          path:"$userView"
                      }
                  },
                  {
                    "$project":
                    {
                        userView:1
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
                                        _id:1,
                                        states: 1,
                                    }
                                },
                                {
                                    $lookup: 
                                    {
                                        from: 'areas',
                                        localField: 'states.$id',
                                        foreignField: '_id',
                                        as: 'areas_data',
                                    },
                                },
                                {
                                    "$project":
                                    {
                                        _id:1,
                                        stateName:
                                        {
                                            "$ifNull":
                                            [
                                                {
                                                    "$arrayElemAt":
                                                    [
                                                        '$areas_data.stateName', 0
                                                    ]
                                                },
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
                                          "$basic_data.stateName",0
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
                            _id:"$wilayah",
                            count:
                            {
                                "$sum":1
                            }
                        }
                    },
                    {
                        "$sort":
                        {
                            _id:-1
                        }
                    }
                ],
                "gender":
                [
                  {
                      "$unwind":
                      {
                          path:"$userView"
                      }
                  },
                  {
                    "$project":
                    {
                        userView:1
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
                                        _id:1,
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
                                        _id:1,
                                        gender:1,
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
                                          "$basic_data.gender",0
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
                            _id:"$gender",
                            count:
                            {
                                "$sum":1
                            }
                        }
                    },
                    {
                        "$sort":
                        {
                            _id:-1
                        }
                    }
                ],
                "listtag":
                [
                      {
                          "$project":
                          {
                              tagPeople:1
                          }
                      },
                      {
                          "$unwind":
                          {
                              path:"$tagPeople",
                          }
                      },
                      {
                          $lookup: 
                          {
                              from: 'newUserBasics',
                              let: 
                              {
                                  local:'$tagPeople.$id'
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
                                                          "$_idAuth","$$local"
                                                      ]
                                                  }
                                              },
                                              {
                                                  "$expr":
                                                  {
                                                      "$eq":
                                                      [
                                                          "$_id","$$local"
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
                              path:"$authdata"
                          }
                      },
                      {
                          "$project":
                          {
                              username:"$authdata.username"
                          }
                      },
                      {
                          "$group":
                          {
                              _id:null,
                              data:
                              {
                                  "$push":"$username"
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
                      "$detail._id",0
                  ]
              },
              postID:
              {
                  "$arrayElemAt":
                  [
                      "$detail.postID",0
                  ]
              },
              email:
              {
                  "$arrayElemAt":
                  [
                      "$detail.email",0
                  ]
              },
              postType:
              {
                  "$arrayElemAt":
                  [
                      "$detail.postType",0
                  ]
              },
              description:
              {
                  "$arrayElemAt":
                  [
                      "$detail.description",0
                  ]
              },
              active:
              {
                  "$arrayElemAt":
                  [
                      "$detail.active",0
                  ]
              },
              createdAt:
              {
                  "$arrayElemAt":
                  [
                      "$detail.createdAt",0
                  ]
              },
              updatedAt:
              {
                  "$arrayElemAt":
                  [
                      "$detail.updatedAt",0
                  ]
              },
              visibility:
              {
                  "$arrayElemAt":
                  [
                      "$detail.visibility",0
                  ]
              },
              location:
              {
                  "$arrayElemAt":
                  [
                      "$detail.location",0
                  ]
              },
              tags:
              {
                  "$arrayElemAt":
                  [
                      "$detail.tags",0
                  ]
              },
              allowComments:
              {
                  "$arrayElemAt":
                  [
                      "$detail.allowComments",0
                  ]
              },
              likes:
              {
                  "$arrayElemAt":
                  [
                      "$detail.likes",0
                  ]
              },
              views:
              {
                  "$arrayElemAt":
                  [
                      "$detail.views",0
                  ]
              },
              shares:
              {
                  "$arrayElemAt":
                  [
                      "$detail.shares",0
                  ]
              },
              tagPeople:
              {
                  "$arrayElemAt":
                  [
                      "$listtag.data",0
                  ]
              },
              tagDescription:
              {
                  "$arrayElemAt":
                  [
                      "$detail.tagDescription",0
                  ]
              },
              kategori:
              {
                  "$arrayElemAt":
                  [
                      "$detail.kategori",0
                  ]
              },
              username:
              {
                  "$arrayElemAt":
                  [
                      "$detail.username",0
                  ]
              },
              saleAmount:
              {
                  "$arrayElemAt":
                  [
                      "$detail.saleAmount",0
                  ]
              },
              saleView:
              {
                  "$arrayElemAt":
                  [
                      "$detail.saleView",0
                  ]
              },
              saleLike:
              {
                  "$arrayElemAt":
                  [
                      "$detail.saleLike",0
                  ]
              },
              type:
              {
                  "$arrayElemAt":
                  [
                      "$detail.type",0
                  ]
              },
              kepemilikan:
              {
                  "$arrayElemAt":
                  [
                      "$detail.kepemilikan",0
                  ]
              },
              statusJual:
              {
                  "$arrayElemAt":
                  [
                      "$detail.statusJual",0
                  ]
              },
              mediaBasePath:
              {
                  "$arrayElemAt":
                  [
                      "$detail.mediaBasePath",0
                  ]
              },
              mediaUri:
              {
                  "$arrayElemAt":
                  [
                      "$detail.mediaUri",0
                  ]
              },
              mediaType:
              {
                  "$arrayElemAt":
                  [
                      "$detail.mediaType",0
                  ]
              },
              mediaThumbEndpoint:
              {
                  "$arrayElemAt":
                  [
                      "$detail.mediaThumbEndpoint",0
                  ]
              },
              mediaEndpoint:
              {
                  "$arrayElemAt":
                  [
                      "$detail.mediaEndpoint",0
                  ]
              },
              apsaraId:
              {
                  "$arrayElemAt":
                  [
                      "$detail.apsaraId",0
                  ]
              },
              apsara:
              {
                  "$arrayElemAt":
                  [
                      "$detail.apsara",0
                  ]
              },
              originalName:
              {
                  "$arrayElemAt":
                  [
                      "$detail.originalName",0
                  ]
              },
              comment:
              {
                  "$arrayElemAt":
                  [
                      "$detail.comment",0
                  ]
              },
              riwayat:
              {
                  "$arrayElemAt":
                  [
                      "$detail.riwayat",0
                  ]
              },
              age:"$age",
              wilayah:"$wilayah",
              gender:"$gender"
            }
        }
      ]);

      return query;
    }

    async findcontentbysearch(key: string, email: string, skip: number, limit: number, pict: any, vid: any, diary: any, user: any)
    {
      var pipeline = [];
      pipeline.push(
        {
          "$project":
          {
            "dedy" : key
          }
        },
        {
          "$limit":1
        }
      );

      var facet = {};
      if(user == true)
      {
        facet['user'] = [
          {
              "$lookup":
              {
                  from:"newUserBasics",
                  let:
                  {
                      name:"$dedy"
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
                                      input:"$username",
                                      regex:"$$name",
                                      options:"i"
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
                  path:"$userdata",
                  preserveNullAndEmptyArrays:true
              }
          },
          {
              "$project":
              {
                  fullName:"$userdata.fullName",
                  profilePict:"$userdata.profilePict",
                  username:"$userdata.username",
                  email:"$userdata.email",
                  avatar:
                  {
                      mediaBasePath:"$userdata.mediaBasePath",
                      mediaUri:"$userdata.mediaUri",
                      mediaType:"$userdata.mediaType",
                      mediaEndpoint:"$userdata.mediaEndpoint",
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
                  fullName:1,
                  profilePict:1,
                  username:1,
                  email:1,
                  avatar:1,
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
                          null
                      ]
                  }
              }
          },
          {
              "$skip":(skip * limit)
          },
          {
              "$limit":limit
          },
        ];
      }

      if(pict == true)
      {
        facet['pict'] = [
          {
              "$lookup":
              {
                  from:"newPosts",
                  let:
                  {
                      name:"$dedy"
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
                                              input:"$description",
                                              regex:"$$name",
                                              options:"i"
                                          }
                                      }
                                  },
                                  {
                                      "reportedStatus":
                                      {
                                          "$ne":"OWNED"
                                      }
                                  },
                                  {
                                      "visibility":"PUBLIC"
                                  },
                                  {
                                      "active":true
                                  },
                                  {
                                      "postType":"pict"
                                  },
                                  {
                                      "reportedUser.email":
                                      {
                                          "$not":
                                          {
                                              "$regex":"kusnur9@gmail.com"
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
                              "mediaSource":1,
                              "isLiked":
                              {
                                  "$ifNull":
                                  [
                                      {
                                          "$filter":
                                          {
                                              input:"$userLike",
                                              as:"datalike",
                                              cond:
                                              {
                                                  "$eq":
                                                  [
                                                      "$$datalike",
                                                      "kusnur9@gmail.com"
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
                              from:"newUserBasics",
                              localField:"email",
                              foreignField:"email",
                              as:"authdata"
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
                                                  "$size":"$isLiked"
                                              },
                                              0
                                          ]
                                      },
                                      then:false,
                                      else:true
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
                                      "$arrayElemAt":
                                      [
                                          "$authdata.mediaEndpoint", 0
                                      ]
                                  }
                              },
                              "mediaThumbEndpoint":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$mediaSource.mediaThumbEndpoint", 0
                                  ]
                              },
                              "mediaEndpoint":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$mediaSource.mediaEndpoint", 0
                                  ]
                              },
                              "mediaType":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$mediaSource.mediaType", 0
                                  ]
                              },
                              "isApsara":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$mediaSource.apsara", 0
                                  ]
                              },
                              "apsaraId":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$mediaSource.apsaraId", 0
                                  ]
                              }
                          }
                      },
                      {
                          "$skip":(skip * limit)
                      },
                      {
                          "$limit":limit
                      }
                  ]
              }
          },
          {
              "$unwind":
              {
                  path:"$postdata",
                  preserveNullAndEmptyArrays:true
              }
          },
          {
              "$project":
              {
                  boosted:"$postdata.boosted",
                  reportedStatus:"$postdata.reportedStatus",
                  insight:"$postdata.insight",
                  _id:"$postdata._id",
                  postID:"$postdata.postID",
                  createdAt:"$postdata.createdAt",
                  updatedAt:"$postdata.updatedAt",
                  email:"$postdata.email",
                  postType:"$postdata.postType",
                  description:"$postdata.description",
                  active:"$postdata.active",
                  metadata:"$postdata.metadata",
                  location:"$postdata.location",
                  isOwned:"$postdata.isOwned",
                  visibility:"$postdata.visibility",
                  isViewed:"$postdata.isViewed",
                  allowComments:"$postdata.allowComments",
                  saleAmount:"$postdata.saleAmount",
                  isLiked:"$postdata.isLiked",
                  certified:"$postdata.certified",
                  username:"$postdata.username",
                  profilepictid:"$postdata.profilepictid",
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
                  avatar:"$postdata.avatar",
                  mediaThumbEndpoint:"$postdata.mediaThumbEndpoint",
                  mediaEndpoint:"$postdata.mediaEndpoint",
                  mediaType:"$postdata.mediaType",
                  isApsara:"$postdata.isApsara",
                  apsaraId:"$postdata.apsaraId",
              }
          }
        ];
      }

      if(vid == true)
      {
        facet['vid'] = [
          {
              "$lookup":
              {
                  from:"newPosts",
                  let:
                  {
                      name:"$dedy"
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
                                              input:"$description",
                                              regex:"$$name",
                                              options:"i"
                                          }
                                      }
                                  },
                                  {
                                      "reportedStatus":
                                      {
                                          "$ne":"OWNED"
                                      }
                                  },
                                  {
                                      "visibility":"PUBLIC"
                                  },
                                  {
                                      "active":true
                                  },
                                  {
                                      "postType":"vid"
                                  },
                                  {
                                      "reportedUser.email":
                                      {
                                          "$not":
                                          {
                                              "$regex":"kusnur9@gmail.com"
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
                              "mediaSource":1,
                              "isLiked":
                              {
                                  "$ifNull":
                                  [
                                      {
                                          "$filter":
                                          {
                                              input:"$userLike",
                                              as:"datalike",
                                              cond:
                                              {
                                                  "$eq":
                                                  [
                                                      "$$datalike",
                                                      "kusnur9@gmail.com"
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
                              from:"newUserBasics",
                              localField:"email",
                              foreignField:"email",
                              as:"authdata"
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
                                                  "$size":"$isLiked"
                                              },
                                              0
                                          ]
                                      },
                                      then:false,
                                      else:true
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
                                      "$arrayElemAt":
                                      [
                                          "$authdata.mediaEndpoint", 0
                                      ]
                                  }
                              },
                              "mediaThumbEndpoint":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$mediaSource.mediaThumbEndpoint", 0
                                  ]
                              },
                              "mediaEndpoint":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$mediaSource.mediaEndpoint", 0
                                  ]
                              },
                              "mediaType":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$mediaSource.mediaType", 0
                                  ]
                              },
                              "isApsara":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$mediaSource.apsara", 0
                                  ]
                              },
                              "apsaraId":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$mediaSource.apsaraId", 0
                                  ]
                              }
                          }
                      },
                      {
                          "$skip":(skip * limit)
                      },
                      {
                          "$limit":limit
                      }
                  ]
              }
          },
          {
              "$unwind":
              {
                  path:"$postdata",
                  preserveNullAndEmptyArrays:true
              }
          },
          {
              "$project":
              {
                  boosted:"$postdata.boosted",
                  reportedStatus:"$postdata.reportedStatus",
                  insight:"$postdata.insight",
                  _id:"$postdata._id",
                  postID:"$postdata.postID",
                  createdAt:"$postdata.createdAt",
                  updatedAt:"$postdata.updatedAt",
                  email:"$postdata.email",
                  postType:"$postdata.postType",
                  description:"$postdata.description",
                  active:"$postdata.active",
                  metadata:"$postdata.metadata",
                  location:"$postdata.location",
                  isOwned:"$postdata.isOwned",
                  visibility:"$postdata.visibility",
                  isViewed:"$postdata.isViewed",
                  allowComments:"$postdata.allowComments",
                  saleAmount:"$postdata.saleAmount",
                  isLiked:"$postdata.isLiked",
                  certified:"$postdata.certified",
                  username:"$postdata.username",
                  profilepictid:"$postdata.profilepictid",
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
                  avatar:"$postdata.avatar",
                  mediaThumbEndpoint:"$postdata.mediaThumbEndpoint",
                  mediaEndpoint:"$postdata.mediaEndpoint",
                  mediaType:"$postdata.mediaType",
                  isApsara:"$postdata.isApsara",
                  apsaraId:"$postdata.apsaraId",
              }
          }
        ]
      }

      if(diary == true)
      {
        facet['diary'] = [
          {
              "$lookup":
              {
                  from:"newPosts",
                  let:
                  {
                      name:"$dedy"
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
                                              input:"$description",
                                              regex:"$$name",
                                              options:"i"
                                          }
                                      }
                                  },
                                  {
                                      "reportedStatus":
                                      {
                                          "$ne":"OWNED"
                                      }
                                  },
                                  {
                                      "visibility":"PUBLIC"
                                  },
                                  {
                                      "active":true
                                  },
                                  {
                                      "postType":"diary"
                                  },
                                  {
                                      "reportedUser.email":
                                      {
                                          "$not":
                                          {
                                              "$regex":"kusnur9@gmail.com"
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
                              "mediaSource":1,
                              "isLiked":
                              {
                                  "$ifNull":
                                  [
                                      {
                                          "$filter":
                                          {
                                              input:"$userLike",
                                              as:"datalike",
                                              cond:
                                              {
                                                  "$eq":
                                                  [
                                                      "$$datalike",
                                                      "kusnur9@gmail.com"
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
                              from:"newUserBasics",
                              localField:"email",
                              foreignField:"email",
                              as:"authdata"
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
                                                  "$size":"$isLiked"
                                              },
                                              0
                                          ]
                                      },
                                      then:false,
                                      else:true
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
                                      "$arrayElemAt":
                                      [
                                          "$authdata.mediaEndpoint", 0
                                      ]
                                  }
                              },
                              "mediaThumbEndpoint":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$mediaSource.mediaThumbEndpoint", 0
                                  ]
                              },
                              "mediaEndpoint":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$mediaSource.mediaEndpoint", 0
                                  ]
                              },
                              "mediaType":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$mediaSource.mediaType", 0
                                  ]
                              },
                              "isApsara":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$mediaSource.apsara", 0
                                  ]
                              },
                              "apsaraId":
                              {
                                  "$arrayElemAt":
                                  [
                                      "$mediaSource.apsaraId", 0
                                  ]
                              }
                          }
                      },
                      {
                          "$skip":(skip * limit)
                      },
                      {
                          "$limit":limit
                      }
                  ]
              }
          },
          {
              "$unwind":
              {
                  path:"$postdata",
                  preserveNullAndEmptyArrays:true
              }
          },
          {
              "$project":
              {
                  boosted:"$postdata.boosted",
                  reportedStatus:"$postdata.reportedStatus",
                  insight:"$postdata.insight",
                  _id:"$postdata._id",
                  postID:"$postdata.postID",
                  createdAt:"$postdata.createdAt",
                  updatedAt:"$postdata.updatedAt",
                  email:"$postdata.email",
                  postType:"$postdata.postType",
                  description:"$postdata.description",
                  active:"$postdata.active",
                  metadata:"$postdata.metadata",
                  location:"$postdata.location",
                  isOwned:"$postdata.isOwned",
                  visibility:"$postdata.visibility",
                  isViewed:"$postdata.isViewed",
                  allowComments:"$postdata.allowComments",
                  saleAmount:"$postdata.saleAmount",
                  isLiked:"$postdata.isLiked",
                  certified:"$postdata.certified",
                  username:"$postdata.username",
                  profilepictid:"$postdata.profilepictid",
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
                  avatar:"$postdata.avatar",
                  mediaThumbEndpoint:"$postdata.mediaThumbEndpoint",
                  mediaEndpoint:"$postdata.mediaEndpoint",
                  mediaType:"$postdata.mediaType",
                  isApsara:"$postdata.isApsara",
                  apsaraId:"$postdata.apsaraId",
              }
          }
        ]
      }

      pipeline.push(
        {
          "$facet":facet
        }
      );

      console.log(JSON.stringify(pipeline));

      var query = await this.loaddata.aggregate(pipeline);

      return query;
    }
}
