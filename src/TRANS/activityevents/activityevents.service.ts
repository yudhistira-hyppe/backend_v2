import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateActivityeventsDto } from './dto/create-activityevents.dto';
import { Activityevents, ActivityeventsDocument } from './schemas/activityevents.schema';
@Injectable()
export class ActivityeventsService {

    constructor(
        @InjectModel(Activityevents.name) private readonly activityeventsModel: Model<ActivityeventsDocument>,
      ) {}
     
      async create(CreateActivityeventsDto: CreateActivityeventsDto): Promise<Activityevents> {
        const createActivityeventsDto = await this.activityeventsModel.create(CreateActivityeventsDto);
        return createActivityeventsDto;
      }
    
      async findAll(): Promise<Activityevents[]> {
        return this.activityeventsModel.find().exec();
      }
      

       async findOne(id: string): Promise<Activityevents> {
        return this.activityeventsModel.findOne({ _id: id }).exec();
      }
    
      async delete(id: string) {
        const deletedCat = await this.activityeventsModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
