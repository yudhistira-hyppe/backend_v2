import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCitiesDto } from './dto/create-cities.dto';
import { Cities, CitiesDocument } from './schemas/cities.schema';
@Injectable()
export class CitiesService {
  constructor(
    @InjectModel(Cities.name, 'SERVER_INFRA')
    private readonly citiesModel: Model<CitiesDocument>,
  ) {}

  async create(CreateCitiesDto: CreateCitiesDto): Promise<Cities> {
    const createCitiesDto = await this.citiesModel.create(CreateCitiesDto);
    return createCitiesDto;
  }

  async findAll(): Promise<Cities[]> {
    return this.citiesModel.find().exec();
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
}
