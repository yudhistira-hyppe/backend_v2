import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateActivityeventsDto } from './dto/create-activityevents.dto';
import { Activityevents, ActivityeventsDocument } from './schemas/activityevents.schema';
@Injectable()
export class ActivityeventsService {
  constructor(
    @InjectModel(Activityevents.name, 'SERVER_TRANS')
    private readonly activityeventsModel: Model<ActivityeventsDocument>,
  ) { }

  async create(
    CreateActivityeventsDto: CreateActivityeventsDto,
  ): Promise<Activityevents> {
    const createActivityeventsDto = await this.activityeventsModel.create(
      CreateActivityeventsDto,
    );
    return createActivityeventsDto;
  }

  async findAll(): Promise<Activityevents[]> {
    return this.activityeventsModel.find().exec();
  }

  async findevent(email: string): Promise<Object> {
    return this.activityeventsModel
      .find({
        'payload.email': email,
      })
      .sort({ createdAt: -1 })
      .limit(1)
      .exec();
  }

  async findOne(id: string): Promise<Activityevents> {
    return this.activityeventsModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.activityeventsModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }

  async LogActivitas(year: number): Promise<Object> {
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
    var GetCount = this.activityeventsModel
      .aggregate([
        {
          $sort: { createdAt: 1 },
        },
        {
          $project: {
            activityType_repo: '$activityType',
            createdAt_repo: '$createdAt',
            month_repo: { $toInt: { $substrCP: ['$createdAt', 5, 2] } },
            month_name_repo: {
              $arrayElemAt: [
                monthsArray,
                {
                  $subtract: [
                    { $toInt: { $substrCP: ['$createdAt', 5, 2] } },
                    1,
                  ],
                },
              ],
            },
            YearcreatedAt_repo: { $toInt: { $substrCP: ['$createdAt', 0, 4] } },
            year_param_repo: { $toInt: year_param.toString() },
          },
        },
        {
          $group: {
            _id: {
              month_group: '$month_repo',
              activityType_group: '$activityType_repo',
            },
            activityType_Count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$_id.month_group',
            log: {
              $push: {
                activityType: '$_id.activityType_group',
                count: '$activityType_Count',
              },
            },
            count: { $sum: '$activityType_Count' },
          },
        },
        {
          $project: {
            _id: 0,
            month: '$_id',
            month_name: {
              $arrayElemAt: [
                monthsArray,
                {
                  $subtract: ['$_id', 1],
                },
              ],
            },
            log: '$log',
          },
        },
        // {
        //   $group: {
        //     _id: { year_month: { $substrCP: ['$createdAt', 0, 7] } },
        //     count: { $sum: 1 },
        //   },
        // },
      ])
      .exec();
    return GetCount;
  }

  async findParentByDevice(
    email: string,
    login_device: string,
    activityType: string,
    flowIsDone_: boolean,
  ): Promise<Object> {
    return this.activityeventsModel
      .find({
        'payload.email': email,
        'payload.login_device': login_device,
        activityType: activityType,
        parentActivityEventID: { $eq: null },
        flowIsDone: flowIsDone_,
      })
      .exec();
  }

  async update(param: Object, data: Object) {
    this.activityeventsModel.updateOne(param, data, function (err, docs) {
      if (err) { } else { }
    });
  }

  async findevents() {
    const query = await this.activityeventsModel.aggregate([
      {
        "$group": {
          "_id": "$payload.email",
          "timeAt": {
            "$last": "$createdAt"
          },
          "event": {
            "$last": "$event"
          },
          "eventipe": {
            "$last": "$event"
          },
          "email": {
            "$last": "$payload.email"
          }
        }
      },
      {
        "$match": {
          "event": "AWAKE"
        }
      }

    ]);

    return query;

  }
}
