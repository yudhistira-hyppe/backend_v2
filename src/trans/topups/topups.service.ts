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

  async findCriteria(start_date: any, end_date: any, pageNumber: number, pageRow: number, search: string, createBy: string, status: [], sort: any): Promise<Topups[]> {
    var perPage = pageRow, page = Math.max(0, pageNumber);
    var where = {
      $and: []
    };

    let where_id = {
      _id: { $ne: null }
    };
    where.$and.push(where_id);

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

    if (createBy != undefined) {
      let where_createBy = {};
      where_createBy['createByUsername'] = { $regex: createBy, $options: "i" };
      where.$and.push(where_createBy);
    }

    if (status != undefined) {
      if (status.length > 0) {
        let where_status = {};
        where_status['status'] = { $in: status };
        where.$and.push(where_status);
      }
    }

    if (search != undefined) {
      var $or = [];
      let where_email = {};
      let where_username = {};
      where_email['email'] = { $regex: search, $options: "i" };
      where_username['username'] = { $regex: search, $options: "i" };
      $or.push(where_email);
      $or.push(where_username);
      where.$and.push({ $or:$or });
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
