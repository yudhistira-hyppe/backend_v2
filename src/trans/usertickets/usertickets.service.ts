import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { CreateUserticketsDto } from './dto/create-usertickets.dto';
import { Usertickets, UserticketsDocument } from './schemas/usertickets.schema';
import { MediaprofilepictsService } from '../../content/mediaprofilepicts/mediaprofilepicts.service';
@Injectable()
export class UserticketsService {
  constructor(
    @InjectModel(Usertickets.name, 'SERVER_TRANS')
    private readonly userticketsModel: Model<UserticketsDocument>, private readonly mediaprofilepictsService: MediaprofilepictsService,

  ) { }

  async findAll(): Promise<Usertickets[]> {
    return this.userticketsModel.find().exec();
  }
  async update(IdUserticket: ObjectId, status: string): Promise<Object> {
    let data = await this.userticketsModel.updateOne({ "_id": IdUserticket },
      { $set: { "status": status } });
    return data;
  }

  async delete(IdUserticket: ObjectId): Promise<Object> {
    let data = await this.userticketsModel.updateOne({ "_id": IdUserticket },
      { $set: { "active": false } });
    return data;
  }

  async create(CreateUserticketsDto: CreateUserticketsDto): Promise<Usertickets> {
    let data = await this.userticketsModel.create(CreateUserticketsDto);

    if (!data) {
      throw new Error('Todo is not found!');
    }
    return data;
  }

  async retrieve(id: object): Promise<object> {
    const query = await this.userticketsModel.aggregate([
      {
        $lookup: {
          from: "userbasics",
          localField: "IdUser",
          foreignField: "_id",
          as: "userdata"
        }
      }, {
        $lookup: {
          from: "userticketdetails",
          localField: "_id",
          foreignField: "IdUserticket",
          as: "tiketdata"
        }
      },

      {
        $lookup: {
          from: "userbasics",
          localField: "tiketdata.IdUser",
          foreignField: "_id",
          as: "userbasics_data"
        }
      },
      {
        $project: {
          userdata: {
            $arrayElemAt: ['$userdata', 0]
          },
          profilpictid: '$userdata.profilePict.$id',
          replydata: "$tiketdata",
          userrequest: "$userdata.fullName",
          nomortiket: "$nomortiket",
          email: "$userdata.email",
          subject: "$subject",
          body: "$body",
          status: "$status",
          tipe: "$tipe",
          datetime: "$datetime"

        }
      },
      {
        $project: {

          profilpictid: '$userdata.profilePict.$id',
          nomortiket: "$nomortiket",
          userrequest: "$userdata.fullName",
          email: "$userdata.email",
          subject: "$subject",
          body: "$body",
          status: "$status",
          tipe: "$tipe",
          datetime: "$datetime",
          replydata: "$replydata"

        }
      },
      {
        $lookup: {
          from: 'mediaprofilepicts2',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',
        },
      },
      {
        $project: {
          profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
          nomortiket: "$nomortiket",
          userrequest: "$userrequest",
          email: "$email",
          subject: "$subject",
          body: "$body",
          status: "$status",
          tipe: "$tipe",
          datetime: "$datetime",
          replydata: "$replydata",
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },

        }
      },
      {
        $addFields: {

          concats: '/profilepict',
          pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

        },
      },

      {
        $project: {
          nomortiket: "$nomortiket",
          userrequest: "$userrequest",
          email: "$email",
          subject: "$subject",
          body: "$body",
          status: "$status",
          tipe: "$tipe",
          datetime: "$datetime",
          replydata: "$replydata",
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },

        }
      },
      { $match: { "_id": id } }
    ]);


    return query;
  }

  async searchdata(status: string, tipe: string, startdate: string, enddate: string, page: number, limit: number) {
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate()));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }
    if (startdate !== undefined && enddate !== undefined) {
      const query = await this.userticketsModel.aggregate([
        { "$match": { "status": status, "tipe": tipe, "active": true, "datetime": { $gte: startdate, $lte: dateend } } },
        { "$sort": { "datetime": -1 }, }, { "$skip": page }, { "$limit": limit },
        {
          $lookup: {
            from: "userbasics",
            localField: "IdUser",
            foreignField: "_id",
            as: "userdata"
          }
        }, {
          $lookup: {
            from: "userticketdetails",
            localField: "_id",
            foreignField: "IdUserticket",
            as: "tiketdata"
          }
        },

        {
          $lookup: {
            from: "userbasics",
            localField: "tiketdata.IdUser",
            foreignField: "_id",
            as: "userbasics_data"
          }
        },
        {
          $project: {
            userdata: {
              $arrayElemAt: ['$userdata', 0]
            },
            profilpictid: '$userdata.profilePict.$id',
            replydata: "$tiketdata",
            userrequest: "$userdata.fullName",
            nomortiket: "$nomortiket",
            email: "$userdata.email",
            subject: "$subject",
            body: "$body",
            status: "$status",
            tipe: "$tipe",
            datetime: "$datetime"

          }
        },
        {
          $project: {

            profilpictid: '$userdata.profilePict.$id',
            nomortiket: "$nomortiket",
            userrequest: "$userdata.fullName",
            email: "$userdata.email",
            subject: "$subject",
            body: "$body",
            status: "$status",
            tipe: "$tipe",
            datetime: "$datetime",
            replydata: "$replydata"

          }
        },
        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $project: {
            profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
            nomortiket: "$nomortiket",
            userrequest: "$userrequest",
            email: "$email",
            subject: "$subject",
            body: "$body",
            status: "$status",
            tipe: "$tipe",
            datetime: "$datetime",
            replydata: "$replydata",
            avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: '$profilpict.fsTargetUri',
              medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

            },

          }
        },
        {
          $addFields: {

            concats: '/profilepict',
            pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },
        },

        {
          $project: {
            nomortiket: "$nomortiket",
            userrequest: "$userrequest",
            email: "$email",
            subject: "$subject",
            body: "$body",
            status: "$status",
            tipe: "$tipe",
            datetime: "$datetime",
            replydata: "$replydata",
            avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


            },

          }
        },


      ]);
      return query;

    } else {
      const query = await this.userticketsModel.aggregate([

        { "$match": { "status": status, "tipe": tipe, "active": true } },
        { "$sort": { "datetime": -1 }, }, { "$skip": 0 }, { "$limit": 10 },
        {
          $lookup: {
            from: "userbasics",
            localField: "IdUser",
            foreignField: "_id",
            as: "userdata"
          }
        }, {
          $lookup: {
            from: "userticketdetails",
            localField: "_id",
            foreignField: "IdUserticket",
            as: "tiketdata"
          }
        },

        {
          $lookup: {
            from: "userbasics",
            localField: "tiketdata.IdUser",
            foreignField: "_id",
            as: "userbasics_data"
          }
        },
        {
          $project: {
            userdata: {
              $arrayElemAt: ['$userdata', 0]
            },
            profilpictid: '$userdata.profilePict.$id',
            replydata: "$tiketdata",
            userrequest: "$userdata.fullName",
            nomortiket: "$nomortiket",
            email: "$userdata.email",
            subject: "$subject",
            body: "$body",
            status: "$status",
            tipe: "$tipe",
            datetime: "$datetime"

          }
        },
        {
          $project: {

            profilpictid: '$userdata.profilePict.$id',
            nomortiket: "$nomortiket",
            userrequest: "$userdata.fullName",
            email: "$userdata.email",
            subject: "$subject",
            body: "$body",
            status: "$status",
            tipe: "$tipe",
            datetime: "$datetime",
            replydata: "$replydata"

          }
        },
        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $project: {
            profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
            nomortiket: "$nomortiket",
            userrequest: "$userrequest",
            email: "$email",
            subject: "$subject",
            body: "$body",
            status: "$status",
            tipe: "$tipe",
            datetime: "$datetime",
            replydata: "$replydata",
            avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: '$profilpict.fsTargetUri',
              medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

            },

          }
        },
        {
          $addFields: {

            concats: '/profilepict',
            pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },
        },

        {
          $project: {
            nomortiket: "$nomortiket",
            userrequest: "$userrequest",
            email: "$email",
            subject: "$subject",
            body: "$body",
            status: "$status",
            tipe: "$tipe",
            datetime: "$datetime",
            replydata: "$replydata",
            avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


            },

          }
        },

      ]);
      return query;
    }

  }
  async searchdataall(status: string, tipe: string) {
    const query = await this.userticketsModel.aggregate([
      { "$match": { "status": status, "tipe": tipe, "active": true } },
      { "$sort": { "datetime": -1 }, },
      {
        $lookup: {
          from: "userbasics",
          localField: "IdUser",
          foreignField: "_id",
          as: "userdata"
        }
      }, {
        $lookup: {
          from: "userticketdetails",
          localField: "_id",
          foreignField: "IdUserticket",
          as: "tiketdata"
        }
      },

      {
        $lookup: {
          from: "userbasics",
          localField: "tiketdata.IdUser",
          foreignField: "_id",
          as: "userbasics_data"
        }
      },
      {
        $project: {
          userdata: {
            $arrayElemAt: ['$userdata', 0]
          },
          replydata: "$tiketdata",
          userrequest: "$userdata.fullName",
          nomortiket: "$nomortiket",
          email: "$userdata.email",
          subject: "$subject",
          body: "$body",
          status: "$status",
          tipe: "$tipe",
          datetime: "$datetime"

        }
      },
      {
        $project: {


          nomortiket: "$nomortiket",
          userrequest: "$userdata.fullName",
          email: "$userdata.email",
          subject: "$subject",
          body: "$body",
          status: "$status",
          tipe: "$tipe",
          datetime: "$datetime",
          replydata: "$replydata"

        }
      },

    ]);


    return query;
  }


  async alldatatiket(tipe: string, startdate: string, enddate: string, page: number, limit: number) {
    const mediaprofil = await this.mediaprofilepictsService.findmediaprofil();
    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate()));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }
    if (startdate !== undefined && enddate !== undefined) {
      const query = await this.userticketsModel.aggregate([
        { "$match": { "tipe": tipe, "active": true, "datetime": { $gte: startdate, $lte: dateend } } },
        { "$sort": { "datetime": -1 }, }, { "$skip": page }, { "$limit": limit },
        {
          $lookup: {
            from: "userbasics",
            localField: "IdUser",
            foreignField: "_id",
            as: "userdata"
          }
        }, {
          $lookup: {
            from: "userticketdetails",
            localField: "_id",
            foreignField: "IdUserticket",
            as: "tiketdata"
          }
        },

        {
          $lookup: {
            from: "userbasics",
            localField: "tiketdata.IdUser",
            foreignField: "_id",
            as: "userbasics_data"
          }
        },
        {
          $project: {
            userdata: {
              $arrayElemAt: ['$userdata', 0]
            },
            profilpictid: '$userdata.profilePict.$id',
            replydata: "$tiketdata",
            userrequest: "$userdata.fullName",
            nomortiket: "$nomortiket",
            email: "$userdata.email",
            subject: "$subject",
            body: "$body",
            status: "$status",
            tipe: "$tipe",
            datetime: "$datetime"

          }
        },
        {
          $project: {

            profilpictid: '$userdata.profilePict.$id',
            nomortiket: "$nomortiket",
            userrequest: "$userdata.fullName",
            email: "$userdata.email",
            subject: "$subject",
            body: "$body",
            status: "$status",
            tipe: "$tipe",
            datetime: "$datetime",
            replydata: "$replydata"

          }
        },
        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $project: {
            profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
            nomortiket: "$nomortiket",
            userrequest: "$userrequest",
            email: "$email",
            subject: "$subject",
            body: "$body",
            status: "$status",
            tipe: "$tipe",
            datetime: "$datetime",
            replydata: "$replydata",
            avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: '$profilpict.fsTargetUri',
              medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

            },

          }
        },
        {
          $addFields: {

            concats: '/profilepict',
            pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },
        },

        {
          $project: {
            nomortiket: "$nomortiket",
            userrequest: "$userrequest",
            email: "$email",
            subject: "$subject",
            body: "$body",
            status: "$status",
            tipe: "$tipe",
            datetime: "$datetime",
            replydata: "$replydata",
            avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


            },

          }
        },



      ]);
      return query;

    } else {
      const query = await this.userticketsModel.aggregate([
        { "$match": { "tipe": tipe, "active": true } },
        { "$sort": { "datetime": -1 }, }, { "$skip": page }, { "$limit": limit },
        {
          $lookup: {
            from: "userbasics",
            localField: "IdUser",
            foreignField: "_id",
            as: "userdata"
          }
        }, {
          $lookup: {
            from: "userticketdetails",
            localField: "_id",
            foreignField: "IdUserticket",
            as: "tiketdata"
          }
        },

        {
          $lookup: {
            from: "userbasics",
            localField: "tiketdata.IdUser",
            foreignField: "_id",
            as: "userbasics_data"
          }
        },
        {
          $project: {
            userdata: {
              $arrayElemAt: ['$userdata', 0]
            },
            profilpictid: '$userdata.profilePict.$id',
            replydata: "$tiketdata",
            userrequest: "$userdata.fullName",
            nomortiket: "$nomortiket",
            email: "$userdata.email",
            subject: "$subject",
            body: "$body",
            status: "$status",
            tipe: "$tipe",
            datetime: "$datetime"

          }
        },
        {
          $project: {

            profilpictid: '$userdata.profilePict.$id',
            nomortiket: "$nomortiket",
            userrequest: "$userdata.fullName",
            email: "$userdata.email",
            subject: "$subject",
            body: "$body",
            status: "$status",
            tipe: "$tipe",
            datetime: "$datetime",
            replydata: "$replydata"

          }
        },
        {
          $lookup: {
            from: 'mediaprofilepicts2',
            localField: 'profilpictid',
            foreignField: '_id',
            as: 'profilePict_data',
          },
        },
        {
          $project: {
            profilpict: { $arrayElemAt: ['$profilePict_data', 0] },
            nomortiket: "$nomortiket",
            userrequest: "$userrequest",
            email: "$email",
            subject: "$subject",
            body: "$body",
            status: "$status",
            tipe: "$tipe",
            datetime: "$datetime",
            replydata: "$replydata",
            avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: '$profilpict.fsTargetUri',
              medreplace: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

            },

          }
        },
        {
          $addFields: {

            concats: '/profilepict',
            pict: { $replaceOne: { input: "$profilpict.mediaUri", find: "_0001.jpeg", replacement: "" } },

          },
        },

        {
          $project: {
            nomortiket: "$nomortiket",
            userrequest: "$userrequest",
            email: "$email",
            subject: "$subject",
            body: "$body",
            status: "$status",
            tipe: "$tipe",
            datetime: "$datetime",
            replydata: "$replydata",
            avatar: {
              mediaBasePath: '$profilpict.mediaBasePath',
              mediaUri: '$profilpict.mediaUri',
              mediaType: '$profilpict.mediaType',
              mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


            },

          }
        },



      ]);
      return query;
    }
  }

  async all(tipe: string) {
    const query = await this.userticketsModel.aggregate([
      { $match: { "tipe": tipe, "active": true } },
      { $sort: { datetime: -1 }, },
      {
        $lookup: {
          from: "userbasics",
          localField: "IdUser",
          foreignField: "_id",
          as: "userdata"
        }
      }, {
        $lookup: {
          from: "userticketdetails",
          localField: "_id",
          foreignField: "IdUserticket",
          as: "tiketdata"
        }
      },
      {
        $lookup: {
          from: "userbasics",
          localField: "tiketdata.IdUser",
          foreignField: "_id",
          as: "userbasics_data"
        }
      },
      {
        $project: {
          userdata: {
            $arrayElemAt: ['$userdata', 0]
          },
          replydata: "$tiketdata",
          userrequest: "$userdata.fullName",
          nomortiket: "$nomortiket",
          email: "$userdata.email",
          subject: "$subject",
          body: "$body",
          status: "$status",
          tipe: "$tipe",
          datetime: "$datetime"

        }
      },
      {
        $project: {


          nomortiket: "$nomortiket",
          userrequest: "$userdata.fullName",
          email: "$userdata.email",
          subject: "$subject",
          body: "$body",
          status: "$status",
          tipe: "$tipe",
          datetime: "$datetime",
          replydata: "$replydata"

        }
      },

    ]);



    return query;
  }
  async updatedata(
    id: string,
    CreateUserticketsDto: CreateUserticketsDto,
  ): Promise<Usertickets> {
    let data = await this.userticketsModel.findByIdAndUpdate(
      id,
      CreateUserticketsDto,
      { new: true },
    );

    if (!data) {
      throw new Error('Todo is not found!');
    }
    return data;
  }


  // async dateRange(startDate, endDate, steps = 1) {
  //   const dateArray = [];
  //   let currentDate = new Date(startDate);

  //   while (currentDate <= new Date(endDate)) {
  //     dateArray.push(new Date(currentDate));
  //     // Use UTC date to prevent problems with time zones and DST
  //     currentDate.setUTCDate(currentDate.getUTCDate() + steps);
  //   }

  //   return dateArray;
  // }


}
