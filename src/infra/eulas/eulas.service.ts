import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEulasDto } from './dto/create-eulas.dto';
import { Eulas, EulasDocument } from './schemas/eulas.schema';
@Injectable()
export class EulasService {
  constructor(
    @InjectModel(Eulas.name, 'SERVER_FULL')
    private readonly eulasModel: Model<EulasDocument>,
  ) { }

  async create(CreateEulasDto: CreateEulasDto): Promise<Eulas> {
    const createEulasDto = await this.eulasModel.create(CreateEulasDto);
    return createEulasDto;
  }

  async findCriteria(pageNumber: number, pageRow: number, langIso: string) {
    var perPage = pageRow
      , page = Math.max(0, pageNumber);
    var where = {};
    if (langIso != undefined) {
      where['langIso'] = langIso;
    }
    const query = await this.eulasModel.find(where).limit(perPage).skip(perPage * page).sort({ _id: 'asc' });
    return query;
  }

  async findAll(): Promise<Eulas[]> {
    return this.eulasModel.find().exec();
  }

  async findOne(id: string): Promise<Eulas> {
    return this.eulasModel.findOne({ _id: id }).exec();
  }

  async findOnelangiso(langIso: string): Promise<Eulas> {
    return this.eulasModel.findOne({ langIso: langIso }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.eulasModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }
}
