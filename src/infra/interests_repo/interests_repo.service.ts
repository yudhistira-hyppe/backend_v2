import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateInterestsRepoDto } from './dto/create-interests_repo.dto';
import { Interestsrepo, InterestsrepoDocument } from './schemas/interests_repo.schema';

@Injectable()
export class InterestsRepoService {
    constructor(
        @InjectModel(Interestsrepo.name) private readonly interestsrepoModel: Model<InterestsrepoDocument>,
      ) {}
     
      async create(CreateInterestsRepoDto: CreateInterestsRepoDto): Promise<Interestsrepo> {
        const createInterestsRepoDto = await this.interestsrepoModel.create(CreateInterestsRepoDto);
        return createInterestsRepoDto;
      }
    
      async findAll(): Promise<Interestsrepo[]> {
        return this.interestsrepoModel.find().exec();
      }
      

       async findOne(id: string): Promise<Interestsrepo> {
        return this.interestsrepoModel.findOne({ _id: id }).exec();
      }
    
      async delete(id: string) {
        const deletedCat = await this.interestsrepoModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
}
