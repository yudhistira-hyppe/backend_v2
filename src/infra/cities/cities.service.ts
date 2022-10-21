import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCitiesDto } from './dto/create-cities.dto';
import { Cities, CitiesDocument } from './schemas/cities.schema';
@Injectable()
export class CitiesService {
  constructor(
    @InjectModel(Cities.name, 'SERVER_FULL')
    private readonly citiesModel: Model<CitiesDocument>,
  ) { }

  async create(CreateCitiesDto: CreateCitiesDto): Promise<Cities> {
    const createCitiesDto = await this.citiesModel.create(CreateCitiesDto);
    return createCitiesDto;
  }

  async findAll(): Promise<Cities[]> {
    return this.citiesModel.find().exec();
  }

  async findOneName(cityName: string): Promise<Cities> {
    return this.citiesModel.findOne({ cityName: cityName }).exec();
  }

  async findCriteria(stateID: string, pageNumber: number, pageRow: number, search: string) {
    var perPage = pageRow
      , page = Math.max(0, pageNumber);
    var where = {};
    if (stateID != undefined) {
      where['stateID'] = stateID;
    }
    if (search != undefined) {
      where['cityName'] = { $regex: search, $options: "i" };
    }
    const query = await this.citiesModel.find(where).limit(perPage).skip(perPage * page).sort({ cityName: 'asc' });
    return query;
  }

  async findOne(id: String): Promise<Cities> {
    return this.citiesModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.citiesModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }

  // async findcities() {
  //   const query = await this.citiesModel.aggregate([

  //     {
  //       $lookup: {
  //         from: 'cities',
  //         localField: 'cities.$id',
  //         foreignField: '_id',
  //         as: 'roless',
  //       },
  //     }, {
  //       $out: {
  //         db: 'hyppe_trans_db',
  //         coll: 'cities2'
  //       }
  //     },

  //   ]);
  //   return query;
  // }
}
