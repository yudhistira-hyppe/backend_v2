import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Model } from 'mongoose';
import { GroupDto } from './dto/group.dto';
import { Group, GroupDocument } from './schemas/group.schema';

@Injectable()
export class GroupService {
    constructor(
        @InjectModel(Group.name, 'SERVER_FULL')
        private readonly groupModel: Model<GroupDocument>
    ) { }

    async create(GroupDto: GroupDto): Promise<Group> {
        let data = await this.groupModel.create(GroupDto);
        if (!data) {
            throw new Error('data is not found!');
        }
        return data;
    }

    async findAll(search: string, skip: number, limit: number): Promise<Group[]> {
        return this.groupModel.find({ nameGroup: { $regex: search } }).skip(skip).limit(limit).exec();
    }

    async findAllCount(search: string): Promise<Group[]> {
        return this.groupModel.find({ nameGroup: { $regex: search } }).exec();
    }

    async findAllnoSkip(): Promise<Group[]> {
        return this.groupModel.find().exec();
    }
    async findbydiv(divisiId: ObjectId): Promise<Group[]> {
        return this.groupModel.find({ divisionId: divisiId }).exec();
    }
    async find(): Promise<Group[]> {
        return this.groupModel.find().exec();
    }


    async findOne(_id: String): Promise<Group> {
        return this.groupModel.findOne({ _id: _id }).exec();
    }

    async findByid(_id: String): Promise<any> {
        var GetGroup = this.groupModel.aggregate([
            // { 
            //     $project: { 
            //         param_id: { "$toObjectId": _id } 
            //     }
            // },
            {
                "$match": {
                    _id: new ObjectId(_id.toString())
                },
            },
            {
                $lookup: {
                    from: 'division',
                    let: { division_Id: "$divisionId" },
                    pipeline: [
                        { "$addFields": { "_id": { "$toString": "$_id" } } },
                        { "$match": { "$expr": { "$eq": ["$_id", "$$division_Id"] } } }
                    ],
                    as: 'division_data'
                }
            },
            {
                $lookup: {
                    from: 'groupmodule',
                    let: { group_id: "$_id" },
                    pipeline: [
                        { "$addFields": { "group": { "$toObjectId": "$group" } } },
                        { "$match": { "$expr": { "$eq": ["$group", "$$group_id"] } } }
                    ],
                    as: 'groupmodule_data',
                },
            },
            {
                $project: {
                    _id: '$_id',
                    nameGroup: '$nameGroup',
                    divisionId: { $arrayElemAt: ['$division_data._id', 0] },
                    nameDivision: { $arrayElemAt: ['$division_data.nameDivision', 0] },
                    fullName: '$fullName',
                    createAt: '$createAt',
                    updateAt: '$updateAt',
                    desc: '$desc',
                    data: {
                        "$map": {
                            "input": "$groupmodule_data",
                            "as": "dline",
                            "in": {
                                "id": "$$dline.module",
                                "createAcces": "$$dline.createAcces",
                                "updateAcces": "$$dline.updateAcces",
                                "deleteAcces": "$$dline.deleteAcces",
                                "viewAcces": "$$dline.viewAcces"
                            }
                        }
                    }
                },
            },
        ]).exec();
        return GetGroup;
    }

    async findByDvivision(_id: String): Promise<any> {
        var GetGroup = this.groupModel.aggregate([
            // { 
            //     $project: { 
            //         param_id: { "$toObjectId": _id } 
            //     }
            // },
            {
                "$match": {
                    divisionId: new ObjectId(_id.toString())
                },
            },
            {
                $lookup: {
                    from: 'division',
                    let: { division_Id: "$divisionId" },
                    pipeline: [
                        { "$addFields": { "_id": { "$toString": "$_id" } } },
                        { "$match": { "$expr": { "$eq": ["$_id", "$$division_Id"] } } }
                    ],
                    as: 'division_data'
                }
            },
            {
                $lookup: {
                    from: 'groupmodule',
                    let: { group_id: "$_id" },
                    pipeline: [
                        { "$addFields": { "group": { "$toObjectId": "$group" } } },
                        { "$match": { "$expr": { "$eq": ["$group", "$$group_id"] } } }
                    ],
                    as: 'groupmodule_data',
                },
            },
            {
                $project: {
                    _id: '$_id',
                    nameGroup: '$nameGroup',
                    divisionId: { $arrayElemAt: ['$division_data._id', 0] },
                    nameDivision: { $arrayElemAt: ['$division_data.nameDivision', 0] },
                    fullName: '$fullName',
                    createAt: '$createAt',
                    updateAt: '$updateAt',
                    desc: '$desc',
                    data: {
                        "$map": {
                            "input": "$groupmodule_data",
                            "as": "dline",
                            "in": {
                                "id": "$$dline.module",
                                "createAcces": "$$dline.createAcces",
                                "updateAcces": "$$dline.updateAcces",
                                "deleteAcces": "$$dline.deleteAcces",
                                "viewAcces": "$$dline.viewAcces"
                            }
                        }
                    }
                },
            },
        ]).exec();
        return GetGroup;
    }

    async findOnebyName(nameGroup: String): Promise<Group> {
        return this.groupModel.findOne({ nameGroup: nameGroup }).exec();
    }

    async update(_id: String, GroupDto: GroupDto): Promise<Object> {
        return await this.groupModel.updateOne({ _id: _id }, GroupDto);
    }

    async delete(_id: String) {
        return await this.groupModel.findByIdAndRemove({ _id: _id }).exec();
    }

    async deleteUserGroup(_id: String, userId: mongoose.Types.ObjectId) {
        return await this.groupModel.updateOne({ _id: _id }, { $pull: { userbasics: userId } }).exec();
    }

    async addUserGroup(_id: String, userId: mongoose.Types.ObjectId) {
        return await this.groupModel.updateOne({ _id: _id }, { $push: { userbasics: userId } }).exec();
    }

    async findbyuser(_id: mongoose.Types.ObjectId) {
        return await this.groupModel.findOne({ userbasics: { $in: [_id] } }).exec();
    }

    async getAcces(_id: mongoose.Types.ObjectId) {

        var GetGroup = this.groupModel.aggregate([
            // { 
            //     $project: { 
            //         param_id: { "$toObjectId": _id } 
            //     }
            // },
            {
                "$match": {
                    $and: [
                        { userbasics: { $in: [_id] } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'division',
                    let: { division_Id: "$divisionId" },
                    pipeline: [
                        { "$addFields": { "_id": { "$toString": "$_id" } } },
                        { "$match": { "$expr": { "$eq": ["$_id", "$$division_Id"] } } }
                    ],
                    as: 'division_data'
                }
            },
            {
                $lookup: {
                    from: 'groupmodule',
                    let: { group_id: "$_id" },
                    pipeline: [
                        { "$addFields": { "group": { "$toObjectId": "$group" } } },
                        { "$match": { "$expr": { "$eq": ["$group", "$$group_id"] } } }
                    ],
                    as: 'groupmodule_data',
                },
            },
            {
                $project: {
                    _id: '$_id',
                    nameGroup: '$nameGroup',
                    divisionId: { $arrayElemAt: ['$division_data._id', 0] },
                    nameDivision: { $arrayElemAt: ['$division_data.nameDivision', 0] },
                    fullName: '$fullName',
                    createAt: '$createAt',
                    updateAt: '$updateAt',
                    desc: '$desc',
                    data: {
                        "$map": {
                            "input": "$groupmodule_data",
                            "as": "dline",
                            "in": {
                                "id": "$$dline.module",
                                "createAcces": "$$dline.createAcces",
                                "updateAcces": "$$dline.updateAcces",
                                "deleteAcces": "$$dline.deleteAcces",
                                "viewAcces": "$$dline.viewAcces"
                            }
                        }
                    }
                },
            },
            {
                $unwind: {
                    path: "$data",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: '$_id',
                    nameGroup: '$nameGroup',
                    divisionId: { $arrayElemAt: ['$division_data._id', 0] },
                    nameDivision: { $arrayElemAt: ['$division_data.nameDivision', 0] },
                    fullName: '$fullName',
                    createAt: '$createAt',
                    updateAt: '$updateAt',
                    desc: '$desc',
                    moduleId: '$data.id',
                    data: '$data'
                },
            },
            {
                $lookup: {
                    from: "module",
                    localField: "moduleId",
                    foreignField: "_id",
                    as: "module_data"
                }
            },
            {
                $project: {
                    _id: { $arrayElemAt: ['$module_data._id', 0] },
                    nameModule: { $arrayElemAt: ['$module_data.nameModule', 0] },
                    desc: { $arrayElemAt: ['$module_data.desc', 0] },
                    updateAt: { $arrayElemAt: ['$module_data.updateAt', 0] },
                    createAt: { $arrayElemAt: ['$module_data.createAt', 0] },
                    acces: '$data',
                },
            },
        ]).exec();

        return GetGroup;
    }

    async listGroupUserAll() {
        var query = await this.groupModel.aggregate([

            {
                $lookup: {
                    from: "userbasics",
                    localField: "userbasics",
                    foreignField: "_id",
                    as: "userdata"
                }
            },
            {
                $lookup: {
                    from: "division",
                    localField: "divisionId",
                    foreignField: "_id",
                    as: "divisidata"
                }
            },
            {
                $project: {
                    divisi: {
                        $arrayElemAt: ['$divisidata', 0]
                    },
                    user: {
                        $arrayElemAt: ['$userdata', 0]
                    },

                },
            },
            {
                $project: {
                    userId: '$user._id',
                    fullName: '$user.fullName',
                    email: '$user.email',
                    divisionId: '$divisi._id',
                    nameDivision: '$divisi.nameDivision'

                },
            }
        ]);

        return query;
    }

    async listGroup(divisionId: ObjectId) {
        var query = await this.groupModel.aggregate([
            {
                $match: {
                    "divisionId": divisionId
                }
            },
            {
                $lookup: {
                    from: "userbasics",
                    localField: "userbasics",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $project: {
                    "divisionId": "$divisionId",
                    "nameGroup": "$nameGroup",
                    "createAt": "$createAt",
                    "desc": "$desc",
                    "user": "$user"
                }
            },

        ]);

        return query;
    }


    // async validasiUserGroup(email: String) {
    //     return await this.groupModel.find({ userbasics: { $in: [_id] } }).exec();
    // }
}
