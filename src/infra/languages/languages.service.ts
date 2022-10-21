
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLanguagesDto } from './dto/create-languages.dto';
import { Languages, LanguagesDocument } from './schemas/languages.schema';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectModel(Languages.name, 'SERVER_FULL')
    private readonly LanguagesModel: Model<LanguagesDocument>,
  ) { }

  async create(CreateLanguagesDto: CreateLanguagesDto): Promise<Languages> {
    const createLanguagesDto = await this.LanguagesModel.create(
      CreateLanguagesDto,
    );
    return createLanguagesDto;
  }

  async findAll(): Promise<Languages[]> {
    return this.LanguagesModel.find().exec();
  }

  async findCriteria(langIso: string, search: string) {
    var where = {};
    if (langIso != undefined) {
      where['langIso'] = langIso;
    }
    if (search != undefined) {
      where['country'] = { $regex: search, $options: "i" };
    }
    const query = await this.LanguagesModel.find(where).sort({ langIso: 'asc' });
    return query;
  }

  async findOne(id: string): Promise<Languages> {
    return this.LanguagesModel.findOne({ _id: id }).exec();
  }

  async findOneLangiso(langIso: string): Promise<Languages> {
    return this.LanguagesModel.findOne({ langIso: langIso }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.LanguagesModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  async findlanguanges() {
    const query = await this.LanguagesModel.aggregate([
      {
        $lookup: {
          from: 'languages',
          localField: 'languages.$id',
          foreignField: '_id',
          as: 'roless',
        },
      },
      {
        $out: {
          db: 'hyppe_trans_db',
          coll: 'languages2',
        },
      },
    ]);
    return query;
  }
}
