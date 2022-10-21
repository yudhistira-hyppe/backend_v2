import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateContentdailyqueuesDto } from './dto/create-contentdailyqueue.dto';
import { Contentdailyqueues, ContentdailyqueuesDocument } from './schemas/contentdailyqueue.schema';

@Injectable()
export class ContentdailyqueueService {
  constructor(
    @InjectModel(Contentdailyqueues.name, 'SERVER_FULL')
    private readonly ContentdailyqueuesModel: Model<ContentdailyqueuesDocument>,
  ) { }

  async create(
    CreateContentdailyqueuesDto: CreateContentdailyqueuesDto,
  ): Promise<Contentdailyqueues> {
    const createContentdailyqueuesDto =
      await this.ContentdailyqueuesModel.create(CreateContentdailyqueuesDto);
    return createContentdailyqueuesDto;
  }

  async findAll(): Promise<Contentdailyqueues[]> {
    return this.ContentdailyqueuesModel.find().exec();
  }

  async findOne(id: string): Promise<Contentdailyqueues> {
    return this.ContentdailyqueuesModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.ContentdailyqueuesModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }
}
