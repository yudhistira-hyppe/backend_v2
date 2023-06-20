import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { subChallenge, subchallengeDocument } from './schemas/subchallenge.schema';
import { CreateSubChallengeDto } from './dto/create-subchallenge.dto';

@Injectable()
export class subChallengeService {
  constructor(
    @InjectModel(subChallenge.name, 'SERVER_FULL')
    private readonly subChallengeModel: Model<subchallengeDocument>,
  ) { }

  async create(subchallengedata: CreateSubChallengeDto) {
    const result = await this.subChallengeModel.create(subchallengedata);
    return result;
  }

  async findOne(id: string): Promise<subChallenge> {
    return this.subChallengeModel.findOne({ _id: new Types.ObjectId(id) }).exec();
  }

  async findChild(id: string): Promise<subChallenge[]> {
    return this.subChallengeModel.find({ challengeId: new Types.ObjectId(id) }).exec();
  }

  async find(): Promise<subChallenge[]> {
    return this.subChallengeModel.find().exec();
  }

  async update(id: string, subChallengedata: CreateSubChallengeDto): Promise<subChallenge> {
    let data = await this.subChallengeModel.findByIdAndUpdate(id, subChallengedata, { new: true });
    if (!data) {
      throw new Error('Data is not found!');
    }
    return data;
  }

  async delete(id: string) {
    const data = await this.subChallengeModel.findByIdAndRemove({ _id: new Types.ObjectId(id) }).exec();
    return data;
  }

  async findbyid(id: string) {
    var query = await this.subChallengeModel.aggregate([
      {

        $match: {

          challengeId: new Types.ObjectId(id)
        }
      }

    ]);
    return query;
  }

  async listingleaderboard(challengeId: string, userId: string)
  {
    var mongo = require('mongoose');
    var konvertChallenge = mongo.Types.ObjectId(challengeId);
    var konvertUser = mongo.Types.ObjectId(userId);

    var data = await this.subChallengeModel.aggregate([
        {
            $set: {
                "timenow": 
                {
                    "$dateToString": {
                        "format": "%Y-%m-%d %H:%M:%S",
                        "date": {
                            $add: [
                                new Date(),
                                - 61200000
                            ] // 1 hari 61200000
                        }
                    }
                }
            }
        },
        {
            "$match": 
            {
                "$and": 
                [
                    {
                        challengeId: konvertChallenge
                    },
                    
                ]
            }
        },
        {
            "$lookup": 
            {
                from: "userChallenge",
                let: 
                {
                    userchallenge_fk: "$_id"
                },
                as: 'getlastrank',
                pipeline: 
                [
                    {
                        "$match": 
                        {
                            $or: 
                            [
                                {
                                    "$and": 
                                    [
                                        {
                                            "$expr": 
                                            {
                                                "$eq": 
                                                [
                                                    "$$userchallenge_fk",
                                                    "$idSubChallenge"
                                                ]
                                            }
                                        },
                                        {
                                            isActive: true
                                        },
                                        {
                                            ranking: {
                                                $ne: 0
                                            }
                                        },
                                        {
                                            ranking: {
                                                $ne: null
                                            }
                                        },
                                        {
                                            $expr: 
                                            {
                                                $lte: 
                                                [
                                                    "$timenow",
                                                    "$startDatetime",
                                                    
                                                ]
                                            }
                                        },
                                        
                                    ]
                                },
                                {
                                    "$and": 
                                    [
                                        {
                                            "$expr": 
                                            {
                                                "$eq": 
                                                [
                                                    "$$userchallenge_fk",
                                                    "$idSubChallenge"
                                                ]
                                            }
                                        },
                                        {
                                            idUser: konvertUser,
                                            
                                        },
                                        {
                                            isActive: true
                                        },
                                        {
                                            ranking: {
                                                $ne: 0
                                            }
                                        },
                                        {
                                            ranking: {
                                                $ne: null
                                            }
                                        },
                                        {
                                            $expr: 
                                            {
                                                $lte: 
                                                [
                                                    "$timenow",
                                                    "$startDatetime",
                                                    
                                                ]
                                            }
                                        },
                                        
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        $set: {
                            lastRank: //{$arrayElemAt:[ "$history.ranking", 0]}
                            {
                                $ifNull: 
                                [
                                    {
                                        $arrayElemAt: ["$history.ranking", 0]
                                    },
                                    0
                                ]
                            }
                        }
                    },
                    {
                        $set: {
                            userID: konvertUser,
                            
                        }
                    },
                    {
                        $set: {
                            isUserLogin: 
                            {
                                "$cond": 
                                {
                                    if : 
                                        {
                                        "$eq": 
                                        ["$userID", "$idUser"]
                                    },
                                    then: true,
                                    else : false
                                }
                            },
                            
                        }
                    },
                    {
                        "$sort": 
                        {
                            isUserLogin: - 1,
                            ranking: 1
                        }
                    },
                    {
                        $limit: 11
                    },
                    {
                        "$lookup": 
                        {
                            from: "userbasics",
                            let: 
                            {
                                basic_fk: "$idUser",
                                
                            },
                            as: 'userbasic_data',
                            pipeline: 
                            [
                                {
                                    "$match": 
                                    {
                                        "$expr": 
                                        {
                                            "$eq": 
                                            [
                                                "$_id",
                                                "$$basic_fk"
                                            ]
                                        }
                                    }
                                },
                                {
                                    "$lookup": 
                                    {
                                        from: "userauths",
                                        let: 
                                        {
                                            basic_fk: "$email"
                                        },
                                        as: 'userauth_data',
                                        pipeline: 
                                        [
                                            {
                                                "$match": 
                                                {
                                                    "$and": 
                                                    [
                                                        {
                                                            "$expr": 
                                                            {
                                                                "$eq": 
                                                                [
                                                                    "$email",
                                                                    "$$basic_fk"
                                                                ]
                                                            },
                                                            
                                                        },
                                                        
                                                    ]
                                                }
                                            },
                                            
                                        ]
                                    }
                                },
                                {
                                    "$project": 
                                    {
                                        _id: 1,
                                        email: 1,
                                        username: 
                                        {
                                            "$arrayElemAt": 
                                            [
                                                "$userauth_data.username",
                                                0
                                            ]
                                        },
                                        avatar: 
                                        {
                                            mediaEndpoint: 
                                            {
                                                "$concat": 
                                                [
                                                    "/profilepict/",
                                                    "$profilePict.$id",
                                                    
                                                ]
                                            }
                                        },
                                        
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "$project": 
                        {
                            idUser: 1,
                            score: 1,
                            ranking: 1,
                            lastRank: 1,
                            idSubChallenge: 1,
                            history: 1,
                            sorter: "$ranking",
                            username: 
                            {
                                "$arrayElemAt": 
                                [
                                    "$userbasic_data.username",
                                    0
                                ]
                            },
                            email: 
                            {
                                "$arrayElemAt": 
                                [
                                    "$userbasic_data.email",
                                    0
                                ]
                            },
                            avatar: 
                            {
                                "$arrayElemAt": 
                                [
                                    "$userbasic_data.avatar",
                                    0
                                ]
                            },
                            currentstatistik: 
                            {
                                "$switch": 
                                {
                                    branches: 
                                    [
                                        {
                                            case: 
                                            {
                                                $gt: ["$ranking", "$lastRank"]
                                            },
                                            then: "UP"
                                        },
                                        {
                                            case: 
                                            {
                                                "$gt": ["$lastRank", "$ranking"]
                                            },
                                            then: "DOWN"
                                        },
                                        
                                    ],
                                    default: "NETRAL"
                                }
                            },
                            isUserLogin: 1,
                        }
                    },
                    {
                        $sort: {
                            ranking: 1
                        }
                    },
                ]
            },
            
        },
    ]);

    return data;
  }
}
