import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateUserplaylistDto } from './dto/create-userplaylist.dto';
import { Userplaylist, UserplaylistDocument } from './schemas/userplaylist.schema';
@Injectable()
export class UserplaylistService {
  constructor(
    @InjectModel(Userplaylist.name, 'SERVER_TRANS')
    private readonly userplaylistModel: Model<UserplaylistDocument>
  ) { }

  async create(CreateUserplaylistDto_: CreateUserplaylistDto): Promise<Userplaylist> {
    const _createUserbasicDto_ = await this.userplaylistModel.create(
      CreateUserplaylistDto_,
    );
    return _createUserbasicDto_;
  }

  async findAll(): Promise<Userplaylist[]> {
    return this.userplaylistModel.find().exec();
  }
  async findid(id: string): Promise<Userplaylist> {
    return this.userplaylistModel.findOne({ _id: id }).exec();
  }
  async findbyid(id: string): Promise<Userplaylist> {
    return this.userplaylistModel.findOne({ _id: new Types.ObjectId(id) }).exec();
  }
  async findOne(email: string): Promise<Userplaylist> {
    return this.userplaylistModel.findOne({ email: email }).exec();
  }
  async findOneUsername(username: string): Promise<Userplaylist> {
    return this.userplaylistModel.findOne({ username: username }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.userplaylistModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }
}