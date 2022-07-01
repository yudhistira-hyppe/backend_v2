import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAccountbalancesDto } from './dto/create-accountbalances.dto';
import { Accountbalances, AccountbalancesDocument } from './schemas/accountbalances.schema';

@Injectable()
export class AccountbalancesService {

    constructor(
        @InjectModel(Accountbalances.name, 'SERVER_TRANS')
        private readonly accountbalancesModel: Model<AccountbalancesDocument>,
    ) { }


    async findsaldo(iduser: object) {
        const query = await this.accountbalancesModel.aggregate([

            {
                $match: {
                    "iduser": iduser
                }
            },

            { $group: { _id: null, totalsaldo: { $sum: { $subtract: ["$kredit", "$debet"] } }, totalpenarikan: { $sum: "$debet" } } },

        ]);
        return query;
    }

    async findsaldoall() {
        const query = await this.accountbalancesModel.aggregate([
            { $group: { _id: null, totalsaldo: { $sum: { $subtract: ["$kredit", "$debet"] } }, totalpenarikan: { $sum: "$debet" } } },


        ]);
        return query;
    }

    async findwalletpenarikan(iduser: object, datestart: string, dateend: string) {

        var currentdate = new Date(new Date(dateend).setDate(new Date(dateend).getDate() + 1));

        var enddate = currentdate.toISOString();
        const query = await this.accountbalancesModel.aggregate([

            {
                $match: {

                    "iduser": iduser, "timestamp": { $gte: datestart, $lte: enddate }, "type": "withdraw"
                }
            },
            {
                $group: {
                    _id: null,
                    totalpenarikan: {
                        $sum: "$debet"
                    }
                }
            },


        ]);
        return query;
    }

    async findwallettotalsaldo(iduser: object) {
        const query = await this.accountbalancesModel.aggregate([

            {
                $match: {

                    "iduser": iduser
                }
            },
            {
                $group: {
                    _id: null,
                    totalsaldo: { $sum: { $subtract: ["$kredit", "$debet"] } },
                }
            },


        ]);
        return query;
    }

    async findwallethistory(iduser: object, datestart: string, dateend: string, skip: number, limit: number) {

        var currentdate = new Date(new Date(dateend).setDate(new Date(dateend).getDate() + 1));

        var enddate = currentdate.toISOString();
        const query = await this.accountbalancesModel.aggregate([

            {
                $match: {

                    "iduser": iduser, "timestamp": { $gte: datestart, $lte: enddate }
                }
            },
            {
                $project: {
                    iduser: "$iduser",
                    type:
                    {
                        $cond: { if: { $eq: ["$type", "withdraw"] }, then: "Buy", else: "Rewards" }
                    },
                    timestamp: "$timestamp",
                    description: "$description",
                    amount:
                    {
                        $cond: { if: { $eq: ["$debet", 0] }, then: "$kredit", else: "$debet" }
                    },
                    status:
                    {
                        $cond: { if: { $eq: ["$type", "withdraw"] }, then: "SENT", else: "RECEIVE" }
                    },



                }

            }, { $skip: skip }, { $limit: limit }

        ]);
        return query;
    }
}
