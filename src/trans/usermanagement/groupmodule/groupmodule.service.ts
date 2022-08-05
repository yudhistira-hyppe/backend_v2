import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { GroupModuleDto } from './dto/groupmodule.dto'; 
import { GroupModule, GroupModuleDocument } from './schemas/groupmodule.schema';
import { GroupService } from '../group/group.service';
import { ModuleService } from '../module/module.service';
import { UtilsService } from '../../../utils/utils.service';
import { UserbasicsService } from '../../../trans/userbasics/userbasics.service';

@Injectable()
export class GroupModuleService {
    constructor(
        @InjectModel(GroupModule.name, 'SERVER_TRANS')
        private readonly moduleModel: Model<GroupModuleDocument>,
        private readonly groupService: GroupService, 
        private readonly moduleService: ModuleService,
        private readonly utilsService: UtilsService,
        private readonly userbasicsService: UserbasicsService
    ) {}

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

    async update(_id: String, GroupModuleDto: GroupModuleDto): Promise<Object> {
        return await this.moduleModel.updateOne({ _id: _id }, GroupModuleDto);
    }

    async delete(_id: String) {
        return await this.moduleModel.findByIdAndRemove({ _id: _id }).exec();
    }

    async validasiModule(id_userbasic: string, id_module: string, action: string): Promise<boolean> {
        var permission = false;

        var group = await this.groupService.findbyuser(id_userbasic);
        var datapermission = await this.moduleModel.findOne({ group: group[0]._id.toString(), module: id_module }).exec();
        console.log(group[0]._id.toString());
        console.log(id_module);
        console.log(datapermission);
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
        return permission;
    }
}
