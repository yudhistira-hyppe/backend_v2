import { Body, Controller, HttpCode, Headers, Get, Param, HttpStatus, Post, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AdsDto } from './dto/ads.dto';
import { UtilsService } from '../../../utils/utils.service';
import { ErrorHandler } from '../../../utils/error.handler';
import { AdsService } from './ads.service';
import mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UserbasicsService } from 'src/trans/userbasics/userbasics.service';
import { AdsTypeService } from '../adstype/adstype.service';
import { AdsBalaceCreditDto } from '../adsbalacecredit/dto/adsbalacecredit.dto';
import { AdsType } from '../adstype/schemas/adstype.schema';
import { AdssettingService } from '../adssetting/adssetting.service';
import { Mutex, MutexInterface } from 'async-mutex';
import { UserAdsService } from '../../userads/userads.service'
import { CreateUserAdsDto } from 'src/trans/userads/dto/create-userads.dto';
import e from 'express';

@Controller('api/adsv2/ads/')
export class AdsController {
    private readonly logger = new Logger(AdsController.name);
    private locks: Map<string, MutexInterface>;

    constructor(
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler,
        private readonly userbasicsService: UserbasicsService,
        private readonly adssettingService: AdssettingService, 
        private readonly adsTypeService: AdsTypeService,
        private readonly configService: ConfigService, 
        private readonly userAdsService: UserAdsService,
        private readonly adsService: AdsService) {
        this.locks = new Map();
    }

    @UseGuards(JwtAuthGuard)
    @Post('/create')
    @HttpCode(HttpStatus.ACCEPTED)
    async create(@Body() AdsDto_: AdsDto, @Headers() headers) {
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

        var _id_setting_AdsDurationMin = this.configService.get("ID_SETTING_ADS_DURATION_MIN");
        var _id_setting_AdsDurationMax = this.configService.get("ID_SETTING_ADS_DURATION_MAX");
        var _id_setting_AdsPlanMin = this.configService.get("ID_SETTING_ADS_PLAN_MIN");
        var _id_setting_AdsPlanMax = this.configService.get("ID_SETTING_ADS_PLAN_MAX");

        //VALIDASI PARAM userId
        const ubasic = await this.userbasicsService.findOne(headers['x-auth-user']);
        if (!(await this.utilsService.ceckData(ubasic))) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, user not found',
            );
        } else {
            AdsDto_.userID = new mongoose.Types.ObjectId(ubasic._id.toString());
        }

        //VALIDASI PARAM adsObjectivitasId
        var ceck_adsObjectivitasId = await this.utilsService.validateParam("adsObjectivitasId", AdsDto_.adsObjectivitasId, "string")
        if (ceck_adsObjectivitasId != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_adsObjectivitasId,
            );
        }else{
            AdsDto_.adsObjectivitasId = new mongoose.Types.ObjectId(AdsDto_.adsObjectivitasId.toString());
        }

        //VALIDASI PARAM typeAdsID
        var ceck_typeAdsID = await this.utilsService.validateParam("typeAdsID", AdsDto_.typeAdsID, "string")
        if (ceck_typeAdsID != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_typeAdsID,
            );
        } 

        //VALIDASI PARAM typeAdsID
        var getAdsType: AdsType;
        if (AdsDto_.typeAdsID.toString() == this.configService.get("ID_ADS_IN_CONTENT")) {
            var _id_InContentAds = this.configService.get("ID_ADS_IN_CONTENT");
            getAdsType = await this.adsTypeService.findOne(_id_InContentAds);
        } else if (AdsDto_.typeAdsID.toString() == this.configService.get("ID_ADS_IN_BETWEEN")) {
            var _id_InBetweenAds = this.configService.get("ID_ADS_IN_CONTENT");
            getAdsType = await this.adsTypeService.findOne(_id_InBetweenAds);
        } else if (AdsDto_.typeAdsID.toString() == this.configService.get("ID_ADS_IN_POPUP")) {
            var _id_PopUpAds = this.configService.get("ID_ADS_IN_CONTENT");
            getAdsType = await this.adsTypeService.findOne(_id_PopUpAds);
        } else {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, param typeAdsID not found',
            );
        }
        AdsDto_.typeAdsID = new mongoose.Types.ObjectId(AdsDto_.typeAdsID.toString());

        //VALIDASI PARAM name
        var ceck_name = await this.utilsService.validateParam("name", AdsDto_.name, "string")
        if (ceck_name != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_name,
            );
        }else{
            if (AdsDto_.name.length > Number(getAdsType.titleMax)) {
                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed, name max length ' + getAdsType.titleMax.toString(),
                );
           } 
        }

        //VALIDASI PARAM dayAds
        if (AdsDto_.dayAds == undefined) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed param timeAds is required',
            );
        }else{
            if (
                AdsDto_.dayAds.sunday == undefined || 
                AdsDto_.dayAds.monday == undefined ||
                AdsDto_.dayAds.tuesday == undefined ||
                AdsDto_.dayAds.wednesday == undefined ||
                AdsDto_.dayAds.thursday == undefined ||
                AdsDto_.dayAds.friday == undefined ||
                AdsDto_.dayAds.saturday == undefined
            ) {
                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed, param typeAdsID is required',
                );
            }
        }

        //VALIDASI PARAM timeAds
        if (AdsDto_.timeAds == undefined) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed param timeAds is required',
            );
        } else {
            if (
                AdsDto_.timeAds.time_4_8 == undefined ||
                AdsDto_.timeAds.time_8_12 == undefined ||
                AdsDto_.timeAds.time_12_16 == undefined ||
                AdsDto_.timeAds.time_16_20 == undefined ||
                AdsDto_.timeAds.time_20_24 == undefined ||
                AdsDto_.timeAds.time_24_4 == undefined 
            ) {
                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed param timeAds is required',
                );
            }
        }

        //VALIDASI PARAM skipTime
        var ceck_skipTime = await this.utilsService.validateParam("skipTime", AdsDto_.skipTime, "number")
        if (ceck_skipTime != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_skipTime,
            );
        }else{
            if (!((Number(getAdsType.skipMax) >= Number(AdsDto_.skipTime)) && (Number(AdsDto_.skipTime) >= Number(getAdsType.skipMin)))) {
                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed, skipTime required ' + getAdsType.skipMax.toString() + ' > skipTime >' + getAdsType.skipMin.toString(),
                );
            }
        }

        //VALIDASI PARAM placingID
        var ceck_placingID = await this.utilsService.validateParam("placingID", AdsDto_.placingID, "string")
        if (ceck_placingID != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_placingID,
            );
        }else{
            AdsDto_.placingID = new mongoose.Types.ObjectId(AdsDto_.placingID.toString());
        }

        //VALIDASI PARAM liveAt
        var ceck_liveAt = await this.utilsService.validateParam("liveAt", AdsDto_.liveAt, "string")
        if (ceck_liveAt != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_liveAt,
            );
        }

        //VALIDASI PARAM liveEnd
        var ceck_liveEnd = await this.utilsService.validateParam("liveEnd", AdsDto_.liveEnd, "string")
        if (ceck_liveEnd != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_liveEnd,
            );
        }

        const liveAt_ = new Date(AdsDto_.liveAt);
        const liveEnd_ = new Date(AdsDto_.liveEnd);
        const oneDay = 1000 * 60 * 60 * 24;
        const diff = liveEnd_.getTime() - liveAt_.getTime(); 
        const dayCount = Math.round(diff / oneDay);

        //VALIDASI PARAM Duration Day 
        var getSetting_AdsDurationMin = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsDurationMin));
        var getSetting_AdsDurationMax = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsDurationMax));
        var getSetting_AdsPlanMin = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsPlanMin));
        var getSetting_AdsPlanMax = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsPlanMax));
    
        if (!((Number(getSetting_AdsDurationMax.value) >= Number(dayCount)) && (Number(dayCount) >= Number(getSetting_AdsDurationMin.value)))){
            return await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, duration day tayang required ' + getSetting_AdsDurationMax.value.toString() + ' > Day Duration : ' + Number(dayCount) + ' > ' + getSetting_AdsDurationMin.value.toString(),
            );
        }

        //VALIDASI PARAM tayang
        var ceck_tayang = await this.utilsService.validateParam("tayang", AdsDto_.tayang, "number")
        if (ceck_tayang != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_tayang,
            );
        } else {
            if (!((Number(getSetting_AdsPlanMax.value) >= Number(AdsDto_.tayang)) && (Number(AdsDto_.tayang) >= Number(getSetting_AdsPlanMin.value)))) {
                return await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed, plan tayang required ' + getSetting_AdsPlanMax.value.toString() + ' > tayang > ' + getSetting_AdsPlanMin.value.toString(),
                );
            } 
        }

        //VALIDASI PARAM credit
        var ceck_credit = await this.utilsService.validateParam("credit", AdsDto_.credit, "number")
        if (ceck_credit != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_credit,
            );
        }else{
            const minPembelianCredit = (getAdsType.CPV * AdsDto_.tayang) + (getAdsType.CPA * AdsDto_.tayang);
            if (minPembelianCredit != AdsDto_.credit) {
                AdsDto_.status = "DRAFT";
            }else{
                if (AdsDto_.status == undefined) {
                    AdsDto_.status = "UNDER_REVIEW";
                }
            }
        }

        //VALIDASI PARAM demografisID
        var Array_Demografis = [];
        if (AdsDto_.demografisID == undefined) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed param demografisID is required',
            );
        }else{
            for (var i = 0; i < AdsDto_.demografisID.length; i++) {
                let demografisID_Object = AdsDto_.demografisID[i];
                let demografisID_Object_Dbref = { "$ref": "areas", "$id": new mongoose.Types.ObjectId(demografisID_Object), "$db": "ProdAll" }
                Array_Demografis.push(demografisID_Object_Dbref);
            }
            AdsDto_.demografisID = Array_Demografis;
        }

        //VALIDASI PARAM interestID
        var Array_Interest = [];
        if (AdsDto_.interestID == undefined) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed param interestID is required',
            );
        } else {
            for (var i = 0; i < AdsDto_.interestID.length; i++) {
                let interestID_Object = AdsDto_.interestID[i];
                let interestID_Object_Dbref = { "$ref": "interests_repo", "$id": new mongoose.Types.ObjectId(interestID_Object), "$db": "ProdAll" }
                Array_Interest.push(interestID_Object_Dbref);
            }
            AdsDto_.interestID = Array_Interest;
        } 

        //VALIDASI PARAM audiensFrekuensi
        var ceck_audiensFrekuensi = await this.utilsService.validateParam("audiensFrekuensi", AdsDto_.audiensFrekuensi, "number")
        if (ceck_audiensFrekuensi != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_audiensFrekuensi,
            );
        }else{
            if (AdsDto_.audiensFrekuensi > 1) {
                AdsDto_.liveTypeAds = true;
            } else {
                AdsDto_.liveTypeAds = false;
            }
        }

        //VALIDASI PARAM gender
        if (AdsDto_.gender == undefined) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed param gender is required',
            );
        } else {
            if (AdsDto_.gender.length == 0) {
                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed param gender is required',
                ); 
            }
        }

        //VALIDASI PARAM age
        if (AdsDto_.age == undefined) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed param timeAds is required',
            );
        } else {
            if (
                AdsDto_.age.age_smaller_than_14 == undefined ||
                AdsDto_.age.age_14_smaller_than_28 == undefined ||
                AdsDto_.age.age_29_smaller_than_43 == undefined ||
                AdsDto_.age.age_greater_than_44 == undefined ||
                AdsDto_.age.age_other == undefined
            ) {
                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed param age is required',
                );
            }
        } 

        //VALIDASI PARAM ctaButton
        var ceck_ctaButton = await this.utilsService.validateParam("ctaButton", AdsDto_.ctaButton, "number")
        if (ceck_ctaButton != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_ctaButton,
            );
        }

        //VALIDASI PARAM idApsara
        var ceck_idApsara = await this.utilsService.validateParam("idApsara", AdsDto_.idApsara, "string")
        if (ceck_idApsara != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_idApsara,
            );
        }

        //VALIDASI PARAM urlLink
        var ceck_urlLink = await this.utilsService.validateParam("urlLink", AdsDto_.urlLink, "string")
        if (ceck_urlLink != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_urlLink,
            );
        } 

        //--------------------GENERATE CAMPAIG ID--------------------
        const coutAds = await this.adsService.count();
        const generateCampaignID = await this.utilsService.generateCampaignID(coutAds+1, AdsDto_.typeAdsID.toString());
        AdsDto_.campaignId = generateCampaignID;

        try {
            const currentDate = await this.utilsService.getDateTimeISOString();
            AdsDto_.createdAt = currentDate;
            AdsDto_.updatedAt = currentDate;
            AdsDto_.timestamp = currentDate;
            AdsDto_.totalCredit = AdsDto_.credit;
            AdsDto_.totalUsedCredit = AdsDto_.credit;
            AdsDto_.objectifitas = "Lalu Lintas";
            AdsDto_.creditFree = 0;
            AdsDto_.creditValue = 0; 
            AdsDto_.usedCredit = 0; 
            AdsDto_.startAge = 0; 
            AdsDto_.usedCreditFree = 0;
            AdsDto_.endAge = 0;
            AdsDto_.totalView = 0; 
            AdsDto_.isActive = false;
            console.log(AdsDto_);
            let data = await this.adsService.create(AdsDto_);
            if (AdsDto_.status == "UNDER_REVIEW"){
                //--------------------INSERT BALANCE DEBET--------------------
                const AdsBalaceCreditDto_ = new AdsBalaceCreditDto();
                AdsBalaceCreditDto_._id = new mongoose.Types.ObjectId;
                AdsBalaceCreditDto_.iduser = AdsDto_.userID;
                AdsBalaceCreditDto_.debet = AdsDto_.credit; 
                AdsBalaceCreditDto_.kredit = 0;
                AdsBalaceCreditDto_.type = "USE";
                AdsBalaceCreditDto_.timestamp = await this.utilsService.getDateTimeString();
                AdsBalaceCreditDto_.description = "USE ADS CREATE";
                AdsBalaceCreditDto_.idtrans = data._id;  
                await this.adsService.insertBalaceDebit(AdsBalaceCreditDto_); 
            }

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Create Ads Type succesfully with status " + AdsDto_.status, data
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
    async update(@Body() AdsDto_: AdsDto, @Headers() headers) {
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
        var ceck_id = await this.utilsService.validateParam("_id", AdsDto_._id, "string")
        if (ceck_id != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_id,
            );
        }
        //VALIDASI PARAM status
        var ceck_status = await this.utilsService.validateParam("status", AdsDto_.status, "string")
        if (ceck_status != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_status,
            );
        }
        //--------------------GET ADS--------------------
        const ads = await this.adsService.findOne(AdsDto_._id.toString());
        if (!(await this.utilsService.ceckData(ads))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ads not found',
            );
        }

        if (AdsDto_.status == "UNDER_REVIEW" || AdsDto_.status == "IN_ACTIVE"){
            const AdsBalaceCreditDto_ = new AdsBalaceCreditDto();
            AdsBalaceCreditDto_._id = new mongoose.Types.ObjectId;
            AdsBalaceCreditDto_.iduser = AdsDto_.userID;
            AdsBalaceCreditDto_.timestamp = await this.utilsService.getDateTimeString();
            AdsBalaceCreditDto_.idtrans = ads._id;
            if (ads.status != "ACTIVE") {
                if ((ads.status == "DRAFT") && (AdsDto_.status == "UNDER_REVIEW")) {
                    //--------------------INSERT BALANCE DEBET--------------------
                    AdsBalaceCreditDto_.iduser = ads.userID;
                    AdsBalaceCreditDto_.debet = AdsDto_.credit;
                    AdsBalaceCreditDto_.kredit = 0;
                    AdsBalaceCreditDto_.type = "USE";
                    AdsBalaceCreditDto_.description = "ADS CREATION";
                }
                if ((ads.status == "UNDER_REVIEW") && (AdsDto_.status == "IN_ACTIVE")) {
                    //--------------------INSERT BALANCE KREDIT--------------------
                    AdsBalaceCreditDto_.iduser = ads.userID;
                    AdsBalaceCreditDto_.debet = 0;
                    AdsBalaceCreditDto_.kredit = ads.credit;
                    AdsBalaceCreditDto_.type = "REFUND";
                    AdsBalaceCreditDto_.description = "ADS REJECTED";
                }
                await this.adsService.insertBalaceDebit(AdsBalaceCreditDto_);
            }
        } else {
            //VALIDASI PARAM userId
            const ubasic = await this.userbasicsService.findOne(headers['x-auth-user']);
            if (!(await this.utilsService.ceckData(ubasic))) {
                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed, user not found',
                );
            } else {
                AdsDto_.userIDAssesment = new mongoose.Types.ObjectId(ubasic._id.toString());
            }
            AdsDto_.isActive = true;
        }

        try {
            var data = await this.adsService.update(AdsDto_._id.toString(), AdsDto_);
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Update Ads Type succesfully", data
            );
        } catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
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
            var data = await this.adsService.findOne(id);
            var AdsDto_ = new AdsDto();
            AdsDto_._id = data._id; 
            AdsDto_.name = data.name;
            AdsDto_.typeAdsID = new mongoose.Types.ObjectId(data.typeAdsID.toString());
            AdsDto_.dayAds = data.dayAds;
            AdsDto_.timeAds = data.timeAds;
            AdsDto_.skipTime = data.skipTime;
            AdsDto_.liveAt = data.liveAt;
            AdsDto_.liveEnd = data.liveEnd;
            AdsDto_.liveEnd = data.liveEnd; 
            AdsDto_.tayang = data.tayang;
            AdsDto_.credit = data.credit;
            AdsDto_.placingID = new mongoose.Types.ObjectId(data.placingID.toString());
            AdsDto_.demografisID = await Promise.all(data.demografisID.map(async (item, index) => {
                console.log(JSON.parse(JSON.stringify(item)).$id)
                return JSON.parse(JSON.stringify(item)).$id;
            }));
            AdsDto_.interestID = await Promise.all(data.interestID.map(async (item, index) => {
                console.log(JSON.parse(JSON.stringify(item)).$id)
                return JSON.parse(JSON.stringify(item)).$id;
            }));
            AdsDto_.audiensFrekuensi = data.audiensFrekuensi;
            AdsDto_.gender = data.gender;
            AdsDto_.age = data.age;
            AdsDto_.type = data.type;
            AdsDto_.urlLink = data.urlLink;
            AdsDto_.ctaButton = data.ctaButton;
            AdsDto_.description = data.description;
            AdsDto_.duration = data.duration;
            AdsDto_.idApsara = data.idApsara;
            AdsDto_.sizeFile = data.sizeFile;

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads succesfully", AdsDto_
            );
        } catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/dashboard')
    @HttpCode(HttpStatus.ACCEPTED)
    async dashboard(@Body() body: any,@Headers() headers) {
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

        //----------------START DATE----------------
        var start_date = null;
        if (body.start_date != undefined) {
            start_date = new Date(body.start_date);
        }

        //----------------END DATE----------------
        var end_date = null;
        if (body.end_date != undefined) {
            end_date = new Date(body.end_date);
        }

        const ads_dashboard = await this.adsService.dashboard(start_date, end_date);
        return ads_dashboard;
    }

    @UseGuards(JwtAuthGuard)
    @Post('/campaign/dashboard')
    @HttpCode(HttpStatus.ACCEPTED)
    async campaignDashboard(@Body() body: any, @Headers() headers) {
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

        //----------------START DATE----------------
        var start_date = null;
        if (body.start_date != undefined) {
            start_date = new Date(body.start_date);
        }

        //----------------END DATE----------------
        var end_date = null;
        if (body.end_date != undefined) {
            end_date = new Date(body.end_date);
        }

        try {
            let ads_campaign_dashboard = await this.adsService.campaignDashboard(start_date, end_date);
            if (await this.utilsService.ceckData(ads_campaign_dashboard)){
                if (ads_campaign_dashboard.length>0){
                    ads_campaign_dashboard = ads_campaign_dashboard[0];
                }
            }
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads Campaign Dashboard succesfully", ads_campaign_dashboard,
            );
        }
        catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/campaign/detail/all')
    @HttpCode(HttpStatus.ACCEPTED)
    async campaignDetailAll(@Body() body: any, @Headers() headers) {
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

        //VALIDASI PARAM adsId
        if (body.adsId == undefined) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, param adsId is required',
            );
        }

        const dataAds = await this.adsService.findOne(body.adsId);
        if (!(await this.utilsService.ceckData(dataAds))) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, ads not found',
            );
        } 

        //----------------START DATE----------------
        var start_date = null;
        if (body.start_date != undefined) {
            start_date = new Date(body.start_date);
        }

        //----------------END DATE----------------
        var end_date = null;
        if (body.end_date != undefined) {
            end_date = new Date(body.end_date);
        }

        try {
            let ads_campaign_detail = await this.adsService.campaignDetailAll(body.adsId.toString(), start_date, end_date);
            if (await this.utilsService.ceckData(ads_campaign_detail)) {
                if (ads_campaign_detail.length > 0) {
                    ads_campaign_detail = ads_campaign_detail[0];
                }
            }
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads Campaign Detail succesfully", ads_campaign_detail,
            );
        }
        catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/campaign/detail/')
    @HttpCode(HttpStatus.ACCEPTED)
    async campaignDetail1(@Body() body: any, @Headers() headers) {
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

        //VALIDASI PARAM adsId
        if (body.adsId == undefined) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, param adsId is required',
            );
        }

        const dataAds = await this.adsService.findOne(body.adsId);
        if (!(await this.utilsService.ceckData(dataAds))) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed, ads not found',
            );
        }

        try {
            let ads_campaign_detail = await this.adsService.campaignDetail(body.adsId.toString());
            if (await this.utilsService.ceckData(ads_campaign_detail)) {
                if (ads_campaign_detail.length > 0) {
                    ads_campaign_detail = ads_campaign_detail[0];
                }
            }
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads Campaign Detail succesfully", ads_campaign_detail,
            );
        }
        catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    // @UseGuards(JwtAuthGuard)
    // @Post('/campaign/detail/summary/')
    // @HttpCode(HttpStatus.ACCEPTED)
    // async campaignDetail2(@Body() body: any, @Headers() headers) {
    //     if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unauthorized',
    //         );
    //     }
    //     if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed email header dan token not match',
    //         );
    //     }

    //     //VALIDASI PARAM adsId
    //     if (body.adsId == undefined) {
    //         await this.errorHandler.generateBadRequestException(
    //             'Unabled to proceed, param adsId is required',
    //         );
    //     }

    //     const dataAds = await this.adsService.findOne(body.adsId);
    //     if (!(await this.utilsService.ceckData(dataAds))) {
    //         await this.errorHandler.generateBadRequestException(
    //             'Unabled to proceed, ads not found',
    //         );
    //     }

    //     //----------------START DATE----------------
    //     var start_date = null;
    //     if (body.start_date != undefined) {
    //         start_date = new Date(body.start_date);
    //     }

    //     //----------------END DATE----------------
    //     var end_date = null;
    //     if (body.end_date != undefined) {
    //         end_date = new Date(body.end_date);
    //     }

    //     try {
    //         let ads_campaign_detail = await this.adsService.campaignDetailSummary(body.adsId.toString(), start_date, end_date);
    //         if (await this.utilsService.ceckData(ads_campaign_detail)) {
    //             if (ads_campaign_detail.length > 0) {
    //                 ads_campaign_detail = ads_campaign_detail[0];
    //             }
    //         }
    //         return await this.errorHandler.generateAcceptResponseCodeWithData(
    //             "Get Ads Campaign Detail succesfully", ads_campaign_detail,
    //         );
    //     }
    //     catch (e) {
    //         await this.errorHandler.generateInternalServerErrorException(
    //             'Unabled to proceed, ERROR ' + e,
    //         );
    //     }
    // }

    @UseGuards(JwtAuthGuard)
    @Post('/list')
    @HttpCode(HttpStatus.ACCEPTED)
    async adsList(@Body() body: any, @Headers() headers) {
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

        var array_type_ads = []
        if (body.type_ads != undefined) {
            if (body.type_ads.length > 0) {
                for (var i = 0; i < body.type_ads.length; i++) {
                    let type_ads_ = body.type_ads[i];
                    let type_ads_Object_Id = new mongoose.Types.ObjectId(type_ads_);
                    array_type_ads.push(type_ads_Object_Id);
                }
            }
        }
        body.type_ads = array_type_ads;

        try {
            const ads_dashboard = await this.adsService.list(body.name_ads, body.start_date, body.end_date, body.type_ads, body.plan_ads, body.status_list, body.page, body.limit, body.sorting);

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads List succesfully", ads_dashboard, ads_dashboard.length, body.page
            );
        }
        catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/list/reward')
    @HttpCode(HttpStatus.ACCEPTED)
    async adsListReward(@Body() body: any, @Headers() headers) {
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

        var array_type_ads = []
        if (body.type_ads != undefined) {
            if (body.type_ads.length > 0) {
                for (var i = 0; i < body.type_ads.length; i++) {
                    let type_ads_ = body.type_ads[i];
                    let type_ads_Object_Id = new mongoose.Types.ObjectId(type_ads_);
                    array_type_ads.push(type_ads_Object_Id);
                }
            }
        }
        body.type_ads = array_type_ads;

        try {
            const ads_dashboard = await this.adsService.list_reward(body.name, body.startdate, body.enddate, body.gender, body.age, body.areas, body.page, body.limit, body.sorting); 

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get Ads List succesfully", ads_dashboard, ads_dashboard.length, body.page
            );
        }
        catch (e) {
            await this.errorHandler.generateInternalServerErrorException(
                'Unabled to proceed, ERROR ' + e,
            );
        }
    }

    // @UseGuards(JwtAuthGuard)
    // @Post('/viewads/')
    // @HttpCode(HttpStatus.ACCEPTED)
    // async viewads(@Headers() headers, @Body() body): Promise<any> {
    //     this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> START headers : " + JSON.stringify(headers));
    //     this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> START body : " + JSON.stringify(body));
    //     if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unauthorized',
    //         );
    //     }
    //     if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed email header dan token not match',
    //         );
    //     }

    //     //----------------VALIDASI watchingTime----------------
    //     if (body.watchingTime == undefined) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed param watchingTime is reqired',
    //         );
    //     } else {
    //         if (typeof body.watchingTime != 'number') {
    //             await this.errorHandler.generateNotAcceptableException(
    //                 'Unabled to proceed param watchingTime invalid format ' + typeof body.watchingTime,
    //             );
    //         }
    //     }
    //     //----------------VALIDASI adsId----------------
    //     if (body.adsId == undefined) {
    //         this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed param adsId is reqired");
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed param adsId is reqired',
    //         );
    //     }
    //     //----------------VALIDASI useradsId----------------
    //     if (body.useradsId == undefined) {
    //         this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed param useradsId is reqired");
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed param useradsId is reqired',
    //         );
    //     }

    //     var current_date = await this.utilsService.getDateTimeString();

    //     //----------------SET MUTEX----------------
    //     if (!this.locks.has(user_email)) {
    //         this.locks.set(user_email, new Mutex());
    //     }

    //     return this.locks.get(user_email).acquire().then(async (release) => {
    //         try {
    //             //----------------VALIDASI userbasics----------------
    //             const data_userbasicsService = await this.userbasicsService.findOne(user_email);
    //             if (!(await this.utilsService.ceckData(data_userbasicsService))) {
    //                 this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed User not found");
    //                 await this.errorHandler.generateNotAcceptableException(
    //                     'Unabled to proceed User not found',
    //                 );
    //             }

    //             //----------------VALIDASI adsId----------------
    //             const data_adsService = await this.adsService.findOneActive(body.adsId.toString());
    //             if (!(await this.utilsService.ceckData(data_adsService))) {
    //                 this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Ads not found");
    //                 await this.errorHandler.generateNotAcceptableException(
    //                     'Unabled to proceed Ads not found',
    //                 );
    //             }

    //             //----------------VALIDASI typeAdsID----------------
    //             const data_adstypesService = await this.adsTypeService.findOne(data_adsService.typeAdsID.toString());
    //             if (!(await this.utilsService.ceckData(data_adstypesService))) {
    //                 this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Ads types not found");
    //                 await this.errorHandler.generateNotAcceptableException(
    //                     'Unabled to proceed Ads types not found',
    //                 );
    //             }

    //             //----------------VALIDASI typeAdsID skipMin----------------
    //             if (data_adstypesService.skipMin == undefined) {
    //                 this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Ads skipMin not found");
    //                 await this.errorHandler.generateNotAcceptableException(
    //                     'Unabled to proceed data setting Ads skipMin not found',
    //                 );
    //             }

    //             //----------------VALIDASI typeAdsID skipMax----------------
    //             if (data_adstypesService.skipMax == undefined) {
    //                 this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Ads skipMax not found");
    //                 await this.errorHandler.generateNotAcceptableException(
    //                     'Unabled to proceed data setting Ads skipMax not found',
    //                 );
    //             }

    //             //----------------VALIDASI typeAdsID CPA----------------
    //             if (data_adstypesService.CPA == undefined) {
    //                 this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Ads CPA not found");
    //                 await this.errorHandler.generateNotAcceptableException(
    //                     'Unabled to proceed data setting Ads CPA not found',
    //                 );
    //             }

    //             //----------------VALIDASI typeAdsID CPV----------------
    //             if (data_adstypesService.CPV == undefined) {
    //                 this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Ads CPV not found");
    //                 await this.errorHandler.generateNotAcceptableException(
    //                     'Unabled to proceed data setting Ads CPV not found',
    //                 );
    //             }

    //             //----------------VALIDASI typeAdsID rewards----------------
    //             if (data_adstypesService.rewards == undefined) {
    //                 this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Ads rewards not found");
    //                 await this.errorHandler.generateNotAcceptableException(
    //                     'Unabled to proceed data setting Ads rewards not found',
    //                 );
    //             }

    //             //----------------VALIDASI userAds----------------
    //             const data_userAdsService = await this.userAdsService.getAdsUser(userads_id.toString());
    //             if (!(await this.utilsService.ceckData(data_userAdsService))) {
    //                 this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed User Ads not found");
    //                 await this.errorHandler.generateNotAcceptableException(
    //                     'Unabled to proceed User Ads not found',
    //                 );
    //             }

    //             // var credit_view = data_adstypesService.creditValue;
    //             // var AdsSkip = data_adstypesService.AdsSkip;
    //             // var ads_rewards = data_adstypesService.rewards;

    //             // var userAds_liveTypeuserads = (data_userAdsService.liveTypeuserads != undefined) ? data_userAdsService.liveTypeuserads : false;
    //             // var userAds_statusView = (data_userAdsService.statusView != undefined) ? data_userAdsService.statusView : false;
    //             // var userAds_statusClick = (data_userAdsService.statusClick != undefined) ? data_userAdsService.statusClick : false;
    //             // var userAds_timeViewSecond = (data_userAdsService.timeViewSecond != undefined) ? data_userAdsService.timeViewSecond : null;
    //             // var userAds_viewed = (data_userAdsService.viewed != undefined) ? data_userAdsService.viewed : 0;

    //             // var userID = (data_userAdsService.userID != undefined) ? data_userAdsService.userID.toString() : null;
    //             // var adsID = (data_userAdsService.adsID != undefined) ? data_userAdsService.adsID.toString() : null;

    //             // var ads_tayang = data_adsService.tayang;
    //             // var ads_totalView = 0;
    //             // if (data_adsService.totalView != undefined) {
    //             //     ads_totalView = data_adsService.totalView;
    //             // }

    //             // var credit = data_adsService.creditValue;
    //             // var credit_free = data_adsService.creditFree;
    //             // var used_credit = data_adsService.usedCredit;
    //             // var used_credit_free = data_adsService.usedCreditFree;

    //             // if ((ads_totalView + 1) <= ads_tayang) {
    //             //     const sisa_credit = credit - (used_credit + credit_view);
    //             //     const sisa_credit_free = credit_free - (used_credit_free + credit_view);
    //             //     let sisa_credit_view = 0;
    //             //     if (sisa_credit == 0) {
    //             //         used_credit = used_credit + credit_view;
    //             //     } else if (sisa_credit > 0) {
    //             //         if (watching_time > AdsSkip) {
    //             //             this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PROCCES, AdsSkip : " + AdsSkip.toString());
    //             //             this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PROCCES, watching_time : " + watching_time.toString());
    //             //             this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PROCCES, rewards : " + rewards.toString());
    //             //             if (userAds_liveTypeuserads) {
    //             //                 if ((userID != null) && (adsID != null)) {
    //             //                     const ceck_rewars = await this.userAdsService.findUserAdsRewars(userID, adsID, AdsSkip);
    //             //                     if (await this.utilsService.ceckData(ceck_rewars)) {
    //             //                         rewards = false;
    //             //                     } else {
    //             //                         rewards = true;
    //             //                     }
    //             //                 }
    //             //             } else {
    //             //                 if ((userID != null) && (adsID != null)) {
    //             //                     const ceck_rewars = await this.userAdsService.findUserAdsRewars(userID, adsID, AdsSkip);
    //             //                     if (await this.utilsService.ceckData(ceck_rewars)) {
    //             //                         rewards = false;
    //             //                     } else {
    //             //                         rewards = true;
    //             //                     }
    //             //                 }
    //             //                 //rewards = true;
    //             //             }
    //             //         }
    //             //         if (sisa_credit < credit_view) {
    //             //             sisa_credit_view = credit_view - sisa_credit;
    //             //             used_credit = used_credit + sisa_credit;
    //             //             used_credit_free = used_credit_free + sisa_credit_view;
    //             //         } else {
    //             //             used_credit = used_credit + credit_view;
    //             //         }
    //             //     } else {
    //             //         if (sisa_credit_free >= credit_view) {
    //             //             used_credit_free = used_credit_free + credit_view;
    //             //         }
    //             //     }

    //             //     //Update userads
    //             //     try {
    //             //         var CreateUserAdsDto_ = new CreateUserAdsDto();
    //             //         CreateUserAdsDto_.statusView = true;
    //             //         CreateUserAdsDto_.clickAt = current_date;
    //             //         if (userAds_liveTypeuserads) {
    //             //             var viewedAds = Number(userAds_viewed) + 1;
    //             //             CreateUserAdsDto_.viewed = viewedAds;
    //             //             CreateUserAdsDto_.viewedUnder = 0;
    //             //         } else {
    //             //             CreateUserAdsDto_.viewed = 1;
    //             //             CreateUserAdsDto_.viewedUnder = 0;
    //             //         }
    //             //         CreateUserAdsDto_.timeViewSecond = watching_time;
    //             //         await this.userAdsService.updatesdataUserId_(data_userAdsService._id.toString(), CreateUserAdsDto_);
    //             //         this.userAdsService.updateUpdateAt(data_userAdsService._id.toString(), current_date);
    //             //     } catch (e) {
    //             //         this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed " + e);
    //             //         await this.errorHandler.generateNotAcceptableException(
    //             //             'Unabled to proceed, ' + e,
    //             //         );
    //             //     }

    //             //     if (watching_time > 0 && watching_time > AdsSkip) {
    //             //         //Update ads
    //             //         try {
    //             //             var CreateAdsDto_ = new CreateAdsDto();
    //             //             CreateAdsDto_.usedCredit = used_credit;
    //             //             CreateAdsDto_.usedCreditFree = used_credit_free;
    //             //             CreateAdsDto_.totalView = ads_totalView + 1;
    //             //             if ((ads_totalView + 1) == ads_tayang) {
    //             //                 CreateAdsDto_.isActive = false;
    //             //                 CreateAdsDto_.status = 'FINISH';
    //             //             }
    //             //             await this.adsService.update(data_adsService._id.toString(), CreateAdsDto_);
    //             //         } catch (e) {
    //             //             this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed " + e);
    //             //             await this.errorHandler.generateNotAcceptableException(
    //             //                 'Unabled to proceed, ' + e,
    //             //             );
    //             //         }
    //             //     }

    //             //     if ((ads_totalView + 1) == ads_tayang) {
    //             //         var CreateUserAdsDto_ = new CreateUserAdsDto();
    //             //         CreateUserAdsDto_.isActive = false;
    //             //         await this.userAdsService.updatesAlladsNotActive(data_userAdsService.adsID.toString(), CreateUserAdsDto_);
    //             //     }

    //             //     if (rewards) {
    //             //         var currentDate = await this.utilsService.getDateTime();
    //             //         //Update accountbalace
    //             //         try {
    //             //             var CreateAccountbalancesDto_ = new CreateAccountbalancesDto();
    //             //             CreateAccountbalancesDto_.iduser = data_userbasicsService._id;
    //             //             CreateAccountbalancesDto_.debet = 0;
    //             //             CreateAccountbalancesDto_.kredit = ads_rewards;
    //             //             CreateAccountbalancesDto_.type = "rewards";
    //             //             CreateAccountbalancesDto_.timestamp = currentDate.toISOString();
    //             //             CreateAccountbalancesDto_.description = "rewards form ads view";
    //             //             CreateAccountbalancesDto_.idtrans = new mongoose.Types.ObjectId(data_userAdsService.adsID.toString());
    //             //             await this.accountbalancesService.create(CreateAccountbalancesDto_);
    //             //         } catch (e) {
    //             //             this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed " + e);
    //             //             console.log('Unabled to proceed, ' + e);
    //             //         }

    //             //         try {
    //             //             var eventType = "TRANSACTION";
    //             //             var event = "ADS VIEW";
    //             //             await this.utilsService.sendFcmV2(data_userbasicsService.email.toString(), data_userbasicsService.email.toString(), eventType, event, "REWARDS", null, null, null, ads_rewards.toString());
    //             //         } catch (e) {
    //             //             this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed " + e);
    //             //             console.log('Unabled to proceed, ' + e);
    //             //         }
    //             //     }
    //             // }
    //             // this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, successfully " + rewards.toString());

    //             // return {
    //             //     response_code: 202,
    //             //     data: {
    //             //         rewards: rewards,
    //             //     },
    //             //     messages: {
    //             //         info: ['successfully'],
    //             //     },
    //             // };
    //             release();
    //         } catch (error) {
    //             release();
    //             throw error;
    //         } finally {
    //             release();
    //         }
    //     });

    //     if (await this.utilsService.validasiTokenEmail(headers)) {
    //         var user_email = null;
    //         var watching_time = null;
    //         var ads_id = null;
    //         var userads_id = null;
    //         var current_date = await this.utilsService.getDateTimeString();

    //         if (body.watchingTime == undefined) {
    //             this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed param watchingTime is reqired");
    //             await this.errorHandler.generateNotAcceptableException(
    //                 'Unabled to proceed param watchingTime is reqired',
    //             );
    //         }
    //         if (typeof body.watchingTime != 'number') {
    //             this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed param watchingTime invalid format " + typeof body.watchingTime);
    //             await this.errorHandler.generateNotAcceptableException(
    //                 'Unabled to proceed param watchingTime invalid format ' + typeof body.watchingTime,
    //             );
    //         }
    //         if (body.adsId == undefined) {
    //             this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed param adsId is reqired");
    //             await this.errorHandler.generateNotAcceptableException(
    //                 'Unabled to proceed param adsId is reqired',
    //             );
    //         }
    //         if (body.useradsId == undefined) {
    //             this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed param useradsId is reqired");
    //             await this.errorHandler.generateNotAcceptableException(
    //                 'Unabled to proceed param useradsId is reqired',
    //             );
    //         }

    //         user_email = headers['x-auth-user'];
    //         watching_time = body.watchingTime;
    //         ads_id = body.adsId;
    //         userads_id = body.useradsId;
    //         var rewards = false;

    //         if (!this.locks.has(user_email)) {
    //             this.locks.set(user_email, new Mutex());
    //         }

            
    //     } else {
    //         this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed token and email not match");
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed token and email not match',
    //         );
    //     }
    // }

    // @UseGuards(JwtAuthGuard)
    // @Post('/clickads/')
    // @HttpCode(HttpStatus.ACCEPTED)
    // async clickads(@Headers() headers, @Body() body): Promise<any> {
    //     this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> START headers : " + JSON.stringify(headers));
    //     this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> START body : " + JSON.stringify(body));
    //     if (await this.utilsService.validasiTokenEmail(headers)) {
    //         var user_email = null;
    //         var watching_time = null;
    //         var ads_id = null;
    //         var userads_id = null;
    //         var current_date = await this.utilsService.getDateTimeString();

    //         if (body.watchingTime == undefined) {
    //             this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed param watchingTime is reqired");
    //             await this.errorHandler.generateNotAcceptableException(
    //                 'Unabled to proceed param watchingTime is reqired',
    //             );
    //         }
    //         if (typeof body.watchingTime != 'number') {
    //             this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed param watchingTime invalid format " + typeof body.watchingTime);
    //             await this.errorHandler.generateNotAcceptableException(
    //                 'Unabled to proceed param watchingTime invalid format ' + typeof body.watchingTime,
    //             );
    //         }
    //         if (body.adsId == undefined) {
    //             this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed param adsId is reqired");
    //             await this.errorHandler.generateNotAcceptableException(
    //                 'Unabled to proceed param adsId is reqired',
    //             );
    //         }
    //         if (body.useradsId == undefined) {
    //             this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed param useradsId is reqired");
    //             await this.errorHandler.generateNotAcceptableException(
    //                 'Unabled to proceed param useradsId is reqired',
    //             );
    //         }

    //         user_email = headers['x-auth-user'];
    //         watching_time = body.watchingTime;
    //         ads_id = body.adsId;
    //         userads_id = body.useradsId;
    //         var rewards = false;

    //         if (!this.locks.has(user_email)) {
    //             this.locks.set(user_email, new Mutex());
    //         }
    //         return this.locks.get(user_email).acquire().then(async (release) => {
    //             try {
    //                 const data_userbasicsService = await this.userbasicsService.findOne(user_email);
    //                 if (!(await this.utilsService.ceckData(data_userbasicsService))) {
    //                     this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed User not found");
    //                     await this.errorHandler.generateNotAcceptableException(
    //                         'Unabled to proceed User not found',
    //                     );
    //                 }

    //                 const data_adsService = await this.adsService.findOneActive(ads_id.toString());
    //                 if (!(await this.utilsService.ceckData(data_adsService))) {
    //                     this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Ads not found");
    //                     await this.errorHandler.generateNotAcceptableException(
    //                         'Unabled to proceed Ads not found',
    //                     );
    //                 }

    //                 const data_adstypesService = await this.adstypesService.findOne(data_adsService.typeAdsID.toString());
    //                 if (!(await this.utilsService.ceckData(data_adstypesService))) {
    //                     this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Ads types not found");
    //                     await this.errorHandler.generateNotAcceptableException(
    //                         'Unabled to proceed Ads types not found',
    //                     );
    //                 }

    //                 if (data_adstypesService.AdsSkip == undefined) {
    //                     this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Ads Skip not found");
    //                     await this.errorHandler.generateNotAcceptableException(
    //                         'Unabled to proceed data setting Ads Skip not found',
    //                     );
    //                 }

    //                 if (data_adstypesService.creditValue == undefined) {
    //                     this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Ads Credit not found");
    //                     await this.errorHandler.generateNotAcceptableException(
    //                         'Unabled to proceed data setting Ads Credit not found',
    //                     );
    //                 }

    //                 const data_userAdsService = await this.userAdsService.getAdsUser(userads_id.toString());
    //                 if (!(await this.utilsService.ceckData(data_userAdsService))) {
    //                     this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed User Ads not found");
    //                     await this.errorHandler.generateNotAcceptableException(
    //                         'Unabled to proceed User Ads not found',
    //                     );
    //                 }

    //                 var credit_view = data_adstypesService.creditValue;
    //                 var AdsSkip = data_adstypesService.AdsSkip;
    //                 var ads_rewards = data_adstypesService.rewards;

    //                 var userAds_liveTypeuserads = (data_userAdsService.liveTypeuserads != undefined) ? data_userAdsService.liveTypeuserads : false;
    //                 var userAds_statusView = (data_userAdsService.statusView != undefined) ? data_userAdsService.statusView : false;
    //                 var userAds_statusClick = (data_userAdsService.statusClick != undefined) ? data_userAdsService.statusClick : false;
    //                 var userAds_timeViewSecond = (data_userAdsService.timeViewSecond != undefined) ? data_userAdsService.timeViewSecond : null;
    //                 var userAds_viewed = (data_userAdsService.viewed != undefined) ? data_userAdsService.viewed : 0;

    //                 var userID = (data_userAdsService.userID != undefined) ? data_userAdsService.userID.toString() : null;
    //                 var adsID = (data_userAdsService.adsID != undefined) ? data_userAdsService.adsID.toString() : null;

    //                 var ads_tayang = data_adsService.tayang;
    //                 var ads_totalView = 0;
    //                 if (data_adsService.totalView != undefined) {
    //                     ads_totalView = data_adsService.totalView;
    //                 }

    //                 var credit = data_adsService.creditValue;
    //                 var credit_free = data_adsService.creditFree;
    //                 var used_credit = data_adsService.usedCredit;
    //                 var used_credit_free = data_adsService.usedCreditFree;

    //                 if ((ads_totalView + 1) <= ads_tayang) {
    //                     const sisa_credit = credit - (used_credit + credit_view);
    //                     const sisa_credit_free = credit_free - (used_credit_free + credit_view);
    //                     let sisa_credit_view = 0;
    //                     if (sisa_credit == 0) {
    //                         used_credit = used_credit + credit_view;
    //                     } else if (sisa_credit > 0) {
    //                         if (watching_time > AdsSkip) {
    //                             this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PROCCES, AdsSkip : " + AdsSkip.toString());
    //                             this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PROCCES, watching_time : " + watching_time.toString());
    //                             this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PROCCES, rewards : " + rewards.toString());
    //                             if (userAds_liveTypeuserads) {
    //                                 if ((userID != null) && (adsID != null)) {
    //                                     const ceck_rewars = await this.userAdsService.findUserAdsRewars(userID, adsID, AdsSkip);
    //                                     if (await this.utilsService.ceckData(ceck_rewars)) {
    //                                         rewards = false;
    //                                     } else {
    //                                         rewards = true;
    //                                     }
    //                                 }
    //                             } else {
    //                                 if ((userID != null) && (adsID != null)) {
    //                                     const ceck_rewars = await this.userAdsService.findUserAdsRewars(userID, adsID, AdsSkip);
    //                                     if (await this.utilsService.ceckData(ceck_rewars)) {
    //                                         rewards = false;
    //                                     } else {
    //                                         rewards = true;
    //                                     }
    //                                 }
    //                                 //rewards = true;
    //                             }
    //                         }
    //                         if (sisa_credit < credit_view) {
    //                             sisa_credit_view = credit_view - sisa_credit;
    //                             used_credit = used_credit + sisa_credit;
    //                             used_credit_free = used_credit_free + sisa_credit_view;
    //                         } else {
    //                             used_credit = used_credit + credit_view;
    //                         }
    //                     } else {
    //                         if (sisa_credit_free >= credit_view) {
    //                             used_credit_free = used_credit_free + credit_view;
    //                         }
    //                     }

    //                     //Update userads
    //                     try {
    //                         var CreateUserAdsDto_ = new CreateUserAdsDto();
    //                         CreateUserAdsDto_.statusView = true;
    //                         CreateUserAdsDto_.statusClick = true;
    //                         CreateUserAdsDto_.clickAt = current_date;
    //                         if (userAds_liveTypeuserads) {
    //                             CreateUserAdsDto_.viewed = userAds_viewed + 1;
    //                             CreateUserAdsDto_.viewedUnder = 0;
    //                         } else {
    //                             CreateUserAdsDto_.viewed = 1;
    //                             CreateUserAdsDto_.viewedUnder = 0;
    //                         }
    //                         CreateUserAdsDto_.timeViewSecond = watching_time;
    //                         await this.userAdsService.updatesdataUserId_(data_userAdsService._id.toString(), CreateUserAdsDto_);
    //                         this.userAdsService.updateUpdateAt(data_userAdsService._id.toString(), current_date);
    //                         this.userAdsService.updateClickTime(data_userAdsService._id.toString(), current_date);
    //                     } catch (e) {
    //                         await this.errorHandler.generateNotAcceptableException(
    //                             'Unabled to proceed, ' + e,
    //                         );
    //                     }

    //                     //Update ads
    //                     try {
    //                         var CreateAdsDto_ = new CreateAdsDto();
    //                         CreateAdsDto_.usedCredit = used_credit;
    //                         CreateAdsDto_.usedCreditFree = used_credit_free;
    //                         CreateAdsDto_.totalView = ads_totalView + 1;
    //                         if ((ads_totalView + 1) == ads_tayang) {
    //                             CreateAdsDto_.isActive = false;
    //                             CreateAdsDto_.status = 'FINISH';
    //                         }
    //                         await this.adsService.update(data_adsService._id.toString(), CreateAdsDto_);
    //                     } catch (e) {
    //                         await this.errorHandler.generateNotAcceptableException(
    //                             'Unabled to proceed, ' + e,
    //                         );
    //                     }

    //                     if (ads_totalView == ads_tayang) {
    //                         var CreateUserAdsDto_ = new CreateUserAdsDto();
    //                         CreateUserAdsDto_.isActive = false;
    //                         await this.userAdsService.updatesAlladsNotActive(data_userAdsService.adsID.toString(), CreateUserAdsDto_);
    //                     }

    //                     if (rewards) {
    //                         //Update accountbalace
    //                         var currentDate = await this.utilsService.getDateTime();
    //                         try {
    //                             var CreateAccountbalancesDto_ = new CreateAccountbalancesDto();
    //                             CreateAccountbalancesDto_.iduser = data_userbasicsService._id;
    //                             CreateAccountbalancesDto_.debet = 0;
    //                             CreateAccountbalancesDto_.kredit = ads_rewards;
    //                             CreateAccountbalancesDto_.type = "rewards";
    //                             CreateAccountbalancesDto_.timestamp = currentDate.toISOString();
    //                             CreateAccountbalancesDto_.description = "rewards form ads click";
    //                             CreateAccountbalancesDto_.idtrans = new mongoose.Types.ObjectId(data_userAdsService.adsID.toString());
    //                             await this.accountbalancesService.create(CreateAccountbalancesDto_);
    //                         } catch (e) {
    //                             console.log('Unabled to proceed, ' + e);
    //                         }


    //                         try {
    //                             // var titleinsukses = "Reward";
    //                             // var titleensukses = "Reward";
    //                             // var bodyinsukses = "Selamat kamu mendapatkan reward Rp." + ads_rewards;
    //                             // var bodyensukses = "Congratulation you've got a reward Rp." + ads_rewards;
    //                             var eventType = "TRANSACTION";
    //                             var event = "ADS CLICK";
    //                             await this.utilsService.sendFcmV2(data_userbasicsService.email.toString(), data_userbasicsService.email.toString(), eventType, event, "REWARDS", null, null, null, ads_rewards.toString())
    //                             //await this.utilsService.sendFcm(data_userbasicsService.email.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event);
    //                         } catch (e) {
    //                             console.log('Unabled to proceed, ' + e);
    //                         }
    //                     }

    //                     if (ads_tayang == (ads_totalView + 1)) {
    //                         //Update userads
    //                         try {
    //                             var CreateUserAdsDto_ = new CreateUserAdsDto();
    //                             CreateUserAdsDto_.statusView = false;
    //                             await this.userAdsService.updatesdataAdsID(data_adsService._id.toString(), CreateUserAdsDto_);

    //                         } catch (e) {
    //                             await this.errorHandler.generateNotAcceptableException(
    //                                 'Unabled to proceed, ' + e,
    //                             );
    //                         }

    //                         //Update ads
    //                         // try {
    //                         //     var CreateAdsDto_ = new CreateAdsDto();
    //                         //     CreateAdsDto_.usedCredit = used_credit;
    //                         //     CreateAdsDto_.usedCreditFree = used_credit_free;
    //                         //     CreateAdsDto_.totalView = ads_totalView - 1;
    //                         //     await this.adsService.update(data_adsService._id.toString(), CreateAdsDto_);
    //                         // } catch (e) {
    //                         //     await this.errorHandler.generateNotAcceptableException(
    //                         //         'Unabled to proceed, ' + e,
    //                         //     );
    //                         // }
    //                     }
    //                 }

    //                 return {
    //                     response_code: 202,
    //                     data: {
    //                         userAds_id: data_userAdsService._id.toString()
    //                     },
    //                     messages: {
    //                         info: ['successfully'],
    //                     },
    //                 };
    //             } catch (error) {
    //                 release();
    //                 throw error;
    //             } finally {
    //                 release();
    //             }
    //         });
    //     } else {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed token and email not match',
    //         );
    //     }
    // }
}