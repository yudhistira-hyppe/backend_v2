import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateNewRefferalDto } from './dto/create-newRefferal.dto';
import { UpdateNewRefferalDto } from './dto/update-newRefferal.dto';
import { newRefferal, newRefferalDocument, newRefferalSchema } from './schemas/newRefferal.schema';

@Injectable()
export class NewRefferalService {
  constructor(
    @InjectModel(newRefferal.name, 'SERVER_FULL')
    private readonly referraldata: Model<newRefferalDocument>
  ) { }

  async create(createNewRefferalDto: CreateNewRefferalDto) {
    return await this.referraldata.create(createNewRefferalDto);
  }

  async findAll() {
    return await this.referraldata.find().exec();
  }

  async findOne(id: string) {
    return await this.referraldata.findOne({ _id:id }).exec();
  }

  async update(id: number, updateNewRefferalDto: UpdateNewRefferalDto) {
    return `This action updates a #${id} newRefferal`;
  }

  async findAllByParent(parent: string): Promise<newRefferal[]> {
    return this.referraldata.find({ parent: parent, verified: true }, { parent:1, children:1, active:1, verified:1, imei:1, createdAt:1, updatedAt:1 }).exec();
  }

  async findAllByChildren(children: string): Promise<newRefferal[]> {
    return this.referraldata.find({ children: children }, { parent:1, children:1, active:1, verified:1, imei:1, createdAt:1, updatedAt:1 }).exec();
  }
}
