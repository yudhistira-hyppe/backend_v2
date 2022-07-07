import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateInterestsRepoDto } from './dto/create-interests_repo.dto';
import { Interestsrepo, InterestsrepoDocument } from './schemas/interests_repo.schema';

@Injectable()
export class InterestsRepoService {
  constructor(
    @InjectModel(Interestsrepo.name, 'SERVER_INFRA')
    private readonly interestsrepoModel: Model<InterestsrepoDocument>,
  ) {}

  async create(
    CreateInterestsRepoDto: CreateInterestsRepoDto,
  ): Promise<Interestsrepo> {
    const createInterestsRepoDto = await this.interestsrepoModel.create(
      CreateInterestsRepoDto,
    );
    return createInterestsRepoDto;
  }

  async findAll(): Promise<Interestsrepo[]> {
    return this.interestsrepoModel.find().exec();
  }

  async findOneByInterestName(interestName: string): Promise<Interestsrepo> {
    return this.interestsrepoModel
      .findOne({ interestName: interestName })
      .exec();
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

  async findCriteria(langIso:string,pageNumber:string,pageRow:string,search:string) {
    const query = await this.interestsrepoModel.aggregate([
      {
        $lookup: {
          from: 'interests_repo',
          localField: 'interests_repo.$id',
          foreignField: '_id',
          as: 'roless',
        },
      },
      {
        $out: {
          db: 'hyppe_trans_db',
          coll: 'interests_repo2',
        },
      },
    ]);
    return query;
  }

  async findinterst() {
    const query = await this.interestsrepoModel.aggregate([
      {
        $lookup: {
          from: 'interests_repo',
          localField: 'interests_repo.$id',
          foreignField: '_id',
          as: 'roless',
        },
      },
      {
        $out: {
          db: 'hyppe_trans_db',
          coll: 'interests_repo2',
        },
      },
    ]);
    return query;
  }
}
