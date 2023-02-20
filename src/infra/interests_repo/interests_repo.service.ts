import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { CreateInterestsRepoDto } from './dto/create-interests_repo.dto';
import { Interestsrepo, InterestsrepoDocument } from './schemas/interests_repo.schema';

@Injectable()
export class InterestsRepoService {
  constructor(
    @InjectModel(Interestsrepo.name, 'SERVER_FULL')
    private readonly interestsrepoModel: Model<InterestsrepoDocument>,
  ) { }

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

  async findOneByInterestNameLangIso(interestName: string, langIso: string): Promise<Interestsrepo> {
    return this.interestsrepoModel
      .findOne({ interestName: interestName, langIso: langIso })
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

  async findCriteria(langIso: string, pageNumber: number, pageRow: number, search: string) {
    var perPage = pageRow
      , page = Math.max(0, pageNumber);
    var where = {};
    if (langIso != undefined) {
      where['langIso'] = langIso;
    }
    if (search != undefined) {
      where['interestName'] = { $regex: search, $options: "i" };
    }
    const query = await this.interestsrepoModel.find(where).select({ "createdAt": 1, "icon": 1, "langIso": 1, "interestName": 1, "_id": 0 }).limit(perPage).skip(perPage * page).sort({ interestName: 'asc' });
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

  async findData(){
    const query = await this.interestsrepoModel.aggregate([
      {
        "$match":
        {
          langIso: "id"
        }
      },
      {
        "$lookup":
        {
          from: "userbasics",
          localField: "_id",
          foreignField: "userInterests.$id",
          as: "basics_data"
        }
      },
      {
        "$project":
        {
          _id: "$_id",
          interestName: 1,
          langIso: 1,
          basics_data: "$basics_data",
        }
      }
    ]);
    return query;
  }

  async executeData(id_interst1: string, id_interst2: string) {
    return this.interestsrepoModel
      .replaceOne({ "userInterests.$id": new ObjectId(id_interst1) },
        { "userInterests.$id": new ObjectId(id_interst2) })
      .exec();
  }
}
