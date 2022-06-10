import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDisquslogsDto } from './dto/create-disquslogs.dto';
import { Disquslogs, DisquslogsDocument } from './schemas/disquslogs.schema';

@Injectable()
export class DisquslogsService {
  constructor(
    @InjectModel(Disquslogs.name, 'SERVER_CONTENT')
    private readonly DisquslogsModel: Model<DisquslogsDocument>,
  ) { }

  async create(CreateDisquslogsDto: CreateDisquslogsDto): Promise<Disquslogs> {
    const createDisquslogsDto = await this.DisquslogsModel.create(
      CreateDisquslogsDto,
    );
    return createDisquslogsDto;
  }

  async findAll(): Promise<Disquslogs[]> {
    return this.DisquslogsModel.find().exec();
  }

  async findOne(id: string): Promise<Disquslogs> {
    return this.DisquslogsModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.DisquslogsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  async finddisquslog() {
    const query = await this.DisquslogsModel.aggregate([

      {
        $lookup: {
          from: 'disquslogs',
          localField: 'disquslogs.$id',
          foreignField: '_id',
          as: 'roless',
        },
      }, {
        $out: {
          db: 'hyppe_trans_db',
          coll: 'disquslogs2'
        }
      },

    ]);
    return query;
  }

  async update(
    id: string,
    createDisquslogsDto: CreateDisquslogsDto,
  ): Promise<Disquslogs> {
    let data = await this.DisquslogsModel.findByIdAndUpdate(
      id,
      createDisquslogsDto,
      { new: true },
    );

    if (!data) {
      throw new Error('Todo is not found!');
    }
    return data;
  }
}
