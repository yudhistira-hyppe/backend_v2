import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGetcontenteventsDto } from 'src/trans/getusercontents/getcontentevents/dto/create-getcontentevents.dto';
import { CreateContenteventsDto } from './dto/create-contentevents.dto';
import { Contentevents, ContenteventsDocument } from './schemas/contentevents.schema';

@Injectable()
export class ContenteventsService {
  constructor(
    @InjectModel(Contentevents.name, 'SERVER_CONTENT')
    private readonly ContenteventsModel: Model<ContenteventsDocument>,
  ) { }

  async create(
    CreateContenteventsDto: CreateContenteventsDto,
  ): Promise<Contentevents> {
    const createContenteventsDto = await this.ContenteventsModel.create(CreateContenteventsDto);
    return createContenteventsDto;
  }

  async createNew(
    data: Contentevents,
  ): Promise<Contentevents> {
    const createContenteventsDto = await this.ContenteventsModel.create(
      CreateContenteventsDto,
    );
    return createContenteventsDto;
  }

  async findAll(): Promise<Contentevents[]> {
    return this.ContenteventsModel.find().exec();
  }

  async findFollowing(email: String): Promise<Contentevents[]> {
    let query = this.ContenteventsModel.find();
    query.where('eventType', 'FOLLOWING');
    query.where('email', email);
    return query.exec();
  }
  async updateNoneActive(email: string) {
    this.ContenteventsModel.updateMany(
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

  async getConteneventbyType(CreateGetcontenteventsDto_: CreateGetcontenteventsDto): Promise<Contentevents[]> {
    return this.ContenteventsModel.find({
      postID: CreateGetcontenteventsDto_.postID,
      eventType: CreateGetcontenteventsDto_.eventType,
      receiverParty: CreateGetcontenteventsDto_.receiverParty,
    }).skip(CreateGetcontenteventsDto_.skip).limit(CreateGetcontenteventsDto_.limit).exec();
  }

  //    async findOne(id: string): Promise<Contentevents> {
  //     return this.ContenteventsModel.findOne({ _id: id }).exec();
  //   }
  async findAllCategory(CreateGetcontenteventsDto_: CreateGetcontenteventsDto): Promise<Contentevents> {
    return this.ContenteventsModel.findOne(CreateGetcontenteventsDto_).exec();
  }

  async findParentBySender(eventType: string, email: string, senderParty: string, flowIsDone: boolean): Promise<Contentevents> {
    return this.ContenteventsModel.findOne({ eventType: eventType, email: email, senderParty: senderParty, flowIsDone: flowIsDone }).exec();
  }

  async findParentByReceiver(eventType: string, receiverParty: string, email: string, flowIsDone: boolean): Promise<Contentevents> {
    return this.ContenteventsModel.findOne({ eventType: eventType, email: email, receiverParty: receiverParty, flowIsDone: flowIsDone }).exec();
  }

  async findSenderOrReceiverByPostID(postID: string, eventType: string, email: string, receiverParty: string): Promise<Contentevents> {
    return await this.ContenteventsModel.findOne({ postID: postID, eventType: eventType, email: email, receiverParty: receiverParty }).exec();
  } 

  async findSenderOrReceiver(eventType: string, email: string, receiverParty: string): Promise<Contentevents> {
    return await this.ContenteventsModel.findOne(
      { $and: 
        [
          { eventType: eventType }, 
          { email: email }, 
          { $or: 
            [
              { receiverParty: receiverParty }, 
              { senderParty: receiverParty }
            ] 
          }
        ] 
      }).exec();
  }

  async findOne(email: string): Promise<Contentevents> {
    return this.ContenteventsModel.findOne({ email: email }).exec();
  }
  async delete(id: string) {
    const deletedCat = await this.ContenteventsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  async UserActivityNow(date: Date): Promise<Object> {
    const HoursArray = [
      '00:00-01:00',
      '01:00-02:00',
      '02:00-03:00',
      '03:00-04:00',
      '04:00-05:00',
      '05:00-06:00',
      '06:00-07:00',
      '07:00-08:00',
      '08:00-09:00',
      '09:00-10:00',
      '10:00-11:00',
      '11:00-12:00',
      '12:00-13:00',
      '13:00-14:00',
      '14:00-15:00',
      '15:00-16:00',
      '16:00-17:00',
      '17:00-18:00',
      '18:00-19:00',
      '19:00-20:00',
      '20:00-21:00',
      '21:00-22:00',
      '22:00-23:00',
      '23:00-00:00',
    ];
    var GetCount = this.ContenteventsModel.aggregate([
      {
        $addFields: {
          createdAt_date_only: { $substrCP: ['$createdAt', 0, 10] },
          createdAt_: { $toDate: '$createdAt' },
        },
      },
      {
        $match: {
          createdAt_date_only: date,
        },
      },
      {
        $project: {
          h: { $hour: '$createdAt_' },
          email: '$email',
        },
      },
      {
        $group: {
          _id: {
            hour_group: '$h',
            email_group: '$email',
          },
          email_count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.hour_group',
          log: {
            $push: {
              email: '$_id.email_group',
              count_activity: '$email_count',
            },
          },
          count: { $sum: '$email_count' },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: date,
          hour: {
            $arrayElemAt: [
              HoursArray,
              {
                $subtract: ['$_id', 0],
              },
            ],
          },
          user_activity_count: { $size: '$log' },
          count_all_activity: '$count',
          user_activity: '$log',
        },
      },
    ]).exec();
    return GetCount;
  }

  async UserActivityYear(year: number): Promise<Object> {
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
    var GetCount = this.ContenteventsModel.aggregate([
      {
        $addFields: {
          createdAt_date_only: { $substrCP: ['$createdAt', 0, 10] },
          createdAt_: { $toDate: '$createdAt' },
          YearcreatedAt: { $toInt: { $substrCP: ['$createdAt', 0, 4] } },
          year_param: { $toInt: year_param.toString() },
        },
      },
      {
        $match: {
          YearcreatedAt: year_param,
        },
      },
      // {
      //   $sort: { createdAt_: 1 },
      // },
      {
        $group: {
          _id: {
            year_month: { $substrCP: ['$createdAt', 0, 7] },
            email_group: '$email',
          },
          email_count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.year_month',
          log: {
            $push: {
              email: '$_id.email_group',
              count_activity: '$email_count',
            },
          },
          count: { $sum: '$email_count' },
        },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          month_int: { $toInt: { $substrCP: ['$_id', 5, 2] } },
          month_: { $substrCP: ['$_id', 5, 2] },
          monet: '$log',
          month_name_: {
            $arrayElemAt: [
              monthsArray,
              {
                $subtract: [{ $toInt: { $substrCP: ['$_id', 5, 2] } }, 1],
              },
            ],
          },
          year_: { $substrCP: ['$_id', 0, 4] },
        },
      },
      {
        $sort: { month_int: 1 },
      },
      {
        $project: {
          _id: 0,
          year: { $toInt: '$year_' },
          month: '$month_',
          month_name: '$month_name_',
          //monitize: '$monet',
          count_user: { $size: '$monet' },
        },
      },
      // {
      //   $sort: { createdAt_: 1 },
      // },
      // {
      //   $group: {
      //     _id: {
      //       createdAt_data: '$createdAt_date_only',
      //       email_group: '$email',
      //     },
      //     email_count: { $sum: 1 },
      //   },
      // },
      // {
      //   $group: {
      //     _id: '$_id.createdAt_data',
      //     log: {
      //       $push: {
      //         email: '$_id.email_group',
      //         count_activity: '$email_count',
      //       },
      //     },
      //     count: { $sum: '$email_count' },
      //   },
      // },
      // {
      //   $project: {
      //     _id: 0,
      //     date: '$_id',
      //     user_activity_count: { $size: '$log' },
      //     count_all_activity: '$count',
      //     user_activity: '$log',
      //   },
      // },
      // {
      //   $sort: { date: 1 },
      // },
    ]).exec();
    return GetCount;
  }

  async UserActivityBeforeToday(day: number): Promise<Object> {
    if (day == undefined) {
      throw new BadRequestException('Unabled to proceed');
    }
    var TODAY = new Date();
    var TODAY_BEFORE = new Date(new Date().setDate(new Date().getDate() - day));
    var GetCount = this.ContenteventsModel.aggregate([
      {
        $addFields: {
          createdAt_date_only: { $substrCP: ['$createdAt', 0, 10] },
          createdAt_: { $toDate: '$createdAt' },
          today: { $toDate: { $substrCP: [TODAY, 0, 10] } },
          today_before: { $toDate: { $substrCP: [TODAY_BEFORE, 0, 10] } },
        },
      },
      {
        $match: {
          createdAt_: { $gte: TODAY_BEFORE, $lt: TODAY },
        },
      },
      {
        $sort: { createdAt_: 1 },
      },
      {
        $group: {
          _id: {
            createdAt_data: '$createdAt_date_only',
            email_group: '$email',
          },
          email_count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.createdAt_data',
          log: {
            $push: {
              email: '$_id.email_group',
              count_activity: '$email_count',
            },
          },
          count: { $sum: '$email_count' },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          user_activity_count: { $size: '$log' },
          count_all_activity: '$count',
          user_activity: '$log',
        },
      },
      {
        $sort: { date: 1 },
      },
    ]).exec();
    return GetCount;
  }

  async UserActivitySize(day: number): Promise<Object> {
    const DayNameIndoArray = [
      'Minggu',
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu',
    ];
    const DayNameEnglishArray = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    if (day == undefined) {
      throw new BadRequestException('Unabled to proceed');
    }
    var TODAY = new Date();
    var TODAY_BEFORE = new Date(new Date().setDate(new Date().getDate() - day));
    var GetCount = this.ContenteventsModel.aggregate([
      {
        $addFields: {
          createdAt_date_only: { $substrCP: ['$createdAt', 0, 10] },
          createdAt_: { $toDate: '$createdAt' },
          today: { $toDate: { $substrCP: [TODAY, 0, 10] } },
          today_before: { $toDate: { $substrCP: [TODAY_BEFORE, 0, 10] } },
        },
      },
      {
        $match: {
          createdAt_: { $gte: TODAY_BEFORE, $lt: TODAY },
          eventType: {
            $in: ['LIKE', 'VIEW', 'CREATE_POST', 'COMMENT', 'REACTION', 'POST'],
          },
        },
      },
      {
        $sort: { createdAt_: 1 },
      },
      {
        $group: {
          _id: {
            createdAt_data: '$createdAt_date_only',
            eventType_group: '$eventType',
          },
          eventType_count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.createdAt_data',
          log: {
            $push: {
              eventType: '$_id.eventType_group',
              count_eventType: '$eventType_count',
            },
          },
          count: { $sum: '$eventType_count' },
        },
      },
      {
        $project: {
          _id: 0,
          day_name: {
            $arrayElemAt: [
              DayNameEnglishArray,
              {
                $subtract: [{ $toInt: { $dayOfWeek: { $toDate: '$_id' } } }, 1],
              },
            ],
          },
          date: '$_id',
          count_all_event: '$count',
          eventType_activity: '$log',
        },
      },
      {
        $sort: { date: 1 },
      },
    ]).exec();
    return GetCount;
  }

  async UserActivitySizeYear(year: number): Promise<Object> {
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
    var GetCount = this.ContenteventsModel.aggregate([
      {
        $addFields: {
          createdAt_date_only: { $substrCP: ['$createdAt', 0, 10] },
          createdAt_: { $toDate: '$createdAt' },
          YearcreatedAt: { $toInt: { $substrCP: ['$createdAt', 0, 4] } },
          year_param: { $toInt: year_param.toString() },
        },
      },
      {
        $match: {
          YearcreatedAt: year_param,
          eventType: {
            $in: ['LIKE', 'VIEW', 'CREATE_POST', 'COMMENT', 'REACTION', 'POST'],
          },
        },
      },
      {
        $group: {
          _id: {
            year_month: { $substrCP: ['$createdAt', 0, 7] },
            eventType_group: '$eventType',
          },
          eventType_count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.year_month',
          log: {
            $push: {
              eventType: '$_id.eventType_group',
              count_eventType: '$eventType_count',
            },
          },
          count: { $sum: '$eventType_count' },
        },
      },
      {
        $project: {
          _id: 0,
          year: { $toInt: { $substrCP: ['$_id', 0, 4] } },
          month_int: { $toInt: { $substrCP: ['$_id', 5, 2] } },
          month_name: {
            $arrayElemAt: [
              monthsArray,
              {
                $subtract: [{ $toInt: { $substrCP: ['$_id', 5, 2] } }, 1],
              },
            ],
          },
          count_all_event: '$count',
          eventType_activity: '$log',
        },
      },
      {
        $sort: { month_int: 1 },
      },
    ]).exec();
    return GetCount;
  }

  async findcontent() {
    const query = await this.ContenteventsModel.aggregate([

      {
        $lookup: {
          from: 'contentevents',
          localField: 'contentevents.$id',
          foreignField: '_id',
          as: 'roless',
        },
      }, {
        $out: {
          db: 'hyppe_trans_db',
          coll: 'contentevents2'
        }
      },

    ]);
    return query;
  }

  async friend(email: string, head: any) {
    const query = await this.ContenteventsModel.aggregate([
      {
        "$match": {
          "$or": [
            {
              "eventType": "FOLLOWER"
            },
            {
              "eventType": "FOLLOWING"
            }
          ]
        }
      },
      {
        "$redact": {
          "$cond": [
            {
              "$eq": [
                "$senderParty",
                "$receiveParty"
              ]
            },
            "$$KEEP",
            "$$PRUNE"
          ]
        }
      },
      {
        "$match": {
          "event": "ACCEPT"
        }
      },
      {
        "$match": {
          "email": email
        }
      },
      {
        "$group": {
          "_id": "$receiverParty",
        }
      },
      {
        $project: {
          _id: 0,
          friend: '$_id',
        },
      },
    ]);
    return query;
  }

  async ceckFriendFollowingFollower(email1: string, email2: string) {
    const query = await this.ContenteventsModel.aggregate([
      {
        "$match": {
          "$or": [
            {
              "$and": [
                {
                  "eventType": "FOLLOWER"
                },
                {
                  "receiverParty": email2
                },
                {
                  "email": email1
                },
                {
                  "event": "ACCEPT"
                }
              ]
            },
            {
              "$and": [
                {
                  "eventType": "FOLLOWING"
                },
                {
                  "senderParty": email1
                },
                {
                  "email": email2
                },
                {
                  "event": "ACCEPT"
                }
              ]
            }
          ],
        }
      }
    ]);
    return query;
  }

  async findByCriteria(email: string, PostID: string, EventType: string, Events: string[], pageRow: number, pageNumber: number): Promise<Contentevents[]> {
    var Where = {}
    var Or = []
    Object.assign(Where, { email: email });
    if (PostID != "") {
      Object.assign(Where, { postID: PostID });
    }
    if (EventType != "") {
      Object.assign(Where, { eventType: EventType });
    }
    if (Events.length > 0) {
      for (let i = 0; i < Events.length; i++) {
        if (Events[i] == "INITIAL") {
          Or.push({ event: Events[i] }, { $and: [{ flowIsDone: false }] })
        } else if (Events[i] == "REQUEST") {
          Or.push({ event: Events[i] }, { $and: [{ flowIsDone: false }] })
        } else {
          Or.push({ event: Events[i] }, { $and: [{ flowIsDone: true }] })
        }
      }
    }
    if (Object.keys(Or).length > 0) {
      Object.assign(Where, { $or: Or });
    } else {
      Object.assign(Where);
    }

    var sort = null;
    if (EventType != "") {
      if (EventType == "FOLLOWING" || EventType == "FOLLOWER") {
        sort = { sequenceNumber: 1, updatedAt: -1 }
      } else {
        sort = { postType: 1, updatedAt: -1 }
      }
    } else {
      sort = { postType: 1, updatedAt: -1 }
    }
    const query = this.ContenteventsModel.find(Where)
      .limit(pageRow)
      .skip(pageRow * pageNumber).sort(sort);
    return query;
  }

  async findfriend(email: string) {

    let query = await this.ContenteventsModel.aggregate(

      [
        {
          "$match": {
            "$or": [
              {
                "$and": [
                  {
                    "eventType": "FOLLOWING"
                  },
                  {
                    "senderParty": email
                  }
                ]
              },
              {
                "$and": [
                  {
                    "eventType": "FOLLOWER"
                  },
                  {
                    "receiverParty": email
                  }
                ]
              }
            ]
          }
        },
        {
          "$lookup": {
            from: "userauths",
            localField: "email",
            foreignField: "email",
            as: "nameUser"
          }
        },
        {
          "$lookup": {
            from: "userbasics",
            localField: "email",
            foreignField: "email",
            as: "userBasic"
          }
        },



        {
          "$group": {
            "_id": {
              "friend": "$email",
              "username": "$nameUser.username",

            },
            "count": {
              "$sum": 1.0
            }
          }
        },
        {
          "$match": {
            "count": {
              "$gt": 1.0
            }
          }
        },
        {
          "$project": {
            "email": 1.0
          }
        }
      ],
      {
        "allowDiskUse": true
      }
    );

    return query;
  }

  async ceckData(email: String, eventType: String, event: String, receiverParty: String, senderParty: String, postID: String): Promise<Contentevents> {
    let query = this.ContenteventsModel.findOne();
    query.where('email', email);
    query.where('eventType', eventType);
    query.where('event', event);
    if (senderParty != "") {
      query.where('senderParty', senderParty);
    }
    if (receiverParty != "") {
      query.where('receiverParty', receiverParty);
    }
    if (postID != "") {
      query.where('postID', postID);
    }
    return query.exec();
  }

  async updateUnlike(email: string, eventType: string, event: string, postID: string) {
    this.ContenteventsModel.updateOne(
      {
        email: email,
        eventType: eventType,
        postID: postID,
        event: event,
      },
      { active: false },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateUnFollowing(email: string, eventType: string, receiverParty: string) {
    this.ContenteventsModel.updateOne(
      {
        email: email,
        eventType: eventType,
        senderParty: receiverParty,
        event: "ACCEPT"
      },
      { active: false },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateUnFollower(email: string, eventType: string, receiverParty: string) {
    this.ContenteventsModel.updateOne(
      {
        email: email,
        eventType: eventType,
        receiverParty: receiverParty,
        event: "ACCEPT"
      },
      { active: false },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }
}
