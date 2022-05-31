import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateInterestsDto } from './dto/create-interests.dto';
import { Interests, InterestsDocument } from './schemas/interests.schema';

@Injectable()
export class InterestsService {
  constructor(
    @InjectModel(Interests.name, 'SERVER_INFRA')
    private readonly interestsModel: Model<InterestsDocument>,
  ) {}

  async create(CreateInterestsDto: CreateInterestsDto): Promise<Interests> {
    const createInterestsDto = await this.interestsModel.create(
      CreateInterestsDto,
    );
    return createInterestsDto;
  }

  async findAll(): Promise<Interests[]> {
    return this.interestsModel.find().exec();
  }

  async findOne(id: string): Promise<Interests> {
    return this.interestsModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.interestsModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }
}
