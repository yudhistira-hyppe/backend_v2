import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMediaproofpictsDto } from './dto/create-mediaproofpicts.dto';
import { Mediaproofpicts, MediaproofpictsDocument } from './schemas/mediaproofpicts.schema';

@Injectable()
export class MediaproofpictsService {
  constructor(
    @InjectModel(Mediaproofpicts.name, 'SERVER_CONTENT')
    private readonly MediaproofpictsModel: Model<MediaproofpictsDocument>,
  ) { }

  async create(
    CreateMediaproofpictsDto: CreateMediaproofpictsDto,
  ): Promise<Mediaproofpicts> {
    const createMediaproofpictsDto = await this.MediaproofpictsModel.create(
      CreateMediaproofpictsDto,
    );
    return createMediaproofpictsDto;
  }

  async findAll(): Promise<Mediaproofpicts[]> {
    return this.MediaproofpictsModel.find().exec();
  }

  async findOne(id: string): Promise<Mediaproofpicts> {
    return this.MediaproofpictsModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.MediaproofpictsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }


}
