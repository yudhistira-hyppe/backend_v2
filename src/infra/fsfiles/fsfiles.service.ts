import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFsfilesDto } from './dto/create-fsfiles.dto';
import { Fsfiles, FsfilesDocument } from './schemas/fsfiles.schema';

@Injectable()
export class FsfilesService {
  constructor(
    @InjectModel(Fsfiles.name, 'SERVER_FULL')
    private readonly fsfilesModel: Model<FsfilesDocument>,
  ) { }

  async create(CreateFsfilesDto: CreateFsfilesDto): Promise<Fsfiles> {
    const createFsfilesDto = await this.fsfilesModel.create(CreateFsfilesDto);
    return createFsfilesDto;
  }

  async findAll(): Promise<Fsfiles[]> {
    return this.fsfilesModel.find().exec();
  }

  async findOne(id: string): Promise<Fsfiles> {
    return this.fsfilesModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.fsfilesModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }
}
