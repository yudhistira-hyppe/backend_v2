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
        if (request.nameGroup == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create group param nameGroup is required',
            );
        }
        var current_date = await this.utilsService.getDateTimeString();
        var GroupDto_ = new GroupDto();
        GroupDto_.nameGroup = request.nameGroup;
        if (request.userbasics != undefined){
            if (request.userbasics.length>0) {
                var data = [];
                for (var i = 0; i < request.userbasics.length; i++) {
                    var data_userbasic = await this.userbasicsService.findid(request.userbasics[i]);
                    if (await this.utilsService.ceckData(data_userbasic)) {
                        data[i] = new Object(request.userbasics[i]);
                    };
                }
                GroupDto_.userbasics = data;
            }
        }
        GroupDto_.createAt = current_date;
        GroupDto_.updateAt = current_date;
        if (request.desc != undefined) {
            GroupDto_.desc = request.desc;
        }
        await this.groupService.create(GroupDto_);
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
        var current_date = await this.utilsService.getDateTimeString();
        var GroupDto_ = new GroupDto();
        GroupDto_.nameGroup = request.nameGroup;
        if (request.userbasics != undefined) {
            if (request.userbasics.length > 0) {
                var data = [];
                for (var i = 0; i < request.userbasics.length; i++) {
                    var data_userbasic = await this.userbasicsService.findid(request.userbasics[i]);
                    if (await this.utilsService.ceckData(data_userbasic)) {
                        data[i] = new Object(request.userbasics[i]);
                    };
                }
                GroupDto_.userbasics = data;
            }
        }
        GroupDto_.updateAt = current_date;
        if (request.desc != undefined) {
            GroupDto_.desc = request.desc;
        }
        await this.groupService.update(request._id,GroupDto_);
        return {
            "response_code": 202,
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
