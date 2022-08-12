import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserauthDto } from './dto/create-userauth.dto';
import { Userauth, UserauthDocument } from './schemas/userauth.schema';

@Injectable()
export class UserauthsService {
  constructor(
    @InjectModel(Userauth.name, 'SERVER_TRANS')
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
    return this.userauthModel.findOne({ username: username }).exec();
  }

  async findOneemail(email: String): Promise<Userauth> {
    return this.userauthModel.findOne({ email: email }).exec();
  }

  async findRoleEmail(email: String, roles_: String): Promise<Userauth[]> {
    return this.userauthModel.find({ email: email, roles: { $in: [roles_] } }).exec();
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

  async findOne(email: String): Promise<Userauth> {
    return this.userauthModel.findOne({ email: email }).exec();
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
    return await this.userauthModel.updateOne({ email: email }, { $pull: { roles: Role.toString() } }).exec();
  }

  async addUserRole(email: String, Role: String) {
    return await this.userauthModel.updateOne({ email: email }, { $push: { roles: Role.toString() } }).exec();
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
}
