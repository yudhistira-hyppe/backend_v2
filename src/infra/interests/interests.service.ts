import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateInterestsDto } from './dto/create-interests.dto';
import { Interests, InterestsDocument } from './schemas/interests.schema';

@Injectable()
export class InterestsService {
  constructor(
    @InjectModel(Interests.name, 'SERVER_FULL')
    private readonly interestsModel: Model<InterestsDocument>,
  ) { }

  async create(CreateInterestsDto: CreateInterestsDto): Promise<Interests> {
    const createInterestsDto = await this.interestsModel.create(
      CreateInterestsDto,
    );
    return createInterestsDto;
  }

  async findAll(): Promise<Interests[]> {
    return this.interestsModel.find().exec();
  }

  async findOneByInterestNameLangIso(interestName: string, langIso: string): Promise<Interests> {
    return this.interestsModel
      .findOne({ interestName: interestName, langIso: langIso })
      .exec();
  }

  async findinterst() {
    const query = await this.interestsModel.aggregate([
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
          coll: 'interests_repo',
        },
      },
    ]);
    return query;
  }

  async findOne(id: string): Promise<Interests> {
    return this.interestsModel.findOne({ _id: id }).exec();
  }

  async findByName(name: string): Promise<Interests> {
    return this.interestsModel.findOne({ interestName: name }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.interestsModel
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
    const query = await this.interestsModel.find(where).select({ "createdAt": 1, "icon": 1, "langIso": 1, "interestName": 1, "_id": 0 }).limit(perPage).skip(perPage * page).sort({ interestName: 'asc' });
    return query;
  }
}
