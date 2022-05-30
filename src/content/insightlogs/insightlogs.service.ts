import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateInsightlogsDto } from './dto/create-insightlogs.dto';
import { Insightlogs, InsightlogsDocument } from './schemas/insightlogs.schema';

@Injectable()
export class InsightlogsService {

    constructor(
        @InjectModel(Insightlogs.name) private readonly InsightlogsModel: Model<InsightlogsDocument>,
      ) {}
     
      async create(CreateInsightlogsDto: CreateInsightlogsDto): Promise<Insightlogs> {
        const createInsightlogsDto = await this.InsightlogsModel.create(CreateInsightlogsDto);
        return createInsightlogsDto;
      }
    
      async findAll(): Promise<Insightlogs[]> {
        return this.InsightlogsModel.find().exec();
      }
      

       async findOne(id: string): Promise<Insightlogs> {
        return this.InsightlogsModel.findOne({ _id: id }).exec();
      }
    
      async delete(id: string) {
        const deletedCat = await this.InsightlogsModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
