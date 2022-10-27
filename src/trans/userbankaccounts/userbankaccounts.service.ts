import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserbankaccountsDto } from './dto/create-userbankaccounts.dto';
import { Model, Types } from 'mongoose';
import { Userbankaccounts, UserbankaccountsDocument } from './schemas/userbankaccounts.schema';
import { ObjectId } from 'mongodb';

@Injectable()
export class UserbankaccountsService {
    constructor(
        @InjectModel(Userbankaccounts.name, 'SERVER_TRANS')
        private readonly userbankaccountsModel: Model<UserbankaccountsDocument>,
    ) { }

    async findAll(): Promise<Userbankaccounts[]> {
        return this.userbankaccountsModel.find().exec();
    }

    async findOneUser(iduser: ObjectId): Promise<Userbankaccounts[]> {

        let query = await this.userbankaccountsModel.aggregate([
            {
                $lookup: {
                    from: "banks",
                    localField: "idBank",
                    foreignField: "_id",
                    as: "dataBank"
                }
            }, {
                $project: {
                    databank: {
                        $arrayElemAt: [
                            "$dataBank",
                            0
                        ]
                    },
                    userId: "$userId",
                    noRek: "$noRek",
                    nama: "$nama",
                    statusInquiry: "$statusInquiry",
                    active: "$active"
                }
            }, {
                $project: {
                    userId: "$userId",
                    noRek: "$noRek",
                    nama: "$nama",
                    statusInquiry: "$statusInquiry",
                    active: "$active",
                    bankId: "$databank._id",
                    bankcode: "$databank.bankcode",
                    bankname: "$databank.bankname",
                    urlEbanking: "$databank.urlEbanking",
                    bankIcon: "$databank.bankIcon"
                }
            }, {
                $match: {
                    userId: iduser, active: true
                }
            }

        ]);
        return query;
    }
    async findOne(id: string): Promise<Userbankaccounts> {
        return this.userbankaccountsModel.findOne({ _id: id }).exec();
    }
    async findOneid(id: ObjectId): Promise<Userbankaccounts> {
        return this.userbankaccountsModel.findOne({ _id: id }).exec();
    }


    async findnorekkembar(noRek: string): Promise<Userbankaccounts> {
        return this.userbankaccountsModel.findOne({ noRek: noRek }).exec();
    }
    async findnorek(noRek: string, idBank: string): Promise<Userbankaccounts> {
        return this.userbankaccountsModel.findOne({ noRek: noRek, idBank: idBank }).exec();
    }

    async findnorekWithdraw(noRek: string, idBank: string, nama: string): Promise<Userbankaccounts> {
        return this.userbankaccountsModel.findOne({ noRek: noRek, idBank: idBank, nama: nama }).exec();
    }
    async findnorekWithdrawuser(noRek: string, idBank: string, userid: ObjectId): Promise<Userbankaccounts> {
        return this.userbankaccountsModel.findOne({ userId: userid, noRek: noRek, idBank: idBank }).exec();
    }
    async create(CreateUserbankaccountsDto: CreateUserbankaccountsDto): Promise<Userbankaccounts> {
        let data = await this.userbankaccountsModel.create(CreateUserbankaccountsDto);

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

    async updateone(id: Types.ObjectId, description: string): Promise<Object> {
        let data = await this.userbankaccountsModel.updateOne({ "_id": id },
            { $set: { "statusInquiry": true, "description": description } });
        return data;
    }

    async updateactivetrue(id: Types.ObjectId): Promise<Object> {
        let data = await this.userbankaccountsModel.updateOne({ "_id": id },
            { $set: { "active": true } });
        return data;
    }

    async updateonefalse(id: Types.ObjectId, description: string): Promise<Object> {
        let data = await this.userbankaccountsModel.updateOne({ "_id": id },
            { $set: { "statusInquiry": false, "description": description } });
        return data;
    }

    async updateactive(id: Types.ObjectId): Promise<Object> {
        let data = await this.userbankaccountsModel.updateOne({ "_id": id },
            { $set: { "active": false } });
        return data;
    }
    async update(
        id: string,
        createUserbankaccountsDto: CreateUserbankaccountsDto,
    ): Promise<Userbankaccounts> {
        let data = await this.userbankaccountsModel.findByIdAndUpdate(
            id,
            createUserbankaccountsDto,
            { new: true },
        );

        if (!data) {
            throw new Error('Todo is not found!');
        }
        return data;
    }

}
