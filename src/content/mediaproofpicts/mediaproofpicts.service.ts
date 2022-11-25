import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMediaproofpictsDto } from './dto/create-mediaproofpicts.dto';
import { Mediaproofpicts, MediaproofpictsDocument } from './schemas/mediaproofpicts.schema';

@Injectable()
export class MediaproofpictsService {
  constructor(
    @InjectModel(Mediaproofpicts.name, 'SERVER_FULL')
    private readonly MediaproofpictsModel: Model<MediaproofpictsDocument>,
  ) { }

  async create(
    CreateMediaproofpictsDto: CreateMediaproofpictsDto,
  ): Promise<Mediaproofpicts> {
    const createMediaproofpictsDto = await this.MediaproofpictsModel.create(
      CreateMediaproofpictsDto,
    );
    return createMediaproofpictsDto;
  }

  async findAll(): Promise<Mediaproofpicts[]> {
    return this.MediaproofpictsModel.find().exec();
  }

  async findOne(id: string): Promise<Mediaproofpicts> {
    return this.MediaproofpictsModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.MediaproofpictsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  async updatebyId(id: string, CreateMediaproofpictsDto_: CreateMediaproofpictsDto) {
    this.MediaproofpictsModel.updateOne(
      {
        _id: id,
      },
      CreateMediaproofpictsDto_,
      function (err, docs) {
        if (err) {
          //console.log(err);
        } else {
          //console.log(docs);
        }
      },
    );
  }

  async listkyc(keys: string, status: any[], startdate: string, enddate: string, descending: boolean, page: number, limit: number) {
    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }

    var order = null;

    if (descending === true) {
      order = -1;
    } else {
      order = 1;
    }
    var pipeline = [];

    pipeline.push(
      {
        $lookup: {
          from: 'userbasics',
          localField: '_id',
          foreignField: 'proofPict.$id',
          as: 'basicdata',

        }
      },
      {
        $unwind: "$basicdata"
      },
      {
        $project: {
          email: '$basicdata.email',
          profilepictid: '$basicdata.profilePict.$id',
          fullName: '$basicdata.fullName',
          userAuth_id: '$basicdata.userAuth.$id',
          createdAt: 1,
          status: 1,
          idcardnumber: 1
        }
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
        $addFields: {


          'auth': {
            $arrayElemAt: ['$userAuth_data', 0]
          },

        }
      },
      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilepictid',
          foreignField: '_id',
          as: 'profilePict_data',

        }
      },

      {
        $project: {
          email: 1,
          username: '$auth.username',
          createdAt: 1,
          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          status: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$status",
                      "IN_PROGGRESS"
                    ]
                  },
                  then: "BARU"
                },
                {
                  case: {
                    $eq: [
                      "$status",
                      "FAILED"
                    ]
                  },
                  then: "DITOLAK"
                },
                {
                  case: {
                    $eq: [
                      "$status",
                      "FINISH"
                    ]
                  },
                  then: "DISETUJUI"
                },
              ],
              default: ""
            }
          },
          idcardnumber: 1,
          jumlahPermohonan: "1",
          tahapan: "KTP",


        }
      },
      {
        $addFields: {

          concat: '/profilepict',
          pict: {
            $replaceOne: {
              input: "$profilpict.mediaUri",
              find: "_0001.jpeg",
              replacement: ""
            }
          },

        },

      },
      {
        $project: {
          email: 1,
          username: '$auth.username',
          createdAt: 1,
          status: 1,
          idcardnumber: 1,
          jumlahPermohonan: "1",
          tahapan: "KTP",
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: {
              $concat: ["$concat", "/", "$pict"]
            },

          },

        }
      },
      {
        $match: {
          $and: [
            {

              status: {
                $ne: null
              }
            },
            {

              status: {
                $ne: ""
              }
            },

          ]
        }
      },);

    if (keys && keys !== undefined) {
      pipeline.push({
        $match: {

          username: {
            $regex: keys, $options: 'i'
          },
        }
      });
    }
    if (status && status !== undefined) {

      pipeline.push(
        {
          $match: {
            $or: [
              {
                status: {
                  $in: status
                }
              },

            ]
          }
        });
    }

    if (startdate && startdate !== undefined) {

      pipeline.push({ $match: { createdAt: { "$gte": startdate } } });

    }
    if (enddate && enddate !== undefined) {

      pipeline.push({ $match: { createdAt: { "$lte": dateend } } });

    }

    pipeline.push({
      $sort: {
        createdAt: order
      },

    });

    if (page > 0) {
      pipeline.push({ $skip: (page * limit) });
    }
    if (limit > 0) {
      pipeline.push({ $limit: limit });
    }
    let query = await this.MediaproofpictsModel.aggregate(pipeline);

    return query;

  }

  // async findmediaproofpicts() {
  //   const query = await this.MediaproofpictsModel.aggregate([

  //     {
  //       $lookup: {
  //         from: 'mediaproofpicts',
  //         localField: 'mediaproofpicts.$id',
  //         foreignField: '_id',
  //         as: 'mediaproofpicts2',
  //       },
  //     }, {
  //       $out: {
  //         db: 'hyppe_trans_db',
  //         coll: 'mediaproofpicts2'
  //       }
  //     },

  //   ]);
  //   return query;
  // }


}
