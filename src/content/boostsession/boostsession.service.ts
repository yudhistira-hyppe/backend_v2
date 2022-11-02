import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Model } from 'mongoose';
import { BoostsessionDto } from './dto/boostsession.dto';
import { Boostsession, BoostsessionDocument } from './schemas/boostsession.schema';


@Injectable()
export class BoostsessionService {

  constructor(@InjectModel(Boostsession.name, 'SERVER_FULL')
  private readonly BoostsessionModel: Model<BoostsessionDocument>){}

  async create(BoostsessionDto_: BoostsessionDto): Promise<Boostsession> {
    const boostsessionDto_ = await this.BoostsessionModel.create(BoostsessionDto_);
    return boostsessionDto_;
  }

  async findAll(): Promise<Boostsession[]> {
    return this.BoostsessionModel.find().exec();
  }

  async findById(_id: String): Promise<Boostsession> {
    return this.BoostsessionModel.findOne({ _id: new mongoose.Types.ObjectId(_id.toString()) }).exec();
  }
}
