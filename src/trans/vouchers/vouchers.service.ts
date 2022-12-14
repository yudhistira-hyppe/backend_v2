import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { CreateVouchersDto } from './dto/create-vouchers.dto';
import { Vouchers, VouchersDocument } from './schemas/vouchers.schema';

@Injectable()
export class VouchersService {

    constructor(
        @InjectModel(Vouchers.name, 'SERVER_FULL')
        private readonly vouchersModel: Model<VouchersDocument>

    ) { }
    async create(CreateVouchersDto: CreateVouchersDto): Promise<Vouchers> {
        let data = await this.vouchersModel.create(CreateVouchersDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }
    async findByid(id: string): Promise<Vouchers> {
        return this.vouchersModel.findOne({ _id: id }).exec();
    }
    async findAll(): Promise<Vouchers[]> {
        return this.vouchersModel.find().exec();
    }

    async finddata(key: string, skip: number, limit: number) {
        var query = null;
        if (key !== undefined) {
            query = await this.vouchersModel.aggregate([
                {
                    $match: {
                        codeVoucher: {
                            $regex: key,
                            $options: 'i'
                        }
                    }
                },
                {
                    $sort: {
                        createdAt: - 1
                    }
                }, {
                    $skip: (skip * limit)
                }, {
                    $limit: limit
                }
            ]);


        }
        else {
            query = await this.vouchersModel.aggregate([

                {
                    $sort: {
                        createdAt: - 1
                    }
                }, {
                    $skip: (skip * limit)
                }, {
                    $limit: limit
                }
            ]);

        }
        return query;
    }
    async finddataCount(key: string) {
        var query = null;
        if (key !== undefined) {
            query = await this.vouchersModel.aggregate([
                {
                    $match: {
                        codeVoucher: {
                            $regex: key,
                            $options: 'i'
                        }
                    }
                },
                {
                    $sort: {
                        createdAt: - 1
                    }
                },
            ]);


        }
        else {
            query = await this.vouchersModel.aggregate([

                {
                    $sort: {
                        createdAt: - 1
                    }
                },
            ]);

        }
        return query;
    }
    async findLatest(): Promise<Vouchers[]> {
        return this.vouchersModel.find().sort({ "_id": -1 }).limit(1);
    }

    async findExpired(expiredAt: string): Promise<Vouchers[]> {
        return this.vouchersModel.find({ expiredAt: { $lte: expiredAt } });
    }

    async findExpirednactive(expiredAt: string): Promise<Vouchers[]> {
        return this.vouchersModel.find({ $and: [{ isActive: true }, { expiredAt: { $gte: expiredAt } }] });
    }

    async finddetailbuy(idvoucher: any[]): Promise<Vouchers[]> {
        return this.vouchersModel.find({ _id: { $in: idvoucher } });
    }

    async findOne(id: string): Promise<Vouchers> {
        return this.vouchersModel.findOne({ _id: id }).exec();
    }

    async delete(id: string) {
        const deletedCat = await this.vouchersModel
            .findByIdAndRemove({ _id: id })
            .exec();
        return deletedCat;
    }

    async updatestatusActive(id: Types.ObjectId, updatedAt: string): Promise<Object> {
        let data = await this.vouchersModel.updateOne({ "_id": id, "isActive": true },
            { $set: { "isActive": false, "description": "Voucher expired time" }, "updatedAt": updatedAt });
        return data;
    }

    // async updatestatuTotalUsed(id: Types.ObjectId, totalUsed: number, pendingUsed: number): Promise<Object> {
    //     let data = await this.vouchersModel.updateOne({ "_id": id, "isActive": true },
    //         { $set: { "totalUsed": totalUsed, "pendingUsed": pendingUsed } });
    //     return data;
    // }
    async updatestatuTotalUsed(id: Types.ObjectId, totalUsed: number): Promise<Object> {
        let data = await this.vouchersModel.updateOne({ "_id": id, "isActive": true },
            { $set: { "totalUsed": totalUsed } });
        return data;
    }
    async updatesPendingUsed(id: Types.ObjectId, pendingUsed: number): Promise<Object> {
        let data = await this.vouchersModel.updateOne({ "_id": id, "isActive": true },
            { $set: { "pendingUsed": pendingUsed } });
        return data;
    }

    async updatestatusVoucher(id: Types.ObjectId, updatedAt: string): Promise<Object> {
        let data = await this.vouchersModel.updateOne({ "_id": id, "isActive": true },
            { $set: { "isActive": false, "updatedAt": updatedAt } });
        return data;
    }

    async update(
        id: string,
        createVouchersDto: CreateVouchersDto,
    ): Promise<Vouchers> {
        let data = await this.vouchersModel.findByIdAndUpdate(
            id,
            createVouchersDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }
    async totalcount() {
        const query = await this.vouchersModel.aggregate([
            {
                $group: {
                    _id: null,
                    countrow: {
                        $sum: 1
                    }
                }
            }, {
                $project: {
                    _id: 0
                }
            }]);
        return query;
    }
}
