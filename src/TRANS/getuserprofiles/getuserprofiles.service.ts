import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGetuserprofilesDto } from './dto/create-getuserprofiles.dto';
import { Getuserprofiles, GetuserprofilesDocument } from './schemas/getuserprofiles.schema';

@Injectable()
export class GetuserprofilesService {

    constructor(
        @InjectModel(Getuserprofiles.name) private readonly getuserprofilesModel: Model<GetuserprofilesDocument>,
      ) {}
    
      async create(CreateGetuserprofilesDto: CreateGetuserprofilesDto): Promise<Getuserprofiles> {
        const createGetuserprofilesDto = await this.getuserprofilesModel.create(CreateGetuserprofilesDto);
        return createGetuserprofilesDto;
      }
    
      async findAll(documentsToSkip = 0, limitOfDocuments?: number) {
        const query = this.getuserprofilesModel
          .find()
          .sort({ _id: 1 })
          .skip(documentsToSkip)
         ;
       
        if (limitOfDocuments) {
          query.limit(limitOfDocuments);
        }
        return query;
      }
    
      // async findOne(id: string): Promise<Getuserprofiles> {
      //   return this.GetuserprofilesModel.findOne({ _id: id }).exec();
      // }
      async findOne(fullName: string): Promise<Getuserprofiles> {
        return this.getuserprofilesModel.findOne({ fullName: fullName }).exec();
      }
      async delete(id: string) {
        const deletedCat = await this.getuserprofilesModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
