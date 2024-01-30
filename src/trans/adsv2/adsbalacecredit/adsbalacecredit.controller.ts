import { Body, Controller, Post, UseGuards, Headers, HttpStatus, HttpCode, Get, Param, Query, Req } from "@nestjs/common";
import { AdsBalaceCreditService } from "./adsbalacecredit.service";
import { JwtAuthGuard } from "../../../auth/jwt-auth.guard";
import { UtilsService } from "../../../utils/utils.service";
import { ErrorHandler } from "../../../utils/error.handler";
import { AdsBalaceCreditDto } from "./dto/adsbalacecredit.dto";
import mongoose from "mongoose";
import { UserbasicsService } from "../../../trans/userbasics/userbasics.service";
import { LogapisService } from "src/trans/logapis/logapis.service";
import { UserbasicnewService } from "src/trans/userbasicnew/userbasicnew.service";

@Controller('api/adsv2/balance')
export class AdsPurposesController {
    constructor(
        private readonly adsBalaceCreditService: AdsBalaceCreditService,
        private readonly utilsService: UtilsService,
        //private readonly userbasicsService: UserbasicsService, 
        private readonly basic2SS: UserbasicnewService,
        private readonly errorHandler: ErrorHandler,
        private readonly logapiSS: LogapisService) { }

    @UseGuards(JwtAuthGuard)
    @Get('/saldo')
    async getSaldo(@Headers() headers, @Req() request) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

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

        //--------------------GET USERID--------------------
        const ubasic = await this.basic2SS.findBymail(headers['x-auth-user']);
        
        var dataBalance = await this.adsBalaceCreditService.findsaldoKredit(ubasic._id);
        if (await this.utilsService.ceckData(dataBalance)) {
            if (dataBalance.length > 0) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

                return await this.errorHandler.generateAcceptResponseCodeWithData(
                    "Get Ads Balance succesfully ", dataBalance
                );
            }else{
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);
                const dataResponse = [{
                    saldoKredit: 0,
                    totalUseKredit: 0,
                    totalBuyKredit: 0
                }]
                return await this.errorHandler.generateAcceptResponseCodeWithData(
                    "Get Ads Balance succesfully ", dataResponse
                );
            }
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);
            const dataResponse = [{
                saldoKredit: 0,
                totalUseKredit: 0,
                totalBuyKredit: 0
            }]
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads Balance succesfully ", dataResponse
            );
        }
    }
}