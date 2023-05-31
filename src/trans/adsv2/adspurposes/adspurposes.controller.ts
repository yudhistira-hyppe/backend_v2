import { Body, Controller, Post, UseGuards, Headers, HttpStatus, HttpCode, Get, Param, Query } from "@nestjs/common";
import { AdsPurposesService } from "./adspurposes.service";
import { JwtAuthGuard } from "../../../auth/jwt-auth.guard";
import { UtilsService } from "../../../utils/utils.service";
import { ErrorHandler } from "../../../utils/error.handler";
import { AdsPurposesDto } from "./dto/adspurposes.dto";

@Controller('api/adsv2/adspurposes')
export class AdsPurposesController {
    constructor(
        private readonly adsPurposesService: AdsPurposesService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler) { }
        
    @UseGuards(JwtAuthGuard)
    @Post('api/adsv2/adspurposes/create')
    @HttpCode(HttpStatus.ACCEPTED)
    async create(@Body() AdsPurposesDto_: AdsPurposesDto, @Headers() headers) {
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
        const currentDate = await this.utilsService.getDateTimeString();
        AdsPurposesDto_.createdAt = currentDate;
        AdsPurposesDto_.updatedAt = currentDate;
        var data = await this.adsPurposesService.create(AdsPurposesDto_);
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Create Ads Purposes succesfully"
                ]
            }
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/adsv2/adspurposes/update')
    @HttpCode(HttpStatus.ACCEPTED)
    async update(@Body() AdsPurposesDto_: AdsPurposesDto, @Headers() headers) {
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
        if (AdsPurposesDto_._id == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param _id is required',
            );
        }
        const currentDate = await this.utilsService.getDateTimeString();
        AdsPurposesDto_.updatedAt = currentDate;
        var data = await this.adsPurposesService.update(AdsPurposesDto_._id.toString(), AdsPurposesDto_);
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Update Ads Purposes succesfully"
                ]
            }
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('api/adsv2/adspurposes/:id')
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
        var data = await this.adsPurposesService.findOne(id);
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Get Ads Purposes succesfully"
                ]
            }
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/adsv2/adspurposes/delete')
    @HttpCode(HttpStatus.ACCEPTED)
    async delete(@Body() AdsPurposesDto_: AdsPurposesDto, @Headers() headers) {
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
        if (AdsPurposesDto_._id == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param _id is required',
            );
        }
        var data = await this.adsPurposesService.delete(AdsPurposesDto_._id.toString());
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Delete Ads Purposes succesfully"
                ]
            }
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('api/adsv2/adspurposes/')
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
        const langIso = (profile.langIso != undefined) ? profile.langIso : "id";
        const data_all = await this.adsPurposesService.filAll();
        const data = await this.adsPurposesService.findCriteria(pageNumber_, pageRow_, search_, langIso.toString());

        var Response = {
            response_code: 202,
            total: data_all.length.toString(),
            data: data,
            messages: {
                info: [
                    "Ads Purposes retrieved succesfully"
                ]
            },
            page: pageNumber
        }
        return Response;
    }
}