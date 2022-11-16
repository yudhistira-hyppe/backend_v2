import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Model } from 'mongoose';
import { BoostintervalDto } from './dto/boostinterval.dto';
import { Boostinterval, BoostintervalDocument } from './schemas/boostinterval.schema';


@Injectable()
export class BoostintervalService {

  constructor(@InjectModel(Boostinterval.name, 'SERVER_FULL')
  private readonly BoostintervalModel: Model<BoostintervalDocument>){}

  async create(BoostintervalDto_: BoostintervalDto): Promise<Boostinterval> {
    const boostintervalDto_ = await this.BoostintervalModel.create(BoostintervalDto_);
    return boostintervalDto_;
  }

  async findAll(): Promise<Boostinterval[]> {
    return this.BoostintervalModel.find().exec();
  }

  async findWhere(BoostintervalDto_: BoostintervalDto): Promise<Boostinterval[]> {
    return this.BoostintervalModel.find(BoostintervalDto_).exec();
  }

  async findById(_id:String): Promise<Boostinterval> {
    return this.BoostintervalModel.findOne({ _id: new mongoose.Types.ObjectId(_id.toString()) }).exec();
  }

  async findByType(type: String): Promise<Boostinterval> {
    return this.BoostintervalModel.findOne({ type: type }).exec();
  }
}