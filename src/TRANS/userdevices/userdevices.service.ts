import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserdeviceDto } from './dto/create-userdevice.dto';
import { Userdevice, UserdeviceDocument } from './schemas/userdevice.schema';

@Injectable()
export class UserdevicesService {

    constructor(
        @InjectModel(Userdevice.name) private readonly userdeviceModel: Model<UserdeviceDocument>,
      ) {}
    
      async create(CreateUserdeviceDto: CreateUserdeviceDto): Promise<Userdevice> {
        const createUserdeviceDto = await this.userdeviceModel.create(CreateUserdeviceDto);
        return createUserdeviceDto;
      }
    
      async findAll(): Promise<Userdevice[]> {
        return this.userdeviceModel.find().exec();
      }
    
      // async findOne(id: string): Promise<Userdevice> {
      //   return this.userdeviceModel.findOne({ _id: id }).exec();
      // }
      async findOne(email: string,deviceID:string): Promise<Userdevice> {
        return this.userdeviceModel.findOne({ email: email ,deviceID:deviceID}).exec();
      }
      async delete(id: string) {
        const deletedCat = await this.userdeviceModel
          .findByIdAndRemove({ _id: id })
          .exec();
        return deletedCat;
      }
      
      async countUserActiveGroupByMonth(): Promise<Object> {
        const monthsArray = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]
        var GetCount = this.userdeviceModel.aggregate( [
            { 
                $match: { 
                    active: true
                }
            },
            { 
                $group: {
                    _id: { "year_month": { $substrCP: [ "$createdAt", 0, 7 ] } },
                    count: { $sum: 1 }
                } 
            },
            {
                $sort: { "_id.year_month": 1 }
            },
            { 
                $project: { 
                    _id: 0, 
                    count: 1, 
                    month_: { $toInt: { $substrCP: [ "$_id.year_month", 5, 2 ] }},
                    month_name_: { $arrayElemAt: [ monthsArray, { $subtract: [ { $toInt: { $substrCP: [ "$_id.year_month", 5, 2 ] } }, 1 ] } ] },
                    year_: { $substrCP: [ "$_id.year_month", 0, 4 ] }
                } 
            },
            { 
              $project: { 
                _id: 0,
                month_name: "$month_name_",
                month: "$month_",
                year: {$toInt:"$year_"},
                count: 1,
            }
          }
          ]).exec();
        return GetCount;
      }

      async countAllUserActiveDay(day: number): Promise<Object> {
        var TODAY = new Date();
        var TODAY_BEFORE = new Date((new Date().setDate(new Date().getDate() - day)));

        var GetCount = this.userdeviceModel.aggregate( [
            {
                $addFields: { 
                    createdAt_:  { $toDate: { $substrCP: [ "$createdAt", 0, 10 ] } },
                }
            },
            { 
                $match: { 
                    //createdAt_:{$gte:new Date("2022-05-01"),$lt:new Date("2022-05-10")}
                    createdAt_: {$gte:TODAY_BEFORE,$lt:TODAY}
                }
            },
            {
                $sort: { "createdAt_": 1 }
            }
          ]).exec();
        return GetCount;
      }

}
