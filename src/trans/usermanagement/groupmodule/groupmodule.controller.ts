import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Query, Post, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
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
        var insert = false;

        var current_date = await this.utilsService.getDateTimeString();
        var param = JSON.parse(JSON.stringify(request));

        if (param.length ==undefined){
            if (request.group == undefined) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Create groupmodule, param group is required',
                );
            }else{
                var data_group = await this.groupService.findOne(request.group);
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
                var data_module = await this.moduleService.findOne(request.module);
                if (!(await this.utilsService.ceckData(data_module))) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed Create groupmodule, module is not found',
                    );
                }
            }
            var data_groupandmodule = await this.groupModuleService.findOnebygroupandmodule(request.group, request.module);
            if (!(await this.utilsService.ceckData(data_groupandmodule))){
                insert = true;
            }

            var GroupModuleDto_ = new GroupModuleDto();
            GroupModuleDto_.group = request.group;
            GroupModuleDto_.module = request.module;
            if (request.createAcces != undefined) {
                GroupModuleDto_.createAcces = request.createAcces;
            } else {
                GroupModuleDto_.createAcces = false;
            }
            if (request.updateAcces != undefined) {
                GroupModuleDto_.updateAcces = request.updateAcces;
            } else {
                GroupModuleDto_.updateAcces = false;
            }
            if (request.deleteAcces != undefined) {
                GroupModuleDto_.deleteAcces = request.deleteAcces;
            } else {
                GroupModuleDto_.deleteAcces = false;
            }
            if (request.viewAcces != undefined) {
                GroupModuleDto_.viewAcces = request.viewAcces;
            } else {
                GroupModuleDto_.viewAcces = false;
            }
            if (request.desc != undefined) {
                GroupModuleDto_.desc = request.desc;
            }
            GroupModuleDto_.updateAt = current_date;
            if (insert) {
                GroupModuleDto_.createAt = current_date;
                await this.groupModuleService.create(GroupModuleDto_);
            } else {
                await this.groupModuleService.update(data_groupandmodule._id.toString(),GroupModuleDto_);
            }
        } else {
            for (var k = 0; k < param.length; k++) {
                if (param[k].group == undefined) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed Create groupmodule, param group is required in index ' + k,
                    );
                } else {
                    var data_group_ = await this.groupService.findOne(param[k].group);
                    if (!(await this.utilsService.ceckData(data_group_))) {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed Create groupmodule, group is not found in index ' + k,
                        );
                    }
                }
                if (param[k].module == undefined) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed Create groupmodule, param module is required in index ' + k,
                    );
                } else {
                    var data_module = await this.moduleService.findOne(param[k].module);
                    if (!(await this.utilsService.ceckData(data_module))) {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed Create groupmodule, module is not found in index ' + k,
                        );
                    }
                }
            }
            for (var i = 0; i < param.length; i++) {
                var insert_array = false;
                var data_groupandmodule = await this.groupModuleService.findOnebygroupandmodule(param[i].group, param[i].module);
                if (!(await this.utilsService.ceckData(data_groupandmodule))) {
                    insert_array = true;
                }

                var GroupModuleDto_ = new GroupModuleDto();
                GroupModuleDto_.group = param[i].group;
                GroupModuleDto_.module = param[i].module;
                if (param[i].createAcces != undefined) {
                    GroupModuleDto_.createAcces = param[i].createAcces;
                }else{
                    GroupModuleDto_.createAcces = false;
                }
                if (param[i].updateAcces != undefined) {
                    GroupModuleDto_.updateAcces = param[i].updateAcces;
                } else {
                    GroupModuleDto_.updateAcces = false;
                }
                if (param[i].deleteAcces != undefined) {
                    GroupModuleDto_.deleteAcces = param[i].deleteAcces;
                } else {
                    GroupModuleDto_.deleteAcces = false;
                }
                if (param[i].viewAcces != undefined) {
                    GroupModuleDto_.viewAcces = param[i].viewAcces;
                } else {
                    GroupModuleDto_.viewAcces = false;
                }
                if (param[i].desc != undefined) {
                    GroupModuleDto_.desc = param[i].desc;
                }
                GroupModuleDto_.updateAt = current_date;
                if (insert_array) {
                    GroupModuleDto_.createAt = current_date;
                    await this.groupModuleService.create(GroupModuleDto_);
                } else {
                    await this.groupModuleService.update(data_groupandmodule._id.toString(), GroupModuleDto_);
                }
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
            data_user = await this.userbasicsService.findOne(ValidasiGroupModuleDto_.user.toString());
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
            data_module = await this.moduleService.findOnebyName(ValidasiGroupModuleDto_.module.toString());
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
        var permission = await this.groupModuleService.validasiModule(data_user._id.toString(), data_module._id.toString(), ValidasiGroupModuleDto_.action.toString());
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
        var current_date = await this.utilsService.getDateTimeString();
        var param = JSON.parse(JSON.stringify(request));
        var data_group = null;
        var data_module = null;

        var succes_update = [];
        var group_not_found = []; 
        var module_not_found = [];
        var group_module_failed_update = [];
        var group_module_succes_update = [];
        if (param.length == undefined) {
            if (request.group == undefined) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Create groupmodule, param group is required',
                );
            } else {
                data_group = await this.groupService.findOne(request.group);
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
            } else {
                data_module = await this.moduleService.findOne(request.module);
                if (!(await this.utilsService.ceckData(data_module))) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed Create groupmodule, module is not found',
                    );
                }
            }
            var data_group_module = await this.groupModuleService.findOnebygroupandmodule(data_group._id.toString(), data_module._id.toString());
            if (!(await this.utilsService.ceckData(data_group_module))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Update groupmodule, data is not found',
                );
            }

            var GroupModuleDto_ = new GroupModuleDto();
            GroupModuleDto_.group = request.group;
            GroupModuleDto_.module = request.module;
            if (request.createAcces != undefined) {
                GroupModuleDto_.createAcces = request.createAcces;
            } else {
                GroupModuleDto_.createAcces = false;
            }
            if (request.updateAcces != undefined) {
                GroupModuleDto_.updateAcces = request.updateAcces;
            } else {
                GroupModuleDto_.updateAcces = false;
            }
            if (request.deleteAcces != undefined) {
                GroupModuleDto_.deleteAcces = request.deleteAcces;
            } else {
                GroupModuleDto_.deleteAcces = false;
            }
            if (request.viewAcces != undefined) {
                GroupModuleDto_.viewAcces = request.viewAcces;
            } else {
                GroupModuleDto_.viewAcces = false;
            }
            GroupModuleDto_.updateAt = current_date;
            if (request.desc != undefined) {
                GroupModuleDto_.desc = request.desc;
            }
            await this.groupModuleService.update(request._id, GroupModuleDto_);
        } else {
            for (var k = 0; k < param.length; k++) {
                // if (param[k]._id == undefined) {
                //     await this.errorHandler.generateNotAcceptableException(
                //         'Unabled to proceed Update groupmodule, param _id is required in index ' + k,
                //     );
                // } else {
                //     var data_group_module = await this.groupModuleService.findOne(param[k]._id);
                //     if (!(await this.utilsService.ceckData(data_group_module))) {
                //         await this.errorHandler.generateNotAcceptableException(
                //             'Unabled to proceed Update groupmodule, data is not foundin index ' + k,
                //         );
                //     }
                // }
                if (param[k].group == undefined) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed Create groupmodule, param group is required in index ' + k,
                    );
                } else {
                    if (await this.utilsService.ceckObjectid(param[k].group)) {
                        data_group = await this.groupService.findOne(param[k].group);
                        if (!(await this.utilsService.ceckData(data_group))) {
                            succes_update[k] = false;
                            group_not_found[k] = param[k].group + ' index ' + k;
                            // await this.errorHandler.generateNotAcceptableException(
                            //     'Unabled to proceed Create groupmodule, group is not found in index ' + k,
                            // );
                        }
                    } else {
                        succes_update[k] = false;
                    }
                }
                if (param[k].module == undefined) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed Create groupmodule, param module is required in index ' + k,
                    );
                } else {
                    if (await this.utilsService.ceckObjectid(param[k].module)) {
                        data_module = await this.moduleService.findOne(param[k].module);
                        if (!(await this.utilsService.ceckData(data_module))) {
                            succes_update[k] = false;
                            module_not_found[k] = param[k].module + ' index ' + k;
                            // await this.errorHandler.generateNotAcceptableException(
                            //     'Unabled to proceed Create groupmodule, module is not found in index ' + k,
                            // );
                        }
                    } else {
                        succes_update[k] = false;
                    }
                }

                var data_group_module = await this.groupModuleService.findOnebygroupandmodule(param[k].group, param[k].module);
                if (!(await this.utilsService.ceckData(data_group_module))) {
                    succes_update[k] = false;
                    group_module_failed_update.push({
                        'index': k,
                        'group': param[k].group,
                        'module': param[k].module,
                        'messages': 'group module is not found'
                    });
                    // await this.errorHandler.generateNotAcceptableException(
                    //     'Unabled to proceed Update groupmodule, group module is not found in index ' + k,
                    // );
                } else {
                    succes_update[k] = true;
                    group_module_succes_update.push({
                        'index': k,
                        'group': param[k].group,
                        'module': param[k].module,
                        'messages': 'group module succes update'
                    });
                }
            }
            for (var i = 0; i < param.length; i++) {
                if (succes_update[i]) {
                    var GroupModuleDto_ = new GroupModuleDto();
                    GroupModuleDto_.group = param[i].group;
                    GroupModuleDto_.module = param[i].module;
                    if (param[i].createAcces != undefined) {
                        GroupModuleDto_.createAcces = param[i].createAcces;
                    } else {
                        GroupModuleDto_.createAcces = false;
                    }
                    if (param[i].updateAcces != undefined) {
                        GroupModuleDto_.updateAcces = param[i].updateAcces;
                    } else {
                        GroupModuleDto_.updateAcces = false;
                    }
                    if (param[i].deleteAcces != undefined) {
                        GroupModuleDto_.deleteAcces = param[i].deleteAcces;
                    } else {
                        GroupModuleDto_.deleteAcces = false;
                    }
                    if (param[i].viewAcces != undefined) {
                        GroupModuleDto_.viewAcces = param[i].viewAcces;
                    } else {
                        GroupModuleDto_.viewAcces = false;
                    }
                    GroupModuleDto_.createAt = current_date;
                    GroupModuleDto_.updateAt = current_date;
                    if (param[i].desc != undefined) {
                        GroupModuleDto_.desc = param[i].desc;
                    }
                    await this.groupModuleService.update(param[i]._id, GroupModuleDto_);
                }
            }
        }
        
        return {
            "response_code": 202,
            "data": {
                "data_failed_update_group_mosule": group_module_failed_update,
                "data_succes_update_group_mosule": group_module_succes_update,
                "group_not_found": group_not_found,
                "module_not_found": module_not_found
            },
            "messages": {
                "info": [
                    "Update group module successfully"
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
