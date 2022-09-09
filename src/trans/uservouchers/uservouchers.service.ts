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
        @InjectModel(Uservouchers.name, 'SERVER_TRANS')
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

    async findUserVoucher(userID: ObjectId, date: string): Promise<Object> {

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
                    "field.isActive": true,
                    "field.expiredAt": {
                        $gte: date
                    }
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
                    expiredAt: "$field.expiredAt",
                    creditTotal: "$totalCredit",
                    totalUsed: "$field.totalUsed",
                    isActive: "$field.isActive",
                    description: "$field.description",
                    jmlVoucher: "$jmlVoucher"
                }
            }
        ]);
        return query;
    }

    async findUserKodeVoucher(userID: ObjectId, date: string, codeVoucher: string): Promise<Object> {

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
                    "field.isActive": true,
                    "field.expiredAt": {
                        $gte: date
                    }
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
                    expiredAt: "$field.expiredAt",
                    creditTotal: "$totalCredit",
                    totalUsed: "$field.totalUsed",
                    isActive: "$field.isActive",
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
                    "field.isActive": true,
                    "field.expiredAt": {
                        $gte: date
                    }
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
                    expiredAt: "$field.expiredAt",
                    creditTotal: "$totalCredit",
                    totalUsed: "$field.totalUsed",
                    isActive: "$field.isActive",
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
