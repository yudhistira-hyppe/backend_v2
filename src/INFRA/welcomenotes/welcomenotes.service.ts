import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWelcomenotesDto } from './dto/create-welcomenotes.dto';
import { Welcomenotes, WelcomenotesDocument } from './schemas/welcomenotes.schema';

@Injectable()
export class WelcomenotesService {
    constructor(
        @InjectModel(Welcomenotes.name) private readonly WelcomenotesModel: Model<WelcomenotesDocument>,
      ) {}
     
      async create(CreateWelcomenotesDto: CreateWelcomenotesDto): Promise<Welcomenotes> {
        const createWelcomenotesDto = await this.WelcomenotesModel.create(CreateWelcomenotesDto);
        return createWelcomenotesDto;
      }
    
      async findAll(): Promise<Welcomenotes[]> {
        return this.WelcomenotesModel.find().exec();
      }
      

       async findOne(id: string): Promise<Welcomenotes> {
        return this.WelcomenotesModel.findOne({ _id: id }).exec();
      }
    
      async delete(id: string) {
        const deletedCat = await this.WelcomenotesModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
