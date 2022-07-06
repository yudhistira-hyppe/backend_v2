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
  ) {}

  async create(CreateUserauthDto: CreateUserauthDto): Promise<Userauth> {
    const createUserauthDto = await this.userauthModel.create(
      CreateUserauthDto,
    );
    return createUserauthDto;
  }

  async findAll(): Promise<Userauth[]> {
    return this.userauthModel.find().exec();
  }

  async findOneUsername(username: string): Promise<Userauth> {
    return this.userauthModel.findOne({ username: username }).exec();
  }
  // async findOne(username: string): Promise<Userauth> {
  //   return this.userauthModel.findOne({ username: username }).exec();
  // }

  async findOneByEmailandUsername(
    email: string,
    username: string,
  ): Promise<any> {
    return this.userauthModel
      .findOne({
        $or: [{ email: email }, { username: username }],
      })
      .exec();
  }

  async findOne(email: string): Promise<Userauth> {
    return this.userauthModel.findOne({ email: email }).exec();
  }

  async findOneByEmail(email: string): Promise<any> {
    return this.userauthModel.findOne({ email: email }).exec();
  }
  // async findOneId(id: string): Promise<Userauth> {
  //   return this.userauthModel.findOne({ _id: id }).exec();
  // }

  async delete(id: string) {
    const deletedCat = await this.userauthModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }

  async updatebyEmail(email: string, data: Object) {
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

  async findOneupdatebyEmail(email: string) {
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

  async findUpdateEmailStatusRole(email: string,upgradeRole: string) {
    this.userauthModel.updateOne(
      {
        email: email,
      },
      { upgradeRole:upgradeRole },
      function (err, docs) {
        if (err) {
          //console.log(err);
        } else {
          //console.log(docs);
        }
      },
    );
  }

  async update(email: string, roles: string): Promise<Object> {
    let data = await this.userauthModel.updateOne({ "email": email },
      { $set: { "roles": [roles] } });
    return data;
  }
}
