import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { CreateUserauthDto } from './dto/create-userauth.dto';
import { Userauth, UserauthDocument } from './schemas/userauth.schema';

@Injectable()
export class UserauthsService {
  constructor(
    @InjectModel(Userauth.name, 'SERVER_FULL')
    private readonly userauthModel: Model<UserauthDocument>,
  ) { }

  async create(CreateUserauthDto: CreateUserauthDto): Promise<Userauth> {
    const createUserauthDto = await this.userauthModel.create(
      CreateUserauthDto,
    );
    return createUserauthDto;
  }

  async findAll(): Promise<Userauth[]> {
    return this.userauthModel.find().exec();
  }

  async findOneUsername(username: String): Promise<Userauth> {
    return this.userauthModel.findOne({ username: username, isEmailVerified: true, isEnabled: true }).exec();
  }

  async findOneemail(email: String): Promise<Userauth> {
    return this.userauthModel.findOne({ email: email, isEmailVerified: true, isEnabled: true }).exec();
  }
  async findOneId(id: ObjectId): Promise<Userauth> {
    return this.userauthModel.findOne({ _id: id }).exec();
  }

  async findById(id: String): Promise<Userauth> {
    return this.userauthModel.findById(id);
  }

  async findIn(id: String[]): Promise<Userauth[]> {
    return this.userauthModel.find().where('email').in(id).exec();
  }

  async findByUsername(Username: String): Promise<Userauth> {
    return await this.userauthModel.findOne({ username: Username }).exec();
  }

  async findRoleEmail(email: String, roles_: String): Promise<Userauth[]> {
    return this.userauthModel.find({ email: email, roles: { $in: [roles_] } }).exec();
  }

  async removeRoleEmail(email: String, roles_: String) {
    return await this.userauthModel.updateOne({ email: email }, { $pull: { roles: roles_ } }).exec();
  }
        
  // async findOne(username: String): Promise<Userauth> {
  //   return this.userauthModel.findOne({ username: username }).exec();
  // }

  async findOneByEmailandUsername(
    email: String,
    username: String,
  ): Promise<any> {
    return this.userauthModel
      .findOne({
        $or: [{ email: email }, { username: username }],
      })
      .exec();
  }

  async search(search: String): Promise<Userauth[]> {
    return this.userauthModel.find({$or: [{ email: search }, { username: search }],}).exec();
  }  

  async findOne(email: String): Promise<Userauth> {
    return await this.userauthModel.findOne({ email: email }).exec();
  }

  async updatebyId(id: string, data: Object) {
    console.log(id);
    this.userauthModel.updateOne(
      {
        _id: Object(id),
      },
      data,
      function (err, docs) {
        if (err) {
          //console.log(err);
        } else {
          //console.log(docs);
        }
      },
    );
  }

  async findOneByEmail(email: String): Promise<Userauth> {
    return this.userauthModel.findOne({ email: email }).exec();
  }
  // async findOneId(id: String): Promise<Userauth> {
  //   return this.userauthModel.findOne({ _id: id }).exec();
  // }

  async delete(id: String) {
    const deletedCat = await this.userauthModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }

  async updatebyEmail(email: String, data: Object) {
    this.userauthModel.updateOne(
      {
        email: email,
      },
      data,
      function (err, docs) {
        if (err) {
          //console.log(err);
        } else {
          //console.log(docs);
        }
      },
    );
  }

  async findOneupdatebyEmail(email: String) {
    this.userauthModel.updateOne(
      {
        email: email,
      },
      { $inc: { otpAttempt: 1 } },
      function (err, docs) {
        if (err) {
          //console.log(err);
        } else {
          //console.log(docs);
        }
      },
    );
  }

  async deleteUserRole(email: String, Role: String) {
    return await this.userauthModel.updateOne({ email: email }, { $pull: { roles: Role } }).exec();
  }

  async addUserRole(email: String, Role: String) {
    return await this.userauthModel.updateOne({ email: email }, { $push: { roles: Role } }).exec();
  }

  async findUpdateEmailStatusRole(email: String, upgradeRole: String) {
    this.userauthModel.updateOne(
      {
        email: email,
      },
      { upgradeRole: upgradeRole },
      function (err, docs) {
        if (err) {
          //console.log(err);
        } else {
          //console.log(docs);
        }
      },
    );
  }
  async update(email: String, roles: String): Promise<Object> {
    let data = await this.userauthModel.updateOne({ "email": email },
      { $set: { "roles": [roles] } });
    return data;
  }

  async updateNoneActive(email: String): Promise<Object> {
    let data = await this.userauthModel.updateOne({ "email": email },
      {
        $set: {
          "isEnabled": false,
          "isEmailVerified": false,
          "email": email + '_noneactive',
        }
      });
    return data;
  }

  async coutRow(keys: string) {
    const query = await this.userauthModel.aggregate([
      {
        "$match": {
          username: {
            $regex: keys
          }
        }
      },
      {
        $group: {
          _id: null,
          totalpost: {
            $sum: 1
          }
        }
      }
    ]);
    return query;
  }

  async findUserNew(username: string, skip: number, limit: number) {

    if (username !== undefined) {
      const query = await this.userauthModel.aggregate([
        {
          "$match": {
            "username": {
              $regex: username,
              $options: 'i'
            }
          }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'userbasics',
            localField: '_id',
            foreignField: 'userAuth.$id',
            as: 'userbasic_data',

          },

        },
        {
          $project: {
            ubasic: {
              $arrayElemAt: ['$userbasic_data', 0]
            },
            username: '$username',
            email: '$email',
            idUserAuth: '$_id',
          },

        },
        {
          $project: {

            _id: '$ubasic._id',
            username: '$username',
            fullName: '$ubasic.fullName',
            mediaId: '$ubasic.profilePict.$id',
            email: '$email',
            idUserAuth: '$idUserAuth'

          },

        },
        {
          $sort: {
            username: 1
          },

        },
      ]);
      return query;
    }
    else {
      const query = await this.userauthModel.aggregate([

        {
          $skip: 0
        },
        {
          $limit: 1
        },

      ]);
      return query;
    }

  }

  async getUserActiveByDate(startdate:string)
  {
    var before = new Date(startdate).toISOString().split("T")[0];
    var input = new Date();
    input.setDate(input.getDate() + 1);
    var today = new Date(input).toISOString().split("T")[0];
    //kalo error, coba ganti jadi set dan jadi object
    var query = await this.userauthModel.aggregate([
      {
        "$match":
        {
            createdAt:
            {
                "$gte":before,
                "$lte":today
            },
            isEnabled:true
        }
      },
      {
        "$project":
        {
            createdAt:
            {
                "$substr":
                [
                    "$createdAt", 0, 10
                ]
            }
        }
      },
      {
        "$group":
        {
            _id:
            {
                "$dateFromString": 
                {
                    "format": "%Y-%m-%d",
                    "dateString": "$createdAt"
                    
                }
            },
            totalperhari:
            {
                "$sum":1
            }
        }
      },
      {
        "$project":
        {
            _id:1,
            totalperhari:1
        }
      },
      {
        "$unwind":
        {
            path:"$_id"
        }
      },
      {
        "$sort":
        {
            _id:-1 
        }
      },
      {
        "$group":
        {
            _id:null,
            total:
            {
                "$sum":"$totalperhari"
            },
            resultdata:
            {
                "$push":
                {
                    _id:
                    {
                      "$substr":
                      [
                        {
                            "$toString":"$_id"
                        },0,10
                      ]
                    },
                    totaldata:"$totalperhari"
                }
            }
        }
      }
    ]); 

    return query;
  }
}
