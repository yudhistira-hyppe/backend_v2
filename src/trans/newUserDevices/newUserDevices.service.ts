import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { newUserDevices, newUserDevicesDocument } from './schemas/newUserDevices.schema';

@Injectable()
export class NewUserDevicesService 
{
    constructor(
        @InjectModel(newUserDevices.name, 'SERVER_FULL')
        private readonly userdevice: Model<newUserDevicesDocument>,
    ) { }

    async findAll()
    {
        var result = await this.userdevice.find().exec();
        return result;
    }

    async findActive(email: string) {
        const query = await this.userdevice.aggregate([
    
          {
            $match: {
              email: email,
              active: true
            }
          },
    
        ]);
        return query;
      }
}
