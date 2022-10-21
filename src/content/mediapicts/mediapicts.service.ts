import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMediapictsDto } from './dto/create-mediapicts.dto';
import { Mediapicts, MediapictsDocument } from './schemas/mediapicts.schema';

@Injectable()
export class MediapictsService {
  constructor(
    @InjectModel(Mediapicts.name, 'SERVER_FULL')
    private readonly MediapictsModel: Model<MediapictsDocument>,
  ) { }

  async create(CreateMediapictsDto: CreateMediapictsDto): Promise<Mediapicts> {
    const createMediapictsDto = await this.MediapictsModel.create(
      CreateMediapictsDto,
    );
    return createMediapictsDto;
  }

  async findAll(): Promise<Mediapicts[]> {
    return this.MediapictsModel.find().exec();
  }

  async findOne(id: string): Promise<Mediapicts> {
    return this.MediapictsModel.findOne({ _id: id }).exec();
  }

  async findOnepostID(id: string): Promise<Mediapicts> {
    return this.MediapictsModel.findOne({ postID: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.MediapictsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  // async findpict() {
  //   const query = await this.MediapictsModel.aggregate([

  //     {
  //       $lookup: {
  //         from: 'mediapicts',
  //         localField: 'mediapicts.$id',
  //         foreignField: '_id',
  //         as: 'roless',
  //       },
  //     }, {
  //       $out: {
  //         db: 'hyppe_trans_db',
  //         coll: 'mediapicts2'
  //       }
  //     },

  //   ]);
  //   return query;
  // }

  async findtotalpostmediapict(date: string) {

    var currentdate = new Date(new Date(date).setDate(new Date(date).getDate() + 1));
    var before = new Date(new Date(date).setDate(new Date(date).getDate() - 7));

    var stdate = currentdate.toISOString();
    var beforedate = before.toISOString();

    var substrdate = stdate.substring(0, 10);
    var subbefore = beforedate.substring(0, 10);
    console.log(subbefore);

    const query = await this.MediapictsModel.aggregate([

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
}
