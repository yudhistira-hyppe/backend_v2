import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Query, Post, UseGuards, Param } from '@nestjs/common';
import { DivisionService } from './division.service';
import { DivisionDto } from './dto/division.dto';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { Division } from './schemas/division.schema'; 
import { UtilsService } from '../../../utils/utils.service';
import { ErrorHandler } from '../../../utils/error.handler';

@Controller('/api/division')
export class DivisionController {

    constructor(
        private readonly divisionService: DivisionService,
        private readonly utilsService: UtilsService, 
        private readonly errorHandler: ErrorHandler,
        ) { }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/create')
    async create(@Body() request) {
        if (request.nameDivision == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create division param nameDivision is required',
            );
        }
        var current_date = await this.utilsService.getDateTimeString();
        var DivisionDto_ = new DivisionDto();
        DivisionDto_.nameDivision = request.nameDivision;
        DivisionDto_.createAt = current_date;
        DivisionDto_.updateAt = current_date;
        if (request.desc != undefined) {
            DivisionDto_.desc = request.desc;
        }
        await this.divisionService.create(DivisionDto_);
        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Create division successfully"
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
        var data = await this.divisionService.findAll(skip, limit);
        return {
            "response_code": 202,
            "data": data,
            "messages": {
                "info": [
                    "Get list division successfully"
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
                'Unabled to proceed Create division param _id is required',
            );
        }
        if (request.nameDivision == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create division param nameDivision is required',
            );
        }
        var current_date = await this.utilsService.getDateTimeString();
        var DivisionDto_ = new DivisionDto();
        DivisionDto_.nameDivision = request.nameDivision;
        DivisionDto_.updateAt = current_date;
        if (request.desc != undefined) {
            DivisionDto_.desc = request.desc;
        }
        await this.divisionService.update(request._id, DivisionDto_);
        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Update division successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Delete('/delete')
    async delete(
        @Query('id') id: string,) {
        var data = await this.divisionService.delete(id);
        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Delete division user successfully"
                ]
            },
        };
    }
}
