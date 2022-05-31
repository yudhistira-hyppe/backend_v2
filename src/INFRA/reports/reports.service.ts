import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReportsDto } from './dto/create-reports.dto';
import { Reports, ReportsDocument } from './schemas/reports.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Reports.name, 'SERVER_INFRA')
    private readonly ReportsModel: Model<ReportsDocument>,
  ) {}

  async create(CreateReportsDto: CreateReportsDto): Promise<Reports> {
    const createReportsDto = await this.ReportsModel.create(CreateReportsDto);
    return createReportsDto;
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
