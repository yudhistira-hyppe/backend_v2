import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReactionsrepoDto } from './dto/create-reactionsrepo.dto';
import { Reactionsrepo, ReactionsrepoDocument } from './schemas/reactionsrepo.schema';

@Injectable()
export class ReactionsRepoService {
  constructor(
    @InjectModel(Reactionsrepo.name, 'SERVER_INFRA')
    private readonly ReactionsrepoModel: Model<ReactionsrepoDocument>,
  ) {}

  async create(
    CreateReactionsrepoDto: CreateReactionsrepoDto,
  ): Promise<Reactionsrepo> {
    const createReactionsrepoDto = await this.ReactionsrepoModel.create(
      CreateReactionsrepoDto,
    );
    return createReactionsrepoDto;
  }

  async findAll(): Promise<Reactionsrepo[]> {
    return this.ReactionsrepoModel.find().exec();
  }

  async findOne(id: string): Promise<Reactionsrepo> {
    return this.ReactionsrepoModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.ReactionsrepoModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }
}
