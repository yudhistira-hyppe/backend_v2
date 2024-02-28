import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { ModuleDto } from './dto/module.dto';
import { Module, ModuleDocument } from './schemas/module.schema';

@Injectable()
export class ModuleService {
    constructor(
        @InjectModel(Module.name, 'SERVER_FULL')
        private readonly moduleModel: Model<ModuleDocument>,
    ) { }

    async create(ModuleDto: ModuleDto): Promise<Module> {
        console.log(ModuleDto);
        let data = await this.moduleModel.create(ModuleDto);
        if (!data) {
            throw new Error('data is not found!');
        }
        return data;
    }

    async findAll(search: string, skip: number, limit: number): Promise<Module[]> {
        var GetModule = this.moduleModel.aggregate([
            {
                "$match": {
                    $and: [{ "nameModule": { $regex: search } }]
                }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    name: '$nameModule',
                    desc: '$desc',
                    children: [
                        {
                            id: 1,
                            name: 'createAcces',
                        },
                        {
                            id: 2,
                            name: 'updateAcces',
                        },
                        {
                            id: 3,
                            name: 'deleteAcces',
                        },
                        {
                            id: 4,
                            name: 'viewAcces',
                        }
                    ],
                },
            },
        ]).skip(skip).limit(limit);
        return GetModule;
        //return this.moduleModel.find().skip(skip).limit(limit).exec();
    }

    async findAllCount(search: string): Promise<Module[]> {
        var GetModule = this.moduleModel.aggregate([
            {
                "$match": {
                    $and: [{ "nameModule": { $regex: search } }]
                }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    name: '$nameModule',
                    children: [
                        {
                            id: 1,
                            name: 'createAcces',
                        },
                        {
                            id: 2,
                            name: 'updateAcces',
                        },
                        {
                            id: 3,
                            name: 'deleteAcces',
                        },
                        {
                            id: 4,
                            name: 'viewAcces',
                        }
                    ],
                },
            },
        ]).exec();
        return GetModule;
        //return this.moduleModel.find().skip(skip).limit(limit).exec();
    }

    async findOne(_id: string): Promise<Module> {
        return this.moduleModel.findOne({ _id: new Types.ObjectId(_id) }).exec();
    }

    async findOnebyName(nameModule: string): Promise<Module> {
        return this.moduleModel.findOne({ nameModule: nameModule }).exec();
    }

    async update(_id: String, ModuleDto: ModuleDto): Promise<Object> {
        return await this.moduleModel.updateOne({ _id: _id }, ModuleDto);
    }

    async delete(_id: String) {
        return await this.moduleModel.findByIdAndRemove({ _id: _id }).exec();
    }

    async listModuleGroupUsers(moduleName: string) {
        let data = await this.moduleModel.aggregate([
            {
                "$match": {
                    "nameModule": moduleName
                }
            },
            {
                "$lookup": {
                    from: "groupmodule",
                    localField: "_id",
                    foreignField: "module",
                    as: "groupModule"
                }
            },
            {
                "$lookup": {
                    from: "group",
                    localField: "groupModule.group",
                    foreignField: "_id",
                    as: "group"
                }
            },
            {
                "$lookup": {
                    from: "newUserBasics",
                    localField: "group.userbasics",
                    foreignField: "_id",
                    as: "userdata"
                }
            },
            {
                "$project": {
                    userdata: 1
                }
            }
        ]);
        return data;
    }
}
