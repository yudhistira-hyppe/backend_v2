import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Query, Post, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UtilsService } from '../../../utils/utils.service';
import { ErrorHandler } from '../../../utils/error.handler';
import { ModuleService } from './module.service'; 
import { ModuleDto } from './dto/module.dto';

@Controller('api/module')
export class ModuleController {
    constructor(
        private readonly moduleService: ModuleService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler
    ) { }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/create')
    async create(@Body() request) {
        if (request.nameModule == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create module param nameModule is required',
            );
        }
        var current_date = await this.utilsService.getDateTimeString();
        var ModuleDto_ = new ModuleDto();
        ModuleDto_.nameModule = request.nameModule;
        ModuleDto_.createAt = current_date;
        ModuleDto_.updateAt = current_date;
        if (request.desc != undefined) {
            ModuleDto_.desc = request.desc;
        }
        await this.moduleService.create(ModuleDto_);
        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Create module successfully"
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
        var data = await this.moduleService.findAll(skip, limit);
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
        if (request.nameModule == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create module param nameModule is required',
            );
        }
        var current_date = await this.utilsService.getDateTimeString();
        var ModuleDto_ = new ModuleDto();
        ModuleDto_.nameModule = request.nameModule;
        ModuleDto_.updateAt = current_date;
        if (request.desc != undefined) {
            ModuleDto_.desc = request.desc;
        }
        await this.moduleService.update(request._id, ModuleDto_);
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
        var data = await this.moduleService.delete(id);
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
