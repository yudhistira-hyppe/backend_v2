import { Body, Controller, Post, UseGuards, Headers, HttpStatus, HttpCode, Get, Param, Query, Req } from "@nestjs/common";
import { AdsObjectivitasService } from "./adsobjectivitas.service";
import { JwtAuthGuard } from "../../../auth/jwt-auth.guard";
import { UtilsService } from "../../../utils/utils.service";
import { ErrorHandler } from "../../../utils/error.handler";
import { AdsObjectivitasDto } from "./dto/adsobjectivitas.dto";
import { LogapisService } from "src/trans/logapis/logapis.service";

@Controller('api/adsv2/objectivitas')
export class AdsObjectivitasController {
    constructor(
        private readonly adsObjectivitasService: AdsObjectivitasService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler,
        private readonly logapiSS: LogapisService) { }
        
    @UseGuards(JwtAuthGuard)
    @Post('/create')
    @HttpCode(HttpStatus.ACCEPTED)
    async create(@Body() AdsObjectivitasDto_: AdsObjectivitasDto, @Headers() headers) {
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
        //VALIDASI PARAM name_id
        var ceckname_id = await this.utilsService.validateParam("name_id", AdsObjectivitasDto_.name_id, "string")
        if (ceckname_id != "") {
            await this.errorHandler.generateNotAcceptableException(
                ceckname_id,
            );
        }
        //VALIDASI PARAM name_en
        var ceckname_en = await this.utilsService.validateParam("name_en", AdsObjectivitasDto_.name_en, "string")
        if (ceckname_en != "") {
            await this.errorHandler.generateNotAcceptableException(
                ceckname_en,
            );
        }

        try {
            const currentDate = await this.utilsService.getDateTimeString();
            AdsObjectivitasDto_.createdAt = currentDate;
            AdsObjectivitasDto_.updatedAt = currentDate;
            var data = await this.adsObjectivitasService.create(AdsObjectivitasDto_);
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Create Ads Objectivitas succesfully", data
            );
        } catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/update')
    @HttpCode(HttpStatus.ACCEPTED)
    async update(@Body() AdsObjectivitasDto_: AdsObjectivitasDto, @Headers() headers) {
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
        //VALIDASI PARAM _id
        var ceck_id = await this.utilsService.validateParam("_id", AdsObjectivitasDto_._id, "string")
        if (ceck_id != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_id,
            );
        }
        //VALIDASI PARAM name_id
        var ceckname_id = await this.utilsService.validateParam("name_id", AdsObjectivitasDto_.name_id, "string")
        if (ceckname_id != "") {
            await this.errorHandler.generateNotAcceptableException(
                ceckname_id,
            );
        }
        //VALIDASI PARAM name_en
        var ceckname_en = await this.utilsService.validateParam("name_en", AdsObjectivitasDto_.name_en, "string")
        if (ceckname_en != "") {
            await this.errorHandler.generateNotAcceptableException(
                ceckname_en,
            );
        }

        try {
            const currentDate = await this.utilsService.getDateTimeString();
            AdsObjectivitasDto_.updatedAt = currentDate;
            var data = await this.adsObjectivitasService.update(AdsObjectivitasDto_._id.toString(), AdsObjectivitasDto_);
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Update Ads Objectivitas succesfully", data
            );
        } catch (e) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    @HttpCode(HttpStatus.ACCEPTED)
    async getOne(@Param('id') id: string, @Headers() headers, @Req() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }
        //VALIDASI PARAM _id
        var ceck_id = await this.utilsService.validateParam("_id", id, "string")
        if (ceck_id != "") {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateBadRequestException(
                ceck_id,
            );
        }

        try {
            var data = await this.adsObjectivitasService.findOne(id);
            if (await this.utilsService.ceckData(data)) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

                return await this.errorHandler.generateAcceptResponseCodeWithData(
                    "Get Ads Objectivitas succesfully", data
                );
            }else{
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

                return await this.errorHandler.generateAcceptResponseCode(
                    "Get Ads Objectivitas not found",
                );
            }
        } catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/delete')
    @HttpCode(HttpStatus.ACCEPTED)
    async delete(@Body() AdsObjectivitasDto_: AdsObjectivitasDto, @Headers() headers) {
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
        //VALIDASI PARAM _id
        var ceck_id = await this.utilsService.validateParam("_id", AdsObjectivitasDto_._id, "string")
        if (ceck_id != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_id,
            );
        }

        try {
            var data = await this.adsObjectivitasService.delete(AdsObjectivitasDto_._id.toString());
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Delete Ads Objectivitas succesfully", data
            );
        } catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    @HttpCode(HttpStatus.ACCEPTED)
    async getAll(
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Query('search') search: string, @Headers() headers, @Req() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);
            
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }
        var profile = await this.utilsService.generateProfile(headers['x-auth-user'], "FULL");
        if (!(await this.utilsService.ceckData(profile))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);
            
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
        const pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
        const pageRow_ = (pageRow != undefined) ? pageRow : 8;
        const search_ = search;
        const langIso = (profile.langIso != undefined) ? profile.langIso : "id";
        const data_all = await this.adsObjectivitasService.filAll();
        const data = await this.adsObjectivitasService.findCriteria(pageNumber_, pageRow_, search_, langIso.toString());

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

        return await this.errorHandler.generateAcceptResponseCodeWithData(
            "Ads Objectivitas retrieved succesfully", data, data_all.length, pageNumber
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('/version/2')
    @HttpCode(HttpStatus.ACCEPTED)
    async getAll2(
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Query('search') search: string, @Headers() headers, @Req() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);
            
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }
        var profile = await this.utilsService.generateProfile2(headers['x-auth-user'], "FULL");
        if (!(await this.utilsService.ceckData(profile))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);
            
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
        const pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
        const pageRow_ = (pageRow != undefined) ? pageRow : 8;
        const search_ = search;
        const langIso = (profile.langIso != undefined) ? profile.langIso : "id";
        const data_all = await this.adsObjectivitasService.filAll();
        const data = await this.adsObjectivitasService.findCriteria(pageNumber_, pageRow_, search_, langIso.toString());

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

        return await this.errorHandler.generateAcceptResponseCodeWithData(
            "Ads Objectivitas retrieved succesfully", data, data_all.length, pageNumber
        );
    }
}