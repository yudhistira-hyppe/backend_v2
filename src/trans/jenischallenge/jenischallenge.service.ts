import { Injectable } from '@nestjs/common';
import { CreateJenischallengeDto } from './dto/create-jenischallenge.dto';
import { Model, mongo } from 'mongoose';
import { jenisChallenge, jenisChallengeDocument } from './schemas/jenischallenge.schema';
import { InjectModel } from '@nestjs/mongoose';
import { pipe } from 'rxjs';

@Injectable()
export class JenischallengeService {
  constructor(
    @InjectModel(jenisChallenge.name, 'SERVER_FULL')
    private readonly dataModel: Model<jenisChallengeDocument>,
  ){ }

  async create(createJenischallengeDto: CreateJenischallengeDto) {
    var data = await this.dataModel.create(createJenischallengeDto);
    return data;
  }

  async findAll(): Promise<jenisChallenge[]> {
    return this.dataModel.find().exec();
  }

  async findOne(id: string) {
    var mongoose = require('mongoose');
    var convert = mongoose.Types.ObjectId(id);
    return this.dataModel.find({ _id:convert }).exec();
  }

  async update(id: string, createJenischallengeDto: CreateJenischallengeDto) {
    var mongoose = require('mongoose');
    var convert = mongoose.Types.ObjectId(id);
    var data = await this.dataModel.updateOne(
      {
        _id:convert
      },
      {
        "$set":
        {
          "name":createJenischallengeDto.name,
          "description":createJenischallengeDto.description,
        }
      }
    );

    return data
  }

  async detailAll(search:string, page:number, limit:number)
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
                "description":
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

  async remove(id: string) {
    return `This action removes a #${id} jenischallenge`;
  }
}
