import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { CreateUserticketsDto } from './dto/create-usertickets.dto';
import { Usertickets, UserticketsDocument } from './schemas/usertickets.schema';
import { MediaprofilepictsService } from '../../content/mediaprofilepicts/mediaprofilepicts.service';
@Injectable()
export class UserticketsService {
  constructor(
    @InjectModel(Usertickets.name, 'SERVER_FULL')
    private readonly userticketsModel: Model<UserticketsDocument>, private readonly mediaprofilepictsService: MediaprofilepictsService,

  ) { }

  async findAll(): Promise<Usertickets[]> {
    return this.userticketsModel.find().exec();
  }

  async findOne(id: ObjectId): Promise<Usertickets[]> {
    return this.userticketsModel.find({ _id: id }).exec();
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
      },
      {
        $lookup: {
          from: "leveltickets",
          localField: "levelTicket",
          foreignField: '_id',
          as: 'level_data'
        }
      },
      {
        $lookup: {
          from: "sourcetickets",
          localField: "sourceTicket",
          foreignField: '_id',
          as: 'source_data'
        }
      },
      {
        $lookup: {
          from: "categorytickets",
          localField: "categoryTicket",
          foreignField: '_id',
          as: 'category_data'
        }
      },
      {
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
          category: {
            $arrayElemAt: ['$category_data', 0]
          },
          level: {
            $arrayElemAt: ['$level_data', 0]
          },
          source: {
            $arrayElemAt: ['$source_data', 0]
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
          datetime: "$datetime",
          version: "$version",
          OS: "$OS",
        }
      },
      {
        $project: {
          nameCategory: '$category.nameCategory',
          nameLevel: '$level.nameLevel',
          sourceName: '$source.sourceName',
          profilpictid: '$userdata.profilePict.$id',
          nomortiket: "$nomortiket",
          userrequest: "$userdata.fullName",
          email: "$userdata.email",
          subject: "$subject",
          body: "$body",
          status: "$status",
          tipe: "$tipe",
          datetime: "$datetime",
          version: "$version",
          OS: "$OS",
          replydata: "$replydata"
        }
      },
      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',

        },

      },
      {
        $project: {
          profilpict: {
            $arrayElemAt: ['$profilePict_data', 0]
          },
          nomortiket: "$nomortiket",
          nameCategory: '$nameCategory',
          nameLevel: '$nameLevel',
          sourceName: '$sourceName',
          userrequest: "$userrequest",
          email: "$email",
          subject: "$subject",
          body: "$body",
          status: "$status",
          tipe: "$tipe",
          datetime: "$datetime",
          version: "$version",
          OS: "$OS",
          replydata: "$replydata",
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: {
              $replaceOne: {
                input: "$profilpict.mediaUri",
                find: "_0001.jpeg",
                replacement: ""
              }
            },

          },

        }
      },
      {
        $addFields: {

          concats: '/profilepict',
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
          nomortiket: "$nomortiket",
          nameCategory: '$nameCategory',
          nameLevel: '$nameLevel',
          sourceName: '$sourceName',
          userrequest: "$userrequest",
          email: "$email",
          subject: "$subject",
          body: "$body",
          status: "$status",
          tipe: "$tipe",
          datetime: "$datetime",
          version: "$version",
          OS: "$OS",
          replydata: "$replydata",
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: {
              $concat: ["$concats", "/", "$pict"]
            },

          },

        }
      },
      {
        $match: {
          "_id": id
        }
      }
    ]);


    return query;
  }


  async searchdata(status: string, tipe: string, startdate: string, enddate: string, page: number, limit: number) {

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
            from: 'mediaprofilepicts',
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
            from: 'mediaprofilepicts',
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
            from: 'mediaprofilepicts',
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
            from: 'mediaprofilepicts',
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

  async totalcount() {
    const query = await this.userticketsModel.aggregate([
      {
        $match: { active: true }
      },
      {
        $group: {
          _id: null,
          countrow: {
            $sum: 1
          }
        }
      }, {
        $project: {
          _id: 0
        }
      }]);
    return query;
  }
  async totalcountNew() {
    const query = await this.userticketsModel.aggregate([
      {
        $match: { status: "new", active: true }
      },
      {
        $group: {
          _id: null,
          countrow: {
            $sum: 1
          }
        }
      },

      {
        $project: {
          _id: 0
        }
      }]);
    return query;
  }
  async totalcountOnProgres() {
    const query = await this.userticketsModel.aggregate([
      {
        $match: { status: "onprogress", active: true }
      },
      {
        $group: {
          _id: null,
          countrow: {
            $sum: 1
          }
        }
      },

      {
        $project: {
          _id: 0
        }
      }]);
    return query;
  }

  async totalcountClose() {
    const query = await this.userticketsModel.aggregate([
      {
        $match: { status: "close", active: true }
      },
      {
        $group: {
          _id: null,
          countrow: {
            $sum: 1
          }
        }
      },

      {
        $project: {
          _id: 0
        }
      }]);
    return query;
  }


  async filterdata(search: string, assignto: string, sumber: any[], kategori: any[], level: any[], status: any[], startdate: string, enddate: string, skip: number, limit: number, descending: boolean, iduser?: string) {

    var lenghtkategori = 0;
    var lenghtsumber = 0;
    var lenghtlevel = 0;
    var arrayKategory = [];
    var arraySumber = [];
    var arrayLevel = [];
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
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

    pipeline = [
      { $sort: { datetime: order }, },
      {
        $lookup: {
          from: "userbasics",
          localField: "IdUser",
          foreignField: '_id',
          as: 'userbasics_data'
        }
      },
      {
        $lookup: {
          from: "categorytickets",
          localField: "categoryTicket",
          foreignField: '_id',
          as: 'category_data'
        }
      },
      {
        $lookup: {
          from: "leveltickets",
          localField: "levelTicket",
          foreignField: '_id',
          as: 'level_data'
        }
      },
      {
        $lookup: {
          from: "sourcetickets",
          localField: "sourceTicket",
          foreignField: '_id',
          as: 'source_data'
        }
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'assignTo',
          foreignField: '_id',
          as: 'asignto_data',

        },

      },
      {
        $project: {
          user: {
            $arrayElemAt: ['$userbasics_data', 0]
          },
          userasign: {
            $arrayElemAt: ['$asignto_data', 0]
          },
          category: {
            $arrayElemAt: ['$category_data', 0]
          },
          level: {
            $arrayElemAt: ['$level_data', 0]
          },
          source: {
            $arrayElemAt: ['$source_data', 0]
          },

          nomortiket: 1,
          subject: 1,
          body: 1,
          status: 1,
          isRead: 1,
          active: 1,
          datetime: 1,
          sourceTicket: 1,
          levelTicket: 1,
          categoryTicket: 1,
          mediaBasePath: 1,
          mediaMime: 1,
          mediaType: 1,
          mediaUri: 1,
          originalName: 1,
          fsSourceUri: 1,
          fsSourceName: 1,
          fsTargetUri: 1
        }
      },
      {
        $project: {
          userAuth_id: '$user.userAuth.$id',
          iduser: '$user._id',
          pengirim: '$user.email',
          penerima: '$userasign.email',
          profilpictid: '$userasign.profilePict.$id',
          nameCategory: '$category.nameCategory',
          nameLevel: '$level.nameLevel',
          sourceName: '$source.sourceName',
          nomortiket: 1,
          subject: 1,
          body: 1,
          status: 1,
          isRead: 1,
          active: 1,
          datetime: 1,
          sourceTicket: 1,
          levelTicket: 1,
          categoryTicket: 1,
          mediaBasePath: 1,
          mediaMime: 1,
          mediaType: 1,
          mediaUri: 1,
          originalName: 1,
          fsSourceUri: 1,
          fsSourceName: 1,
          fsTargetUri: 1
        }
      },
      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',

        },

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
        $project: {
          profilpict: {
            $arrayElemAt: ['$profilePict_data', 0]
          },
          userauth: {
            $arrayElemAt: ['$userAuth_data', 0]
          },
          iduser: 1,
          nomortiket: 1,
          pengirim: 1,
          penerima: 1,
          subject: 1,
          body: 1,
          status: 1,
          isRead: 1,
          active: 1,
          datetime: 1,
          nameCategory: 1,
          nameLevel: 1,
          sourceName: 1,
          sourceTicket: 1,
          levelTicket: 1,
          categoryTicket: 1,
          mediaBasePath: 1,
          mediaMime: 1,
          mediaType: 1,
          mediaUri: 1,
          originalName: 1,
          fsSourceUri: 1,
          fsSourceName: 1,
          fsTargetUri: 1
        }
      },
      {
        $project: {
          username: 1,
          iduser: 1,
          nomortiket: 1,
          pengirim: 1,
          penerima: 1,
          subject: 1,
          body: 1,
          status: 1,
          isRead: 1,
          active: 1,
          datetime: 1,
          nameCategory: 1,
          nameLevel: 1,
          sourceName: 1,
          sourceTicket: 1,
          levelTicket: 1,
          categoryTicket: 1,
          mediaBasePath: 1,
          mediaMime: 1,
          mediaType: 1,
          mediaUri: 1,
          originalName: 1,
          fsSourceUri: 1,
          fsSourceName: 1,
          fsTargetUri: 1,
          concats: '/profilepict',
          pict: {
            $replaceOne: {
              input: "$profilpict.mediaUri",
              find: "_0001.jpeg",
              replacement: ""
            }
          },

          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: {
              $replaceOne: {
                input: "$profilpict.mediaUri",
                find: "_0001.jpeg",
                replacement: ""
              }
            },

          },

        }
      },
      {
        $project: {
          username: 1,
          iduser: 1,
          nomortiket: 1,
          pengirim: 1,
          penerima: 1,
          subject: 1,
          body: 1,
          status: 1,
          isRead: 1,
          active: 1,
          datetime: 1,
          nameCategory: 1,
          nameLevel: 1,
          sourceName: 1,
          sourceTicket: 1,
          levelTicket: 1,
          categoryTicket: 1,
          mediaBasePath: 1,
          mediaMime: 1,
          mediaType: 1,
          mediaUri: 1,
          originalName: 1,
          fsSourceUri: 1,
          fsSourceName: 1,
          fsTargetUri: 1,
          concats: '/profilepict',
          pict: {
            $replaceOne: {
              input: "$profilpict.mediaUri",
              find: "_0001.jpeg",
              replacement: ""
            }
          },

          avatar: {
            mediaBasePath: '$avatar.mediaBasePath',
            mediaUri: '$avatar.mediaUri',
            mediaType: '$avatar.mediaType',
            mediaEndpoint: { $concat: ["$concats", "/", "$pict"] },


          },

        }
      },
      {
        $match: {
          active: true,

        }
      },



    ];

    if (iduser && iduser !== undefined) {
      pipeline.push({
        $match: {
          iduser: mongoose.Types.ObjectId(iduser)
        }
      },);
    }

    if (search && search !== undefined) {

      pipeline.push(
        {
          $match: {
            $or: [{
              username: {
                $regex: search,
                $options: 'i'
              },

            }, {
              nomortiket: {
                $regex: search,
                $options: 'i'
              },

            }],

          }
        },
      );


    }

    if (sumber && sumber !== undefined) {
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }
      pipeline.push(
        {
          $match: {
            $or: [
              {
                sourceTicket: {
                  $in: arraySumber
                }
              },

            ],
          }
        },
      );
    }
    if (kategori && kategori !== undefined) {
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      pipeline.push(
        {
          $match: {
            $or: [
              {
                categoryTicket: {
                  $in: arrayKategory
                }
              },

            ],
          }
        },
      );
    }
    if (level && level !== undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      pipeline.push(
        {
          $match: {
            $or: [
              {
                levelTicket: {
                  $in: arrayLevel
                }
              },

            ],
          }
        },
      );
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

            ],
          }
        });
    }
    if (startdate && startdate !== undefined) {
      pipeline.push({ $match: { datetime: { "$gte": startdate } } });
    }
    if (enddate && enddate !== undefined) {
      pipeline.push({ $match: { datetime: { "$lte": dateend } } });
    }
    if (assignto && assignto !== undefined) {
      pipeline.push({
        $match: {

          penerima: {
            $regex: assignto,
            $options: 'i'
          },

        }
      },
      );
    }


    if (skip > 0) {
      pipeline.push({ $skip: (skip * limit) });
    }
    if (limit > 0) {
      pipeline.push({ $limit: limit });
    }


    const query = await this.userticketsModel.aggregate(pipeline);
    return query;
  }


  async detail(id: object): Promise<object> {
    const query = await this.userticketsModel.aggregate([
      {
        $lookup: {
          from: "userticketdetails",
          localField: "_id",
          foreignField: "IdUserticket",
          as: "detail"
        },

      },
      {
        $lookup: {
          from: "userbasics",
          localField: "IdUser",
          foreignField: '_id',
          as: 'userbasics_data'
        }
      },
      {
        $lookup: {
          from: "categorytickets",
          localField: "categoryTicket",
          foreignField: '_id',
          as: 'category_data'
        }
      },
      {
        $lookup: {
          from: "leveltickets",
          localField: "levelTicket",
          foreignField: '_id',
          as: 'level_data'
        }
      },
      {
        $lookup: {
          from: "sourcetickets",
          localField: "sourceTicket",
          foreignField: '_id',
          as: 'source_data'
        }
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'assignTo',
          foreignField: '_id',
          as: 'asignto_data',

        },

      },
      {
        $project: {
          user: {
            $arrayElemAt: ['$userbasics_data', 0]
          },
          userasign: {
            $arrayElemAt: ['$asignto_data', 0]
          },
          category: {
            $arrayElemAt: ['$category_data', 0]
          },
          level: {
            $arrayElemAt: ['$level_data', 0]
          },
          source: {
            $arrayElemAt: ['$source_data', 0]
          },
          nomortiket: '$nomortiket',
          subject: '$subject',
          body: '$body',
          status: '$status',
          isRead: '$isRead',
          active: '$active',
          datetime: '$datetime',
          sourceTicket: '$sourceTicket',
          levelTicket: '$levelTicket',
          categoryTicket: '$categoryTicket',
          mediaBasePath: '$mediaBasePath',
          mediaMime: '$mediaMime',
          mediaType: '$mediaType',
          mediaUri: '$mediaUri',
          originalName: '$originalName',
          fsSourceUri: '$fsSourceUri',
          fsSourceName: '$fsSourceName',
          fsTargetUri: '$fsTargetUri',
          version: '$version',
          OS: '$OS',
          detail: '$detail'
        }
      },
      {
        $project: {
          userAuth_id: '$user.userAuth.$id',
          nomortiket: '$nomortiket',
          pengirim: '$user.email',
          penerima: '$userasign.fullName',
          profilpictid: '$userasign.profilePict.$id',
          subject: '$subject',
          body: '$body',
          status: '$status',
          isRead: '$isRead',
          active: '$active',
          datetime: '$datetime',
          nameCategory: '$category.nameCategory',
          nameLevel: '$level.nameLevel',
          sourceName: '$source.sourceName',
          sourceTicket: '$sourceTicket',
          levelTicket: '$levelTicket',
          categoryTicket: '$categoryTicket',
          mediaBasePath: '$mediaBasePath',
          mediaMime: '$mediaMime',
          mediaType: '$mediaType',
          mediaUri: '$mediaUri',
          originalName: '$originalName',
          fsSourceUri: '$fsSourceUri',
          fsSourceName: '$fsSourceName',
          fsTargetUri: '$fsTargetUri',
          version: '$version',
          OS: '$OS',
          detail: '$detail'
        }
      },
      {
        $lookup: {
          from: 'mediaprofilepicts',
          localField: 'profilpictid',
          foreignField: '_id',
          as: 'profilePict_data',

        },

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
        $project: {
          profilpict: {
            $arrayElemAt: ['$profilePict_data', 0]
          },
          userauth: {
            $arrayElemAt: ['$userAuth_data', 0]
          },
          nomortiket: '$nomortiket',
          pengirim: '$pengirim',
          penerima: '$penerima',
          subject: '$subject',
          body: '$body',
          status: '$status',
          isRead: '$isRead',
          active: '$active',
          datetime: '$datetime',
          nameCategory: '$nameCategory',
          nameLevel: '$nameLevel',
          sourceName: '$sourceName',
          sourceTicket: '$sourceTicket',
          levelTicket: '$levelTicket',
          categoryTicket: '$categoryTicket',
          mediaBasePath: '$mediaBasePath',
          mediaMime: '$mediaMime',
          mediaType: '$mediaType',
          mediaUri: '$mediaUri',
          originalName: '$originalName',
          fsSourceUri: '$fsSourceUri',
          fsSourceName: '$fsSourceName',
          fsTargetUri: '$fsTargetUri',
          version: '$version',
          OS: '$OS',
          detail: '$detail'
        }
      },
      {
        $project: {
          username: '$userauth.username',
          nomortiket: '$nomortiket',
          pengirim: '$pengirim',
          penerima: '$penerima',
          subject: '$subject',
          body: '$body',
          status: '$status',
          isRead: '$isRead',
          active: '$active',
          datetime: '$datetime',
          nameCategory: '$nameCategory',
          nameLevel: '$nameLevel',
          sourceName: '$sourceName',
          sourceTicket: '$sourceTicket',
          levelTicket: '$levelTicket',
          categoryTicket: '$categoryTicket',
          mediaBasePath: '$mediaBasePath',
          mediaMime: '$mediaMime',
          mediaType: '$mediaType',
          mediaUri: '$mediaUri',
          originalName: '$originalName',
          fsSourceUri: '$fsSourceUri',
          fsSourceName: '$fsSourceName',
          fsTargetUri: '$fsTargetUri',
          version: '$version',
          OS: '$OS',
          detail: '$detail',
          concats: '/profilepict',
          pict: {
            $replaceOne: {
              input: "$profilpict.mediaUri",
              find: "_0001.jpeg",
              replacement: ""
            }
          },
          avatar: {
            mediaBasePath: '$profilpict.mediaBasePath',
            mediaUri: '$profilpict.mediaUri',
            mediaType: '$profilpict.mediaType',
            mediaEndpoint: '$profilpict.fsTargetUri',
            medreplace: {
              $replaceOne: {
                input: "$profilpict.mediaUri",
                find: "_0001.jpeg",
                replacement: ""
              }
            },

          },

        }
      },
      {
        $project: {
          username: '$userauth.username',
          nomortiket: '$nomortiket',
          pengirim: '$pengirim',
          penerima: '$penerima',
          subject: '$subject',
          body: '$body',
          status: '$status',
          isRead: '$isRead',
          active: '$active',
          datetime: '$datetime',
          nameCategory: '$nameCategory',
          nameLevel: '$nameLevel',
          sourceName: '$sourceName',
          sourceTicket: '$sourceTicket',
          levelTicket: '$levelTicket',
          categoryTicket: '$categoryTicket',
          mediaBasePath: '$mediaBasePath',
          mediaMime: '$mediaMime',
          mediaType: '$mediaType',
          mediaUri: '$mediaUri',
          originalName: '$originalName',
          fsSourceUri: '$fsSourceUri',
          fsSourceName: '$fsSourceName',
          fsTargetUri: '$fsTargetUri',
          version: '$version',
          OS: '$OS',
          detail: '$detail',
          concats: '/profilepict',
          pict: {
            $replaceOne: {
              input: "$profilpict.mediaUri",
              find: "_0001.jpeg",
              replacement: ""
            }
          },
          avatar: {
            mediaBasePath: '$avatar.mediaBasePath',
            mediaUri: '$avatar.mediaUri',
            mediaType: '$avatar.mediaType',
            mediaEndpoint: {
              $concat: ["$concats", "/", "$pict"]
            },

          },

        }
      },
      {
        $match: {
          "_id": id
        }
      }
    ]);


    return query;
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

  async countUserticketStatus(startdate: string, enddate: string) {
    try {
      var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

      var dateend = currentdate.toISOString();
    } catch (e) {
      dateend = "";
    }

    var pipeline = [];

    if (startdate && startdate === undefined) {
      pipeline.push({ $match: { datetime: { "$gte": startdate } } });

    }
    if (enddate && enddate !== undefined) {
      pipeline.push({ $match: { datetime: { "$lte": dateend } } });
    }

    pipeline.push({
      $match: {

        active: true,

      }
    },
      {
        $addFields: {
          statusDesc: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: ['$status', 'new']
                  },
                  then: 'BARU',

                },
                {
                  case: {
                    $eq: ['$status', 'onprogress']
                  },
                  then: 'DALAM PROSES',

                },
                {
                  case: {
                    $eq: ['$status', 'close']
                  },
                  then: 'SELESAI',

                }
              ],
              default: [],

            },

          },

        }
      },
      {
        $group: {
          _id: "$statusDesc",
          myCount: {
            $sum: 1
          },

        }
      },
    );



    let query = await this.userticketsModel.aggregate(pipeline);

    return query;
  }


}
