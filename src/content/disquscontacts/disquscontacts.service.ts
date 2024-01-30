import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDisquscontactsDto } from './dto/create-disquscontacts.dto';
import { Disquscontacts, DisquscontactsDocument } from './schemas/disquscontacts.schema';

@Injectable()
export class DisquscontactsService {
  constructor(
    @InjectModel(Disquscontacts.name, 'SERVER_FULL')
    private readonly DisquscontactsModel: Model<DisquscontactsDocument>,
  ) { }

  async create(
    CreateDisquscontactsDto: CreateDisquscontactsDto,
  ): Promise<Disquscontacts> {
    const createDisquscontactsDto = await this.DisquscontactsModel.create(
      CreateDisquscontactsDto,
    );
    return createDisquscontactsDto;
  }

  async findAll(): Promise<Disquscontacts[]> {
    return this.DisquscontactsModel.find().exec();
  }

  async findMayeEmail(email: string, mate: string): Promise<Disquscontacts> {
    return this.DisquscontactsModel.findOne({ email: email, mate: mate }).exec();
  }

  //    async findOne(id: string): Promise<Disquscontacts> {
  //     return this.DisquscontactsModel.findOne({ _id: id }).exec();
  //   }
  async findOne(email: string): Promise<Disquscontacts> {
    return this.DisquscontactsModel.findOne({ email: email }).exec();
  }

  async findDisqusByEmail(email: string): Promise<any[]> {
    const Disquscontacts_ = this.DisquscontactsModel.aggregate([
      {
        $match: {
          email: email
        }
      },
      {
        $addFields: {
          disqus_id: '$disqus.$id'
        },
      },
      {
        $lookup: {
          from: 'disqus',
          localField: 'disqus_id',
          foreignField: '_id',
          as: 'disqus_data',
        },
      },
      {
        $addFields: {
          disqus_data_: { $arrayElemAt: ['$disqus_data', 0] },
        },
      },
      {
        $addFields: {
          updatedAt: '$disqus_data_.updatedAt',
        },
      },
      { $sort: { updatedAt: -1 } },
    ]).exec();
    return Disquscontacts_;
  }

  async findByEmailAndMate(email: string, receiverParty: string): Promise<any[]> {
    const Disquscontacts_ = await this.DisquscontactsModel.aggregate([
      {
        $match: {
          email: email,
          mate: receiverParty
        }
      },
      {
        $addFields: {
          disqus_id: '$disqus.$id'
        },
      },
      {
        $lookup: {
          from: 'disqus',
          localField: 'disqus_id',
          foreignField: '_id',
          as: 'disqus_data',
        },
      },
      {
        $addFields: {
          disqus_data_: { $arrayElemAt: ['$disqus_data', 0] },
        },
      },
      {
        $addFields: {
          updatedAt: '$disqus_data_.updatedAt',
        },
      },
      { $sort: { updatedAt: -1 } },
    ]).exec();
    return Disquscontacts_;
  }

  async delete(id: string) {
    const deletedCat = await this.DisquscontactsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }
}
