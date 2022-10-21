import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFschunksDto } from './dto/create-fs.chunks.dto';
import { Fschunks, FschunksDocument } from './schemas/fs.chunks.schema';
@Injectable()
export class FsChunksService {
  constructor(
    @InjectModel(Fschunks.name, 'SERVER_FULL')
    private readonly fschunksModel: Model<FschunksDocument>,
  ) { }

  async create(CreateFschunksDto: CreateFschunksDto): Promise<Fschunks> {
    const createFschunksDto = await this.fschunksModel.create(
      CreateFschunksDto,
    );
    return createFschunksDto;
  }

  async findAll(): Promise<Fschunks[]> {
    return this.fschunksModel.find().exec();
  }

  async findOne(id: string): Promise<Fschunks> {
    return this.fschunksModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.fschunksModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }
}
