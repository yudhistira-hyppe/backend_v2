import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import { Types } from 'aws-sdk/clients/lightsail';
import { query } from 'express';
import { ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { CreateUservouchersDto } from './dto/create-uservouchers.dto';
import { Uservouchers, UservouchersDocument } from './schemas/uservouchers.schema';

@Injectable()
export class UservouchersService {
    constructor(
        @InjectModel(Uservouchers.name, 'SERVER_FULL')
        private readonly uservouchersModel: Model<UservouchersDocument>

    ) { }
    async create(CreateUservouchersDto: CreateUservouchersDto): Promise<Uservouchers> {
        let data = await this.uservouchersModel.create(CreateUservouchersDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async findAll(): Promise<Uservouchers[]> {
        return this.uservouchersModel.find().exec();
    }

    async findOne(id: string): Promise<Uservouchers> {
        return this.uservouchersModel.findOne({ _id: id }).exec();
    }

    // async findUser(userID: ObjectId): Promise<Uservouchers[]> {
    //     return this.uservouchersModel.find({ userID: userID, isActive: true }).exec();
    // }

    async findUser(userID: Types.ObjectId): Promise<Object> {

        const query = this.uservouchersModel.aggregate([



            {
                $match: {
                    "userID": userID,
                    "isActive": true,
                }
            },

        ]);
        return query;
    }

    async findUserVoucher(userID: ObjectId, key: string, startday: number, endday: number, startdate: string, enddate: string): Promise<Object> {
        try {
            var currentdate = new Date(new Date(enddate).setDate(new Date(enddate).getDate() + 1));

            var dateend = currentdate.toISOString();
        } catch (e) {
            dateend = "";
        }
        var pipeline = [];


        pipeline.push({
            $lookup: {
                from: "vouchers",
                localField: "voucherID",
                foreignField: "_id",
                as: "field"
            }
        },
            {
                $unwind: {
                    path: "$field",
                    preserveNullAndEmptyArrays: false
                }
            },
        );

        pipeline.push({
            $match: {
                "userID": userID,
                "isActive": true
            }
        },);

        if (key && key !== undefined) {
            pipeline.push({
                $match: {
                    "$or": [{
                        "field.nameAds": {
                            $regex: key,
                            $options: 'i'
                        }
                    }, {
                        "field.codeVoucher": {
                            $regex: key,
                            $options: 'i'
                        }
                    }],
                }
            },);
        }

        pipeline.push({
            "$sort": {
                "_id": 1
            },

        },
            {
                $project: {
                    noVoucher: "$field.noVoucher",
                    codeVoucher: "$field.codeVoucher",
                    nameAds: "$field.nameAds",
                    expiredAt: 1,
                    creditTotal: "$totalCredit",
                    credit: 1,
                    creditFree: 1,
                    totalUsed: "$field.totalUsed",
                    isActive: 1,
                    description: "$field.description",
                    jmlVoucher: 1,
                    expiredDay: "$field.expiredDay"
                }
            });

        if (startdate && startdate !== undefined) {
            pipeline.push({ $match: { 'expiredAt': { "$gte": startdate } } });
        }
        if (enddate && enddate !== undefined) {
            pipeline.push({ $match: { 'expiredAt': { "$lte": dateend } } });
        }
        if (startday && startday !== undefined) {
            pipeline.push({ $match: { 'expiredDay': { "$gte": startday } } });
        }
        if (endday && endday !== undefined) {
            pipeline.push({ $match: { 'expiredDay': { "$lte": endday } } });
        }

        let query = await this.uservouchersModel.aggregate(pipeline);
        return query;

    }

    async findUserVoucherTrue(userID: ObjectId): Promise<Object> {

        const query = this.uservouchersModel.aggregate([

            {
                $lookup: {
                    from: "vouchers",
                    localField: "voucherID",
                    foreignField: "_id",
                    as: "field"
                }
            },
            {
                $unwind: {
                    path: "$field",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $match: {
                    "userID": userID,
                    "isActive": true,

                }
            },
            {
                "$sort": {
                    "_id": 1
                },

            },
            {
                $project: {
                    noVoucher: "$field.noVoucher",
                    codeVoucher: "$field.codeVoucher",
                    nameAds: "$field.nameAds",
                    expiredAt: "$expiredAt",
                    creditTotal: "$totalCredit",
                    credit: "$credit",
                    creditFree: "$creditFree",
                    totalUsed: "$field.totalUsed",
                    isActive: "$isActive",
                    description: "$field.description",
                    jmlVoucher: "$jmlVoucher"
                }
            }
        ]);
        return query;
    }

    async findUserKodeVoucher(userID: ObjectId, codeVoucher: string): Promise<Object> {

        const query = this.uservouchersModel.aggregate([

            {
                $lookup: {
                    from: "vouchers",
                    localField: "voucherID",
                    foreignField: "_id",
                    as: "field"
                }
            },
            {
                $unwind: {
                    path: "$field",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $match: {
                    "userID": userID,
                    "field.codeVoucher": codeVoucher,
                    "isActive": true,
                    // "expiredAt": {
                    //     $gte: date
                    // }
                }
            },
            {
                "$sort": {
                    "_id": 1
                },

            },
            {
                $project: {
                    noVoucher: "$field.noVoucher",
                    codeVoucher: "$field.codeVoucher",
                    nameAds: "$field.nameAds",
                    expiredAt: "$expiredAt",
                    creditTotal: "$totalCredit",
                    credit: "$credit",
                    creditFree: "$creditFree",
                    totalUsed: "$field.totalUsed",
                    isActive: "$isActive",
                    description: "$field.description",
                    jmlVoucher: "$jmlVoucher"
                }
            }
        ]);
        return query;
    }

    async findUserVoucherID(userID: ObjectId, date: string, voucherID: ObjectId): Promise<Object> {

        const query = this.uservouchersModel.aggregate([

            {
                $lookup: {
                    from: "vouchers",
                    localField: "voucherID",
                    foreignField: "_id",
                    as: "field"
                }
            },
            {
                $unwind: {
                    path: "$field",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $match: {
                    "userID": userID,
                    "voucherID": voucherID,
                    "isActive": true,
                    // "expiredAt": {
                    //     $gte: date
                    // }
                }
            },
            {
                "$sort": {
                    "_id": 1
                },

            },
            {
                $project: {
                    noVoucher: "$field.noVoucher",
                    codeVoucher: "$field.codeVoucher",
                    nameAds: "$field.nameAds",
                    expiredAt: "$expiredAt",
                    creditTotal: "$totalCredit",
                    credit: "$credit",
                    creditFree: "$creditFree",
                    totalUsed: "$field.totalUsed",
                    isActive: "$isActive",
                    description: "$field.description",
                    jmlVoucher: "$jmlVoucher"
                }
            }
        ]);
        return query;
    }


    async delete(id: string) {
        const deletedCat = await this.uservouchersModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deletedCat;
    }

    async updatefalse(id: Types.ObjectId): Promise<Object> {
        let data = await this.uservouchersModel.updateOne({ "_id": id },
            { $set: { "isActive": false } });
        return data;
    }

    async update(
        id: string,
        createUservouchersDto: CreateUservouchersDto,
    ): Promise<Uservouchers> {
        let data = await this.uservouchersModel.findByIdAndUpdate(
            id,
            createUservouchersDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

}
