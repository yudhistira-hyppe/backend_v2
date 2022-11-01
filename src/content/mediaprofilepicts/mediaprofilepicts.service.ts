import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMediaprofilepictsDto } from './dto/create-mediaprofilepicts.dto';
import { Mediaprofilepicts, MediaprofilepictsDocument } from './schemas/mediaprofilepicts.schema';

@Injectable()
export class MediaprofilepictsService {
  constructor(
    @InjectModel(Mediaprofilepicts.name, 'SERVER_FULL')
    private readonly MediaprofilepictsModel: Model<MediaprofilepictsDocument>,
  ) { }

  async create(
    CreateMediaprofilepictsDto: CreateMediaprofilepictsDto,
  ): Promise<Mediaprofilepicts> {
    const createMediaprofilepictsDto = await this.MediaprofilepictsModel.create(
      CreateMediaprofilepictsDto,
    );
    return createMediaprofilepictsDto;
  }

  async createV2(dto: Mediaprofilepicts): Promise<Mediaprofilepicts> {
    const ndto = await this.MediaprofilepictsModel.create(dto);
    return ndto;
  }  

  async findAll(): Promise<Mediaprofilepicts[]> {
    return this.MediaprofilepictsModel.find().exec();
  }

  async findArrayId(mediaId: any[]): Promise<Mediaprofilepicts[]> {
    return this.MediaprofilepictsModel.find({ mediaID: { $in: mediaId } }).exec();
  }

  async findOne(id: string): Promise<Mediaprofilepicts> {
    return this.MediaprofilepictsModel.findOne({ _id: id }).exec();
  }


  async findOnemediaID(mediaID: string): Promise<Mediaprofilepicts> {
    return this.MediaprofilepictsModel.findOne({ mediaID: mediaID }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.MediaprofilepictsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  // async findmediaprofil() {
  //   const query = await this.MediaprofilepictsModel.aggregate([

  //     {
  //       $lookup: {
  //         from: 'mediaprofilepicts',
  //         localField: 'mediaprofilepicts.$id',
  //         foreignField: '_id',
  //         as: 'roless',
  //       },
  //     }, {
  //       $out: {
  //         db: 'hyppe_trans_db',
  //         coll: 'mediaprofilepicts2'
  //       }
  //     },

  //   ]);
  //   return query;
  // }
}
