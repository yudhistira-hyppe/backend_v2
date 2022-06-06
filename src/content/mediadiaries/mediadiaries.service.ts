import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMediadiariesDto } from './dto/create-mediadiaries.dto';
import { Mediadiaries, MediadiariesDocument } from './schemas/mediadiaries.schema';

@Injectable()
export class MediadiariesService {
  constructor(
    @InjectModel(Mediadiaries.name, 'SERVER_CONTENT')
    private readonly MediadiariesModel: Model<MediadiariesDocument>,
  ) {}

  async create(
    CreateMediadiariesDto: CreateMediadiariesDto,
  ): Promise<Mediadiaries> {
    const createMediadiariesDto = await this.MediadiariesModel.create(
      CreateMediadiariesDto,
    );
    return createMediadiariesDto;
  }

  async findAll(): Promise<Mediadiaries[]> {
    return this.MediadiariesModel.find().exec();
  }

  async findOne(id: string): Promise<Mediadiaries> {
    return this.MediadiariesModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.MediadiariesModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  async finddiaries(){
    const query =await this.MediadiariesModel.aggregate([
  
      {
        $lookup: {
          from: 'mediadiaries',
          localField: 'mediadiaries.$id',
          foreignField: '_id',
          as: 'roless',
        },
      },{
        $out:{
          db:'hyppe_trans_db',
          coll:'mediadiaries2'
        }
      },
     
    ]);
    return query;
  }
}
