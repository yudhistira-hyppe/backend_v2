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
    @InjectModel(Usertickets.name, 'SERVER_TRANS')
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
          from: 'mediaprofilepicts2',
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


  async filterdata(search: string, sumber: any[], kategori: any[], level: any[], status: any[], startdate: string, enddate: string, skip: number, limit: number) {
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

    if (search !== undefined && sumber === undefined && kategori === undefined && level === undefined && status === undefined && startdate === undefined && enddate === undefined) {
      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            active: true
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber !== undefined && kategori === undefined && level === undefined && status === undefined && startdate === undefined && enddate === undefined) {
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }
      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            $or: [
              {
                sourceTicket: {
                  $in: arraySumber
                }
              },

            ], active: true,
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori !== undefined && level === undefined && status === undefined && startdate === undefined && enddate === undefined) {
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            $or: [
              {
                categoryTicket: {
                  $in: arrayKategory
                }
              },

            ], active: true,
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori === undefined && level !== undefined && status === undefined && startdate === undefined && enddate === undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            $or: [
              {
                levelTicket: {
                  $in: arrayLevel
                }
              },

            ], active: true,
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori === undefined && level === undefined && status !== undefined && startdate === undefined && enddate === undefined) {

      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            $or: [
              {
                status: {
                  $in: status
                }
              },

            ], active: true,
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori === undefined && level === undefined && status === undefined && startdate !== undefined && enddate !== undefined) {

      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            datetime: { $gte: startdate, $lte: dateend }, active: true
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search !== undefined && sumber !== undefined && kategori === undefined && level === undefined && status === undefined && startdate === undefined && enddate === undefined) {
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }
      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            active: true,
            sourceTicket: {
              $in: arraySumber
            }
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search !== undefined && sumber === undefined && kategori !== undefined && level === undefined && status === undefined && startdate === undefined && enddate === undefined) {
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            active: true,
            categoryTicket: {
              $in: arrayKategory
            }
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search !== undefined && sumber === undefined && kategori === undefined && level !== undefined && status === undefined && startdate === undefined && enddate === undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            active: true,
            levelTicket: {
              $in: arrayLevel
            }
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search !== undefined && sumber === undefined && kategori === undefined && level === undefined && status !== undefined && startdate === undefined && enddate === undefined) {

      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            active: true,
            status: {
              $in: status
            }
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search !== undefined && sumber === undefined && kategori === undefined && level === undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            active: true,
            datetime: { $gte: startdate, $lte: dateend },
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber !== undefined && kategori === undefined && level === undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }
      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            $or: [
              {
                sourceTicket: {
                  $in: arraySumber
                }
              },

            ], active: true, datetime: { $gte: startdate, $lte: dateend },
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori !== undefined && level === undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            $or: [
              {
                categoryTicket: {
                  $in: arrayKategory
                }
              },

            ], active: true, datetime: { $gte: startdate, $lte: dateend },
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori === undefined && level !== undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            $or: [
              {
                levelTicket: {
                  $in: arrayLevel
                }
              },

            ], active: true, datetime: { $gte: startdate, $lte: dateend },
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori === undefined && level === undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {

      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            $or: [
              {
                status: {
                  $in: status
                }
              },

            ], active: true, datetime: { $gte: startdate, $lte: dateend },
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber !== undefined && kategori !== undefined && level === undefined && status === undefined && startdate === undefined && enddate === undefined) {
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }

      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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


            sourceTicket: {
              $in: arraySumber
            },
            categoryTicket: {
              $in: arrayKategory
            }
            , active: true,
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber !== undefined && kategori === undefined && level !== undefined && status === undefined && startdate === undefined && enddate === undefined) {
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }

      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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


            sourceTicket: {
              $in: arraySumber
            },
            levelTicket: {
              $in: arrayLevel
            }
            , active: true,
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber !== undefined && kategori === undefined && level === undefined && status !== undefined && startdate === undefined && enddate === undefined) {
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }


      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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


            sourceTicket: {
              $in: arraySumber
            },
            status: {
              $in: status
            }
            , active: true,
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber !== undefined && kategori === undefined && level === undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }


      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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


            sourceTicket: {
              $in: arraySumber
            },
            datetime: { $gte: startdate, $lte: dateend },
            active: true,
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori !== undefined && level !== undefined && status === undefined && startdate === undefined && enddate === undefined) {
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }

      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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


            categoryTicket: {
              $in: arrayKategory
            },
            levelTicket: {
              $in: arrayLevel
            }
            , active: true,
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori !== undefined && level === undefined && status !== undefined && startdate === undefined && enddate === undefined) {
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }


      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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


            categoryTicket: {
              $in: arrayKategory
            },
            status: {
              $in: status
            }
            , active: true,
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori !== undefined && level === undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }


      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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


            categoryTicket: {
              $in: arrayKategory
            },
            datetime: { $gte: startdate, $lte: dateend }
            , active: true,
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori === undefined && level !== undefined && status !== undefined && startdate === undefined && enddate === undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            levelTicket: {
              $in: arrayLevel
            },
            status: {
              $in: status
            },
            active: true,
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori === undefined && level !== undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            levelTicket: {
              $in: arrayLevel
            },
            datetime: { $gte: startdate, $lte: dateend },
            active: true,
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori === undefined && level !== undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            levelTicket: {
              $in: arrayLevel
            },
            status: {
              $in: status
            },
            datetime: { $gte: startdate, $lte: dateend },
            active: true,
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori !== undefined && level !== undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            levelTicket: {
              $in: arrayLevel
            },
            categoryTicket: {
              $in: arrayKategory
            },
            status: {
              $in: status
            },
            datetime: { $gte: startdate, $lte: dateend },
            active: true,
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber !== undefined && kategori !== undefined && level !== undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }

      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            levelTicket: {
              $in: arrayLevel
            },
            categoryTicket: {
              $in: arrayKategory
            },
            status: {
              $in: status
            },
            sourceTicket: {
              $in: arraySumber
            },
            datetime: { $gte: startdate, $lte: dateend },
            active: true,
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search !== undefined && sumber !== undefined && kategori !== undefined && level !== undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }

      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            levelTicket: {
              $in: arrayLevel
            },
            categoryTicket: {
              $in: arrayKategory
            },
            status: {
              $in: status
            },
            sourceTicket: {
              $in: arraySumber
            },
            datetime: { $gte: startdate, $lte: dateend },
            active: true,
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search !== undefined && sumber !== undefined && kategori !== undefined && level !== undefined && status !== undefined && startdate === undefined && enddate === undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }

      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            levelTicket: {
              $in: arrayLevel
            },
            categoryTicket: {
              $in: arrayKategory
            },
            status: {
              $in: status
            },
            sourceTicket: {
              $in: arraySumber
            },
            active: true,
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search !== undefined && sumber !== undefined && kategori !== undefined && level !== undefined && status === undefined && startdate === undefined && enddate === undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }

      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            levelTicket: {
              $in: arrayLevel
            },
            categoryTicket: {
              $in: arrayKategory
            },
            sourceTicket: {
              $in: arraySumber
            },
            active: true,
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search !== undefined && sumber !== undefined && kategori !== undefined && level === undefined && status === undefined && startdate === undefined && enddate === undefined) {

      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }

      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
            categoryTicket: {
              $in: arrayKategory
            },
            sourceTicket: {
              $in: arraySumber
            },
            active: true,
          }
        },
        {
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else {
      const query = await this.userticketsModel.aggregate([
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
            penerima: '$userasign.email',
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
            fsTargetUri: '$fsTargetUri'
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
            fsTargetUri: '$fsTargetUri'
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
          $skip: (skip * limit)
        },
        {
          $limit: limit
        },
        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
  }

  async filterdataCount(search: string, sumber: any[], kategori: any[], level: any[], status: any[], startdate: string, enddate: string) {
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

    if (search !== undefined && sumber === undefined && kategori === undefined && level === undefined && status === undefined && startdate === undefined && enddate === undefined) {
      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'

          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
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
            active: true
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber !== undefined && kategori === undefined && level === undefined && status === undefined && startdate === undefined && enddate === undefined) {
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }
      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'

          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {
            $or: [
              {
                sourceTicket: {
                  $in: arraySumber
                }
              },

            ], active: true,
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori !== undefined && level === undefined && status === undefined && startdate === undefined && enddate === undefined) {
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'


          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {
            $or: [
              {
                categoryTicket: {
                  $in: arrayKategory
                }
              },

            ], active: true,
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori === undefined && level !== undefined && status === undefined && startdate === undefined && enddate === undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'


          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {
            $or: [
              {
                levelTicket: {
                  $in: arrayLevel
                }
              },

            ], active: true,
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori === undefined && level === undefined && status !== undefined && startdate === undefined && enddate === undefined) {

      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'


          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {
            $or: [
              {
                status: {
                  $in: status
                }
              },

            ], active: true,
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori === undefined && level === undefined && status === undefined && startdate !== undefined && enddate !== undefined) {

      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'


          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {
            datetime: { $gte: startdate, $lte: dateend }, active: true
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search !== undefined && sumber !== undefined && kategori === undefined && level === undefined && status === undefined && startdate === undefined && enddate === undefined) {
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }
      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'


          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
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
            active: true,
            sourceTicket: {
              $in: arraySumber
            }
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search !== undefined && sumber === undefined && kategori !== undefined && level === undefined && status === undefined && startdate === undefined && enddate === undefined) {
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'


          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
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
            active: true,
            categoryTicket: {
              $in: arrayKategory
            }
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search !== undefined && sumber === undefined && kategori === undefined && level !== undefined && status === undefined && startdate === undefined && enddate === undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'


          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
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
            active: true,
            levelTicket: {
              $in: arrayLevel
            }
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search !== undefined && sumber === undefined && kategori === undefined && level === undefined && status !== undefined && startdate === undefined && enddate === undefined) {

      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'


          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
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
            active: true,
            status: {
              $in: status
            }
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search !== undefined && sumber === undefined && kategori === undefined && level === undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'


          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
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
            active: true,
            datetime: { $gte: startdate, $lte: dateend },
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber !== undefined && kategori === undefined && level === undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }
      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'


          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {
            $or: [
              {
                sourceTicket: {
                  $in: arraySumber
                }
              },

            ], active: true, datetime: { $gte: startdate, $lte: dateend },
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori !== undefined && level === undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'


          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {
            $or: [
              {
                categoryTicket: {
                  $in: arrayKategory
                }
              },

            ], active: true, datetime: { $gte: startdate, $lte: dateend },
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori === undefined && level !== undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {
            $or: [
              {
                levelTicket: {
                  $in: arrayLevel
                }
              },

            ], active: true, datetime: { $gte: startdate, $lte: dateend },
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori === undefined && level === undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {

      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'

          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {
            $or: [
              {
                status: {
                  $in: status
                }
              },

            ], active: true, datetime: { $gte: startdate, $lte: dateend },
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber !== undefined && kategori !== undefined && level === undefined && status === undefined && startdate === undefined && enddate === undefined) {
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }

      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'

          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {


            sourceTicket: {
              $in: arraySumber
            },
            categoryTicket: {
              $in: arrayKategory
            }
            , active: true,
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber !== undefined && kategori === undefined && level !== undefined && status === undefined && startdate === undefined && enddate === undefined) {
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }

      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'


          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {


            sourceTicket: {
              $in: arraySumber
            },
            levelTicket: {
              $in: arrayLevel
            }
            , active: true,
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber !== undefined && kategori === undefined && level === undefined && status !== undefined && startdate === undefined && enddate === undefined) {
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }


      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'

          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {


            sourceTicket: {
              $in: arraySumber
            },
            status: {
              $in: status
            }
            , active: true,
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber !== undefined && kategori === undefined && level === undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }


      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'

          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {


            sourceTicket: {
              $in: arraySumber
            },
            datetime: { $gte: startdate, $lte: dateend },
            active: true,
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori !== undefined && level !== undefined && status === undefined && startdate === undefined && enddate === undefined) {
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }

      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'

          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {


            categoryTicket: {
              $in: arrayKategory
            },
            levelTicket: {
              $in: arrayLevel
            }
            , active: true,
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori !== undefined && level === undefined && status !== undefined && startdate === undefined && enddate === undefined) {
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }


      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'

          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {


            categoryTicket: {
              $in: arrayKategory
            },
            status: {
              $in: status
            }
            , active: true,
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori !== undefined && level === undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }


      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'

          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {


            categoryTicket: {
              $in: arrayKategory
            },
            datetime: { $gte: startdate, $lte: dateend }
            , active: true,
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori === undefined && level !== undefined && status !== undefined && startdate === undefined && enddate === undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'

          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {
            levelTicket: {
              $in: arrayLevel
            },
            status: {
              $in: status
            },
            active: true,
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori === undefined && level !== undefined && status === undefined && startdate !== undefined && enddate !== undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'

          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {
            levelTicket: {
              $in: arrayLevel
            },
            datetime: { $gte: startdate, $lte: dateend },
            active: true,
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori === undefined && level !== undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'

          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {
            levelTicket: {
              $in: arrayLevel
            },
            status: {
              $in: status
            },
            datetime: { $gte: startdate, $lte: dateend },
            active: true,
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber === undefined && kategori !== undefined && level !== undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'

          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {
            levelTicket: {
              $in: arrayLevel
            },
            categoryTicket: {
              $in: arrayKategory
            },
            status: {
              $in: status
            },
            datetime: { $gte: startdate, $lte: dateend },
            active: true,
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search === undefined && sumber !== undefined && kategori !== undefined && level !== undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }

      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $match: {
            levelTicket: {
              $in: arrayLevel
            },
            categoryTicket: {
              $in: arrayKategory
            },
            status: {
              $in: status
            },
            sourceTicket: {
              $in: arraySumber
            },
            datetime: { $gte: startdate, $lte: dateend },
            active: true,
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search !== undefined && sumber !== undefined && kategori !== undefined && level !== undefined && status !== undefined && startdate !== undefined && enddate !== undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }

      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'

          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
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
            levelTicket: {
              $in: arrayLevel
            },
            categoryTicket: {
              $in: arrayKategory
            },
            status: {
              $in: status
            },
            sourceTicket: {
              $in: arraySumber
            },
            datetime: { $gte: startdate, $lte: dateend },
            active: true,
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search !== undefined && sumber !== undefined && kategori !== undefined && level !== undefined && status !== undefined && startdate === undefined && enddate === undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }

      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'

          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
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
            levelTicket: {
              $in: arrayLevel
            },
            categoryTicket: {
              $in: arrayKategory
            },
            status: {
              $in: status
            },
            sourceTicket: {
              $in: arraySumber
            },
            active: true,
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search !== undefined && sumber !== undefined && kategori !== undefined && level !== undefined && status === undefined && startdate === undefined && enddate === undefined) {
      lenghtlevel = level.length;

      for (var i = 0; i < lenghtlevel; i++) {
        var id = level[i];
        var idlevel = mongoose.Types.ObjectId(id);
        arrayLevel.push(idlevel);
      }
      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }

      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'

          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
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
            levelTicket: {
              $in: arrayLevel
            },
            categoryTicket: {
              $in: arrayKategory
            },
            sourceTicket: {
              $in: arraySumber
            },
            active: true,
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else if (search !== undefined && sumber !== undefined && kategori !== undefined && level === undefined && status === undefined && startdate === undefined && enddate === undefined) {

      lenghtkategori = kategori.length;

      for (var i = 0; i < lenghtkategori; i++) {
        var id = kategori[i];
        var idkategori = mongoose.Types.ObjectId(id);
        arrayKategory.push(idkategori);
      }
      lenghtsumber = sumber.length;

      for (var i = 0; i < lenghtsumber; i++) {
        var id = sumber[i];
        var idsumber = mongoose.Types.ObjectId(id);
        arraySumber.push(idsumber);
      }

      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'

          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
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
            categoryTicket: {
              $in: arrayKategory
            },
            sourceTicket: {
              $in: arraySumber
            },
            active: true,
          }
        },

        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
    else {
      const query = await this.userticketsModel.aggregate([
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
          $project: {
            user: {
              $arrayElemAt: ['$userbasics_data', 0]
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
            fsTargetUri: '$fsTargetUri'

          }
        },
        {
          $project: {
            userAuth_id: '$user.userAuth.$id',
            nomortiket: '$nomortiket',
            pengirim: '$user.email',
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
            fsTargetUri: '$fsTargetUri'
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
          $project: {
            userauth: {
              $arrayElemAt: ['$userAuth_data', 0]
            },
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },
        {
          $project: {
            username: '$userauth.username',
            nomortiket: '$nomortiket',
            pengirim: '$pengirim',
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
            fsTargetUri: '$fsTargetUri'
          }
        },


        { $sort: { datetime: -1 }, },
      ]);
      return query;
    }
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
