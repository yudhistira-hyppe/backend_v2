import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReferralDto } from './dto/create-referral.dto';
import { Referral, ReferralDocument } from './schemas/referral.schema';

@Injectable()
export class ReferralService {
  constructor(
    @InjectModel(Referral.name, 'SERVER_FULL')
    private readonly referralModel: Model<ReferralDocument>,
  ) { }

  async create(CreateSagasDto: CreateReferralDto): Promise<Referral> {
    const createSagasDto = await this.referralModel.create(CreateSagasDto);
    return createSagasDto;
  }

  async findAll(): Promise<Referral[]> {
    return this.referralModel.find().exec();
  }

  async findAllByParentChildren(parent: string, children: string): Promise<Referral[]> {
    return this.referralModel.find({ parent: parent, children: children }).exec();
  }

  async findAllByParent(parent: string): Promise<Referral[]> {
    return this.referralModel.find({ parent: parent, verified: true }).exec();
  }

  async findAllByChildren(children: string): Promise<Referral[]> {
    return this.referralModel.find({ children: children }).exec();
  }

  async findbyparent(parent: string): Promise<Referral> {
    return this.referralModel.findOne({ parent: parent }).exec();
  }

  async findOne(id: string): Promise<Referral> {
    return this.referralModel.findOne({ _id: id }).exec();
  }

  async findOneInChild(email: string): Promise<Referral> {
    return this.referralModel.findOne({ children: email }).exec();
  }

  async findOneInChildParent(user_email_children: string, user_email_parent: string): Promise<Referral> {
    return this.referralModel.findOne({ children: user_email_parent, parent: user_email_children }).exec();
  }

  async findOneInIme(imei: string): Promise<Referral> {
    return this.referralModel.findOne({ imei: imei }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.referralModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }
}
