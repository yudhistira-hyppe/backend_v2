import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserdeviceDto } from './dto/create-userdevice.dto';
import { Userdevice, UserdeviceDocument } from './schemas/userdevice.schema';

@Injectable()
export class UserdevicesService {
  constructor(
    @InjectModel(Userdevice.name, 'SERVER_TRANS')
    private readonly userdeviceModel: Model<UserdeviceDocument>,
  ) { }

  async create(CreateUserdeviceDto: CreateUserdeviceDto): Promise<Userdevice> {
    const createUserdeviceDto = await this.userdeviceModel.create(
      CreateUserdeviceDto,
    );
    return createUserdeviceDto;
  }

  async findAll(): Promise<Userdevice[]> {
    return this.userdeviceModel.find().exec();
  }

  // async findOne(id: string): Promise<Userdevice> {
  //   return this.userdeviceModel.findOne({ _id: id }).exec();
  // }

  async findOne(email: string, deviceID: string): Promise<Userdevice> {
    return this.userdeviceModel
      .findOne({ email: email, webdeviceID: deviceID })
      .exec();
  }

  async findOneEmail_(email: string): Promise<Userdevice> {
    return this.userdeviceModel
      .findOne({ email: email })
      .exec();
  }

  async findOneId(Id: Object): Promise<Userdevice> {
    return this.userdeviceModel
      .findOne({ _id: Id })
      .exec();
  }

  async findActive(email: string) {
    const query = await this.userdeviceModel.aggregate([

      {
        $match: {
          email: email,
          active: true
        }
      },

    ]);
    return query;
  }

  async updatebyEmail(email: string, deviceID: string, data: Object) {
    this.userdeviceModel.updateOne(
      {
        email: email,
        deviceID: deviceID,
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

  async updateNoneActive(email: string) {
    this.userdeviceModel.updateMany(
      {
        email: email,
      },
      { $set: { "active": false } },
      function (err, docs) {
        if (err) {
          //console.log(err);
        } else {
          //console.log(docs);
        }
      },
    );
  }


  async findOneEmail(email: string, deviceID: string): Promise<Userdevice> {
    return this.userdeviceModel
      .findOne({ email: email, deviceID: deviceID })
      .exec();
  }

  async delete(id: string) {
    const deletedCat = await this.userdeviceModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }
}
