import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Query, Post, UseGuards, Param } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupDto } from './dto/group.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Group } from './schemas/group.schema'; 
import { UtilsService } from '../../../utils/utils.service';
import { ErrorHandler } from '../../../utils/error.handler';
import { UserbasicsService } from '../../../trans/userbasics/userbasics.service';
import { DivisionService } from '../division/division.service';
import { UserauthsService } from 'src/trans/userauths/userauths.service';

@Controller('/api/group')
export class GroupController {

    constructor(
        private readonly groupService: GroupService,
        private readonly utilsService: UtilsService, 
        private readonly errorHandler: ErrorHandler, 
        private readonly userbasicsService: UserbasicsService,
        private readonly divisionService: DivisionService, 
        private readonly userauthsService: UserauthsService,
        ) { }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/create')
    async create(@Body() request) {
        var current_date = await this.utilsService.getDateTimeString();
        var data_group = null;
        var data_division = null;
        var insert = false;
        var data_user_insert = [];
        var data_user_insert_email = [];
        var data_user_not_insert = [];
        var data_user_not_found = [];

        if (request.nameGroup == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create group param nameGroup is required',
            );
        }else{
            data_group = await this.groupService.findOnebyName(request.nameGroup);
            if (!(await this.utilsService.ceckData(data_group))){
                insert =true
            }
        }

        if (request.divisionId == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create group param divisionId is required',
            );
        } else {
            data_division = await this.divisionService.findOne(request.divisionId);
            if (!(await this.utilsService.ceckData(data_division))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Create group param divisionId is not found',
                );
            }
        }

        var GroupDto_ = new GroupDto();
        GroupDto_.nameGroup = request.nameGroup;
        GroupDto_.divisionId = Object(request.divisionId);
        if (request.userbasics != undefined) {
            if (request.userbasics.length > 0) {
                for (var i = 0; i < request.userbasics.length; i++) {
                    var data_userbasic = await this.userbasicsService.findOne(request.userbasics[i]);
                    if (await this.utilsService.ceckData(data_userbasic)) {
                        var data_user_group = await this.groupService.findbyuser(data_userbasic._id.toString());
                        if (await this.utilsService.ceckData(data_user_group)) {
                            if (data_user_group[0].nameGroup == request.nameGroup) {
                                data_user_insert.push(new Object(data_userbasic._id.toString()));
                                data_user_insert_email.push(request.userbasics[i]);
                            } else {
                                data_user_not_insert.push(request.userbasics[i]);
                            }
                        } else {
                            data_user_insert.push(new Object(data_userbasic._id.toString()));
                            data_user_insert_email.push(request.userbasics[i]);
                        }
                    } else {
                        data_user_not_found.push(request.userbasics[i]);
                    }
                }
                GroupDto_.userbasics = data_user_insert;
            }
        }
        if (request.desc != undefined) {
            GroupDto_.desc = request.desc;
        }
        GroupDto_.updateAt = current_date;
        if (insert) {
            GroupDto_.createAt = current_date;
            await this.groupService.create(GroupDto_);
        } else {
            await this.groupService.update(data_group._id,GroupDto_);
        }
        return {
            "response_code": 202,
            "data":{
                "nameGroup": request.nameGroup,
                "data_usert_insert_in_group": data_user_insert_email,
                "user_exist_in_another_group": data_user_not_insert,
                "user_not_found": data_user_not_found
            },
            "messages": {
                "info": [
                    "Create group user successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Get('/all')
    async findAll(
        @Query('skip') skip: number,
        @Query('limit') limit: number,
        @Query('search') search: string) {
        if (search == undefined) {
            search = "";
        } 
        var data = await this.groupService.findAll(search, skip, limit);
        var totalRow = (await this.groupService.findAllCount(search)).length;
        return {
            "response_code": 202,
            "totalRow": totalRow,
            "data": data,
            skip: skip,
            limit: limit,
            "messages": {
                "info": [
                    "Get list group user successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/update')
    async update(@Body() request) {
        var current_date = await this.utilsService.getDateTimeString();
        var data_division = null;
        var data_user_insert = [];
        var data_user_insert_email = [];
        var data_user_not_insert = [];
        var data_user_not_found = [];

        if (request._id == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create group param _id is required',
            );
        }
        if (request.nameGroup == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create group param nameGroup is required',
            );
        }

        if (request.divisionId == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create group param divisionId is required',
            );
        } else {
            data_division = await this.divisionService.findOne(request.divisionId);
            if (!(await this.utilsService.ceckData(data_division))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Create group param divisionId is not found',
                );
            }
        }

        var GroupDto_ = new GroupDto();
        GroupDto_.nameGroup = request.nameGroup;
        GroupDto_.divisionId = Object(request.divisionId);
        if (request.userbasics != undefined) {
            if (request.userbasics.length > 0) {
                for (var i = 0; i < request.userbasics.length; i++) {
                    var data_userbasic = await this.userbasicsService.findOne(request.userbasics[i]);
                    if (await this.utilsService.ceckData(data_userbasic)) {
                        var data_user_group = await this.groupService.findbyuser(data_userbasic._id.toString());
                        if (await this.utilsService.ceckData(data_user_group)) {
                            if (data_user_group[0]._id.toString() == request._id) {
                                data_user_insert.push(new Object(data_userbasic._id.toString()));
                                data_user_insert_email.push(request.userbasics[i]);
                            } else {
                                data_user_not_insert.push(request.userbasics[i]);
                            }
                        } else {
                            data_user_insert.push(new Object(data_userbasic._id.toString()));
                            data_user_insert_email.push(request.userbasics[i]);
                        }
                    } else {
                        data_user_not_found.push(request.userbasics[i]);
                    }
                }
                GroupDto_.userbasics = data_user_insert;
            }
        }
        GroupDto_.updateAt = current_date;
        if (request.desc != undefined) {
            GroupDto_.desc = request.desc;
        }
        await this.groupService.update(request._id,GroupDto_);
        return {
            "response_code": 202,
            "data": {
                "nameGroup": request.nameGroup,
                "data_usert_insert_in_group": data_user_insert_email,
                "user_exist_in_another_group": data_user_not_insert,
                "user_not_found": data_user_not_found
            },
            "messages": {
                "info": [
                    "Update group user successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Delete('/delete')
    async delete(
        @Query('id') id: string,) {
        var data = await this.groupService.delete(id);
        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Delete group user successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/user')
    async addusergroup(@Body() request) {
        if (request.email == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Add user to group param email is required',
            );
        }
        if (request.groupId == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Add user to group param groupId is required',
            );
        }

        var data_userbasic = await this.userbasicsService.findOne(request.email);
        if (await this.utilsService.ceckData(data_userbasic)) {
            var group = await this.groupService.findbyuser(data_userbasic._id.toString());
            var user_auth = await this.userauthsService.findOneemail(request.email);
            if (await this.utilsService.ceckData(user_auth)) {
                if (await this.utilsService.ceckData(group)) {
                    if (group[0]._id != request.groupId) {
                        await this.groupService.deleteUserGroup(group[0]._id, data_userbasic._id.toString());
                        await this.groupService.addUserGroup(request.groupId, data_userbasic._id.toString());

                        var user_auth_role = await this.userauthsService.findRoleEmail(request.email, "ROLE_ADMIN");
                        if (!(await this.utilsService.ceckData(user_auth_role))) {
                            await this.userauthsService.addUserRole(request.email, "ROLE_ADMIN");
                        }
                    } else {
                        var user_auth_role = await this.userauthsService.findRoleEmail(request.email, "ROLE_ADMIN");
                        if (!(await this.utilsService.ceckData(user_auth_role))) {
                            await this.userauthsService.addUserRole(request.email, "ROLE_ADMIN");
                        }
                    }
                } else {
                    await this.groupService.addUserGroup(request.groupId, data_userbasic._id.toString());

                    var user_auth_role = await this.userauthsService.findRoleEmail(request.email, "ROLE_ADMIN");
                    if (!(await this.utilsService.ceckData(user_auth_role))) {
                        await this.userauthsService.addUserRole(request.email, "ROLE_ADMIN");
                    }
                }
                return {
                    "response_code": 202,
                    "messages": {
                        "info": [
                            "Update user to group successfully"
                        ]
                    },
                };
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed userauth not found',
                ); 
            }
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Delete('/user')
    async deleteusergroup(
        @Query('email') email: string,) {
        if (email == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Add user to group param email is required',
            );
        }

        var data_userbasic = await this.userbasicsService.findOne(email);
        if (await this.utilsService.ceckData(data_userbasic)) {
            var group = await this.groupService.findbyuser(data_userbasic._id.toString());
            var user_auth = await this.userauthsService.findOneemail(email);
            if (await this.utilsService.ceckData(user_auth)) {
                if (await this.utilsService.ceckData(group)) {
                    await this.groupService.deleteUserGroup(group[0]._id, data_userbasic._id.toString());
                }

                var user_auth_role = await this.userauthsService.findRoleEmail(email, "ROLE_ADMIN");
                if (await this.utilsService.ceckData(user_auth_role)) {
                    await this.userauthsService.deleteUserRole(email, "ROLE_ADMIN");
                }
                return {
                    "response_code": 202,
                    "messages": {
                        "info": [
                            "Delete user to group successfully"
                        ]
                    },
                };
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed userauth not found',
                );
            }
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
    }
}
