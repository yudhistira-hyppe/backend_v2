import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateInsightsDto } from './dto/create-insights.dto';
import { Insights, InsightsDocument } from './schemas/insights.schema';


@Injectable()
export class InsightsService {

    constructor(
        @InjectModel(Insights.name) private readonly InsightsModel: Model<InsightsDocument>,
      ) {}
     
      async create(CreateInsightsDto: CreateInsightsDto): Promise<Insights> {
        const createInsightsDto = await this.InsightsModel.create(CreateInsightsDto);
        return createInsightsDto;
      }
    
      async findAll(): Promise<Insights[]> {
        return this.InsightsModel.find().exec();
      }
      

    //    async findOne(id: string): Promise<Insights> {
    //     return this.InsightsModel.findOne({ _id: id }).exec();
    //   }
    async findOne(_id: string): Promise<Insights> {
        return this.InsightsModel.findOne({ _id: _id }).exec();
      }
      async delete(id: string) {
        const deletedCat = await this.InsightsModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
