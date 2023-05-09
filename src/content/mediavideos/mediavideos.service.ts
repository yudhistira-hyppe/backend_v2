import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMediavideosDto } from './dto/create-mediavideos.dto';
import { Mediavideos, MediavideosDocument } from './schemas/mediavideos.schema';

@Injectable()
export class MediavideosService {
  constructor(
    @InjectModel(Mediavideos.name, 'SERVER_FULL')
    private readonly MediavideosModel: Model<MediavideosDocument>,
  ) { }

  async create(
    CreateMediavideosDto: CreateMediavideosDto,
  ): Promise<Mediavideos> {
    const createMediavideosDto = await this.MediavideosModel.create(
      CreateMediavideosDto,
    );
    return createMediavideosDto;
  }

  //async update(CreateMediavideosDto: CreateMediavideosDto): Promise<Mediavideos> {
  //  const createMediavideosDto = await this.MediavideosModel.updateOne(CreateMediavideosDto);
  //  return createMediavideosDto;
  //}  

  async findAll(): Promise<Mediavideos[]> {
    return this.MediavideosModel.find().exec();
  }

  async findOne(id: string): Promise<Mediavideos> {
    return this.MediavideosModel.findOne({ _id: id }).exec();
  }

  async findByIds(ids: string[]): Promise<Mediavideos[]> {
    return this.MediavideosModel.find().where('_id').in(ids).exec();
  }

  async findOnepostID(id: string): Promise<Mediavideos> {
    return this.MediavideosModel.findOne({ postID: id }).exec();
  }

  async updatebyId(id: string, Mediavideos_: Mediavideos) {
    this.MediavideosModel.updateOne(
      {
        _id: id,
      },
      Mediavideos_,
      function (err, docs) {
        if (err) {
          //console.log(err);
        } else {
          //console.log(docs);
        }
      },
    );
  }

  async delete(id: string) {
    const deletedCat = await this.MediavideosModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  // async findvideo() {
  //   const query = await this.MediavideosModel.aggregate([

  //     {
  //       $lookup: {
  //         from: 'mediavideos',
  //         localField: 'mediavideos.$id',
  //         foreignField: '_id',
  //         as: 'roless',
  //       },
  //     }, {
  //       $out: {
  //         db: 'hyppe_trans_db',
  //         coll: 'mediavideos2'
  //       }
  //     },

  //   ]);
  //   return query;
  // }

  async findtotalpostmediavid(date: string) {

    var currentdate = new Date(new Date(date).setDate(new Date(date).getDate() + 1));
    var before = new Date(new Date(date).setDate(new Date(date).getDate() - 7));

    var stdate = currentdate.toISOString();
    var beforedate = before.toISOString();

    var substrdate = stdate.substring(0, 10);
    var subbefore = beforedate.substring(0, 10);
    console.log(subbefore);

    const query = await this.MediavideosModel.aggregate([

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

  async getDataMediavideosSeaweed(): Promise<Mediavideos[]> {
    return await this.MediavideosModel.find({ apsaraId: { $eq: null }, mediaBasePath: { $ne: null } }).exec();
  }
}
