import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Query, Post, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UtilsService } from '../../../utils/utils.service';
import { ErrorHandler } from '../../../utils/error.handler';
import { GroupModuleService } from './groupmodule.service';
import { GroupModuleDto } from './dto/groupmodule.dto';

@Controller('api/groupmodule')
export class GroupModuleController {
    constructor(
        private readonly groupModuleService: GroupModuleService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler
    ) { }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/create')
    async create(@Body() request) {
        const isFound = request.some(element => {
            if (element.id === 1) {
                return true;
            }
            return false;
        });
        console.log(request);
        console.log(isFound);
        // if (typeof request){

        // }
        // if (request.group == undefined) {
        //     await this.errorHandler.generateNotAcceptableException(
        //         'Unabled to proceed Create module param group is required',
        //     );
        // }
        // if (request.module == undefined) {
        //     await this.errorHandler.generateNotAcceptableException(
        //         'Unabled to proceed Create module param module is required',
        //     );
        // }
        // var current_date = await this.utilsService.getDateTimeString();
        // var GroupModuleDto_ = new GroupModuleDto();
        // GroupModuleDto_.group = request.group;
        // GroupModuleDto_.module = request.module;
        // if (request.createAcces != undefined) {
        //     GroupModuleDto_.createAcces = request.createAcces;
        // }
        // if (request.updateAcces != undefined) {
        //     GroupModuleDto_.updateAcces = request.updateAcces;
        // }
        // if (request.deleteAcces != undefined) {
        //     GroupModuleDto_.deleteAcces = request.deleteAcces;
        // }
        // if (request.viewAcces != undefined) {
        //     GroupModuleDto_.viewAcces = request.viewAcces;
        // }
        // GroupModuleDto_.createAt = current_date;
        // GroupModuleDto_.updateAt = current_date;
        // if (request.desc != undefined) {
        //     GroupModuleDto_.desc = request.desc;
        // }
        // await this.groupModuleService.create(GroupModuleDto_);
        // return {
        //     "response_code": 202,
        //     "messages": {
        //         "info": [
        //             "Create group module successfully"
        //         ]
        //     },
        // };
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
        if (request._id == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create module param _id is required',
            );
        }
        if (request.group == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create module param group is required',
            );
        }
        if (request.module == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create module param module is required',
            );
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
