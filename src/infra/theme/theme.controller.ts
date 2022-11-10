import { Body, Controller, Post, UseGuards, Headers, Param, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ThemeDto } from './dto/theme.dto';
import { ThemeService } from './theme.service';

@Controller()
export class ThemeController {
    constructor(
        private readonly themeService: ThemeService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler) {}

    @UseGuards(JwtAuthGuard)
    @Post('api/theme/create')
    async create(@Body() ThemeDto_: ThemeDto, @Headers() headers) {
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
        if (ThemeDto_.name==undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param name is required',
            );
        }
        const currentDate = await this.utilsService.getDateTimeString();
        ThemeDto_.createdAt = currentDate;
        ThemeDto_.updatedAt = currentDate;
        var data = await this.themeService.create(ThemeDto_);
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Create theme succesfully"
                ]
            }
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/theme/update')
    @HttpCode(HttpStatus.ACCEPTED)
    async update(@Body() ThemeDto_: ThemeDto, @Headers() headers) {
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
        if (ThemeDto_._id == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param _id is required',
            );
        }
        if (ThemeDto_.name == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param name is required',
            );
        }
        const currentDate = await this.utilsService.getDateTimeString();
        ThemeDto_.updatedAt = currentDate;
        var data = await this.themeService.update(ThemeDto_._id.toString(), ThemeDto_);
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Update theme succesfully"
                ]
            }
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/theme/delete')
    @HttpCode(HttpStatus.ACCEPTED)
    async delete(@Body() ThemeDto_: ThemeDto, @Headers() headers) {
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
        if (ThemeDto_._id == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param _id is required',
            );
        }
        var data = await this.themeService.delete(ThemeDto_._id.toString());
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Delete theme succesfully"
                ]
            }
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('api/theme/:id')
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
                'Unabled to proceed param name is required',
            );
        }
        var data = await this.themeService.findOne(id);
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Get theme succesfully"
                ]
            }
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('api/theme/')
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
        var profile = await this.utilsService.generateProfile(headers['x-auth-user'], "FULL");
        if (!(await this.utilsService.ceckData(profile))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
        const pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
        const pageRow_ = (pageRow != undefined) ? pageRow : 8;
        const search_ = search;
        const langIso = (profile.langIso != undefined) ? profile.langIso:"id";
        const data_all = await this.themeService.filAll();
        const data = await this.themeService.findCriteria(pageNumber_, pageRow_, search_, langIso.toString());
        var Response = {
            response_code: 202,
            total: data_all.length.toString(),
            data: data,
            messages: {
                info: [
                    "Theme retrieved succesfully"
                ]
            },
            page: pageNumber
        }
        return Response;
    }
}
