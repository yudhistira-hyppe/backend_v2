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

  async findByOssName(text: string): Promise<Mediaproofpicts[]> {
    const ndto = await this.MediaproofpictsModel.find({ 'SelfiefsSourceUri': { $regex: text, $options: 'i' } }).exec();
    return ndto;
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
    pipeline.push({
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
          idcardnumber: 1,
          kycHandle: 1
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
                  then: "BYSYSTEM"
                },
                {
                  case: {
                    $eq: [
                      "$status",
                      "DISETUJUI"
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
          kycHandle: 1


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
          username: 1,
          createdAt: 1,
          status: 1,
          idcardnumber: 1,
          jumlahPermohonan: "1",
          tahapan: "KTP",
          kycHandle: 1,
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: {
              $concat: ["$concat", "/", "$profilpict.mediaID"]
            },

          },

        }
      },
    );

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

    if (page > 0) {
      pipeline.push({ $skip: (page * limit) });
    }
    if (limit > 0) {
      pipeline.push({ $limit: limit });
    }

    let query = await this.MediaproofpictsModel.aggregate(pipeline);

    return query;

  }

  async detailkyc(id: string) {
    var query = await this.MediaproofpictsModel.aggregate([
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
          insight_id: '$basicdata.insight.$id',
          isIdVerified: '$basicdata.isIdVerified',
          profilepictid: '$basicdata.profilePict.$id',
          countries_id: '$basicdata.countries.$id',
          cities_id: '$basicdata.cities.$id',
          areas_id: '$basicdata.states.$id',
          fsSourceUri: 1,
          mediaUri: 1,
          SelfiefsSourceUri: 1,
          mediaSelfieUri: 1,
          SupportfsSourceUri: 1,
          mediaSupportUri: 1,
          fullName: '$basicdata.fullName',
          userAuth_id: '$basicdata.userAuth.$id',
          createdAt: 1,
          status: 1,
          idcardnumber: 1,
          tglLahir: {
            "$cond":
            {
              if:
              {
                "$or":
                [
                  {
                    "$eq":
                    [
                      "$tglLahir", null
                    ]
                  },
                  {
                    "$eq":
                    [
                      "$tglLahir", ""
                    ]
                  }
                ]
              },
              then:"$basicdata.dob",
              else:"$tglLahir"
            }
          },
          nama: 1,
          tempatLahir: 1,
          jenisKelamin: 1,
          alamat: 1,
          agama: 1,
          statusPerkawinan: 1,
          pekerjaan: 1,
          kewarganegaraan: 1,
          mobileNumber: '$basicdata.mobileNumber',

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
          from: 'countries',
          localField: 'countries_id',
          foreignField: '_id',
          as: 'countries_data',

        },

      },
      {
        $lookup: {
          from: 'cities',
          localField: 'cities_id',
          foreignField: '_id',
          as: 'cities_data',

        },

      },
      {
        $lookup: {
          from: 'areas',
          localField: 'areas_id',
          foreignField: '_id',
          as: 'areas_data',

        },

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
        $lookup: {
          from: 'insights',
          localField: 'insight_id',
          foreignField: '_id',
          as: 'insight_data',
        },
      },
      {
        $addFields: {

          insights: { $arrayElemAt: ['$insight_data', 0] },
          citi: {
            $arrayElemAt: ['$cities_data', 0]
          },
          countri: {
            $arrayElemAt: ['$countries_data', 0]
          },

          areas: {
            $arrayElemAt: ['$areas_data', 0]
          },
        },

      },
      {
        $project: {
          email: 1,
          insights: 1,
          isIdVerified: 1,
          username: '$auth.username',
          fullName: 1,
          countries: '$countri.country',
          area: '$areas.stateName',
          cities: '$citi.cityName',
          createdAt: 1,
          profilpict: {
            $arrayElemAt: ['$profilePict_data', 0]
          },
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
                  then: "BYSYSTEM"
                },
                {
                  case: {
                    $eq: [
                      "$status",
                      "DISETUJUI"
                    ]
                  },
                  then: "DISETUJUI"
                },
              ],
              default: ""
            }
          },
          tglLahir: 1,
          idcardnumber: 1,
          jumlahPermohonan: "1",
          tahapan: "KTP",
          nama: 1,
          tempatLahir: 1,
          jenisKelamin: 1,
          alamat: 1,
          agama: 1,
          statusPerkawinan: 1,
          pekerjaan: 1,
          kewarganegaraan: 1,
          fsSourceUri: 1,
          mediaUri: 1,
          SelfiefsSourceUri: 1,
          mediaSelfieUri: 1,
          SupportfsSourceUri: 1,
          mediaSupportUri: 1,
          mobileNumber: 1,

          statusUser: {
            $cond: {
              if: {
                $or: [{
                  $eq: ["$isIdVerified", null]
                }, {
                  $eq: ["$isIdVerified", ""]
                }, {
                  $eq: ["$isIdVerified", []]
                }, {
                  $eq: ["$isIdVerified", false]
                }]
              },
              then: "BASIC",
              else: "PREMIUM"
            },

          },

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
          isIdVerified: 1,
          username: 1,
          fullName: 1,

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
              $concat: ["$concat", "/", "$profilpict.mediaID"]
            },

          },
          nama: 1,
          tglLahir: 1,
          tempatLahir: 1,
          jenisKelamin: 1,
          alamat: 1,
          agama: 1,
          statusPerkawinan: 1,
          pekerjaan: 1,
          kewarganegaraan: 1,
          statusUser: 1,
          insight: {

            followers: '$insights.followers',

            followings: '$insights.followings'
          },
          fsSourceUri: 1,
          SelfiefsSourceUri: 1,
          SupportfsSourceUri: 1,
          mediaSelfieUri: 1,
          mediaUri: 1,
          mediaSupportUri: 1,
          mobileNumber: 1,
          countries: 1,
          area: 1,
          cities: 1,
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

          ],
          _id: id
        }
      },



    ]);

    return query;
  }
  async updateKyc(id: string, noktp: string, nama: string, tglLahir: String, tempatLahir: String, jenisKelamin: string, status: string, kycHandle: any[]): Promise<Object> {
    let data = await this.MediaproofpictsModel.updateOne({ "_id": id },
      { $set: { "idcardnumber": noktp, "nama": nama, "tglLahir": tglLahir, "tempatLahir": tempatLahir, "jenisKelamin": jenisKelamin, "status": status, "kycHandle": kycHandle } });
    return data;
  }

  async finduser(id: string) {
    var query = await this.MediaproofpictsModel.aggregate([
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


        }
      },

      {
        $match: {

          _id: id
        }
      },

    ]);
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

  async listkycsummary(startdate: string, enddate: string) {
    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }

    var pipeline = [];
    pipeline.push({
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

    if (startdate && startdate !== undefined) {

      pipeline.push({ $match: { createdAt: { "$gte": startdate } } });

    }
    if (enddate && enddate !== undefined) {

      pipeline.push({ $match: { createdAt: { "$lte": dateend } } });

    }

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
          idcardnumber: 1,
          kycHandle: 1
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
                  then: "BYSYSTEM"
                },
                {
                  case: {
                    $eq: [
                      "$status",
                      "DISETUJUI"
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
          kycHandle: 1


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
          username: 1,
          createdAt: 1,
          status: 1,
          idcardnumber: 1,
          jumlahPermohonan: "1",
          tahapan: "KTP",
          kycHandle: 1,
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
        $group: {
          _id: '$status',
          myCount: {
            $sum: 1
          },

        }
      },
    );


    let query = await this.MediaproofpictsModel.aggregate(pipeline);

    return query;

  }

  async listkycsummary2(startdate: string, enddate: string) {
    var pipeline = [];
    
    var firstmatch = [];
    firstmatch.push(
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
    );

    if(startdate != null && enddate != null)
    {
      firstmatch.push(
        { 
          createdAt: 
          { 
            "$gte": startdate 
          } 
        },
        { 
          createdAt: 
          { 
            "$lte": enddate 
          } 
        }
      );
    }

    pipeline.push(
      {
        "$project":
        {
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
                  then: "BYSYSTEM"
                },
                {
                  case: {
                    $eq: [
                      "$status",
                      "DISETUJUI"
                    ]
                  },
                  then: "DISETUJUI"
                },
              ],
              default: ""
            }
          },
        }
      },
      {
        $group: {
          _id: '$status',
          myCount: {
            $sum: 1
          },

        }
      },
    );

    var query = await this.MediaproofpictsModel.aggregate(pipeline);
    return query;

  }

}
