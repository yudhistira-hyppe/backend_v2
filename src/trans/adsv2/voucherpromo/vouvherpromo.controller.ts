import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Headers, Get, Param, Query } from '@nestjs/common';
import { VoucherpromoService } from './voucherpromo.service';
import { UtilsService } from '../../../utils/utils.service';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { VoucherPromoDto } from './dto/voucherpromo.dto';
import { ErrorHandler } from '../../../utils/error.handler';

@Controller("api/adsv2/voucher/promo")
export class VouvherpromoController {
    constructor(
        private readonly voucherpromoService: VoucherpromoService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler) { }

    @UseGuards(JwtAuthGuard)
    @Post('/create')
    @HttpCode(HttpStatus.ACCEPTED)
    async create(@Body() VoucherPromoDto_: VoucherPromoDto, @Headers() headers): Promise<any> {
        var current_date = await this.utilsService.getDateTimeString();
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
        //VALIDASI PARAM nameVoucher
        var cecknameVoucher = await this.utilsService.validateParam("nameVoucher", VoucherPromoDto_.nameVoucher, "string")
        if (cecknameVoucher != "") {
            await this.errorHandler.generateBadRequestException(
                cecknameVoucher,
            );
        }
        //VALIDASI PARAM codeVoucher
        var ceckcodeVoucher = await this.utilsService.validateParam("codeVoucher", VoucherPromoDto_.codeVoucher, "string")
        if (ceckcodeVoucher != "") {
            await this.errorHandler.generateBadRequestException(
                ceckcodeVoucher,
            );
        } else {
            let dataCeck = await this.voucherpromoService.findByKode(VoucherPromoDto_);
            if (await this.utilsService.ceckData(dataCeck)) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed codeVoucher is avaliable, codeVoucher must be unique',
                );
            }
        }
        //VALIDASI PARAM cecktype
        // var cecktype = await this.utilsService.validateParam("type", VoucherPromoDto_.type, "string")
        // if (cecktype != "") {
        //     await this.errorHandler.generateBadRequestException(
        //         cecktype,
        //     );
        // }
        VoucherPromoDto_.createAt = current_date; 
        VoucherPromoDto_.updateAt = current_date;

        //VALIDASI PARAM value
        var ceckvalue = await this.utilsService.validateParam("value", VoucherPromoDto_.value, "number")
        if (ceckvalue != "") {
            await this.errorHandler.generateBadRequestException(
                ceckvalue,
            );
        }
        //VALIDASI PARAM quantity
        var ceckquantity = await this.utilsService.validateParam("quantity", VoucherPromoDto_.quantity, "number")
        if (ceckquantity != "") {
            await this.errorHandler.generateBadRequestException(
                ceckquantity,
            );
        }
        //VALIDASI PARAM dateStart
        var ceckdateStart = await this.utilsService.validateParam("dateStart", VoucherPromoDto_.dateStart, "string")
        if (ceckdateStart != "") {
            await this.errorHandler.generateBadRequestException(
                ceckdateStart,
            );
        }
        //VALIDASI PARAM dateEnd
        var ceckdateExpired = await this.utilsService.validateParam("dateEnd", VoucherPromoDto_.dateEnd, "string")
        if (ceckdateExpired != "") {
            await this.errorHandler.generateBadRequestException(
                ceckdateExpired,
            );
        }

        if (VoucherPromoDto_.status==undefined){
            VoucherPromoDto_.status = true;
        }

        try {
            let data = await this.voucherpromoService.create(VoucherPromoDto_);
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Create Voucher Promo succesfully", data
            );
        } catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/ceck')
    @HttpCode(HttpStatus.ACCEPTED)
    async ceckKode(@Body() VoucherPromoDto_: VoucherPromoDto, @Headers() headers): Promise<any> {
        var current_date = await this.utilsService.getDateTimeString();
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
        //VALIDASI PARAM codeVoucher
        var ceckcodeVoucher = await this.utilsService.validateParam("codeVoucher", VoucherPromoDto_.codeVoucher, "string")
        if (ceckcodeVoucher != "") {
            await this.errorHandler.generateBadRequestException(
                ceckcodeVoucher,
            );
        }

        let data = await this.voucherpromoService.findByKode(VoucherPromoDto_);
        if (await this.utilsService.ceckData(data)){
            var startDateVoucher = new Date(data.dateStart);
            var endDateVoucher = new Date(data.dateEnd);
            console.log("dateNow", new Date());
            console.log("startDateVoucher", startDateVoucher);
            console.log("endDateVoucher", endDateVoucher);
            if ((new Date() >= startDateVoucher) && (new Date() <= endDateVoucher)) {
                return await this.errorHandler.generateAcceptResponseCodeWithData(
                    "Create Voucher Promo succesfully", data
                );
            } else {
                await this.errorHandler.generateInternalServerErrorException(
                    'Unabled to proceed, Kode Voucher Expired ',
                );
            }
        } else {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, Kode Voucher Not Found ',
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    @HttpCode(HttpStatus.ACCEPTED)
    async getOne(@Param('id') id: string, @Headers() headers): Promise<any> {
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
        var ceck_id = await this.utilsService.validateParam("_id", id, "string")
        if (ceck_id != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_id,
            );
        }

        try {
            var data = await this.voucherpromoService.findOne(id);
            if (await this.utilsService.ceckData(data)) {
                return await this.errorHandler.generateAcceptResponseCodeWithData(
                    "Get Voucher Promo succesfully", data
                );
            } else {
                return await this.errorHandler.generateAcceptResponseCode(
                    "Get Voucher Promo not found",
                );
            }
        } catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/update')
    @HttpCode(HttpStatus.ACCEPTED)
    async update(@Body() VoucherPromoDto_: VoucherPromoDto, @Headers() headers) {
        var current_date = await this.utilsService.getDateTimeString();
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
        var ceck_id = await this.utilsService.validateParam("_id", VoucherPromoDto_._id, "string")
        if (ceck_id != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_id,
            );
        }
        //VALIDASI PARAM codeVoucher
        if (VoucherPromoDto_.codeVoucher != undefined) {
            var _VoucherPromoDto_ = new VoucherPromoDto();
            _VoucherPromoDto_.codeVoucher = VoucherPromoDto_.codeVoucher;
            let dataCeck = await this.voucherpromoService.findByKode(_VoucherPromoDto_);
            if (await this.utilsService.ceckData(dataCeck)) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed codeVoucher is avaliable, codeVoucher must be unique',
                );
            }
        } 

        VoucherPromoDto_.updateAt = current_date;

        try {
            var data = await this.voucherpromoService.update(VoucherPromoDto_._id.toString(), VoucherPromoDto_);
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Update Voucher Promo succesfully", data
            );
        } catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/delete')
    @HttpCode(HttpStatus.ACCEPTED)
    async delete(@Body() VoucherPromoDto_: VoucherPromoDto, @Headers() headers) {
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
        var ceck_id = await this.utilsService.validateParam("_id", VoucherPromoDto_._id, "string")
        if (ceck_id != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_id,
            );
        }

        VoucherPromoDto_.status = false;
        try {
            var data = await this.voucherpromoService.update(VoucherPromoDto_._id.toString(), VoucherPromoDto_);
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Delete Voucher Promo succesfully", data
            );
        } catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    @HttpCode(HttpStatus.ACCEPTED)
    async getAll(
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

        const pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
        const pageRow_ = (pageRow != undefined) ? pageRow : 8;
        const search_ = search;
        const data_all = await this.voucherpromoService.filAll();
        const data = await this.voucherpromoService.findCriteria(pageNumber_, pageRow_, search_);
        return await this.errorHandler.generateAcceptResponseCodeWithData(
            "Get Voucher Promo succesfully", data, data_all.length, pageNumber
        );
    }
}
