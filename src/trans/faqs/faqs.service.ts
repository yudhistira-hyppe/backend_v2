import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { CreateFaqsDto } from './dto/create-faqs.dto';
import { Faqs, FaqsDocument } from './schemas/faqs.schema';
@Injectable()
export class FaqService {
  constructor(
    @InjectModel(Faqs.name, 'SERVER_TRANS')
    private readonly faqsModel: Model<FaqsDocument>,

  ) { }

  async findAll(): Promise<Faqs[]> {
    return this.faqsModel.find().exec();
  }
  async update(
    id: string,
    createFaqsDto: CreateFaqsDto,
  ): Promise<Faqs> {
    let data = await this.faqsModel.findByIdAndUpdate(
      id,
      createFaqsDto,
      { new: true },
    );

    if (!data) {
      throw new Error('Todo is not found!');
    }
    return data;
  }

  async create(CreateFaqsDto: CreateFaqsDto): Promise<Faqs> {
    let data = await this.faqsModel.create(CreateFaqsDto);

    if (!data) {
      throw new Error('Todo is not found!');
    }
    return data;
  }

  async retrieve(id: object): Promise<object> {
    const query = await this.faqsModel.aggregate([
      {
        $lookup: {
          from: "userbasics",
          localField: "IdUser",
          foreignField: "_id",
          as: "userdata"
        }
      }, {
        $lookup: {
          from: "faqdetails",
          localField: "_id",
          foreignField: "Idfaqs",
          as: "faqdata"
        }
      },
      {
        $lookup: {
          from: "userbasics",
          localField: "faqdata.IdUser",
          foreignField: "_id",
          as: "field2"
        }
      },
      {
        $project: {
          userdata: {
            $arrayElemAt: ['$userdata', 0]
          },
          replydata: "$faqdata",
          usercreate: "$userdata.fullName",
          email: "$userdata.email",
          kategori: "$kategori",
          tipe: "$tipe",
          datetime: "$datetime"

        }
      },
      {
        $project: {
          usercreate: "$userdata.fullName",
          email: "$userdata.email",
          kategori: "$kategori",
          datetime: "$datetime",
          tipe: "$tipe",
          replydata: "$replydata",

        }
      },
      { $match: { "_id": id } },
      { $sort: { datetime: -1 }, },
    ]);


    return query;
  }



  async delete(id: string): Promise<Object> {
    let data = await this.faqsModel.updateOne({ "_id": id },
      { $set: { "active": false } });
    return data;
  }

  async viewalldata(tipe: string): Promise<object> {
    const query = await this.faqsModel.aggregate([
      {
        $lookup: {
          from: "userbasics",
          localField: "IdUser",
          foreignField: "_id",
          as: "userdata"
        }
      }, {
        $lookup: {
          from: "faqdetails",
          localField: "_id",
          foreignField: "Idfaqs",
          as: "faqdata"
        }
      },
      {
        $lookup: {
          from: "userbasics",
          localField: "faqdata.IdUser",
          foreignField: "_id",
          as: "field2"
        }
      },
      {
        $project: {
          userdata: {
            $arrayElemAt: ['$userdata', 0]
          },
          replydata: "$faqdata",
          usercreate: "$userdata.fullName",
          email: "$userdata.email",
          kategori: "$kategori",
          tipe: "$tipe",
          datetime: "$datetime",
          active: "$active"

        }
      },
      {
        $project: {
          usercreate: "$userdata.fullName",
          email: "$userdata.email",
          kategori: "$kategori",
          datetime: "$datetime",
          tipe: "$tipe",
          active: "$active",
          replydata: "$replydata",

        }
      },
      { $match: { "tipe": tipe, "active": true } },
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
