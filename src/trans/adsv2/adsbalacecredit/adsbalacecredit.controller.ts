import { Body, Controller, Post, UseGuards, Headers, HttpStatus, HttpCode, Get, Param, Query } from "@nestjs/common";
import { AdsBalaceCreditService } from "./adsbalacecredit.service";
import { JwtAuthGuard } from "../../../auth/jwt-auth.guard";
import { UtilsService } from "../../../utils/utils.service";
import { ErrorHandler } from "../../../utils/error.handler";
import { AdsBalaceCreditDto } from "./dto/adsbalacecredit.dto";

@Controller('api/adsv2/adsbalacecredit')
export class AdsPurposesController {
    constructor(
        private readonly adsBalaceCreditService: AdsBalaceCreditService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler) { }

    @UseGuards(JwtAuthGuard)
    @Post('api/adsv2/adsbalacecredit/create')
    @HttpCode(HttpStatus.ACCEPTED)
    async create(@Body() AdsBalaceCreditDto_: AdsBalaceCreditDto, @Headers() headers) {
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
        AdsBalaceCreditDto_.timestamp = currentDate;
        var data = await this.adsBalaceCreditService.create(AdsBalaceCreditDto_);
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Create Ads Balance succesfully"
                ]
            }
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/adsv2/adsbalacecredit/update')
    @HttpCode(HttpStatus.ACCEPTED)
    async update(@Body() AdsBalaceCreditDto_: AdsBalaceCreditDto, @Headers() headers) {
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
        if (AdsBalaceCreditDto_._id == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param _id is required',
            );
        }
        const currentDate = await this.utilsService.getDateTimeString();
        var data = await this.adsBalaceCreditService.update(AdsBalaceCreditDto_._id.toString(), AdsBalaceCreditDto_);
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Update Ads Balance succesfully"
                ]
            }
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/adsv2/adsbalacecredit/delete')
    @HttpCode(HttpStatus.ACCEPTED)
    async delete(@Body() AdsBalaceCreditDto_: AdsBalaceCreditDto, @Headers() headers) {
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
        if (AdsBalaceCreditDto_._id == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param _id is required',
            );
        }
        var data = await this.adsBalaceCreditService.delete(AdsBalaceCreditDto_._id.toString());
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Delete Ads Balance succesfully"
                ]
            }
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('api/adsv2/adsbalacecredit/:id')
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
        var data = await this.adsBalaceCreditService.findOne(id);
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Get Ads Balance succesfully"
                ]
            }
        }
        return Response;
    }
}