import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import mongoose, { Model } from 'mongoose';
import { GroupModuleDto } from './dto/groupmodule.dto';
import { GroupModule, GroupModuleDocument } from './schemas/groupmodule.schema';
import { GroupService } from '../group/group.service';
import { ModuleService } from '../module/module.service';
import { UtilsService } from '../../../utils/utils.service';
import { UserbasicsService } from '../../../trans/userbasics/userbasics.service';
import { ErrorHandler } from '../../../utils/error.handler';
import { DomUtils } from 'htmlparser2';

@Injectable()
export class GroupModuleService {
    constructor(
        @InjectModel(GroupModule.name, 'SERVER_FULL')
        private readonly moduleModel: Model<GroupModuleDocument>,
        private readonly groupService: GroupService,
        private readonly moduleService: ModuleService,
        private readonly utilsService: UtilsService,
        private readonly userbasicsService: UserbasicsService,
        private readonly errorHandler: ErrorHandler
    ) { }

    async create(GroupModuleDto: GroupModuleDto): Promise<GroupModule> {
        let data = await this.moduleModel.create(GroupModuleDto);
        if (!data) {
            throw new Error('data is not found!');
        }
        return data;
    }

    async findAll(skip: number, limit: number): Promise<GroupModule[]> {
        return this.moduleModel.find().skip(skip).limit(limit).exec();
    }

    async findOne(_id: String): Promise<GroupModuleDto> {
        return this.moduleModel.findOne({ _id: _id }).exec();
    }

    async findOneByGroupandModule(group: String, module: String): Promise<GroupModuleDto> {
        return this.moduleModel.findOne({ group: group, module: module }).exec();
    }

    async deleteByGroup(group: String) {
        return this.moduleModel.find({ group: group }).remove().exec();
    }

    async findOnebygroupandmodule(group: String, module: String): Promise<GroupModuleDto> {
        return this.moduleModel.findOne({ group: group, module: module }).exec();
    }

    async update(_id: String, GroupModuleDto: GroupModuleDto): Promise<Object> {
        return await this.moduleModel.updateOne({ _id: _id }, GroupModuleDto);
    }

    async delete(_id: String) {
        return await this.moduleModel.findByIdAndRemove({ _id: _id }).exec();
    }

    async validasiModule(id_userbasic: string, id_module: string, action: string): Promise<boolean> {
        var permission = false;

        var group = await this.groupService.findbyuser(new mongoose.Types.ObjectId(id_userbasic));
        if (!(await this.utilsService.ceckData(group))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed ceck permission, the user does not have a group',
            );
        }
        var datapermission = await this.moduleModel.findOne({ group: group[0]._id.toString(), module: id_module }).exec();
        if (await this.utilsService.ceckData(datapermission)) {
            if (action == "create") {
                if (datapermission.createAcces != undefined) {
                    permission = datapermission.createAcces;
                } else {
                    permission = false;
                }
            } else if (action == "update") {
                if (datapermission.updateAcces != undefined) {
                    permission = datapermission.updateAcces;
                } else {
                    permission = false;
                }
            } else if (action == "delete") {
                if (datapermission.deleteAcces != undefined) {
                    permission = datapermission.deleteAcces;
                } else {
                    permission = false;
                }
            } else if (action == "view") {
                if (datapermission.viewAcces != undefined) {
                    permission = datapermission.viewAcces;
                } else {
                    permission = false;
                }
            }
        }
        return permission;
    }

    async validasiModule2(email: string, name_module: string, action: string): Promise<boolean> {
        var permission = false;

        var data_user = await this.userbasicsService.findOne(email);
        if (!(await this.utilsService.ceckData(data_user))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed ceck permission, user does not exist',
            );
        }

        var data_group = await this.groupService.findbyuser(new mongoose.Types.ObjectId(data_user._id.toString()));
        if (!(await this.utilsService.ceckData(data_group))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed ceck permission, the user does not have a group',
            );
        }

        var data_module = await this.moduleService.findOnebyName(name_module);
        if (!(await this.utilsService.ceckData(data_module))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed ceck permission, module does not exist',
            );
        }

        var datapermission = await this.moduleModel.findOne({ group: data_group[0]._id.toString(), module: data_module._id.toString() }).exec();
        if (await this.utilsService.ceckData(datapermission)) {
            if (action == "create") {
                if (datapermission.createAcces != undefined) {
                    permission = datapermission.createAcces;
                } else {
                    permission = false;
                }
            } else if (action == "update") {
                if (datapermission.updateAcces != undefined) {
                    permission = datapermission.updateAcces;
                } else {
                    permission = false;
                }
            } else if (action == "delete") {
                if (datapermission.deleteAcces != undefined) {
                    permission = datapermission.deleteAcces;
                } else {
                    permission = false;
                }
            } else if (action == "view") {
                if (datapermission.viewAcces != undefined) {
                    permission = datapermission.viewAcces;
                } else {
                    permission = false;
                }
            }
        } else {
            permission = false;
        }

        return permission;
    }
}
