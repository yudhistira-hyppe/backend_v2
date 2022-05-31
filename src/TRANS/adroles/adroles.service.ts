import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAdrolesDto } from './dto/create-adroles.dto';
import { Adroles, AdrolesDocument } from './schemas/adroles.schema';

@Injectable()
export class AdrolesService {
  constructor(
    @InjectModel(Adroles.name, 'SERVER_TRANS')
    private readonly adrolesModel: Model<AdrolesDocument>,
  ) {}

  async create(CreateAdrolesDto: CreateAdrolesDto): Promise<Adroles> {
    const createSagasDto = await this.adrolesModel.create(CreateAdrolesDto);
    return createSagasDto;
  }

  async findAll(): Promise<Adroles[]> {
    return this.adrolesModel.find().exec();
  }

  async findOne(id: string): Promise<Adroles> {
    return this.adrolesModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.adrolesModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }
}
