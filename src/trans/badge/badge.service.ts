import { Injectable } from '@nestjs/common';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, mongo } from 'mongoose';
import { badge, badgeDocument } from './schemas/badge.schema';

@Injectable()
export class BadgeService {
  constructor(
    @InjectModel(badge.name, 'SERVER_FULL')
    private readonly dataModel: Model<badgeDocument>,
  ){ }

  async create(createBadgeData: CreateBadgeDto) {
    var data = await this.dataModel.create(createBadgeData);

    return data;
  }

  async findAll() {
    var data = await this.dataModel.find().exec();

    return data;
  }

  async detailAll(search: string, page:number, limit:number)
  {
    var pipeline = [];

    if(search != null && search != undefined)
    {
      pipeline.push(
        {
          "$match":
          {
            "$or":
            [
              {
                "name":
                {
                  "$regex":search,
                  "$options":"i"
                }
              },
              {
                "type":
                {
                  "$regex":search,
                  "$options":"i"
                }
              },
            ]
          }
        }
      );
    }

    if(page > 0)
    {
        pipeline.push({
            "$skip":limit * page
        });
    }

    if(limit > 0)
    {
        pipeline.push({   
            "$limit":limit
        });
    }

    var query = await this.dataModel.aggregate(pipeline);

    return query;
  }

  async findOne(id: string) {
    var mongoose = require('mongoose');
    var convert = mongoose.Types.ObjectId(id);
    return await this.dataModel.findOne({ _id : convert }).exec();
  }

  async update(id: string, createBadgeData: CreateBadgeDto) {
    var mongoose = require('mongoose');
    var convert = mongoose.Types.ObjectId(id);
    
    return await this.dataModel.updateOne(
      {
        _id:convert
      },
      {
        "$set":
        {
          "name":createBadgeData.name,
          "type":createBadgeData.type,
          "badgeProfile":createBadgeData.badgeProfile,
          "badgeOther":createBadgeData.badgeOther,
        }
      }
    );
  }

  // async remove(id: number) {
  //   return `This action removes a #${id} badge`;
  // }
}
