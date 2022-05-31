import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTemplatesDto } from './dto/create-templates.dto';
import { Templates, TemplatesDocument } from './schemas/templates.schema';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectModel(Templates.name, 'SERVER_INFRA')
    private readonly TemplatesModel: Model<TemplatesDocument>,
  ) {}

  async create(CreateTemplatesDto: CreateTemplatesDto): Promise<Templates> {
    const createTemplatesDto = await this.TemplatesModel.create(
      CreateTemplatesDto,
    );
    return createTemplatesDto;
  }

  async findAll(): Promise<Templates[]> {
    return this.TemplatesModel.find().exec();
  }

  async findOne(id: string): Promise<Templates> {
    return this.TemplatesModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.TemplatesModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }
}
