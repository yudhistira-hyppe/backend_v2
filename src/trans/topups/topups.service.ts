import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Topups, TopupsDocument } from './schema/topups.schema';

@Injectable()
export class TopupsService {
  constructor(
    @InjectModel(Topups.name, 'SERVER_FULL')
    private readonly TopupsModel: Model<TopupsDocument>,
  ) { }

  async create(Topups_: Topups): Promise<Topups> {
    const _Topups_ = await this.TopupsModel.create(Topups_);
    return _Topups_;
  }

  async findAll(): Promise<Topups[]> {
    return this.TopupsModel.find().exec();
  }

  async updateone(id: string, Topups_: Topups): Promise<any> {
    let data = await this.TopupsModel.updateOne({ "_id": new mongoose.Types.ObjectId(id) },
      Topups_);
    return data;
  }

  async findOne(id: string): Promise<Topups> {
    return this.TopupsModel.findOne({ _id: new mongoose.Types.ObjectId(id) }).exec();
  }

  async findCriteria(start_date: any, end_date: any, pageNumber: number, pageRow: number, search: string, sort: any): Promise<Topups[]> {
    var perPage = pageRow, page = Math.max(0, pageNumber);
    var where = {
      $and: []
    };

    let where_status = {
      status: { $ne: "DELETE" }
    };
    where.$and.push(where_status);

    if (start_date != null) {
      let where_start_date = {};
      where_start_date['createdAt'] = { $gte: start_date.toISOString() };
      where.$and.push(where_start_date);
    }

    if (end_date != null) {
      let where_end_date = {};
      where_end_date['createdAt'] = { $lte: end_date.toISOString() };
      where.$and.push(where_end_date);
    }

    if (search != undefined) {
      let where_email = {};
      let where_username = {};
      where_email['email'] = { $regex: search, $options: "i" };
      where_username['username'] = { $regex: search, $options: "i" };
      where['$or'].push(where_email);
      where['$or'].push(where_username);
    }

    if (sort==undefined){
      sort = { "createdAt":-1 }
    }
    console.log(JSON.stringify(where));
    const query = await this.TopupsModel.find(where).limit(perPage).skip(perPage * page).sort(sort);
    return query;
  }

  async delete(id: string) {
    const _Topups_ = await this.TopupsModel
      .findByIdAndRemove({ _id: new mongoose.Types.ObjectId(id) })
      .exec();
    return _Topups_;
  }
}
