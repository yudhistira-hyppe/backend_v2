import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOauthclientdetailsDto } from './dto/create-oauthclientdetails.dto';
import { Oauthclientdetails, OauthclientdetailsDocument } from './schemas/oauthclientdetails.schema';

@Injectable()
export class OauthclientdetailsService {
  constructor(
    @InjectModel(Oauthclientdetails.name, 'SERVER_TRANS')
    private readonly oauthclientdetailsModel: Model<OauthclientdetailsDocument>,
  ) {}

  async create(
    CreateOauthclientdetailsDto: CreateOauthclientdetailsDto,
  ): Promise<Oauthclientdetails> {
    const createOauthclientdetailsDto =
      await this.oauthclientdetailsModel.create(CreateOauthclientdetailsDto);
    return createOauthclientdetailsDto;
  }

  async findAll(): Promise<Oauthclientdetails[]> {
    return this.oauthclientdetailsModel.find().exec();
  }

  async findOne(id: string): Promise<Oauthclientdetails> {
    return this.oauthclientdetailsModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.oauthclientdetailsModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }
}
