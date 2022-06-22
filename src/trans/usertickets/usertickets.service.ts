import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { CreateUserticketsDto } from './dto/create-usertickets.dto';
import { Usertickets, UserticketsDocument } from './schemas/usertickets.schema';
@Injectable()
export class UserticketsService {
  constructor(
    @InjectModel(Usertickets.name, 'SERVER_TRANS')
    private readonly userticketsModel: Model<UserticketsDocument>,

  ) { }

  async findAll(): Promise<Usertickets[]> {
    return this.userticketsModel.find().exec();
  }
  async update(IdUserticket: ObjectId, status: string): Promise<Object> {
    let data = await this.userticketsModel.updateOne({ "_id": IdUserticket },
      { $set: { "status": status } });
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
          as: "field2"
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
      }, { $match: { "_id": id } }
    ]);


    return query;
  }

  async searchdata(status: string, tipe: string): Promise<object> {
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
          as: "field2"
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
      }, { $match: { "status": status, "tipe": tipe } },
      { $sort: { datetime: -1 }, },
    ]);


    return query;
  }





  async alldatatiket(tipe: string): Promise<object> {
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
          as: "field2"
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
      }, { $match: { "tipe": tipe } },
      { $sort: { datetime: -1 }, },
    ]);



    return query;
  }


  async dateRange(startDate, endDate, steps = 1) {
    const dateArray = [];
    let currentDate = new Date(startDate);

    while (currentDate <= new Date(endDate)) {
      dateArray.push(new Date(currentDate));
      // Use UTC date to prevent problems with time zones and DST
      currentDate.setUTCDate(currentDate.getUTCDate() + steps);
    }

    return dateArray;
  }


}
