import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCountriesDto } from './dto/create-countries.dto';
import { Countries, CountriesDocument } from './schemas/countries.schema';
@Injectable()
export class CountriesService {
  constructor(
    @InjectModel(Countries.name, 'SERVER_INFRA')
    private readonly countriesModel: Model<CountriesDocument>,
  ) {}

  async create(CreateCountriesDto: CreateCountriesDto): Promise<Countries> {
    const createCountriesDto = await this.countriesModel.create(
      CreateCountriesDto,
    );
    return createCountriesDto;
  }

  async findAll(): Promise<Countries[]> {
    return this.countriesModel.find().exec();
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
}
