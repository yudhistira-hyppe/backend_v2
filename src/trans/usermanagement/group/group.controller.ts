import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Query, Post, UseGuards, Param } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupDto } from './dto/group.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Group } from './schemas/group.schema'; 
import { UtilsService } from '../../../utils/utils.service';
import { ErrorHandler } from '../../../utils/error.handler';
import { UserbasicsService } from '../../../trans/userbasics/userbasics.service'; 

@Controller('/api/group')
export class GroupController {

    constructor(
        private readonly groupService: GroupService,
        private readonly utilsService: UtilsService, 
        private readonly errorHandler: ErrorHandler,
        private readonly userbasicsService: UserbasicsService
        ) { }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/create')
    async create(@Body() request) {
        var current_date = await this.utilsService.getDateTimeString();
        var data_group = null;
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

        var GroupDto_ = new GroupDto();
        GroupDto_.nameGroup = request.nameGroup;
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
        @Query('limit') limit: number) {
        var data = await this.groupService.findAll(skip, limit);
        return {
            "response_code": 202,
            "data": data,
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

        var GroupDto_ = new GroupDto();
        GroupDto_.nameGroup = request.nameGroup;
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
}
