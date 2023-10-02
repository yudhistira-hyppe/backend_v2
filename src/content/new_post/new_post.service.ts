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
}
