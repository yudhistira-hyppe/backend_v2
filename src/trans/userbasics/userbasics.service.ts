import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateUserbasicDto } from './dto/create-userbasic.dto';
import { Userbasic, UserbasicDocument } from './schemas/userbasic.schema';
import { LanguagesService } from '../../infra/languages/languages.service';
import { InterestsRepoService } from '../../infra/interests_repo/interests_repo.service';
import { MediaproofpictsService } from '../../content/mediaproofpicts/mediaproofpicts.service';
@Injectable()
export class UserbasicsService {
  constructor(
    @InjectModel(Userbasic.name, 'SERVER_TRANS')
    private readonly userbasicModel: Model<UserbasicDocument>,
    private readonly languagesService: LanguagesService,
    private readonly interestsRepoService: InterestsRepoService,
    private readonly mediaproofpictsService: MediaproofpictsService,
  ) { }

  async create(CreateUserbasicDto: CreateUserbasicDto): Promise<Userbasic> {
    const createUserbasicDto = await this.userbasicModel.create(
      CreateUserbasicDto,
    );
    return createUserbasicDto;
  }

  async updatebyEmail(email: string, data: Object) {
    console.log(email);
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
    );
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
    let data = await this.userbasicModel.updateOne({ "email": email },
      {
        $set: createUserbasicDto
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
          "isIdVerified": true
        }
      });

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
    const interes = await this.interestsRepoService.findinterst();
    const query = await this.userbasicModel.aggregate([
      {
        $lookup: {
          from: "interests_repo2",
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

  async kycList(startDate: String, endDate: String, search: String, skip: number ,limit: number): Promise<object> {
    var date_range_match = {};
    var startDate_format = null;
    var endDate_format = null;
    if (startDate != null) {
      startDate_format = new Date(startDate.toString());
    }
    if (endDate != null) {
      endDate_format = new Date(endDate.toString());
    }
    if (startDate_format != null && endDate_format!=null){
      console.log(startDate_format);
      console.log(endDate_format);
      date_range_match = {
        'createdAt_': {
          $gte: startDate,
          $lte: endDate
        }};
    }
    const mediaproofpictsService = await this.mediaproofpictsService.findmediaproofpicts();
    const query = await this.userbasicModel.aggregate([
      {
        $match: {
          proofPict: { $exists: true }
        }
      },
      {
        $addFields: {
          id_mediaproofpicts: '$proofPict.$id',
          startDate: { $toDate: { $substrCP: [startDate_format, 0, 10] } },
          endDate: { $toDate: { $substrCP: [endDate_format, 0, 10] } },
        },
      },
      {
        $lookup: {
          from: "mediaproofpicts2",
          localField: "id_mediaproofpicts",
          foreignField: "_id",
          as: "mediaproofpicts"
        }
      },
      {
        $match: {
          $and: [
            {"mediaproofpicts.status": { $exists: true }},
            {"mediaproofpicts.status": { "$ne": "" }},
            {
              $or: [
                date_range_match,
                { "fullName": { $regex: search } },
                { "email": { $regex: search } },
              ]
            },
            //date_range_match
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
          mediaproofpicts_: { $arrayElemAt: ['$mediaproofpicts', 0] }
        },
      },
      {
        $project: {
          _id: 0,
          fullName: '$fullName',
          email: '$email',
          dateOfSubmission: '$mediaproofpicts_.createdAt',
          status: '$mediaproofpicts_.status',
          state: '$mediaproofpicts_.state',
          startDate: '$startDate',
          endDate: '$endDate',
          createdAt_: '$mediaproofpicts_.createdAt_',
        },
      },
    ]);
    return query;
  }
}

