import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { CreateInterestsRepoDto } from './dto/create-interests_repo.dto';
import { Interestsrepo, InterestsrepoDocument } from './schemas/interests_repo.schema';
import { Integer } from 'aws-sdk/clients/codeguruprofiler';

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
    // if (langIso != undefined) {
    //   where['langIso'] = langIso;
    // }
    if (search != undefined) {
      where['interestName'] = { $regex: search, $options: "i" };

    }
    where['langIso'] = "en";
    const query = await this.interestsrepoModel.find(where).select({ "thumbnail": 1, "interestNameId": 1, "createdAt": 1, "icon": 1, "langIso": 1, "interestName": 1, "_id": 1 }).limit(perPage).skip(perPage * page).sort({ interestName: 'asc' });
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

  async findData() {
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

  async update(id:string, CreateInterestsRepoDto: CreateInterestsRepoDto)
  {
    var mongoose = require('mongoose');
    var repoID = mongoose.Types.ObjectId(id);
    var result = await this.interestsrepoModel.updateOne(
      {
        _id:repoID
      },
      {
        "$set":
        {
          "interestName": CreateInterestsRepoDto.interestName,
          "interestNameId": CreateInterestsRepoDto.interestNameId,
          "icon": CreateInterestsRepoDto.icon,
          "langIso": CreateInterestsRepoDto.langIso,
          "updatedAt": CreateInterestsRepoDto.updatedAt,
          "thumbnail": CreateInterestsRepoDto.thumbnail
        }
      }
    );

    return result;
  }

  async getInterestPagination(search:string, page:number, limit:number)
  {
    var pipeline = [];

    if(search != null)
    {
      pipeline.push(
        {
          "$match":
          {
            "$or":
            [
              {
                "interestName":
                {
                  "$regex":search,
                  "$options":"i"
                }
              },
              {
                "interestNameId":
                {
                  "$regex":search,
                  "$options":"i"
                }
              },
            ]
          }
        },
        {
          "$project":
          {
            _id:1,
            interestName:1,
            icon:1,
            createdAt:1,
            updatedAt:1,
            _class:1,
            langIso:1,
            interestNameId:1,
            thumbnail:1,
            posisihurufenglish:
            {
              "$cond":
              {
                if:
                {
                  "$eq":
                  [
                    {
                      "$indexOfBytes": [ "$interestName", search ]
                    },
                    -1
                  ]
                },
                then:
                {
                  "$strLenCP":"$interestNameId"
                },
                else:
                {
                  "$indexOfBytes": [ "$interestName", search ]
                }
              }
            },
            posisihurufindo:
            {
              "$cond":
              {
                if:
                {
                  "$eq":
                  [
                    {
                      "$indexOfBytes": [ "$interestNameId", search ]
                    },
                    -1
                  ]
                },
                then:
                {
                  "$strLenCP":"$interestName"
                },
                else:
                {
                  "$indexOfBytes": [ "$interestNameId", search ]
                }
              }
            }
          }
        },
        {
          "$project":
          {
            _id:1,
            interestName:1,
            icon:1,
            createdAt:1,
            updatedAt:1,
            _class:1,
            langIso:1,
            interestNameId:1,
            thumbnail:1,
      			// posisihurufenglish:1,
      			// posisihurufindo:1,
            fixsort:
            {
              "$cond":
              {
                if:
                {
                  "$gt":
                  [
                    "$posisihurufenglish",
                    "$posisihurufindo"
                  ]
                },
                then:"$posisihurufindo",
                else:"$posisihurufenglish"
              }
            }
          }
        },
        {
          "$sort":
          {
            fixsort:1
          }
        }
      );
    }

    if(page > 0)
    {
      pipeline.push({
          "$skip":limit * page
      });
    }

    if(limit > 0)
    {
      pipeline.push({   
          "$limit":limit
      });
    }

    var query = await this.interestsrepoModel.aggregate(pipeline);
    return query;
  }
}
