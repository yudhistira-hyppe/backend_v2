import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDisqusDto } from './dto/create-disqus.dto';
import { Disqus, DisqusDocument } from './schemas/disqus.schema';

@Injectable()
export class DisqusService {
  constructor(
    @InjectModel(Disqus.name, 'SERVER_CONTENT')
    private readonly DisqusModel: Model<DisqusDocument>,
  ) {}

  async create(CreateDisqusDto: CreateDisqusDto): Promise<Disqus> {
    const createDisqusDto = await this.DisqusModel.create(CreateDisqusDto);
    return createDisqusDto;
  }

  async findAll(): Promise<Disqus[]> {
    return this.DisqusModel.find().exec();
  }

  //    async findOne(id: string): Promise<Disqus> {
  //     return this.DisqusModel.findOne({ _id: id }).exec();
  //   }
  async findOne(email: string): Promise<Disqus> {
    return this.DisqusModel.findOne({ email: email }).exec();
  }
  async delete(id: string) {
    const deletedCat = await this.DisqusModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }
}
