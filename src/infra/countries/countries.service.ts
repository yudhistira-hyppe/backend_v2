import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCountriesDto } from './dto/create-countries.dto';
import { Countries, CountriesDocument } from './schemas/countries.schema';
@Injectable()
export class CountriesService {
  constructor(
    @InjectModel(Countries.name, 'SERVER_FULL')
    private readonly countriesModel: Model<CountriesDocument>,
  ) { }

  async create(CreateCountriesDto: CreateCountriesDto): Promise<Countries> {
    const createCountriesDto = await this.countriesModel.create(
      CreateCountriesDto,
    );
    return createCountriesDto;
  }

  async findCriteria(pageNumber: number, pageRow: number, search: string) {
    var perPage = pageRow
      , page = Math.max(0, pageNumber);
    var where = {};
    if (search != undefined) {
      where['country'] = { $regex: search, $options: "i" };
    }
    const query = await this.countriesModel.find(where).limit(perPage).skip(perPage * page).sort({ country: 'asc' });
    return query;
  }

  async findAll(): Promise<Countries[]> {
    return this.countriesModel.find().exec();
  }

  async findOneName(country: string): Promise<Countries> {
    return this.countriesModel.findOne({ country: country }).exec();
  }

  async findOne(id: string): Promise<Countries> {
    return this.countriesModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.countriesModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }

  async findcountries() {
    const query = await this.countriesModel.aggregate([

      {
        $lookup: {
          from: 'countries',
          localField: 'countries.$id',
          foreignField: '_id',
          as: 'roless',
        },
      }, {
        $out: {
          db: 'hyppe_trans_db',
          coll: 'countries2'
        }
      },

    ]);
    return query;
  }
}
