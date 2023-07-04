import { Body, Controller, Post, UseGuards, Headers, HttpStatus, HttpCode, Get, Param, Query } from "@nestjs/common";
import { AdsBalaceCreditService } from "./adsbalacecredit.service";
import { JwtAuthGuard } from "../../../auth/jwt-auth.guard";
import { UtilsService } from "../../../utils/utils.service";
import { ErrorHandler } from "../../../utils/error.handler";
import { AdsBalaceCreditDto } from "./dto/adsbalacecredit.dto";
import mongoose from "mongoose";
import { UserbasicsService } from "src/trans/userbasics/userbasics.service";

@Controller('api/adsv2/balance')
export class AdsPurposesController {
    constructor(
        private readonly adsBalaceCreditService: AdsBalaceCreditService,
        private readonly utilsService: UtilsService,
        private readonly userbasicsService: UserbasicsService, 
        private readonly errorHandler: ErrorHandler) { }

    @UseGuards(JwtAuthGuard)
    @Get('/saldo')
    async getSaldo(@Headers() headers) {
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

        //--------------------GET USERID--------------------
        const ubasic = await this.userbasicsService.findOne(headers['x-auth-user']);
        
        var dataBalance = await this.adsBalaceCreditService.findsaldoKredit(ubasic._id);
        if (await this.utilsService.ceckData(dataBalance)) {
            if (dataBalance.length > 0) {
                return await this.errorHandler.generateAcceptResponseCodeWithData(
                    "Get Ads Balance succesfully ", dataBalance
                );
            }else{
                return await this.errorHandler.generateAcceptResponseCode(
                    "Get Ads Balance succesfully ",
                );
            }
        } else {
            return await this.errorHandler.generateAcceptResponseCode(
                "Get Ads Balance succesfully ",
            );
        }
    }
}