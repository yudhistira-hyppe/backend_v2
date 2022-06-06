import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMediapictsDto } from './dto/create-mediapicts.dto';
import { Mediapicts, MediapictsDocument } from './schemas/mediapicts.schema';

@Injectable()
export class MediapictsService {
  constructor(
    @InjectModel(Mediapicts.name, 'SERVER_CONTENT')
    private readonly MediapictsModel: Model<MediapictsDocument>,
  ) {}

  async create(CreateMediapictsDto: CreateMediapictsDto): Promise<Mediapicts> {
    const createMediapictsDto = await this.MediapictsModel.create(
      CreateMediapictsDto,
    );
    return createMediapictsDto;
  }

  async findAll(): Promise<Mediapicts[]> {
    return this.MediapictsModel.find().exec();
  }

  async findOne(id: string): Promise<Mediapicts> {
    return this.MediapictsModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.MediapictsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  async findpict(){
    const query =await this.MediapictsModel.aggregate([
  
      {
        $lookup: {
          from: 'mediapicts',
          localField: 'mediapicts.$id',
          foreignField: '_id',
          as: 'roless',
        },
      },{
        $out:{
          db:'hyppe_trans_db',
          coll:'mediapicts2'
        }
      },
     
    ]);
    return query;
  }
}
