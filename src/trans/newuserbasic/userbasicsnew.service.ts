import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateUserbasicDto } from '../userbasics/dto/create-userbasic.dto';
import { CreateUserbasicnewDto } from './dto/create-userbasicnew.dto';
import { Userbasic, UserbasicnewDocument } from './schemas/userbasicnew.schema';
@Injectable()
export class UserbasicsnewService {
  constructor(
    @InjectModel(Userbasic.name, 'SERVER_TRANS')
    private readonly userbasicModel: Model<UserbasicnewDocument>,
  ) { }

  async updateLanguage(email: string, CreateUserbasicnewDto_: CreateUserbasicnewDto) {
    console.log(CreateUserbasicnewDto_);
    this.userbasicModel.updateOne(
      {
        email: email,
      },
      {
        $set: CreateUserbasicnewDto_
      },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    ).clone().exec();
  }
}