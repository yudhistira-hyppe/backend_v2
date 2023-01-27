import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserbankaccountsDto } from './dto/create-userbankaccounts.dto';
import { Model, Types } from 'mongoose';
import { Userbankaccounts, UserbankaccountsDocument } from './schemas/userbankaccounts.schema';
import { ObjectId } from 'mongodb';
import { integer } from 'aws-sdk/clients/lightsail';

@Injectable()
export class UserbankaccountsService {
    constructor(
        @InjectModel(Userbankaccounts.name, 'SERVER_FULL')
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

    // async updateAppeal(id: Types.ObjectId, updatedAt: string, userHandle: any[]) {
    //     let data = await this.userbankaccountsModel.updateOne({ "_id": id },
    //       { $set: { "reportedStatus": "OWNED", "updatedAt": updatedAt, "reportedUserHandle": reportedUserHandle } });
    //     return data;
    //   }
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

    async findemail(id: ObjectId) {
        let query = await this.userbankaccountsModel.aggregate([

            {
                $match: {
                    _id: id
                }
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "userId",
                    foreignField: "_id",
                    as: "field"
                }
            },
            {
                $unwind: {
                    path: '$field',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    email: '$field.email',
                    fullName: '$field.fullName'
                }
            }
        ]);

        return query;
    }

    async updateDisetujui(id: ObjectId, reason: string, updatedAt: string, reasonId: ObjectId, idUserHandle: ObjectId) {
        let data = await this.userbankaccountsModel.updateMany({ "_id": id },
            { $set: { "statusInquiry": null, "updatedAt": updatedAt, "userHandle.$[].updatedAt": updatedAt, "userHandle.$[].reasonId": reasonId, "userHandle.$[].valueReason": reason, "userHandle.$[].status": "DISETUJUI", "userHandle.$[].idUserHandle": idUserHandle, } });
        return data;
    }

    async updateDisetujuiEmpty(id: ObjectId, updatedAt: string, userHandle: any[]) {
        let data = await this.userbankaccountsModel.updateMany({ "_id": id },
            { $set: { "updatedAt": updatedAt, "userHandle": userHandle } });
        return data;
    }

    async updateDitolak(id: ObjectId, reason: string, updatedAt: string, reasonId: ObjectId, idUserHandle: ObjectId) {
        let data = await this.userbankaccountsModel.updateMany({ "_id": id },
            { $set: { "updatedAt": updatedAt, "userHandle.$[].updatedAt": updatedAt, "userHandle.$[].reasonId": reasonId, "userHandle.$[].valueReason": reason, "userHandle.$[].status": "DITOLAK", "userHandle.$[].idUserHandle": idUserHandle, } });
        return data;
    }

    async updateDitolakEmpty(id: ObjectId, updatedAt: string, userHandle: any[]) {
        let data = await this.userbankaccountsModel.updateMany({ "_id": id },
            { $set: { "updatedAt": updatedAt, "userHandle": userHandle } });
        return data;
    }

    async getlistaccount(startdate: string, enddate:string, namapemohon:string, liststatus: any[], descending:number, page: number, limit:number){
        //startdate, enddate, namapemohon, statusLast, page, limit
        //const mongoose = require('mongoose');

        /*
         var querytambahan = [];
        querytambahan.push({
                "$project":
                {
                    _id:1,
                    userId:1,
                    statusInquiry:1,
                    noRek:1,
                    nama:1,
                    active:1,
                    description:1,
                    tanggalPengajuan:
                    {
                        "$dateFromString": 
                        {
                            dateString: 
                            {
                                "$last":"$userHandle.createdAt"
                            }
                        }
                    },
                    updatedAt:1,
                    userHandle:1,
                    statusLast:
                    {
                        "$last":"$userHandle.status"
                    },
                    reasonId:
                    {
                        "$last":"$userHandle.reasonId"
                    },
                    reasonAdmin:
                    {
                        "$last":"$userHandle.valueReason"
                    },
                }
            },
            {
                "$match":
                {
                    "$and":
                    [
                        {
                            userHandle:
                            {
                                "$ne":[]
                            }
                        },
                        {
                            userHandle:
                            {
                                "$ne":null
                            }
                        },
                    ]
                }
            },
            { 
                "$lookup":
                {
                    from:"userbasics",
                    let:
                    {
                        basic_fk:"$userId" 
                    },
                    as:'userbasic_data',
                    pipeline:
                    [
                        {
                            "$match":
                            {
                                "$expr":
                                {
                                    "$eq":
                                    [
                                        "$_id",
                                        "$$basic_fk"
                                    ]
                                }
                            }
                        },
                    ]
                }
            },
            { 
                "$lookup":
                {
                    from:"userauths",
                    let:
                    {
                        basic_fk:
                        {
                            "$arrayElemAt":
                            [
                                "$userbasic_data.email", 0
                            ]
                        } 
                    },
                    as:'userauth_data',
                    pipeline:
                    [
                        {
                            "$match":
                            {
                                "$and":
                                [
                                    {
                                        "$expr":
                                        {
                                            "$eq":
                                            [
                                                "$email",
                                                "$$basic_fk"
                                            ]
                                        },
                                    },
                                ]
                            }
                        },
                    ]
                }
            },
            {
                "$project":
                {
                    _id:"$_id",
                    userId:"$userId",
                    statusInquiry:"$statusInquiry",
                    noRek:"$noRek",
                    nama:"$nama",
                    active:"$active",
                    tanggalPengajuan:"$tanggalPengajuan",
                    // userHandle:"$userHandle",
                    // fkbasic:"$userbasic_data",
                    // fkauth:"$userauth_data",
                    fullName:
                    {
                        "$last":"$userbasic_data.fullName"
                    },
                    email:
                    {
                        "$last":"$userauth_data.email"
                    },
                    username:
                    {
                        "$last":"$userauth_data.username"
                    },
                    statusLast:"$statusLast",
                    reasonId:"$reasonId",
                    reasonAdmin:"$reasonAdmin",
                    avatar:
                    {
                        mediaEndpoint: 
                        {
                            "$concat":
                            [
                                "/profilepict/",
                                {
                                    "$last":"$userbasic_data.profilePict.$id"
                                },
                            ]
                        }
                    },
                }
            },);

        if(namapemohon != null)
        {
            querytambahan.push({
                "$match":
                {
                    username:
                    {
                        "$regex":namapemohon,
                        "$options":"i"
                    }
                }
            },);
        }

        if(startdate != null)
        {
            querytambahan.push({
                "$match":
                {
                    "$and":
                    [
                        {
                            "$expr":
                            {
                                "$gte":
                                [
                                    "$tanggalPengajuan", 
                                    { 
                                        "$dateFromString": 
                                        {
                                            dateString: startdate
                                        } 
                                    }
                                ]
                            }
                        },
                        {
                            "$expr":
                            {
                                "$lt":
                                [
                                    "$tanggalPengajuan", 
                                    { 
                                        "$dateFromString": 
                                        {
                                            dateString: enddate
                                        } 
                                    }
                                ]
                            }
                        }
                    ]
                }
            });
        }

        if(statusLast != null)
        {
            var temp = [];
            statusLast.forEach(element => {
                temp.push({
                    "$expr":
                    {
                        "$eq":["$statusLast", element]
                    }
                });
            });
            querytambahan.push({
                "$match":
                {
                    "$or":temp
                }
            },);
        }

        querytambahan.push({
                "$sort":
                {
                    tanggalPengajuan:descending
                }
            },
            {
                "$skip":limit*page
            },
            {
                "$limit":limit
            },);
        */

        var querytambahan = [];
        querytambahan.push({
                "$match":
                {
                    "$and":
                    [
                        {
                            userHandle:
                            {
                                "$ne":[]
                            }
                        },
                        {
                            userHandle:
                            {
                                "$ne":null
                            }
                        },
                    ]
                }
            },);
        
        var subproject = {
                    _id:1,
                    tanggalPengajuan:
                    {
                        "$dateFromString": 
                        {
                            dateString: 
                            {
                                "$last":"$userHandle.createdAt"
                            }
                        }
                    },
                    userHandle:1,
                    statusLast:
                    {
                        "$last":"$userHandle.status"
                    },
                    reasonId:
                    {
                        "$last":"$userHandle.reasonId"
                    },
                    reasonAdmin:
                    {
                        "$last":"$userHandle.valueReason"
                    },
                };
        
        if(limit !== 0)
        {
            Object.assign(subproject, {userId:1});
            Object.assign(subproject, {statusInquiry:1});
            Object.assign(subproject, {noRek:1});
            Object.assign(subproject, {nama:1});
            Object.assign(subproject, {active:1});
            Object.assign(subproject, {description:1});
            Object.assign(subproject, {updatedAt:1});    
        }
        
        querytambahan.push(
            {
                "$project":
                subproject,
            },
            { 
                "$lookup":
                {
                    from:"userbasics",
                    let:
                    {
                        basic_fk:"$userId" 
                    },
                    as:'userbasic_data',
                    pipeline:
                    [
                        {
                            "$match":
                            {
                                "$expr":
                                {
                                    "$eq":
                                    [
                                        "$_id",
                                        "$$basic_fk"
                                    ]
                                }
                            }
                        },
                    ]
                }
            },
            { 
                "$lookup":
                {
                    from:"userauths",
                    let:
                    {
                        basic_fk:
                        {
                            "$arrayElemAt":
                            [
                                "$userbasic_data.email", 0
                            ]
                        }
                    },
                    as:'userauth_data',
                    pipeline:
                    [
                        {
                            "$match":
                            {
                                "$and":
                                [
                                    {
                                        "$expr":
                                        {
                                            "$eq":
                                            [
                                                "$email",
                                                "$$basic_fk"
                                            ]
                                        },
                                    },
                                ]
                            }
                        },
                    ]
                }
            },
        );

        if(limit !== 0)
        {
            querytambahan.push({
                "$project":
                {
                    _id:"$_id",
                    userId:"$userId",
                    statusInquiry:"$statusInquiry",
                    noRek:"$noRek",
                    nama:"$nama",
                    active:"$active",
                    tanggalPengajuan:"$tanggalPengajuan",
                    // userHandle:"$userHandle",
                    // fkbasic:"$userbasic_data",
                    // fkauth:"$userauth_data",
                    fullName:
                    {
                        "$arrayElemAt":
                        [
                            "$userbasic_data.fullName", 0
                        ]
                    },
                    email:
                    {
                        "$arrayElemAt":
                        [
                            "$userauth_data.email", 0
                        ]
                    },
                    username:
                    {
                        "$arrayElemAt":
                        [
                            "$userauth_data.username", 0
                        ]
                    },
                    statusLast:"$statusLast",
                    reasonId:"$reasonId",
                    reasonAdmin:"$reasonAdmin",
                    avatar:
                    {
                        mediaEndpoint: 
                        {
                            "$concat":
                            [
                                "/profilepict/",
                                {
                                    "$last":"$userbasic_data.profilePict.$id"
                                },
                            ]
                        }
                    },
                }
            },);
        }
        else
        {
            querytambahan.push({
                "$project":
                {
                    _id:"$_id",
                    tanggalPengajuan:"$tanggalPengajuan",
                    username:
                    {
                        "$arrayElemAt":
                        [
                            "$userauth_data.username", 0
                        ]
                    },
                    statusLast:"$statusLast",
                }
            },);
        }

        if(namapemohon != null)
        {
            querytambahan.push({
                "$match":
                {
                    username:
                    {
                        "$regex":namapemohon,
                        "$options":"i"
                    }
                }
            },);
        }

        if(startdate != null)
        {
            querytambahan.push({
                "$match":
                {
                    "$and":
                    [
                        {
                            "$expr":
                            {
                                "$gte":
                                [
                                    "$tanggalPengajuan", 
                                    { 
                                        "$dateFromString": 
                                        {
                                            dateString: startdate
                                        } 
                                    }
                                ]
                            }
                        },
                        {
                            "$expr":
                            {
                                "$lt":
                                [
                                    "$tanggalPengajuan", 
                                    { 
                                        "$dateFromString": 
                                        {
                                            dateString: enddate
                                        } 
                                    }
                                ]
                            }
                        }
                    ]
                }
            });
        }

        if(liststatus != null)
        {
            querytambahan.push({
                "$match":
                {
                    statusLast: 
                    {
                        $in:liststatus
                    }
                },
            },);
        }

        if(limit !== 0)
        {
            querytambahan.push({
                    "$sort":
                    {
                        tanggalPengajuan:descending
                    }
                },
                {
                    "$skip":limit*page
                },
                {
                    "$limit":limit
                },
                {
                    "$project":
                    {
                        _id:"$_id",
                        userId:"$userId",
                        statusInquiry:"$statusInquiry",
                        noRek:"$noRek",
                        nama:"$nama",
                        active:"$active",
                        tanggalPengajuan:"$tanggalPengajuan",
                        // userHandle:"$userHandle",
                        // fkbasic:"$userbasic_data",
                        // fkauth:"$userauth_data",
                        fullName:"$fullName",
                        email:"$email",
                        username:"$username",
                        statusLast:"$statusLast",
                        reasonId:"$reasonId",
                        reasonAdmin:"$reasonAdmin",
                        avatar:"$avatar",
                    }
                });
        }
        else
        {
            querytambahan.push({
                "$group":
                {
                    _id:null,
                    total:
                    {
                        "$sum":1
                    }
                }
            });
        }

        //console.log(JSON.stringify(querytambahan));

        var query = await this.userbankaccountsModel.aggregate(querytambahan);

        return query;
    }

}
