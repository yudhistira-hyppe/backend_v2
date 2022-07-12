import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCorevaluesDto } from './dto/create-corevalues.dto';
import { Corevalues, CorevaluesDocument } from './schemas/corevalues.schema';

@Injectable()
export class CorevaluesService {
  constructor(
    @InjectModel(Corevalues.name, 'SERVER_INFRA')
    private readonly corevaluesModel: Model<CorevaluesDocument>,
  ) {}

  async create(CreateCorevaluesDto: CreateCorevaluesDto): Promise<Corevalues> {
    const createCorevaluesDto = await this.corevaluesModel.create(
      CreateCorevaluesDto,
    );
    return createCorevaluesDto;
  }

  async findcore_type(core_type: string): Promise<Corevalues> {
    return this.corevaluesModel.findOne({ core_type: core_type }).exec();
  }

  async findAll(): Promise<Corevalues[]> {
    return this.corevaluesModel.find().exec();
  }

  async findOne(id: string): Promise<Corevalues> {
    return this.corevaluesModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.corevaluesModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }
}
