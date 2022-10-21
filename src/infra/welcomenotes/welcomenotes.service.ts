import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWelcomenotesDto } from './dto/create-welcomenotes.dto';
import { Welcomenotes, WelcomenotesDocument } from './schemas/welcomenotes.schema';

@Injectable()
export class WelcomenotesService {
  constructor(
    @InjectModel(Welcomenotes.name, 'SERVER_FULL')
    private readonly WelcomenotesModel: Model<WelcomenotesDocument>,
  ) { }

  async create(
    CreateWelcomenotesDto: CreateWelcomenotesDto,
  ): Promise<Welcomenotes> {
    const createWelcomenotesDto = await this.WelcomenotesModel.create(
      CreateWelcomenotesDto,
    );
    return createWelcomenotesDto;
  }

  async findCriteria(langIso: string, countryCode: string, pageNumber: number, pageRow: number) {
    var perPage = pageRow
      , page = Math.max(0, pageNumber);
    var where = {};
    if (langIso != undefined) {
      where['langIso'] = langIso;
    }
    if (langIso != undefined) {
      where['countryCode'] = countryCode;
    }
    const query = await this.WelcomenotesModel.find(where).limit(perPage).skip(perPage * page).sort({ langIso: 'asc' });
    return query;
  }

  async findAll(): Promise<Welcomenotes[]> {
    return this.WelcomenotesModel.find().exec();
  }

  async findOne(id: string): Promise<Welcomenotes> {
    return this.WelcomenotesModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.WelcomenotesModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }
}
