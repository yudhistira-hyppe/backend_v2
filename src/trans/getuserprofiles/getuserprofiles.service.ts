import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGetuserprofilesDto } from './dto/create-getuserprofiles.dto';
import { Getuserprofiles, GetuserprofilesDocument } from './schemas/getuserprofiles.schema';
import { CountriesService } from '../../infra/countries/countries.service';
import { CitiesService } from '../../infra/cities/cities.service';
import { AreasService } from '../../infra/areas/areas.service';
import { LanguagesService } from '../../infra/languages/languages.service';
import { InsightsService } from '../../content/insights/insights.service';
import { MediaprofilepictsService } from '../../content/mediaprofilepicts/mediaprofilepicts.service';
import { InterestsRepoService } from '../../infra/interests_repo/interests_repo.service';
import { ObjectId } from 'mongodb';
@Injectable()
export class GetuserprofilesService {
  constructor(
    @InjectModel(Getuserprofiles.name, 'SERVER_FULL')
    private readonly getuserprofilesModel: Model<GetuserprofilesDocument>,
    private readonly countriesService: CountriesService,
    private readonly citiesService: CitiesService,
    private readonly areasService: AreasService,
    private readonly languagesService: LanguagesService,
    private readonly insightsService: InsightsService,
    private readonly mediaprofilepictsService: MediaprofilepictsService,
    private readonly interestsRepoService: InterestsRepoService,

  ) { }

  async create(
    CreateGetuserprofilesDto: CreateGetuserprofilesDto,
  ): Promise<Getuserprofiles> {
    const createGetuserprofilesDto = await this.getuserprofilesModel.create(
      CreateGetuserprofilesDto,
    );
    return createGetuserprofilesDto;
  }

  async findAll(documentsToSkip = 0, limitOfDocuments?: number) {
    const query = this.getuserprofilesModel
      .find()
      .sort({ _id: 1 })
      .skip(documentsToSkip);
    if (limitOfDocuments) {
      query.limit(limitOfDocuments);
    }
    return query;
  }



  async findUserDetailbyEmail(email: string) {


    const query = await this.getuserprofilesModel.aggregate([

      {
        $addFields: {
          userAuth_id: '$userAuth.$id',
          countries_id: '$countries.$id',
          cities_id: '$cities.$id',
          areas_id: '$states.$id',
          languages_id: '$languages.$id',
          insight_id: '$insight.$id',
          profilePict_id: '$profilePict.$id',
          interest_id: '$userInterests.$id',
          concat: '/profilepict',
          email: '$email',
          age: {
            $cond: {
              if: {
                $and: ['$dob', {
                  $ne: ["$dob", ""]
                }]
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
        },
      },

      {
        $lookup: {
          from: 'interests_repo',
          localField: 'interest_id',
          foreignField: '_id',
          as: 'interes_data',
        },
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilePict_id',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'countries',
          localField: 'countries_id',
          foreignField: '_id',
          as: 'countries_data',
        },
      },
      {
        $lookup: {
          from: 'languages',
          localField: 'languages_id',
          foreignField: '_id',
          as: 'languages_data',
        },
      },
      {
        $lookup: {
          from: 'cities',
          localField: 'cities_id',
          foreignField: '_id',
          as: 'cities_data',
        },
      },
      {
        $lookup: {
          from: 'areas',
          localField: 'areas_id',
          foreignField: '_id',
          as: 'areas_data',
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
        "$unwind": {
          "path": "$userAuth_data",
          "preserveNullAndEmptyArrays": false
        }
      },
      {
        "$match": {
          "userAuth_data.email": email
        }
      },
      {
        $project: {
          activity: '$activity',
          createdAt: '$createdAt',
          auth: '$userAuth_data',
          citi: { $arrayElemAt: ['$cities_data', 0] },
          countri: { $arrayElemAt: ['$countries_data', 0] },
          language: { $arrayElemAt: ['$languages_data', 0] },
          areas: { $arrayElemAt: ['$areas_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          fullName: '$fullName',
          username: '$auth.userName',
          area: '$areas.stateName',
          age: { $ifNull: ["$age", 0] },
          email: '$email',
          gender: '$gender',
          bio: '$bio',
          idProofNumber: '$idProofNumber',
          countries: '$countri.country',
          cities: '$citi.cityName',
          mobileNumber: '$mobileNumber',
          roles: '$auth.roles',
          dob: '$dob',
          event: '$event',
          isPostPrivate: '$isPostPrivate',
          isCelebrity: '$isCelebrity',
          isPrivate: '$isPrivate',
          isComplete: '$isComplete',
          status: '$status',
          langIso: '$language.langIso',
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
          interest: '$interes_data',
        }
      },
      {
        $addFields: {

          concat: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
        },
      },
      {
        $project: {

          createdAt: '$createdAt',
          interest: '$interest',
          username: '$auth.username',
          fullName: '$fullName',
          countries: '$countri.country',
          area: '$areas.stateName',
          cities: '$citi.cityName',
          dob: '$dob',
          age: { $ifNull: ["$age", 0] },
          email: '$email',
          gender: '$gender',
          bio: '$bio',
          idProofNumber: '$idProofNumber',
          mobileNumber: '$mobileNumber',
          roles: '$auth.roles',

          event: '$event',
          isPostPrivate: '$isPostPrivate',
          isCelebrity: '$isCelebrity',
          isPrivate: '$isPrivate',
          isComplete: '$isComplete',
          status: '$status',
          langIso: '$language.langIso',
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
            mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

          },
        },
      },
      { $sort: { createdAt: -1 }, },
    ]);
    return query;

  }

  async findUser(username: string, skip: number, limit: number) {


    const query = await this.getuserprofilesModel.aggregate([
      {
        $addFields: {
          userAuth_id: '$userAuth.$id',
          profilePict_id: '$profilePict.$id',
          concat: '/profilepict',
          email: '$email',

        },
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilePict_id',
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
          "userAuth_data.username": {
            $regex: username, $options: 'i'
          }
        }
      },
      {
        $project: {

          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          idUserAuth: "$userAuth_data._id",
          fullName: '$fullName',
          username: '$userAuth_data.username',
          email: '$email',
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },
          urluserBadge:
          {
              "$ifNull":
              [
                {
                  "$filter":
                  {
                      input: "$userBadge",
                      as: "listbadge",
                      cond:
                      {
                        "$and":
                        [
                            {
                                "$eq":
                                    [
                                        "$$listbadge.isActive",
                                        true
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
                }
              ]
          },
        },
      },
      {
        $addFields: {

          concat: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: ".jpeg", replacement: "" } },
        },
      },
      {
        $project: {
          idUserAuth: '$idUserAuth',
          username: '$username',
          fullName: '$fullName',
          email: '$email',
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: { $concat: ["$concat", "/", "$profilpict.mediaID"] },

          },
          urluserBadge:
          {
            "$ifNull":
            [
              {
                "$arrayElemAt":
                [
                  "$urluserBadge",0
                ]
              },
              null
            ]
          }
        },
      },

      { $sort: { fullName: 1 }, },
      { $skip: skip },
      { $limit: limit },
    ]);
    return query;
  }
  async findUserNew(username: string, skip: number, limit: number) {


    const query = await this.getuserprofilesModel.aggregate([
      {
        $addFields: {
          userAuth_id: '$userAuth.$id',
          profilePict_id: '$profilePict.$id',
          email: '$email',

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
          "userAuth_data.username": {
            $regex: username, $options: 'i'
          }
        }
      },

      {
        $project: {
          // idUserAuth: '$idUserAuth',
          // username: '$userAuth_data.username',
          _id: '$profilePict_id',

        },
      },

      { $sort: { fullName: 1 }, },
      { $skip: skip },
      { $limit: limit },
    ]);
    return query;
  }
  async getUserHyppe(searchemail: string, search: string, skip: number, limit: number, groupId: string) {

    var groupId_match = {};
    if (groupId != "") {
      groupId_match = { 'group_userbasics._id': new ObjectId(groupId) }
    }
    const query = await this.getuserprofilesModel.aggregate([
      {
        $addFields: {
          userAuth_id: '$userAuth.$id',
          profilePict_id: '$profilePict.$id',
          concat: '/profilepict',
          email: '$email',
          isIdVerified: '$isIdVerified',
        },
      },
      {
        "$match": {
          $and: [
            { "email": /@hyppe.id/i }
          ]
        }
      },
      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilePict_id',
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
        $lookup:
        {
          from: "group",
          let: { userName: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$$userName", "$userbasics"],
                },
              },
            },
          ],
          as: 'group_userbasics',
        }
      },
      {
        "$unwind": {
          "path": "$userAuth_data",
          "preserveNullAndEmptyArrays": false
        }
      },
      {
        "$match": {
          $and: [
            groupId_match,
            {
              "userAuth_data.username": {
                $regex: search, $options: 'i'
              }
            },
            { "userAuth_data.email": { $regex: searchemail, $options: 'i' } }
          ]
        }
      },
      {
        $project: {
          group_userbasics: { $arrayElemAt: ['$group_userbasics', 0] },
          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          idUserAuth: "$userAuth_data._id",
          fullName: '$fullName',
          username: '$userAuth_data.username',
          email: '$email',
          isIdVerified: '$isIdVerified',
          roles: '$userAuth_data.roles',
        },
      },
      {
        $project: {
          group_userbasics: '$group_userbasics',
          profilpict: '$profilpict',
          idUserAuth: "$userAuth_data._id",
          fullName: '$fullName',
          username: '$userAuth_data.username',
          email: '$email',
          isIdVerified: {
            $in: [
              "ROLE_ADMIN",
              "$roles"
            ],
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri'
          },
        },
      },
      {
        $addFields: {
          concat: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
        },
      },
      {
        $project: {
          idUserAuth: '$idUserAuth',
          username: '$username',
          fullName: '$fullName',
          group: '$group_userbasics.nameGroup',
          groupId: '$group_userbasics._id',
          email: '$email',
          status: '$isIdVerified',
          avatar: {
            $cond: {
              if: {
                $eq: ["$pict", null]
              },
              then: null,
              else: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },
              }
            }
          },
          // avatar: {
          //   mediaBasePath: '$profilpict.mediaBasePath',
          //   mediaUri: '$profilpict.mediaUri',
          //   mediaType: '$profilpict.mediaType',
          //   mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },
          //   asas: {
          //     $cond: {
          //       if: {
          //         $eq: ["$concat", null]
          //       },
          //       then: null,
          //       else: '$gender'
          //     }
          //   },
          // },
        },
      },

      // {
      //   "$match": groupId_match
      // },
      // {
      //   $facet: {
      //     paginatedResults: [{ $skip: skip }, { $limit: skip }],
      //     totalCount: [
      //       {
      //         $count: 'count'
      //       }
      //     ]
      //   }
      // },
      { $sort: { fullName: 1 }, }
    ]).skip(skip).limit(limit);
    return query;
  }

  async getUserHyppe2(search: string, startdate:string, enddate:string, jabatan:any[], divisi:any[], status:boolean, skip: number, limit: number, ascending:boolean) 
  {
    var pipeline = [];
    pipeline.push({
        "$addFields":
        {
            userAuth_id: "$userAuth.$id",
            profilePict_id: "$profilePict.$id",
            concat:"/profilepict",
            email:"$email",
            isIdVerified:"$isIdVerified"
        }
    },
    {
        "$match":
        {
            "email":/@hyppe.id/i
        },
    },
    {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilePict_id',
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
        $lookup:
        {
          from: "group",
          let: { userName: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$$userName", "$userbasics"],
                },
              },
            },
          ],
          as: 'group_userbasics',
        }
    },
    {
        "$unwind": {
          "path": "$userAuth_data",
          "preserveNullAndEmptyArrays": false
        }
    },
    {
        $project: {
          group_userbasics: { $arrayElemAt: ['$group_userbasics', 0] },
          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          idUserAuth: "$userAuth_data._id",
          fullName: '$fullName',
          username: '$userAuth_data.username',
          email: '$email',
          isIdVerified: '$isIdVerified',
          roles: '$userAuth_data.roles',
          createdAt:"$createdAt",
        },
    },
    {
        $lookup: {
          from: 'division',
          localField: 'group_userbasics.divisionId',
          foreignField: '_id',
          as: 'division_data',
        },
    },
    {
        $project: {
          group_userbasics: '$group_userbasics',
          namadivisi:
          {
            "$arrayElemAt":
            [
                "$division_data.nameDivision", 0
            ]
          },
          createdAt:"$createdAt",
          profilpict: '$profilpict',
          idUserAuth: "$userAuth_data._id",
          fullName: '$fullName',
          username: '$userAuth_data.username',
          email: '$email',
          isIdVerified: {
            $in: [
              "ROLE_ADMIN",
              "$roles"
            ],
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri'
          },
        },
    },
    {
        $addFields: {
          concat: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
        },
    },
    {
        $project: {
          idUserAuth: '$idUserAuth',
          username: '$username',
          fullName: '$fullName',
          createdAt:"$createdAt",
          namadivisi:"$namadivisi",
          group: '$group_userbasics.nameGroup',
          groupId: '$group_userbasics._id',
          email: '$email',
          status: '$isIdVerified',
          avatar: {
            $cond: {
              if: {
                $eq: ["$pict", null]
              },
              then: null,
              else: {
                mediaBasePath: '$profilpict.mediaBasePath',
                mediaUri: '$profilpict.mediaUri',
                mediaType: '$profilpict.mediaType',
                mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },
              }
            }
          },
        }
    });

    var firstmatch = [];
    if(search != null)
    {
      firstmatch.push({
        "$or":
        [
            {
                "username": 
                {
                    $regex: search, 
                    $options: 'i'
                }
            },
            {
                "email": 
                { 
                    $regex: search, 
                    $options: 'i' 
                } 
            },
        ]
      });
    }

    if(startdate != null && enddate != null)
    {
      var convertstart = startdate.split(" ")[0];
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));
      var convertend = currentdate.toISOString().split("T")[0];

      firstmatch.push({
          "$expr":
          {
              "$and":
              [
                  {
                      "$gte":
                      [
                          "$createdAt", convertstart
                      ],
                  },
                  {
                      "$lt":
                      [
                          "$createdAt", convertend
                      ]
                  }
              ]
          }
      });
    }

    if(jabatan != null)
    {
      firstmatch.push({
        "group":
        {
          "$in":jabatan
        }
      });
    }

    if(divisi != null)
    {
      firstmatch.push({
        "namadivisi":
        {
          "$in":divisi
        }
      });
    }

    if(status != null)
    {
      firstmatch.push({
        "status":status
      });
    }

    if(firstmatch.length != 0)
    {
      pipeline.push({
        "$match":
        {
          "$and":firstmatch
        }
      });
    }

    if(ascending != null)
    {
      var konvertsort = null;
      if(ascending == true)
      {
        konvertsort = 1;
      }
      else
      {
        konvertsort = -1;
      }
      pipeline.push({
        "$sort":
        {
          "createdAt":konvertsort
        }
      });
    }

    if(skip != null && skip > 0)
    {
      pipeline.push({
        "$skip" : (skip * limit)
      });
    }

    if(limit != null && limit > 0)
    {
      pipeline.push({
        "$limit":limit
      });
    }

    var data = await this.getuserprofilesModel.aggregate(pipeline);

    return data;
  }

  async countUserHyppe(searchemail: string, search: string) {

    const query = await this.getuserprofilesModel.aggregate([
      {
        $addFields: {
          userAuth_id: '$userAuth.$id',
          profilePict_id: '$profilePict.$id',
          concat: '/profilepict',
          email: '$email',
          status: '$isIdVerified',
        },
      },
      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilePict_id',
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
          from: 'userauths',
          localField: 'userAuth_id',
          foreignField: '_id',
          as: 'userAuth_data',
        },
      },
      {
        $lookup:
        {

          from: "group",
          let: { userName: { $toString: '$_id' } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$$userName", {
                    "$cond": {
                      "if": {
                        "$ne": [{ "$type": "$userbasics" }, "array"]
                      },
                      "then": [],
                      "else": "$userbasics"
                    }
                  }],
                },
              },
            },
          ],
          as: 'group_userbasics',
        }
      },
      {
        "$unwind": {
          "path": "$userAuth_data",
          "preserveNullAndEmptyArrays": false
        }
      },
      {
        "$match": {
          $and: [{ "userAuth_data.username": { $regex: search, $options: 'i' } }, { "userAuth_data.email": { $regex: searchemail, $options: 'i' } }, { "userAuth_data.email": /@hyppe.id/i }]
        }
      },
      {
        $project: {
          group_userbasics: { $arrayElemAt: ['$group_userbasics', 0] },
          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          idUserAuth: "$userAuth_data._id",
          fullName: '$fullName',
          username: '$userAuth_data.username',
          email: '$email',
          status: '$status',
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },
        },
      },
      {
        $addFields: {
          concat: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
        },
      },
      {
        $project: {
          idUserAuth: '$idUserAuth',
          username: '$username',
          fullName: '$fullName',
          group: '$group_userbasics.nameGroup',
          email: '$email',
          status: '$status',
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

          },
        },
      },
      { $sort: { fullName: 1 }, },
    ]);
    return query;
  }

  async findUserDetail(username: string, skip: number, limit: number) {


    const query = await this.getuserprofilesModel.aggregate([

      {
        $addFields: {
          userAuth_id: '$userAuth.$id',
          countries_id: '$countries.$id',
          cities_id: '$cities.$id',
          areas_id: '$states.$id',
          languages_id: '$languages.$id',
          insight_id: '$insight.$id',
          profilePict_id: '$profilePict.$id',
          interest_id: '$userInterests.$id',
          concat: '/profilepict',
          email: '$email',
          age: {
            $round: [{
              $divide: [{
                $subtract: [new Date(), {
                  $toDate: '$dob'
                }]
              }, (365 * 24 * 60 * 60 * 1000)]
            }]
          }
        },
      },

      {
        $lookup: {
          from: 'interests_repo',
          localField: 'interest_id',
          foreignField: '_id',
          as: 'interes_data',
        },
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilePict_id',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'countries',
          localField: 'countries_id',
          foreignField: '_id',
          as: 'countries_data',
        },
      },
      {
        $lookup: {
          from: 'languages',
          localField: 'languages_id',
          foreignField: '_id',
          as: 'languages_data',
        },
      },
      {
        $lookup: {
          from: 'cities',
          localField: 'cities_id',
          foreignField: '_id',
          as: 'cities_data',
        },
      },
      {
        $lookup: {
          from: 'areas',
          localField: 'areas_id',
          foreignField: '_id',
          as: 'areas_data',
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
        "$unwind": {
          "path": "$userAuth_data",
          "preserveNullAndEmptyArrays": false
        }
      },

      {
        "$match": {
          "userAuth_data.username": {
            $regex: username, $options: 'i'
          }
        }
      },
      {
        $project: {
          activity: '$activity',
          createdAt: '$createdAt',
          auth: '$userAuth_data',
          citi: { $arrayElemAt: ['$cities_data', 0] },
          countri: { $arrayElemAt: ['$countries_data', 0] },
          language: { $arrayElemAt: ['$languages_data', 0] },
          areas: { $arrayElemAt: ['$areas_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          fullName: '$fullName',
          username: '$auth.userName',
          area: '$areas.stateName',
          age: { $ifNull: ["$age", 0] },
          email: '$email',
          gender: '$gender',
          bio: '$bio',
          idProofNumber: '$idProofNumber',
          countries: '$countri.country',
          cities: '$citi.cityName',
          mobileNumber: '$mobileNumber',
          roles: '$auth.roles',
          dob: '$dob',
          event: '$event',
          isComplete: '$isComplete',
          status: '$status',
          langIso: '$language.langIso',
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
          interest: '$interes_data',
        }
      },
      {
        $addFields: {

          concat: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
        },
      },
      {
        $project: {

          createdAt: '$createdAt',
          interest: '$interest',
          username: '$auth.username',
          fullName: '$fullName',
          countries: '$countri.country',
          area: '$areas.stateName',
          cities: '$citi.cityName',
          dob: '$dob',
          age: { $ifNull: ["$age", 0] },
          email: '$email',
          gender: '$gender',
          bio: '$bio',
          idProofNumber: '$idProofNumber',
          mobileNumber: '$mobileNumber',
          roles: '$auth.roles',

          event: '$event',
          isComplete: '$isComplete',
          status: '$status',
          langIso: '$language.langIso',
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
            mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

          },
        },
      },

      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },
    ]);
    return query;

  }



  async filteruser(username: string, regender: any[], jenis: any[], lokasi: [], startage: number, endage: number, startdate: string, enddate: string, startlogin: string, endlogin: string, page: number, limit: number, descending: any) {

    var arrlokasi = [];
    var idlokasi = null;
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
    var lenglokasi = null;
    var order = null;

    if (descending === true) {
      order = -1;
    } else {
      order = 1;
    }
    try {
      lenglokasi = lokasi.length;
    } catch (e) {
      lenglokasi = 0;
    }
    if (lenglokasi > 0) {

      for (let i = 0; i < lenglokasi; i++) {
        let idkat = lokasi[i];
        idlokasi = mongoose.Types.ObjectId(idkat);
        arrlokasi.push(idlokasi);
      }
    }

    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }
    var dt = dateend.substring(0, 10);
    try {
      var currentdatelogin = new Date(new Date(endlogin).setDate(new Date(endlogin).getDate() + 1));

      var dateendlogin = currentdatelogin.toISOString();
    } catch (e) {
      dateendlogin = "";
    }
    var dtlogin = dateendlogin.substring(0, 10);
    var pipeline = [];


    pipeline.push(
      {
        $addFields: {
          userAuth_id: '$userAuth.$id',
          countries_id: '$countries.$id',
          cities_id: '$cities.$id',
          areas_id: '$states.$id',
          profilePict_id: '$profilePict.$id',
          age: {
            $cond: {
              if: {
                $and: ['$dob', {
                  $ne: ["$dob", ""]
                }]
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
        },

      },
      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilePict_id',
          foreignField: '_id',
          as: 'profilePict_data',

        },

      },
      {
        $lookup: {
          from: 'countries',
          localField: 'countries_id',
          foreignField: '_id',
          as: 'countries_data',

        },

      },
      {
        $lookup: {
          from: 'cities',
          localField: 'cities_id',
          foreignField: '_id',
          as: 'cities_data',

        },

      },
      {
        $lookup: {
          from: 'areas',
          localField: 'areas_id',
          foreignField: '_id',
          as: 'areas_data',

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
          from: "activityevents",
          as: "activity_data",
          let: {
            local_id: '$email'
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$payload.email', {
                        $ifNull: ['$$local_id', []]
                      }]
                    },


                  ]
                }
              }
            },
            {
              $project: {
                createdAt: 1,
                event: 1

              }
            },
            {
              $match: { event: "AWAKE" }
            },
            {
              $sort: { createdAt: order }
            },

            { $limit: 1 }
          ],

        }
      },
      {
        $project: {

          createdAt: 1,
          auth: {
            $arrayElemAt: ['$userAuth_data', 0]
          },
          citi: {
            $arrayElemAt: ['$cities_data', 0]
          },
          countri: {
            $arrayElemAt: ['$countries_data', 0]
          },
          areas: {
            $arrayElemAt: ['$areas_data', 0]
          },
          profilpict: {
            $arrayElemAt: ['$profilePict_data', 0]
          },
          activity: {
            $arrayElemAt: ['$activity_data', 0]
          },
          fullName: 1,
          age: 1,
          email: 1,
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
          roles: '$auth.roles',
          isIdVerified: 1,
          dob: 1,
          event: 1,
          isComplete: 1,
          status: '$status',

        }
      },
      {
        $addFields: {

          concat: '/profilepict',
          pict: {
            $replaceOne: {
              input: "$profilpict.mediaUri",
              find: "_0001.jpeg",
              replacement: ""
            }
          },

        },

      },
      {
        $project: {
          jenis: {

            $cond: {
              if: {

                $eq: ["$isIdVerified", true]
              },
              then: "PREMIUM",
              else: "BASIC"
            },

          },
          activity: 1,
          age: 1,
          lastlogin: '$activity.createdAt',
          createdAt: '$createdAt',
          username: '$auth.username',
          fullName: '$fullName',
          countries: '$countri.country',
          area: '$areas.stateName',
          areaId: '$areas._id',
          cities: '$citi.cityName',
          dob: 1,
          email: 1,
          gender: 1,
          roles: '$auth.roles',
          event: 1,
          isComplete: 1,
          status: 1,
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: {
              $concat: ["$concat", "/", "$pict"]
            },

          },

        },

      },
      {
        $sort: {
          lastlogin: order
        }
      },
    );

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

    if (regender && regender !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              gender: {
                $in: regender
              }
            },

          ]
        }
      },);
    }

    if (startage && startage !== undefined) {
      pipeline.push({ $match: { age: { $gt: startage } } });
    }
    if (endage && endage !== undefined) {
      pipeline.push({ $match: { age: { $lt: endage } } });
    }

    if (startdate && startdate !== undefined) {
      pipeline.push({ $match: { createdAt: { $gte: startdate } } });
    }
    if (enddate && enddate !== undefined) {
      pipeline.push({ $match: { createdAt: { $lte: dt } } });
    }

    if (jenis && jenis !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              jenis: {
                $in: jenis
              }
            },

          ]
        }
      },);
    }

    if (lokasi && lokasi !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              areaId: {
                $in: arrlokasi
              }
            },

          ]
        }
      },);
    }

    if (startlogin && startlogin !== undefined) {
      pipeline.push({ $match: { lastlogin: { $gte: startlogin } } });
    }
    if (endlogin && endlogin !== undefined) {
      pipeline.push({ $match: { lastlogin: { $lte: dtlogin } } });
    }
    if (page > 0) {
      pipeline.push({ $skip: (page * limit) });
    }
    if (limit > 0) {
      pipeline.push({ $limit: limit });
    }

    let query = await this.getuserprofilesModel.aggregate(pipeline);

    return query;

  }


  async totalcount() {
    const query = await this.getuserprofilesModel.aggregate([
      {
        $group: {
          _id: null,
          countrow: {
            $sum: 1
          }
        }
      }, {
        $project: {
          _id: 0
        }
      }]);
    return query;
  }

  async countdbuser(username: string, regender: any[], jenis: any[], lokasi: [], startage: number, endage: number, startdate: string, enddate: string, startlogin: string, endlogin: string) {

    var arrlokasi = [];
    var idlokasi = null;
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
    var lenglokasi = null;

    try {
      lenglokasi = lokasi.length;
    } catch (e) {
      lenglokasi = 0;
    }
    if (lenglokasi > 0) {

      for (let i = 0; i < lenglokasi; i++) {
        let idkat = lokasi[i];
        idlokasi = mongoose.Types.ObjectId(idkat);
        arrlokasi.push(idlokasi);
      }
    }

    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }
    var dt = dateend.substring(0, 10);
    try {
      var currentdatelogin = new Date(new Date(endlogin).setDate(new Date(endlogin).getDate() + 1));

      var dateendlogin = currentdatelogin.toISOString();
    } catch (e) {
      dateendlogin = "";
    }
    var dtlogin = dateendlogin.substring(0, 10);
    var pipeline = [];
    pipeline.push(

      {
        $addFields: {
          userAuth_id: '$userAuth.$id',
          countries_id: '$countries.$id',
          cities_id: '$cities.$id',
          areas_id: '$states.$id',
          profilePict_id: '$profilePict.$id',
          age: {
            $cond: {
              if: {
                $and: ['$dob', {
                  $ne: ["$dob", ""]
                }]
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
        },

      },

      {
        $lookup: {
          from: 'areas',
          localField: 'areas_id',
          foreignField: '_id',
          as: 'areas_data',

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
          from: "activityevents",
          as: "activity_data",
          let: {
            local_id: '$email'
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$payload.email', {
                        $ifNull: ['$$local_id', []]
                      }]
                    },


                  ]
                }
              }
            },
            {
              $project: {
                createdAt: 1,
                event: 1

              }
            },
            {
              $match: { event: "AWAKE" }
            },
            {
              $sort: { createdAt: -1 }
            },
            { $limit: 1 }

          ],

        }
      },
      {
        $project: {

          createdAt: 1,
          auth: {
            $arrayElemAt: ['$userAuth_data', 0]
          },

          areas: {
            $arrayElemAt: ['$areas_data', 0]
          },

          activity: {
            $arrayElemAt: ['$activity_data', 0]
          },
          fullName: 1,
          age: 1,
          email: 1,
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

          isIdVerified: 1,
          dob: 1,
          event: 1,
          isComplete: 1,
          status: '$status',

        }
      },
      {
        $addFields: {

          concat: '/profilepict',
          pict: {
            $replaceOne: {
              input: "$profilpict.mediaUri",
              find: "_0001.jpeg",
              replacement: ""
            }
          },

        },

      },
      {
        $project: {
          jenis: {

            $cond: {
              if: {

                $eq: ["$isIdVerified", true]
              },
              then: "PREMIUM",
              else: "BASIC"
            },

          },
          activity: 1,
          lastlogin: '$activity.createdAt',
          createdAt: '$createdAt',
          username: '$auth.username',
          area: '$areas.stateName',
          areaId: '$areas._id',
          dob: 1,
          email: 1,
          gender: 1,
          roles: '$auth.roles',
          event: 1,
          isComplete: 1,
          age: 1,
          status: 1,


        },

      },
    );

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

    if (regender && regender !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              gender: {
                $in: regender
              }
            },

          ]
        }
      },);
    }

    if (startage && startage !== undefined) {
      pipeline.push({ $match: { age: { $gt: startage } } });
    }
    if (endage && endage !== undefined) {
      pipeline.push({ $match: { age: { $lt: endage } } });
    }

    if (startdate && startdate !== undefined) {
      pipeline.push({ $match: { createdAt: { $gte: startdate } } });
    }
    if (enddate && enddate !== undefined) {
      pipeline.push({ $match: { createdAt: { $lte: dt } } });
    }

    if (jenis && jenis !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              jenis: {
                $in: jenis
              }
            },

          ]
        }
      },);
    }

    if (lokasi && lokasi !== undefined) {
      pipeline.push({
        $match: {
          $or: [
            {
              areaId: {
                $in: arrlokasi
              }
            },

          ]
        }
      },);
    }

    if (startlogin && startlogin !== undefined) {
      pipeline.push({ $match: { lastlogin: { $gte: startlogin } } });
    }
    if (endlogin && endlogin !== undefined) {
      pipeline.push({ $match: { lastlogin: { $lte: dtlogin } } });
    }

    pipeline.push({
      $group: {
        _id: null,
        totalpost: {
          $sum: 1
        }
      }
    },);


    let query = await this.getuserprofilesModel.aggregate(pipeline);

    return query;

  }

  async findUserDetailCount(username: string) {

    const query = await this.getuserprofilesModel.aggregate([

      {
        $addFields: {
          userAuth_id: '$userAuth.$id',
          countries_id: '$countries.$id',
          cities_id: '$cities.$id',
          areas_id: '$states.$id',
          languages_id: '$languages.$id',
          insight_id: '$insight.$id',
          profilePict_id: '$profilePict.$id',
          interest_id: '$userInterests.$id',
          concat: '/profilepict',
          email: '$email',
          age: {
            $round: [{
              $divide: [{
                $subtract: [new Date(), {
                  $toDate: '$dob'
                }]
              }, (365 * 24 * 60 * 60 * 1000)]
            }]
          }
        },
      },

      {
        $lookup: {
          from: 'interests_repo',
          localField: 'interest_id',
          foreignField: '_id',
          as: 'interes_data',
        },
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilePict_id',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $lookup: {
          from: 'countries',
          localField: 'countries_id',
          foreignField: '_id',
          as: 'countries_data',
        },
      },
      {
        $lookup: {
          from: 'languages',
          localField: 'languages_id',
          foreignField: '_id',
          as: 'languages_data',
        },
      },
      {
        $lookup: {
          from: 'cities',
          localField: 'cities_id',
          foreignField: '_id',
          as: 'cities_data',
        },
      },
      {
        $lookup: {
          from: 'areas',
          localField: 'areas_id',
          foreignField: '_id',
          as: 'areas_data',
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
        "$unwind": {
          "path": "$userAuth_data",
          "preserveNullAndEmptyArrays": false
        }
      },

      {
        "$match": {
          "userAuth_data.username": {
            $regex: username, $options: 'i'
          }
        }
      },
      {
        $project: {
          activity: '$activity',
          createdAt: '$createdAt',
          auth: '$userAuth_data',
          citi: { $arrayElemAt: ['$cities_data', 0] },
          countri: { $arrayElemAt: ['$countries_data', 0] },
          language: { $arrayElemAt: ['$languages_data', 0] },
          areas: { $arrayElemAt: ['$areas_data', 0] },
          insights: { $arrayElemAt: ['$insight_data', 0] },
          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          fullName: '$fullName',
          username: '$auth.userName',
          area: '$areas.stateName',
          age: { $ifNull: ["$age", 0] },
          email: '$email',
          gender: '$gender',
          bio: '$bio',
          idProofNumber: '$idProofNumber',
          countries: '$countri.country',
          cities: '$citi.cityName',
          mobileNumber: '$mobileNumber',
          roles: '$auth.roles',
          dob: '$dob',
          event: '$event',
          isComplete: '$isComplete',
          status: '$status',
          langIso: '$language.langIso',
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
          interest: '$interes_data',
        }
      },
      {
        $addFields: {

          concat: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },
        },
      },
      {
        $project: {

          createdAt: '$createdAt',
          interest: '$interest',
          username: '$auth.username',
          fullName: '$fullName',
          countries: '$countri.country',
          area: '$areas.stateName',
          cities: '$citi.cityName',
          dob: '$dob',
          age: { $ifNull: ["$age", 0] },
          email: '$email',
          gender: '$gender',
          bio: '$bio',
          idProofNumber: '$idProofNumber',
          mobileNumber: '$mobileNumber',
          roles: '$auth.roles',

          event: '$event',
          isComplete: '$isComplete',
          status: '$status',
          langIso: '$language.langIso',
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
            mediaEndpoint: { $concat: ["$concat", "/", "$pict"] },

          },
        },
      },

      { $sort: { createdAt: -1 }, },
    ]);
    return query;

  }


  async delete(id: string) {
    const deletedCat = await this.getuserprofilesModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }
}
