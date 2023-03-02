import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { UserscoresDto } from './dto/create-userscores.dto';
import { Userscores, UserscoresDocument } from './schemas/userscores.schema';

@Injectable()
export class UserscoresService {
    constructor(
        @InjectModel(Userscores.name, 'SERVER_FULL')
        private readonly userscoresModel: Model<UserscoresDocument>,
    ) { }

    async create(
        UserscoresDto: UserscoresDto,
    ): Promise<Userscores> {
        const userscoresDto = await this.userscoresModel.create(
            UserscoresDto,
        );
        return userscoresDto;
    }

    async findAll(): Promise<Userscores[]> {
        return this.userscoresModel.find().exec();
    }

    async findOneById(id: string, date: string): Promise<Userscores> {
        return this.userscoresModel
            .findOne({ _id: new Types.ObjectId(id), date: date })
            .exec();
    }

    // async updatefilter(id: string, idarray: string, value: number, updatedAt: string) {
    //     return this.userscoresModel.findByIdAndUpdate(

    //         { _id: new Types.ObjectId(id) },
    //         {
    //             $set: {
    //                 "listinterest.$[element].total": value,
    //                 "listinterest.$[element].updatedAt": updatedAt
    //             }
    //         },
    //         {
    //             arrayFilters: [{
    //                 "element._id": new Types.ObjectId(idarray)
    //             }]

    //         });
    // }

    // async updateInterestday(id: string, listinterest: any[]) {
    //     let data = await this.interestdayModel.updateOne({ "_id": new Types.ObjectId(id) },
    //         { $set: { "listinterest": listinterest } });
    //     return data;
    // }
    // async finddatabydate(date: string, id: string) {
    //     var query = await this.userscoresModel.aggregate([

    //         {
    //             $match: {
    //                 date: date
    //             }
    //         },
    //         {
    //             $unwind: {
    //                 path: "$listinterest",
    //                 preserveNullAndEmptyArrays: true
    //             }
    //         },
    //         {
    //             $match: {
    //                 'listinterest._id': new Types.ObjectId(id)
    //             }
    //         }
    //     ]);
    //     return query;
    // }

    async finddate(date: string, iduser: string) {
        var query = await this.userscoresModel.aggregate([

            {
                $match: {
                    date: date,
                    iduser: new Types.ObjectId(iduser)
                }
            },

        ]);
        return query;
    }



    async update(
        id: string,
        userscoresDto: Userscores,
    ): Promise<Userscores> {
        let data = await this.userscoresModel.findByIdAndUpdate(
            id,
            userscoresDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }



    async findbydate(date: string) {
        var query = await this.userscoresModel.aggregate([

            {
                $match: {
                    date: date
                }
            },

        ]);
        return query;
    }

}
