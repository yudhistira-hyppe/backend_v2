import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSnapshoteventsDto } from './dto/create-snapshotevents.dto';
import { Snapshotevents, SnapshoteventsDocument } from './schemas/snapshotevents.schema';

@Injectable()
export class SnapshoteventsService {
  constructor(
    @InjectModel(Snapshotevents.name, 'SERVER_FULL')
    private readonly snapshoteventsModel: Model<SnapshoteventsDocument>,
  ) { }

  async create(
    CreateSnapshoteventsDto: CreateSnapshoteventsDto,
  ): Promise<Snapshotevents> {
    const createSnapshoteventsDto = await this.snapshoteventsModel.create(
      CreateSnapshoteventsDto,
    );
    return createSnapshoteventsDto;
  }

  async findAll(): Promise<Snapshotevents[]> {
    return this.snapshoteventsModel.find().exec();
  }

  async findOne(id: string): Promise<Snapshotevents> {
    return this.snapshoteventsModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.snapshoteventsModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }
}
