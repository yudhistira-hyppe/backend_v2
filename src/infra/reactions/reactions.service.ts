import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReactionsDto } from './dto/create-reactions.dto';
import { Reactions, ReactionsDocument } from './schemas/reactions.schema';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectModel(Reactions.name, 'SERVER_FULL')
    private readonly ReactionsModel: Model<ReactionsDocument>,
  ) { }

  async create(CreateReactionsDto: CreateReactionsDto): Promise<Reactions> {
    const createReactionsDto = await this.ReactionsModel.create(
      CreateReactionsDto,
    );
    return createReactionsDto;
  }

  async findAll(): Promise<Reactions[]> {
    return this.ReactionsModel.find().exec();
  }

  async findOne(id: string): Promise<Reactions> {
    return this.ReactionsModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.ReactionsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }
}
