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

  async findChild(id: string): Promise<subChallenge[]>{
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
}
