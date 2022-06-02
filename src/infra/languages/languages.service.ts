
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLanguagesDto } from './dto/create-languages.dto';
import { Languages, LanguagesDocument } from './schemas/languages.schema';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectModel(Languages.name, 'SERVER_INFRA')
    private readonly LanguagesModel: Model<LanguagesDocument>,
  ) {}

  async create(CreateLanguagesDto: CreateLanguagesDto): Promise<Languages> {
    const createLanguagesDto = await this.LanguagesModel.create(
      CreateLanguagesDto,
    );
    return createLanguagesDto;
  }

  async findAll(): Promise<Languages[]> {
    return this.LanguagesModel.find().exec();
  }

  async findOne(id: string): Promise<Languages> {
    return this.LanguagesModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.LanguagesModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  async findlanguanges(){
    const query =await this.LanguagesModel.aggregate([
  
      {
        $lookup: {
          from: 'languages',
          localField: 'languages.$id',
          foreignField: '_id',
          as: 'roless',
        },
      },{
        $out:{
          db:'hyppe_trans_db',
          coll:'languages2'
        }
      },
     
    ]);
    return query;
  }
}
