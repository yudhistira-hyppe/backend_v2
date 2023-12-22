import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateTemplatesDto } from './dto/create-templates.dto';
import { Templates, TemplatesDocument } from './schemas/templates.schema';
import { Types } from 'aws-sdk/clients/lightsail';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectModel(Templates.name, 'SERVER_FULL')
    private readonly TemplatesModel: Model<TemplatesDocument>,
  ) { }

  async create(CreateTemplatesDto: CreateTemplatesDto): Promise<Templates> {
    const createTemplatesDto = await this.TemplatesModel.create(
      CreateTemplatesDto,
    );
    return createTemplatesDto;
  }

  async findAll(): Promise<Templates[]> {
    return this.TemplatesModel.find().exec();
  }
  async updateNonactive(id: string): Promise<Object> {
    let data = await this.TemplatesModel.updateOne({ "_id": id },
      {
        $set: {
          "active": false
        }
      });
    return data;
  }

  async findOneByTypeAndCategory(type: string, category: string): Promise<Templates> {
    return this.TemplatesModel.findOne({
      type: type,
      category: category,
    }).exec();
  }

  async findOne(id: string): Promise<Templates> {
    return this.TemplatesModel.findOne({ _id: id }).exec();
  }

  async findOne2(id: string): Promise<Templates> {
    var mongo = require('mongoose');
    var konvertid = mongo.Types.ObjectId(id);

    var query = await this.TemplatesModel.aggregate([
      {
          "$match":
          {
              "$expr":
              {
                  "$eq":
                  [
                      "$_id", konvertid 
                  ]
              }
          }
      },
      {
          "$project":
          {
              _id: 1,
              name: 1,
              event: 1,
              subject: 1,
              body_detail: 1,
              body_detail_id: 1,
              type: 1,
              category: 1,
              action_buttons: 1,
              subject_id: 1,
              email: 1,
              createdAt: 1,
              active: 1,
              type_sending:1
          }
      },
      {
          $lookup:
          {
              from: 'userbasics',
              localField: 'email',
              foreignField: 'email',
              as: 'basic_data',
          }
      },
      {
          "$project":
          {
              _id: 1,
              name: 1,
              event: 1,
              subject: 1,
              body_detail: 1,
              body_detail_id: 1,
              type: 1,
              category: 1,
              action_buttons: 1,
              subject_id: 1,
              email: 1,
              createdAt: 1,
              active: 1,
              type_sending:1,
              fullName:
              {
                  "$ifNull":
                  [
                      {
                      "$arrayElemAt":
                          [
                          "$basic_data.fullName", 0
                          ]
                      },
                      null
                  ]
              }
          }
      },
    ]);

    return query[0];

    //return this.TemplatesModel.findOne({ _id: id }).exec();
  }

  // async delete(id: string) {
  //   var mongo = require('mongoose');
  //   var konvertid = mongo.Types.ObjectId(id);

  //   var data = await this.TemplatesModel.updateOne(
  //     {
  //       "_id":id
  //     },
  //     {
  //       "$set":
  //       {
  //         "active":false
  //       }
  //     },
  //   );

  //   return data;

  // let data = await this.interestCountModel.findByIdAndUpdate(
  //         id,
  //         tagCountDto,
  //         { new: true },
  //     );

  //     if (!data) {
  //         throw new Error('Todo is not found!');
  //     }
  //     return data;
  // }

  async pushnotif_listing(target: string, start: string, end: string, sorting: boolean, page: number, limit: number) {
    var pipeline = [];

    pipeline.push({
      "$match":
      {
        "$and":
          [
            {
              "$expr":
              {
                "$eq":
                  [
                    "$name", "PUSH_NOTIFICATION"
                  ]
              }
            },
            {
              "$expr":
              {
                "$eq":
                  [
                    "$active", true
                  ]
              }
            },
          ]
      }
    },
      {
        $lookup:
        {
          from: 'userbasics',
          localField: 'email',
          foreignField: 'email',
          as: 'basic_data',
        }
      },
      {
        "$project":
        {
          _id: 1,
          name: 1,
          event: 1,
          subject: 1,
          subject_id: 1,
          body_detail: 1,
          body_detail_id: 1,
          email: 1,
          createdAt: 1,
          fullName:
          {
            "$arrayElemAt":
              [
                "$basic_data.fullName", 0
              ]
          },
        }
      },);

    var firstmatch = [];
    if (start != null) {
      firstmatch.push({
        "$expr":
        {
          "$gte":
            [
              "$createdAt",
              start
            ]
        }
      },
        {
          "$expr":
          {
            "$lte":
              [
                "$createdAt",
                end
              ]
          }
        },)
    }

    if (target != null) {
      firstmatch.push(
        {
          "$or":
            [
              {
                subject:
                {
                  "$regex": target,
                  "$options": "i"
                }
              },
              {
                subject_id:
                {
                  "$regex": target,
                  "$options": "i"
                }
              }
            ]
        }
      );
    }

    if (firstmatch.length != 0) {
      pipeline.push(
        {
          "$match":
          {
            "$and": firstmatch
          }
        }
      );
    }

    if (sorting != null) {
      var setascending = null;
      if (sorting == true) {
        setascending = 1;
      }
      else {
        setascending = -1;
      }

      pipeline.push({
        "$sort":
        {
          "createdAt": setascending
        }
      });
    }

    if (page > 0) {
      pipeline.push({
        "$skip": limit * page
      });
    }

    if (limit > 0) {
      pipeline.push({
        "$limit": limit
      });
    }

    var query = await this.TemplatesModel.aggregate(pipeline);
    return query;
  }

  async pushnotif_listing2(target: string, start: string, end: string, sorting: boolean, page: number, limit: number) {
    var pipeline = [];

    pipeline.push({
      "$match":
      {
        "$and":
          [
            {
              "$expr":
              {
                "$eq":
                  [
                    "$name", "PUSH_NOTIFICATION"
                  ]
              }
            },
            {
              "$expr":
              {
                "$eq":
                  [
                    "$active", true
                  ]
              }
            },
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
        }
      },
      {
        "$project":
        {
          _id: 1,
          name: 1,
          event: 1,
          subject: 1,
          subject_id: 1,
          body_detail: 1,
          body_detail_id: 1,
          email: 1,
          createdAt: 1,
          fullName:
          {
            "$arrayElemAt":
              [
                "$basic_data.fullName", 0
              ]
          },
        }
      },);

    var firstmatch = [];
    if (start != null) {
      firstmatch.push({
        "$expr":
        {
          "$gte":
            [
              "$createdAt",
              start
            ]
        }
      },
        {
          "$expr":
          {
            "$lte":
              [
                "$createdAt",
                end
              ]
          }
        },)
    }

    if (target != null) {
      firstmatch.push(
        {
          "$or":
            [
              {
                subject:
                {
                  "$regex": target,
                  "$options": "i"
                }
              },
              {
                subject_id:
                {
                  "$regex": target,
                  "$options": "i"
                }
              }
            ]
        }
      );
    }

    if (firstmatch.length != 0) {
      pipeline.push(
        {
          "$match":
          {
            "$and": firstmatch
          }
        }
      );
    }

    if (sorting != null) {
      var setascending = null;
      if (sorting == true) {
        setascending = 1;
      }
      else {
        setascending = -1;
      }

      pipeline.push({
        "$sort":
        {
          "createdAt": setascending
        }
      });
    }

    if (page > 0) {
      pipeline.push({
        "$skip": limit * page
      });
    }

    if (limit > 0) {
      pipeline.push({
        "$limit": limit
      });
    }

    var query = await this.TemplatesModel.aggregate(pipeline);
    return query;
  }
}
