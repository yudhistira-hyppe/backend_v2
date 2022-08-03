import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateWithdrawsDto, OyDisburseCallbackWithdraw } from './dto/create-withdraws.dto';
import { Model, Types } from 'mongoose';
import { Withdraws, WithdrawsDocument } from './schemas/withdraws.schema';
import { ObjectId } from 'mongodb';

@Injectable()
export class WithdrawsService {

    constructor(
        @InjectModel(Withdraws.name, 'SERVER_TRANS')
        private readonly withdrawsModel: Model<WithdrawsDocument>,
    ) { }

    async findAll(): Promise<Withdraws[]> {
        return this.withdrawsModel.find().exec();
    }

    async findOne(id: string): Promise<Withdraws> {
        return this.withdrawsModel.findOne({ _id: id }).exec();
    }

    async findParteneridtrx(partnerTrxid: string): Promise<Withdraws> {
        return this.withdrawsModel.findOne({ partnerTrxid: partnerTrxid }).exec();
    }
    async create(CreateWithdrawsDto: CreateWithdrawsDto): Promise<Withdraws> {
        let data = await this.withdrawsModel.create(CreateWithdrawsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async updateone(partnerTrxid: string, payload: OyDisburseCallbackWithdraw): Promise<Object> {
        let data = await this.withdrawsModel.updateOne({ "partnerTrxid": partnerTrxid },
            { $set: { "status": "Success", "description": "Withdraw success", verified: true, payload: payload } });
        return data;
    }

    async findhistoryWithdraw(iduser: ObjectId, skip: number, limit: number) {
        const query = await this.withdrawsModel.aggregate([
            {
                $match: {
                    status: "Success",
                    idUser: iduser
                }
            },

            {
                $addFields: {
                    type: 'Withdrawal',

                },
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "idUser",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            }, {
                $project: {
                    iduser: "$idUser",
                    type: "$type",
                    timestamp: "$timestamp",
                    partnerTrxid: "$partnerTrxid",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    user: {
                        $arrayElemAt: [
                            "$userbasics_data",
                            0
                        ]
                    },

                }
            }, {
                $project: {
                    iduser: "$iduser",
                    fullName: "$user.fullName",
                    email: "$user.email",
                    type: "$type",
                    timestamp: "$timestamp",
                    partnerTrxid: "$partnerTrxid",
                    amount: "$amount",
                    totalamount: "$totalamount",
                }
            },

            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ]);
        return query;
    }


    async findhistoryWithdrawdetail(id: ObjectId, iduser: ObjectId) {
        const query = await this.withdrawsModel.aggregate([
            {
                $match: {
                    _id: id,
                    status: "Success",

                    idUser: iduser
                }
            },

            {
                $addFields: {
                    type: 'Withdrawal',

                },
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "idUser",
                    foreignField: "_id",
                    as: "userbasics_data"
                }
            }, {
                $project: {
                    iduser: "$idUser",
                    type: "$type",
                    timestamp: "$timestamp",
                    partnerTrxid: "$partnerTrxid",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    description: "$description",
                    status: "$status",
                    user: {
                        $arrayElemAt: [
                            "$userbasics_data",
                            0
                        ]
                    },

                }
            }, {
                $project: {
                    iduser: "$iduser",
                    fullName: "$user.fullName",
                    email: "$user.email",
                    type: "$type",
                    timestamp: "$timestamp",
                    partnerTrxid: "$partnerTrxid",
                    amount: "$amount",
                    totalamount: "$totalamount",
                    description: "$description",
                    status: "$status",
                }
            },


        ]);
        return query;
    }
}
