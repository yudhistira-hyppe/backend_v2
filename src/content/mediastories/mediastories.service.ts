import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMediastoriesDto } from './dto/create-mediastories.dto';
import { Mediastories, MediastoriesDocument } from './schemas/mediastories.schema';

@Injectable()
export class MediastoriesService {
  constructor(
    @InjectModel(Mediastories.name, 'SERVER_FULL')
    private readonly MediastoriesModel: Model<MediastoriesDocument>,
  ) { }

  async create(
    CreateMediastoriesDto: CreateMediastoriesDto,
  ): Promise<Mediastories> {
    const createMediastoriesDto = await this.MediastoriesModel.create(
      CreateMediastoriesDto,
    );
    return createMediastoriesDto;
  }

  async findAll(): Promise<Mediastories[]> {
    return this.MediastoriesModel.find().exec();
  }

  async findOne(id: string): Promise<Mediastories> {
    return this.MediastoriesModel.findOne({ _id: id }).exec();
  }

  async findOnepostID(id: string): Promise<Mediastories> {
    return this.MediastoriesModel.findOne({ postID: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.MediastoriesModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  async findtotalpostmediastories(date: string) {

    var currentdate = new Date(new Date(date).setDate(new Date(date).getDate() + 1));
    var before = new Date(new Date(date).setDate(new Date(date).getDate() - 7));

    var stdate = currentdate.toISOString();
    var beforedate = before.toISOString();

    var substrdate = stdate.substring(0, 10);
    var subbefore = beforedate.substring(0, 10);
    console.log(subbefore);

    const query = await this.MediastoriesModel.aggregate([

      {
        "$match": {
          "createdAt": {
            "$gte": subbefore, "$lte": substrdate

          }
        }
      },
      {
        $group: {
          _id: {
            tanggal: {
              $substrCP: [
                "$createdAt",
                0,
                10
              ]
            }
          },
          totalpost: {
            $sum: 1
          }
        }
      }, {
        $project: {
          _id: 0,
          date: "$_id.tanggal",
          totalpost: 1,

        }
      }, {
        $sort: {
          date: - 1
        }
      },

    ]);
    return query;
  }

  async findstories() {
    const query = await this.MediastoriesModel.aggregate([

      {
        $lookup: {
          from: 'mediastories',
          localField: 'mediastories.$id',
          foreignField: '_id',
          as: 'roless',
        },
      }, {
        $out: {
          db: 'hyppe_trans_db',
          coll: 'mediastories2'
        }
      },

    ]);
    return query;
  }
}
