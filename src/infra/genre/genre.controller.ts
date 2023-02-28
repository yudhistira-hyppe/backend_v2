import { Body, Controller, Post, UseGuards, Headers, Param, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GenreDto } from './dto/genre.dto';
import { GenreService } from './genre.service';

@Controller()
export class GenreController {
    constructor(
        private readonly genreService: GenreService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler) {}

    @UseGuards(JwtAuthGuard)
    @Post('api/genre/create')
    @HttpCode(HttpStatus.ACCEPTED)
    async create(@Body() GenreDto_: GenreDto, @Headers() headers) {
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
        if (GenreDto_.name==undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param name is required',
            );
        }
        const currentDate = await this.utilsService.getDateTimeString();
        GenreDto_.createdAt = currentDate;
        GenreDto_.updatedAt = currentDate;
        var data = await this.genreService.create(GenreDto_);
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Create genre succesfully"
                ]
            }
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/genre/update')
    @HttpCode(HttpStatus.ACCEPTED)
    async update(@Body() GenreDto_: GenreDto, @Headers() headers) {
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
        if (GenreDto_._id == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param _id is required',
            );
        }
        if (GenreDto_.name == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed name id is required',
            );
        }
        const currentDate = await this.utilsService.getDateTimeString();
        GenreDto_.updatedAt = currentDate;
        var data = await this.genreService.update(GenreDto_._id.toString(),GenreDto_);
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Update genre succesfully"
                ]
            }
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/genre/delete')
    @HttpCode(HttpStatus.ACCEPTED)
    async delete(@Body() GenreDto_: GenreDto, @Headers() headers) {
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
        if (GenreDto_._id == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param _id is required',
            );
        }
        var data = await this.genreService.delete(GenreDto_._id.toString());
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Delete genre succesfully"
                ]
            }
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('api/genre/:id')
    @HttpCode(HttpStatus.ACCEPTED)
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
        if (id==undefined) {
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
        var data = await this.genreService.findOne(id);
        if (langIso == 'id') {
            data.name = data.name_id;
            data.langIso = 'id';
        }
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Get genre succesfully"
                ]
            }
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('api/genre/')
    @HttpCode(HttpStatus.ACCEPTED)
    async getMusicPost(
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Query('search') search: string, @Headers() headers) {
        const pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
        const pageRow_ = (pageRow != undefined) ? pageRow : 8;
        const search_ = search;
        const data_all = await this.genreService.filAll();
        const data = await this.genreService.findCriteria(pageNumber_, pageRow_, search_);

        var profile = await this.utilsService.generateProfile(headers['x-auth-user'], "FULL");
        if (!(await this.utilsService.ceckData(profile))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
        const langIso = (profile.langIso != undefined) ? profile.langIso : "id";
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
                "Genre retrieved succesfully"
                ]
            },
            page: pageNumber
        }
        return Response;
    }
}