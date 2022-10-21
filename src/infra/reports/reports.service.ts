import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReportsDto } from './dto/create-reports.dto';
import { Reports, ReportsDocument } from './schemas/reports.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Reports.name, 'SERVER_FULL')
    private readonly ReportsModel: Model<ReportsDocument>,
  ) { }

  async create(CreateReportsDto: CreateReportsDto): Promise<Reports> {
    const createReportsDto = await this.ReportsModel.create(CreateReportsDto);
    return createReportsDto;
  }

  async findCriteria(langIso: string, reportType: string, action: string, pageNumber: number, pageRow: number, search: string) {
    var perPage = pageRow
      , page = Math.max(0, pageNumber);
    var where = {};
    if (langIso != undefined) {
      where['langIso'] = langIso;
    }
    if (reportType != undefined) {
      where['reportType'] = reportType;
    }
    if (action != undefined) {
      where['action'] = action;
    }
    if (search != undefined) {
      where['remark'] = { $regex: search, $options: "i" };
    }
    const query = await this.ReportsModel.find(where).limit(perPage).skip(perPage * page).sort({ _id: 'asc' });
    return query;
  }

  async findAll(): Promise<Reports[]> {
    return this.ReportsModel.find().exec();
  }

  async findOne(id: string): Promise<Reports> {
    return this.ReportsModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.ReportsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }
}
