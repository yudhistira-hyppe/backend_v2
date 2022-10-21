import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDevicelogDto } from './dto/create-devicelog.dto';
import { Devicelog, DevicelogDocument } from './schemas/devicelog.schema';

@Injectable()
export class DevicelogService {
  constructor(
    @InjectModel(Devicelog.name, 'SERVER_FULL')
    private readonly devicelogModel: Model<DevicelogDocument>,
  ) { }

  async create(CreateDevicelogDto: CreateDevicelogDto): Promise<Devicelog> {
    const createDevicelogDto = await this.devicelogModel.create(
      CreateDevicelogDto,
    );
    return createDevicelogDto;
  }

  async findAll(): Promise<DevicelogDocument[]> {
    return this.devicelogModel.find().exec();
  }

  async findOne(id: string): Promise<DevicelogDocument> {
    return this.devicelogModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.devicelogModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }

}
