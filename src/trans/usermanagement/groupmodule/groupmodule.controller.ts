import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Query, Post, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UtilsService } from '../../../utils/utils.service';
import { ErrorHandler } from '../../../utils/error.handler';
import { GroupModuleService } from './groupmodule.service';
import { GroupModuleDto, ValidasiGroupModuleDto } from './dto/groupmodule.dto';
import { GroupService } from '../group/group.service';
import { ModuleService } from '../module/module.service'; 
import { GroupDto } from '../group/dto/group.dto';
import { Group as Group_ } from '../group/schemas/group.schema';
import { UserbasicsService } from '../../../trans/userbasics/userbasics.service';
import { ObjectId } from 'mongodb';

@Controller('api/groupmodule')
export class GroupModuleController {
    constructor(
        private readonly groupModuleService: GroupModuleService,
        private readonly utilsService: UtilsService, 
        private readonly errorHandler: ErrorHandler,
        private readonly groupService: GroupService, 
        private readonly moduleService: ModuleService,
        private readonly userbasicsService: UserbasicsService
    ) { }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/create')
    async create(@Body() request) {
        var data_group = null;
        var data_module = null;
        var param = JSON.parse(JSON.stringify(request));
        if (param.length ==undefined){
            if (request.group == undefined) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Create groupmodule, param group is required',
                );
            }else{
                data_group = await this.moduleService.findOne(request.group);
                if (!(await this.utilsService.ceckData(data_group))) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed Create groupmodule, group is not found',
                    );
                }
            }
            if (request.module == undefined) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Create groupmodule, param module is required',
                );
            }else{
                data_module = await this.moduleService.findOne(request.module);
                if (!(await this.utilsService.ceckData(data_module))) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed Create groupmodule, module is not found',
                    );
                }
            }
            var current_date = await this.utilsService.getDateTimeString();
            var GroupModuleDto_ = new GroupModuleDto();
            GroupModuleDto_.group = request.group;
            GroupModuleDto_.module = request.module;
            if (request.createAcces != undefined) {
                GroupModuleDto_.createAcces = request.createAcces;
            }
            if (request.updateAcces != undefined) {
                GroupModuleDto_.updateAcces = request.updateAcces;
            }
            if (request.deleteAcces != undefined) {
                GroupModuleDto_.deleteAcces = request.deleteAcces;
            }
            if (request.viewAcces != undefined) {
                GroupModuleDto_.viewAcces = request.viewAcces;
            }
            GroupModuleDto_.createAt = current_date;
            GroupModuleDto_.updateAt = current_date;
            if (request.desc != undefined) {
                GroupModuleDto_.desc = request.desc;
            }
            await this.groupModuleService.create(GroupModuleDto_);
        } else {
            for (var k = 0; k < param.length; k++) {
                if (param[k].group == undefined) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed Create groupmodule, param group is required',
                    );
                } else {
                    data_group = await this.groupService.findOne(param[k].group);
                    if (!(await this.utilsService.ceckData(data_group))) {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed Create groupmodule, group is not found',
                        );
                    }
                }
                if (param[k].module == undefined) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed Create groupmodule, param module is required',
                    );
                } else {
                    data_module = await this.moduleService.findOne(param[k].module);
                    if (!(await this.utilsService.ceckData(data_module))) {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed Create groupmodule, module is not found',
                        );
                    }
                }
            }
            for (var i = 0; i < param.length;i++){
                var current_date = await this.utilsService.getDateTimeString();
                var GroupModuleDto_ = new GroupModuleDto();
                GroupModuleDto_.group = param[i].group;
                GroupModuleDto_.module = param[i].module;
                if (param[i].createAcces != undefined) {
                    GroupModuleDto_.createAcces = param[i].createAcces;
                }
                if (param[i].updateAcces != undefined) {
                    GroupModuleDto_.updateAcces = param[i].updateAcces;
                }
                if (param[i].deleteAcces != undefined) {
                    GroupModuleDto_.deleteAcces = param[i].deleteAcces;
                }
                if (param[i].viewAcces != undefined) {
                    GroupModuleDto_.viewAcces = param[i].viewAcces;
                }
                GroupModuleDto_.createAt = current_date;
                GroupModuleDto_.updateAt = current_date;
                if (param[i].desc != undefined) {
                    GroupModuleDto_.desc = param[i].desc;
                }
                await this.groupModuleService.create(GroupModuleDto_);
            }
        }
        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Create group module successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/groupcreate')
    async createGroup(@Body() request) {
        if (request.nameGroup == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create group param nameGroup is required',
            );
        }
        var current_date = await this.utilsService.getDateTimeString();
        var GroupDto_ = new GroupDto();
        GroupDto_.nameGroup = request.nameGroup;
        if (request.userbasics != undefined) {
            if (request.userbasics.length > 0) {
                var data = [];
                for (var i = 0; i < request.userbasics.length; i++) {
                    data[i] = new Object(request.userbasics[i]);
                }
                GroupDto_.userbasics = data;
            }
        }
        GroupDto_.createAt = current_date;
        GroupDto_.updateAt = current_date;
        if (request.desc != undefined) {
            GroupDto_.desc = request.desc;
        }
        var _Group_ = new Group_();
        _Group_ = await this.groupService.create(GroupDto_);
        if (request.module != undefined) {
            var param = JSON.parse(JSON.stringify(request.module));
            if (param.length > 0) {
                for (var k = 0; k < param.length; k++) {
                    if (param[k].module == undefined) {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed Create module param module is required',
                        );
                    }
                }

                for (var i = 0; i < param.length; i++) {
                    var data_module = await this.moduleService.findOne(param[k].module);
                    if (await this.utilsService.ceckData(data_module)) {
                        var current_date = await this.utilsService.getDateTimeString();
                        var GroupModuleDto_ = new GroupModuleDto();
                        GroupModuleDto_.group = param[i].group;
                        GroupModuleDto_.module = param[i].module;
                        if (param[i].createAcces != undefined) {
                            GroupModuleDto_.createAcces = param[i].createAcces;
                        }
                        if (param[i].updateAcces != undefined) {
                            GroupModuleDto_.updateAcces = param[i].updateAcces;
                        }
                        if (param[i].deleteAcces != undefined) {
                            GroupModuleDto_.deleteAcces = param[i].deleteAcces;
                        }
                        if (param[i].viewAcces != undefined) {
                            GroupModuleDto_.viewAcces = param[i].viewAcces;
                        }
                        GroupModuleDto_.createAt = current_date;
                        GroupModuleDto_.updateAt = current_date;
                        if (param[i].desc != undefined) {
                            GroupModuleDto_.desc = param[i].desc;
                        }
                        await this.groupModuleService.create(GroupModuleDto_);
                    }
                }
            }
        }
        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Create group user successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/validasi')
    async validasi(@Body() ValidasiGroupModuleDto_: ValidasiGroupModuleDto) {
        var data_group = null;
        var data_module = null;
        var data_user = null;
        if (ValidasiGroupModuleDto_.user == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed ceck permission, param user is required',
            );
        } else {
            data_user = await this.userbasicsService.findbyid(ValidasiGroupModuleDto_.user.toString());
            if (!(await this.utilsService.ceckData(data_user))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed ceck permission, user is not found',
                );
            }
        }
        if (ValidasiGroupModuleDto_.module == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed ceck permission, param module is required',
            );
        }else{
            data_module = await this.moduleService.findOne(ValidasiGroupModuleDto_.module.toString());
            if (!(await this.utilsService.ceckData(data_module))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed ceck permission, module is not found',
                );
            }
        }
        if (ValidasiGroupModuleDto_.action == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create groupmodule, param action is required',
            );
        }
        var permission = await this.groupModuleService.validasiModule(ValidasiGroupModuleDto_.user.toString(), ValidasiGroupModuleDto_.module.toString(), ValidasiGroupModuleDto_.action.toString());
        return {
            "response_code": 202,
            "permission": permission,
            "messages": {
                "info": [
                    "Permission module is " + permission
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Get('/all')
    async findAll(
        @Query('skip') skip: number,
        @Query('limit') limit: number) {
        var data = await this.groupModuleService.findAll(skip, limit);
        return {
            "response_code": 202,
            "data": data,
            "messages": {
                "info": [
                    "Get list module successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/update')
    async update(@Body() request) {
        var data_group = null;
        var data_module = null;
        var data_group_module = null;
        if (request._id == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Update groupmodule, param _id is required',
            );
        } else {
            data_group_module = await this.groupModuleService.findOne(request._id);
            if (!(await this.utilsService.ceckData(data_group_module))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Update groupmodule, data is not found',
                );
            }
        }
        if (request.group == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Update groupmodule, param group is required',
            );
        } else {
            data_group = await this.moduleService.findOne(request.group);
            if (!(await this.utilsService.ceckData(data_group))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Update groupmodule, group is not found',
                );
            }
        }
        if (request.module == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Update groupmodule, param module is required',
            );
        } else {
            data_module = await this.moduleService.findOne(request.module);
            if (!(await this.utilsService.ceckData(data_module))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Update groupmodule, module is not found',
                );
            }
        }

        var current_date = await this.utilsService.getDateTimeString();
        var GroupModuleDto_ = new GroupModuleDto();
        GroupModuleDto_.group = request.group;
        GroupModuleDto_.module = request.module;
        if (request.createAcces != undefined) {
            GroupModuleDto_.createAcces = request.createAcces;
        }
        if (request.updateAcces != undefined) {
            GroupModuleDto_.updateAcces = request.updateAcces;
        }
        if (request.deleteAcces != undefined) {
            GroupModuleDto_.deleteAcces = request.deleteAcces;
        }
        if (request.viewAcces != undefined) {
            GroupModuleDto_.viewAcces = request.viewAcces;
        }
        GroupModuleDto_.createAt = current_date;
        GroupModuleDto_.updateAt = current_date;
        if (request.desc != undefined) {
            GroupModuleDto_.desc = request.desc;
        }
        await this.groupModuleService.update(request._id, GroupModuleDto_);
        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Update module successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Delete('/delete')
    async delete(
        @Query('id') id: string,) {
        var data = await this.groupModuleService.delete(id);
        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Delete module successfully"
                ]
            },
        };
    }
}
