import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateUserbasicDto } from './dto/create-userbasic.dto';
import { Userbasic, UserbasicDocument } from './schemas/userbasic.schema';
import { LanguagesService } from '../../infra/languages/languages.service';
import { InterestsRepoService } from '../../infra/interests_repo/interests_repo.service';
import { MediaproofpictsService } from '../../content/mediaproofpicts/mediaproofpicts.service';
import { MediaprofilepictsService } from '../../content/mediaprofilepicts/mediaprofilepicts.service';

@Injectable()
export class UserbasicsService {
  constructor(
    @InjectModel(Userbasic.name, 'SERVER_FULL')
    private readonly userbasicModel: Model<UserbasicDocument>,
    private readonly languagesService: LanguagesService,
    private readonly interestsRepoService: InterestsRepoService,
    private readonly mediaprofilepictsService: MediaprofilepictsService,
    private readonly mediaproofpictsService: MediaproofpictsService,

  ) { }

  async create(CreateUserbasicDto: CreateUserbasicDto): Promise<Userbasic> {
    const createUserbasicDto = await this.userbasicModel.create(
      CreateUserbasicDto,
    );
    return createUserbasicDto;
  }

  async createV2(dto: Userbasic): Promise<Userbasic> {
    const ndto = await this.userbasicModel.create(dto);
    return ndto;
  }

  async updatebyEmail(email: string, data: Object) {
    console.log(data);
    this.userbasicModel.updateOne(
      {
        email: email,
      },
      data,
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    ).clone().exec();
  }

  async updateLanguage(email: string, language: string) {
    console.log(language);
    this.userbasicModel.updateOne(
      {
        email: email,
      },
      {
        languages: {
          $ref: 'languages',
          $id: new Object(language),
          $db: 'hyppe_infra_db',
        }
      },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    ).clone().exec();
  }

  async updatebyId(email: string,
    createUserbasicDto: CreateUserbasicDto,) {
    console.log(createUserbasicDto);
    this.userbasicModel.findByIdAndUpdate(
      {
        email: email,
      },
      createUserbasicDto,
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateData(email: string, createUserbasicDto: CreateUserbasicDto): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ email: email },
      createUserbasicDto,
      function (err, docs) {
        if (err) {
          console.log("Updated Error : ", err)
        } else {
          console.log("Updated Docs : ", docs);
        }
      }).clone().exec();
    return data;
  }

  async updateStatusemail(email: string, timeEmailSend: string): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ "email": email },
      {
        $set: {
          "timeEmailSend": timeEmailSend
        }
      },
    );
    return data;
  }

  async updateStatus(email: string, status: Boolean): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ "email": email },
      {
        $set: {
          "isIdVerified": status
        }
      },
    );
    return data;
  }

  async updateStatusKyc(email: string, status: Boolean, statusKyc: string): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ "email": email },
      {
        $set: {
          "isIdVerified": status,
          "statusKyc": statusKyc
        }
      },
    );
    return data;
  }
  async updateStatusKycName(nama: string, gender: string, email: string, status: Boolean, statusKyc: string, dob: string): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ "email": email },
      {
        $set: {
          "isIdVerified": status,
          "statusKyc": statusKyc,
          "fullName": nama,
          "gender": gender,
          "dob": dob
        }
      },
    );
    return data;
  }
  async updatekyc(email: string, listAddKyc: any[]): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ "email": email },
      { $set: { "listAddKyc": listAddKyc } });
    return data;
  }
  async update(
    id: string,
    createUserbasicDto: CreateUserbasicDto,
  ): Promise<Userbasic> {
    let data = await this.userbasicModel.findByIdAndUpdate(
      id,
      createUserbasicDto,
      { new: true },
    );

    if (!data) {
      throw new Error('Todo is not found!');
    }
    return data;
  }

  async findAll(): Promise<Userbasic[]> {
    return this.userbasicModel.find().exec();
  }
  async findid(id: string): Promise<Userbasic> {
    return this.userbasicModel.findOne({ _id: id }).exec();
  }
  async findbyid(id: string): Promise<Userbasic> {
    return this.userbasicModel.findOne({ _id: new Types.ObjectId(id) }).exec();
  }
  async findOne(email: string): Promise<Userbasic> {
    return this.userbasicModel.findOne({ email: email }).exec();
  }
  async findOneUsername(username: string): Promise<Userbasic> {
    return this.userbasicModel.findOne({ username: username }).exec();
  }

  async findIn(username: string[]): Promise<Userbasic[]> {
    return this.userbasicModel.find().where('email').in(username).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.userbasicModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }

  async updateNoneActive(email: string): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ "email": email },
      {
        $set: {
          "email": email + '_noneactive'
        }
      });

    return data;
  }

  async updateIdVerified(id: ObjectId): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ "_id": id },
      {
        $set: {
          "isIdVerified": 'verified'
        }
      });

    return data;
  }

  async updateIdVerifiedUser(id: ObjectId, isIdVerified: boolean, statusKyc: string): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ "_id": id },
      {
        $set: {
          "isIdVerified": isIdVerified,
          "statusKyc": statusKyc
        }
      });

    return data;
  }
  async updateReportuser(id: Types.ObjectId, reportedStatus: string, reportedUserCount: number, reportedUser: any[], reportedUserHandle: any[]): Promise<Object> {
    let data = await this.userbasicModel.updateOne({ "_id": id },
      { $set: { "reportedStatus": reportedStatus, "reportedUserCount": reportedUserCount, "reportedUser": reportedUser, "reportedUserHandle": reportedUserHandle } });
    return data;
  }
  async UserAge(): Promise<Object> {
    const languages = await this.languagesService.findAll();
    var GetCount = this.userbasicModel
      .aggregate([
        {
          $addFields: {
            userAuth_id: '$userAuth.$id',
            languages_id: '$languages.$id',
            countries_id: '$countries.$id',
            age: {
              $dateDiff: {
                startDate: { $toDate: '$dob' },
                endDate: '$$NOW',
                unit: 'year',
              },
            },
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
          $project: {
            age: '$age',
            email: '$email',
            userAuth: '$userAuth',
            languages: '$languages.$id',
            languages_name_: languages.filter(function (e) {
              return (e._id.oid = '$languages.$id');
            }),
          },
        },
      ])
      .exec();
    return GetCount;
  }

  async UserActiveLastYear(year: number): Promise<Object> {
    var currentTime = new Date();
    var year_param = 0;
    if (year != undefined) {
      year_param = year;
    } else {
      year_param = currentTime.getFullYear();
    }
    const monthsArray = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    var GetCount = this.userbasicModel
      .aggregate([
        {
          $addFields: {
            userAuth_id: '$userAuth.$id',
          },
        },
        {
          $sort: { '_id.year_month': 1 },
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
          $project: {
            createdAt: '$createdAt',
            first: { $arrayElemAt: ['$userAuth_data', 0] },
          },
        },
        {
          $addFields: {
            userAuth_id__: '$first.isEnabled',
          },
        },
        {
          $project: {
            IsActive: '$userAuth_id__',
            createdAt: '$createdAt',
            YearcreatedAt: { $toInt: { $substrCP: ['$createdAt', 0, 4] } },
            year_param: { $toInt: year_param.toString() },

          },
        },
        {
          $match: {
            IsActive: true,
            YearcreatedAt: year_param,
          },
        },
        {
          $group: {
            _id: { year_month: { $substrCP: ['$createdAt', 0, 7] } },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            count: 1,
            month_: { $toInt: { $substrCP: ['$_id.year_month', 5, 2] } },
            month_name_: {
              $arrayElemAt: [
                monthsArray,
                {
                  $subtract: [
                    { $toInt: { $substrCP: ['$_id.year_month', 5, 2] } },
                    1,
                  ],
                },
              ],
            },
            year_: { $substrCP: ['$_id.year_month', 0, 4] },
          },
        },
        {
          $project: {
            _id: 0,
            month_name: '$month_name_',
            month: '$month_',
            year: { $toInt: '$year_' },
            count: 1,
          },
        },
      ])
      .exec();
    return GetCount;
  }

  async UserActiveDay(day: number): Promise<Object> {
    if (day == undefined) {
      throw new BadRequestException('Unabled to proceed');
    }
    var TODAY = new Date();
    var TODAY_BEFORE = new Date(new Date().setDate(new Date().getDate() - day));
    var GetCount = this.userbasicModel
      .aggregate([
        {
          $addFields: {
            userAuth_id: '$userAuth.$id',
            createdAt_: { $toDate: { $substrCP: ['$createdAt', 0, 10] } },
            today: { $toDate: { $substrCP: [TODAY, 0, 10] } },
            today_before: { $toDate: { $substrCP: [TODAY_BEFORE, 0, 10] } },
          },
        },
        {
          $sort: { '_id.year_month': 1 },
        },
        {
          $match: {
            createdAt_: { $gte: TODAY_BEFORE, $lt: TODAY },
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
          $project: {
            createdAt: '$createdAt',
            first: { $arrayElemAt: ['$userAuth_data', 0] },
          },
        },
        {
          $addFields: {
            userAuth_id__: '$first.isEnabled',
          },
        },
        {
          $project: {
            IsActive: '$userAuth_id__',
            createdAt: '$createdAt',
          },
        },
        {
          $match: {
            IsActive: true,
          },
        },
        {
          $group: {
            _id: { createdAt_data: { $substrCP: ['$createdAt', 0, 10] } },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { createdAt_data: 1 },
        },
        {
          $project: {
            _id: 0,
            date: '$_id.createdAt_data',
            count: 1,
          },
        },
      ])
      .exec();
    return GetCount;
  }

  async getinterest(email: string, langIso: string, pageNumber: number, pageRow: number, search: string): Promise<object> {

    const query = await this.userbasicModel.aggregate([
      {
        $lookup: {
          from: "interests_repo",
          localField: "userInterests.$id",
          foreignField: "_id",
          as: "field"
        }
      }, {
        "$unwind": {
          "path": "$field",
          "preserveNullAndEmptyArrays": false
        }
      }, {
        $match: {
          "email": email,
          "field.interestName": search,
          "field.langIso": langIso
        }
      }, {
        "$project": {
          "langIso": "$field.langIso",
          "cts": "$field.createdAt",
          "icon": "$field.icon",
          "interestName": "$field.interestName"
        }
      },

      { $skip: pageNumber },
      { $limit: pageRow },

    ]);

    return query;
  }

  async viewdatabyuser(id: object): Promise<object> {
    const query = await this.userbasicModel.aggregate([
      {
        $match: {
          _id: id
        }
      },
      {
        $lookup: {
          from: "announcements",
          localField: "_id",
          foreignField: "Detail.iduser",
          as: "pengumuman"
        }
      },
      {
        $project: {
          email: "$email",
          fullName: "$fullName",
          info: "$pengumuman"
        }
      },
    ]);


    return query;
  }

  async findOneupdatebyEmail(email: String) {
    this.userbasicModel.updateOne(
      {
        email: email,
      },
      { $inc: { otp_attemp: 1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async kycList(startDate: String, endDate: String, search: String, skip: number, limit: number) {

    var date_range_match = {};
    var startDate_format = null;
    var endDate_format = null;
    var skip_ = null;
    var limit_ = null;
    if (startDate != null) {
      startDate_format = new Date(startDate.toString());
    }
    if (endDate != null) {
      endDate_format = new Date(endDate.toString());
    }
    if (startDate_format != null && endDate_format != null) {
      date_range_match = { "createdAt_format": { $gte: startDate_format, $lte: endDate_format } };
    }
    let Query_aggregate = [
      {
        $match: {
          proofPict: { $exists: true }
        }
      },
      {
        $addFields: {
          id_mediaproofpicts: '$proofPict.$id',
          id_mediaprofilepicts: '$profilePict.$id',
          startDate: startDate_format,
          endDate: endDate_format
        },
      },
      {
        $lookup: {
          from: "mediaproofpicts",
          localField: "id_mediaproofpicts",
          foreignField: "_id",
          as: "mediaproofpicts"
        }
      },

      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'id_mediaprofilepicts',
          foreignField: '_id',
          as: 'mediaprofilepicts',
        },
      },
      {
        $match: {
          $and: [
            { "mediaproofpicts.status": { $exists: true } },
            { "mediaproofpicts.status": { $ne: "" } },
            {
              $or: [
                date_range_match,
                { "fullName": { $regex: search } },
                { "email": { $regex: search } },
              ]
            },
          ]
        }
      },
      {
        $project: {
          _id: 0,
          fullName: '$fullName',
          email: '$email',
          startDate: '$startDate',
          endDate: '$endDate',
          mediaproofpicts_: { $arrayElemAt: ['$mediaproofpicts', 0] },
          mediaprofilepicts_: { $arrayElemAt: ['$mediaprofilepicts', 0] }
        },
      },
      {
        $addFields: {
          createdAt_format: { $toDate: { $substrCP: ['$mediaproofpicts_.createdAt', 0, 10] } },
        },
      },
      {
        $match: {
          $and: [
            date_range_match
          ]
        }
      },
      {
        $project: {
          _id: 0,
          fullName: '$fullName',
          email: '$email',
          dateOfSubmission: '$mediaproofpicts_.createdAt',
          status: '$mediaproofpicts_.status',
          state: '$mediaproofpicts_.state',
          avatar: {
            mediaBasePath: '$mediaprofilepicts_.mediaBasePath',
            mediaUri: '$mediaprofilepicts_.mediaUri',
            mediaType: '$mediaprofilepicts_.mediaType',
            mediaEndpoint: '$mediaprofilepicts_.fsTargetUri',
            //medreplace: { $replaceOne: { input: "$mediaprofilepicts_.mediaUri", find: "_0001.jpeg", replacement: "" } },
          },
        },
      },
    ];
    if (skip != null) {
      skip_ = { $skip: Number(skip) };
      Query_aggregate.push(skip_);
    }
    if (limit != null) {
      limit_ = { $limit: Number(limit) };
      Query_aggregate.push(limit_);
    }
    const query = await this.userbasicModel.aggregate(Query_aggregate);
    return query;
  }
  async countBy(field: String) {
    const query = await this.userbasicModel.aggregate([
      {
        $group: {
          _id: "$" + field,
          countuser: {
            $sum: 1
          }
        }
      },
      {
        $project: { _id: 1, countuser: 1 }
      }
    ]);
    return query;
  }

  async transaksiHistory(email: string, skip: number, limit: number, startdate: string, enddate: string, sell: any, buy: any, withdrawal: any, rewards: any, boost: any) {

    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }
    var pipeline = [];

    pipeline.push(
      {
        $match:
        {
          "email": email
        }
      },
      {
        $lookup: {
          from: 'userauths',
          as: 'auth',
          let: {
            localID: '$email'
          },
          pipeline: [
            {
              $match:
              {
                $and: [
                  {
                    $expr: {
                      $eq: ['$email', '$$localID']
                    }
                  },

                ]
              }
            },

          ],

        },

      },
      {
        $unwind: {
          path: "$auth",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          "_id": 1,
          "userName": '$auth.username',
          "fullName": 1,
          "email": 1,

        }
      },
      {
        $facet:
        {

          "balances": [
            {
              "$lookup": {
                from: "accountbalances",
                as: "balance",
                let: {
                  localID: "$_id"
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and:
                        [
                          {
                            $expr: {
                              $eq: ['$iduser', '$$localID']
                            }
                          },
                          {
                            "type": "rewards"
                          },

                        ]
                    }
                  },
                  {
                    $project: {
                      "jenis": "Rewards",
                      "type": "Rewards",
                      "timestamp": 1,
                      "description": 1,
                      "noinvoice": 1,
                      "nova": 1,
                      "expiredtimeva": 1,
                      "bank": 1,
                      "amount": "$kredit",
                      "totalamount": "$kredit",
                      "status": "Success",
                      "postid": 1,
                      "iduserbuyer": 1,
                      "idusersell": 1,
                      "debetKredit": "+",

                    }
                  },

                ],

              },

            },
            {
              $unwind: {
                path: "$balance",
                preserveNullAndEmptyArrays: true
              }
            },

          ],
          "tariks": [
            {
              "$lookup": {
                from: "withdraws",
                as: "tarik",
                let: {
                  localID: "$_id"
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and:
                        [
                          {
                            $expr: {
                              $eq: ['$idUser', '$$localID']
                            }
                          },

                        ]
                    }
                  },
                  {
                    $project: {
                      "jenis": "Withdraws",
                      "type": "Withdraws",
                      "timestamp": 1,
                      "description": 1,
                      "noinvoice": 1,
                      "nova": 1,
                      "expiredtimeva": 1,
                      "bank": 1,
                      "amount": 1,
                      "totalamount": 1,
                      "status": "Success",
                      "postid": 1,
                      "iduserbuyer": 1,
                      "idusersell": 1,
                      "debetKredit": "-",

                    }
                  },

                ],

              },

            },
            {
              $unwind: {
                path: "$tarik",
                preserveNullAndEmptyArrays: true
              }
            },

          ],
          "transactions": [
            {
              "$lookup": {
                from: "transactions",
                as: "buy-sell",
                let: {
                  localID: '$_id'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $or:
                        [
                          {
                            $expr: {
                              $eq: ['$iduserbuyer', '$$localID']
                            }
                          },
                          {
                            $expr: {
                              $eq: ['$idusersell', '$$localID']
                            }
                          }
                        ]
                    }
                  },
                  {
                    $project: {
                      "jenis": "$type",
                      "type":
                      {
                        $cond: {
                          if: {
                            $eq: ['$iduserbuyer', '$$localID']
                          },
                          then: "Buy",
                          else: 'Sell'
                        }
                      },
                      "timestamp": 1,
                      "description": 1,
                      "noinvoice": 1,
                      "nova": 1,
                      "expiredtimeva": 1,
                      "bank": 1,
                      "amount": 1,
                      "totalamount": 1,
                      "status": 1,
                      "postid": 1,
                      "iduserbuyer": 1,
                      "idusersell": 1,

                    }
                  },
                  // {
                  //     $sort: {
                  //         "timestamp": - 1,
                  //         
                  //     }
                  // },
                ],

              },

            },
            {
              "$lookup": {
                from: "posts",
                as: "post",
                let: {
                  localID: '$buy-sell.postid'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {

                      "postID": 1,
                      "description": 1,
                      "postType": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "mediapicts",
                as: "pict",
                let: {
                  localID: '$buy-sell.postid'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$postID', '$$localID']
                          }
                        },
                      ]
                    }
                  },
                  {
                    $project: {
                      "postID": 1,
                      "apsara": 1,
                      "apsaraId": 1,
                      "apsaraThumbId": 1,
                      "mediaEndpoint": {
                        "$concat": ["/pict/", "$postID"]
                      },
                      "mediaUri": 1,
                      "mediaThumbEndpoint": 1,
                      "mediaThumbUri": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "mediavideos",
                as: "video",
                let: {
                  localID: '$buy-sell.postid'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      "postID": 1,
                      "apsara": 1,
                      "apsaraId": 1,
                      "apsaraThumbId": 1,
                      "mediaEndpoint": {
                        "$concat": ["/stream/", "$postID"]
                      },
                      "mediaUri": 1,
                      "mediaThumbEndpoint": 1,
                      "mediaThumbUri": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "mediadiaries",
                as: "diary",
                let: {
                  localID: '$buy-sell.postid'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      "postID": 1,
                      "apsara": 1,
                      "apsaraId": 1,
                      "apsaraThumbId": 1,
                      "mediaEndpoint": {
                        "$concat": ["/stream/", "$postID"]
                      },
                      "mediaUri": 1,
                      "mediaThumbEndpoint": 1,
                      "mediaThumbUri": 1,

                    }
                  }
                ],

              },

            },
            {
              "$lookup": {
                from: "mediastories",
                as: "story",
                let: {
                  localID: '$buy-sell.postid'
                },
                pipeline: [
                  {
                    $match:
                    {


                      $expr: {
                        $in: ['$postID', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      "postID": 1,
                      "apsara": 1,
                      "apsaraId": 1,
                      "apsaraThumbId": 1,
                      "mediaEndpoint": {
                        "$concat": ["/stream/", "$postID"]
                      },
                      "mediaUri": 1,
                      "mediaThumbEndpoint": 1,
                      "mediaThumbUri": 1,

                    }
                  }
                ],

              },

            },
            {
              $lookup: {
                from: 'userbasics',
                as: 'penjual',
                let: {
                  localID: '$buy-sell.idusersell'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$_id', '$$localID']
                          }
                        },
                        {
                          "email":
                          {
                            $ne: email
                          }
                        }
                      ]
                    }
                  },

                ],

              },

            },
            {
              $lookup: {
                from: 'userbasics',
                as: 'pembeli',
                let: {
                  localID: '$buy-sell.iduserbuyer'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$_id', '$$localID']
                          }
                        },
                        {
                          "email":
                          {
                            $ne: email
                          }
                        }
                      ]
                    }
                  },

                ],

              },

            },
            {
              $lookup: {
                from: 'userauths',
                as: 'penjualAuth',
                let: {
                  localID: '$penjual.email'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },

                      ]
                    }
                  },

                ],

              },

            },
            {
              $lookup: {
                from: 'userauths',
                as: 'pembeliAuth',
                let: {
                  localID: '$pembeli.email'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $and: [
                        {
                          $expr: {
                            $in: ['$email', '$$localID']
                          }
                        },

                      ]
                    }
                  },

                ],

              },

            },
            {
              $unwind: {
                path: "$buy-sell",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                "transaction": [{
                  //"video": 1,
                  "_id": "$buy-sell._id",
                  //"did": "$buy-sell.postid",
                  "iduser": "$_id",
                  "type": "$buy-sell.type",
                  "jenis": "$buy-sell.jenis",
                  "timestamp": "$buy-sell.timestamp",
                  "description": "$buy-sell.description",
                  "noinvoice": "$buy-sell.noinvoice",
                  "nova": "$buy-sell.nova",
                  "expiredtimeva": "$buy-sell.expiredtimeva",
                  "bank": "$buy-sell.bank",
                  "amount": "$buy-sell.amount",
                  "totalamount":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Sell"]
                      },
                      then: "$buy-sell.amount",
                      else: '$buy-sell.totalamount'
                    }
                  },
                  "status": "$buy-sell.status",
                  "email": "$email",
                  "fullName": "$fullName",
                  "userame": "$fullName",
                  "penjual":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Sell"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$penjual.fullName', {
                          "$indexOfArray": [
                            "$penjual._id",
                            "$buy-sell.idusersell"
                          ]
                        }]
                      }
                    }
                  },
                  "emailpenjual":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Sell"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$penjual.email', {
                          "$indexOfArray": [
                            "$penjual._id",
                            "$buy-sell.idusersell"
                          ]
                        }]
                      }
                    }
                  },
                  "userNamePenjual":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Sell"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$penjualAuth.username', {
                          "$indexOfArray": [
                            "$penjualAuth.email",
                            {
                              $arrayElemAt: ['$penjual.email', {
                                "$indexOfArray": [
                                  "$penjual._id",
                                  "$buy-sell.idusersell"
                                ]
                              }]
                            }
                          ]
                        }]
                      }
                    }
                  },
                  "pembeli":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Buy"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$pembeli.fullName', {
                          "$indexOfArray": [
                            "$pembeli._id",
                            "$buy-sell.iduserbuyer"
                          ]
                        }]
                      }
                    }
                  },
                  "emailpembeli":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Buy"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$pembeli.email', {
                          "$indexOfArray": [
                            "$pembeli._id",
                            "$buy-sell.iduserbuyer"
                          ]
                        }]
                      }
                    }
                  },
                  "userNamePembeli":
                  {
                    $cond: {
                      if: {
                        $eq: ["$buy-sell.type", "Buy"]
                      },
                      then: "$dodol",
                      else: {
                        $arrayElemAt: ['$pembeliAuth.username', {
                          "$indexOfArray": [
                            "$pembeliAuth.email",
                            {
                              $arrayElemAt: ['$pembeli.email', {
                                "$indexOfArray": [
                                  "$pembeli._id",
                                  "$buy-sell.iduserbuyer"
                                ]
                              }]
                            }
                          ]
                        }]
                      }
                    }
                  },
                  "postID": "$buy-sell.postid",
                  "postType":
                  {
                    $arrayElemAt: ['$post.postType', {
                      "$indexOfArray": [
                        "$post.postID",
                        "$buy-sell.postid"
                      ]
                    }]
                  },
                  "descriptionContent":
                  {
                    $arrayElemAt: ['$post.description', {
                      "$indexOfArray": [
                        "$post.postID",
                        "$buy-sell.postid"
                      ]
                    }]
                  },
                  "title":
                  {
                    $arrayElemAt: ['$post.title', {
                      "$indexOfArray": [
                        "$post.postID",
                        "$buy-sell.postid"
                      ]
                    }]
                  },
                  "mediaType":
                  {
                    $arrayElemAt: ['$post.postType', {
                      "$indexOfArray": [
                        "$post.postID",
                        "$buy-sell.postid"
                      ]
                    }]
                  },
                  "mediaEndpoint":
                  {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "vid"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$video.mediaEndpoint', {
                              "$indexOfArray": [
                                "$video.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "pict"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$pict.mediaEndpoint', {
                              "$indexOfArray": [
                                "$pict.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "story"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$story.mediaEndpoint', {
                              "$indexOfArray": [
                                "$story.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "diary"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$diary.mediaEndpoint', {
                              "$indexOfArray": [
                                "$diary.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },

                      ],
                      "default": "other"
                    }
                  },
                  "apsaraId":
                  {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "vid"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$video.apsaraId', {
                              "$indexOfArray": [
                                "$video.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "pict"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$pict.apsaraId', {
                              "$indexOfArray": [
                                "$pict.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "story"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$story.apsaraId', {
                              "$indexOfArray": [
                                "$story.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "diary"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$diary.apsaraId', {
                              "$indexOfArray": [
                                "$diary.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },

                      ],
                      "default": "other"
                    }
                  },
                  "apsara":
                  {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "vid"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$video.apsara', {
                              "$indexOfArray": [
                                "$video.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "pict"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$pict.apsara', {
                              "$indexOfArray": [
                                "$pict.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "story"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$story.apsara', {
                              "$indexOfArray": [
                                "$story.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },
                        {
                          case: {
                            $eq: [{
                              $arrayElemAt: ['$post.postType', {
                                "$indexOfArray": [
                                  "$post.postID",
                                  "$buy-sell.postid"
                                ]
                              }]
                            }, "diary"]
                          },
                          then:
                          {
                            $arrayElemAt: ['$diary.apsara', {
                              "$indexOfArray": [
                                "$diary.postID",
                                "$buy-sell.postid"
                              ]
                            }]
                          }
                        },

                      ],
                      "default": "false"
                    }
                  },
                  "debetKredit":
                  {
                    $switch: {
                      branches: [
                        {
                          case: {
                            $eq: ["$buy-sell.type", "Buy"]
                          },
                          then: null
                        },
                        {
                          case: {
                            $eq: ["$buy-sell.type", "Sell"]
                          },
                          then: "+"
                        },

                      ],
                      "default": null
                    }
                  },

                }]
              }
            },
            {
              $unwind: {
                path: "$transaction",
                preserveNullAndEmptyArrays: true
              }
            },

          ],

        }
      },
      {
        $project: {
          "tester":
          {
            $concatArrays: [
              '$balances.balance',
              '$tariks.tarik',
              '$transactions.transaction'
            ],

          },

        }
      },
      {
        $unwind: {
          path: "$tester",

        }
      },
      {
        $project: {
          "_id": '$tester._id',
          "iduser": '$tester.iduser',
          "type": '$tester.type',
          "jenis": '$tester.jenis',
          "timestamp": '$tester.timestamp',
          "description": '$tester.description',
          "noinvoice": '$tester.noinvoice',
          "nova": '$tester.nova',
          "expiredtimeva": '$tester.expiredtimeva',
          "bank": '$tester.bank',
          "amount": '$tester.amount',
          "totalamount": '$tester.totalamount',
          "status": '$tester.status',
          "fullName": '$tester.fullName',
          "email": '$tester.email',
          "penjual": '$tester.penjual',
          "emailpenjual": '$tester.emailpenjual',
          "userNamePenjual": '$tester.userNamePenjual',
          "pembeli": '$tester.pembeli',
          "emailpembeli": '$tester.emailpembeli',
          "userNamePembeli": '$tester.userNamePembeli',
          "postID": '$tester.postID',
          "postType": '$tester.postType',
          "descriptionContent": '$tester.descriptionContent',
          "title": '$tester.title',
          "mediaType": '$tester.mediaType',
          "mediaEndpoint": '$tester.mediaEndpoint',
          "apsaraId": '$tester.apsaraId',
          "apsara": '$tester.apsara',
          "debetKredit": '$tester.debetKredit',

        }
      },
    );

    if (sell === true && buy === false && withdrawal === false && rewards === false && boost === false) {
      pipeline.push({ $match: { "type": "Sell", "jenis": { $ne: "BOOST_CONTENT" } } },);
    }
    else if (sell === false && buy === true && withdrawal === false && rewards === false && boost === false) {
      pipeline.push({ $match: { "type": "Buy", "jenis": { $ne: "BOOST_CONTENT" } } });
    }
    else if (sell === false && buy === false && withdrawal === true && rewards === false && boost === false) {
      pipeline.push({ $match: { "type": "Withdraws" } });
    }
    else if (sell === false && buy === false && withdrawal === false && rewards === true && boost === false) {
      pipeline.push({ $match: { "type": "Rewards" } });
    }
    else if (sell === false && buy === false && withdrawal === false && rewards === false && boost === true) {
      pipeline.push({ $match: { "type": "Buy", "jenis": "BOOST_CONTENT" } });
    }
    else if (sell === true && buy === true && withdrawal === false && rewards === false && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell", "jenis": { $ne: "BOOST_CONTENT" } }, { "type": "Buy", "jenis": { $ne: "BOOST_CONTENT" } }] } },);
    }
    else if (sell === true && buy === false && withdrawal === true && rewards === false && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell", "jenis": { $ne: "BOOST_CONTENT" } }, { "type": "Withdraws" }] } },);
    }
    else if (sell === true && buy === false && withdrawal === false && rewards === true && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell", "jenis": { $ne: "BOOST_CONTENT" } }, { "type": "Rewards" }] } },);
    }
    else if (sell === true && buy === false && withdrawal === false && rewards === false && boost === true) {
      pipeline.push({ $match: { $or: [{ "type": "Sell" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }] } },);
    }

    else if (sell === false && buy === true && withdrawal === true && rewards === false && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Buy", "jenis": { $ne: "BOOST_CONTENT" } }, { "type": "Withdraws" }] } },);
    }
    else if (sell === false && buy === true && withdrawal === false && rewards === true && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Buy", "jenis": { $ne: "BOOST_CONTENT" } }, { "type": "Rewards" }] } },);
    }
    else if (sell === false && buy === true && withdrawal === false && rewards === false && boost === true) {
      pipeline.push({ $match: { $or: [{ "type": "Buy" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }] } },);
    }
    else if (sell === false && buy === false && withdrawal === true && rewards === true && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Withdraws" }, { "type": "Rewards" }] } },);
    }
    else if (sell === false && buy === false && withdrawal === true && rewards === false && boost === true) {
      pipeline.push({ $match: { $or: [{ "type": "Withdraws" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }] } },);
    }
    else if (sell === false && buy === false && withdrawal === false && rewards === true && boost === true) {
      pipeline.push({ $match: { $or: [{ "type": "Rewards" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }] } },);
    }
    else if (sell === true && buy === true && withdrawal === true && rewards === false && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell", "jenis": { $ne: "BOOST_CONTENT" } }, { "type": "Buy", "jenis": { $ne: "BOOST_CONTENT" } }, { "type": "Withdraws" }] } },);
    }
    else if (sell === true && buy === true && withdrawal === true && rewards === true && boost === false) {
      pipeline.push({ $match: { $or: [{ "type": "Sell", "jenis": { $ne: "BOOST_CONTENT" } }, { "type": "Buy", "jenis": { $ne: "BOOST_CONTENT" } }, { "type": "Withdraws" }, { "type": "Rewards" }] } },);
    }
    else if (sell === true && buy === true && withdrawal === true && rewards === true && boost === true) {
      pipeline.push({ $match: { $or: [{ "type": "Sell" }, { "type": "Buy" }, { "type": "Withdraws" }, { "type": "Buy", "jenis": "BOOST_CONTENT" }] } },);
    }


    if (startdate && startdate !== undefined) {

      pipeline.push({ $match: { timestamp: { "$gte": startdate } } });

    }
    if (enddate && enddate !== undefined) {
      pipeline.push({ $match: { timestamp: { "$lte": dateend } } });

    }

    pipeline.push({
      $sort: {
        "timestamp": - 1,

      }
    },
      {
        $skip: skip
      },
      {
        $limit: limit
      },);
    var query = await this.userbasicModel.aggregate(pipeline);

    return query;
  }

}