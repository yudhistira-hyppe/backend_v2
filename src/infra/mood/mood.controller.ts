import { Body, Controller, Post, UseGuards, Headers, Param, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { MoodDto } from './dto/mood.dto';
import { MoodService } from './mood.service';

@Controller()
export class MoodController {
    constructor(
        private readonly moodService: MoodService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler) {}

    @UseGuards(JwtAuthGuard)
    @Post('api/mood/create')
    async create(@Body() MoodDto_: MoodDto, @Headers() headers) {
        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        } 
        if (MoodDto_.name==undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param name is required',
            );
        }
        const currentDate = await this.utilsService.getDateTimeString();
        MoodDto_.createdAt = currentDate;
        MoodDto_.updatedAt = currentDate;
        var data = await this.moodService.create(MoodDto_);
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Create mood succesfully"
                ]
            }
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/mood/update')
    @HttpCode(HttpStatus.ACCEPTED)
    async update(@Body() MoodDto_: MoodDto, @Headers() headers) {
        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }
        if (MoodDto_._id == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param _id is required',
            );
        }
        if (MoodDto_.name == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param name is required',
            );
        }
        const currentDate = await this.utilsService.getDateTimeString();
        MoodDto_.updatedAt = currentDate;
        var data = await this.moodService.update(MoodDto_._id.toString(), MoodDto_);
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Update mood succesfully"
                ]
            }
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/mood/delete')
    @HttpCode(HttpStatus.ACCEPTED)
    async delete(@Body() MoodDto_: MoodDto, @Headers() headers) {
        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }
        if (MoodDto_._id == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param _id is required',
            );
        }
        var data = await this.moodService.delete(MoodDto_._id.toString());
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Delete mood succesfully"
                ]
            }
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('api/mood/:id')
    async getOne(@Param('id') id: string, @Headers() headers) {
        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }
        if (id == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param id is required',
            );
        }
        var profile = await this.utilsService.generateProfile(headers['x-auth-user'], "FULL");
        if (!(await this.utilsService.ceckData(profile))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
        const langIso = (profile.langIso != undefined) ? profile.langIso : "id";
        var data = await this.moodService.findOne(id);
        if (langIso == 'id') {
            data.name = data.name_id;
            data.langIso = 'id';
        }
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Get mood succesfully"
                ]
            }
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('api/mood/')
    @HttpCode(HttpStatus.ACCEPTED)
    async getMusicPost(
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Query('search') search: string, @Headers() headers) {
        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }
        var profile = await this.utilsService.generateProfile(headers['x-auth-user'],"FULL");
        if (!(await this.utilsService.ceckData(profile))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
        const pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
        const pageRow_ = (pageRow != undefined) ? pageRow : 8;
        const search_ = search;
        const langIso = (profile.langIso != undefined) ? profile.langIso : "id";
        const data_all = await this.moodService.filAll();
        const data = await this.moodService.findCriteria(pageNumber_, pageRow_, search_, langIso.toString());

        await Promise.all(data.map(async (item, index) => {
            if (langIso == 'id') {
                data[index].name = item.name_id; 
                data[index].langIso = 'id';
            } 
        }));
        
        var Response = {
            response_code: 202,
            total: data_all.length.toString(),
            data: data,
            messages: {
                info: [
                    "Mood retrieved succesfully"
                ]
            },
            page: pageNumber
        }
        return Response;
    }
}
