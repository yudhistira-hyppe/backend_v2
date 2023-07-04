import { Body, Controller, Get, Post, UseGuards, Headers, HttpStatus, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { AdssettingService } from './adssetting.service';
import { UtilsService } from '../../../utils/utils.service';
import { ErrorHandler } from '../../../utils/error.handler';
import mongoose from 'mongoose';
import { AdsTypeService } from '../adstype/adstype.service';
import { AdsTypeDto } from '../adstype/dto/adstype.dto';
import { CreateTemplatesRepoDto } from 'src/infra/templates_repo/dto/create-templatesrepo.dto';
import { AdsNotificationService } from './adsnotification.service';
import { ConfigService } from '@nestjs/config';
import { AdsLogsDto } from '../adslog/dto/adslog.dto';
import { UserbasicsService } from 'src/trans/userbasics/userbasics.service';
import { AdslogsService } from '../adslog/adslog.service';

@Controller('api/adsv2/setting')
export class AdsSettingController {
    constructor(
        private readonly adssettingService: AdssettingService,
        private readonly utilsService: UtilsService, 
        private readonly adsNotificationService: AdsNotificationService,
        private readonly adsTypeService: AdsTypeService,
        private readonly userbasicsService: UserbasicsService, 
        private readonly adslogsService: AdslogsService,
        private readonly configService: ConfigService,
        private readonly errorHandler: ErrorHandler) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    @HttpCode(HttpStatus.ACCEPTED)
    async getAdsSetting(@Headers() headers): Promise<any> {
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

        var _id_InContentAds = this.configService.get("ID_ADS_IN_CONTENT");
        var _id_InBetweenAds = this.configService.get("ID_ADS_IN_BETWEEN");
        var _id_PopUpAds = this.configService.get("ID_ADS_IN_POPUP");

        var _id_setting_CreditPrice = this.configService.get("ID_SETTING_ADS_CREDIT_PRICE");
        var _id_setting_AdsDurationMin = this.configService.get("ID_SETTING_ADS_DURATION_MIN");
        var _id_setting_AdsDurationMax = this.configService.get("ID_SETTING_ADS_DURATION_MAX");
        var _id_setting_AdsPlanMin = this.configService.get("ID_SETTING_ADS_PLAN_MIN");
        var _id_setting_AdsPlanMax = this.configService.get("ID_SETTING_ADS_PLAN_MAX");
        var _id_setting_CTAButton = this.configService.get("ID_SETTING_ADS_CTA_BUTTON");

        try {
            //----------------Get Ads Data Setting----------------
            var getSetting_InContentAds = await this.adsTypeService.findOne(_id_InContentAds);
            var getSetting_InBetweenAds = await this.adsTypeService.findOne(_id_InBetweenAds);
            var getSetting_PopUpAds = await this.adsTypeService.findOne(_id_PopUpAds);
            var getSetting_CreditPrice = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_CreditPrice));
            var getSetting_AdsDurationMin = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsDurationMin));
            var getSetting_AdsDurationMax = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsDurationMax));
            var getSetting_AdsPlanMin = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsPlanMin));
            var getSetting_AdsPlanMax = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsPlanMax));
            var getSetting_CTAButton = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_CTAButton));
            var adsCTAButton = await Promise.all(((getSetting_CTAButton.value.toString()).split(',')).map(async (item, index) => {
                return {
                    CTAButtonIndex: index,
                    CTAButton: item
                };
            }));
            var getSetting_Notification = await this.adsNotificationService.getAdsNotification("NOTIFY_REWARDS", "NOTIFICATION");
            
            //----------------Get Log----------------
            var InContentAdsDurationMin = await this.adslogsService.getLog("InContentAdsDurationMin");
            var InContentAdsDurationMax = await this.adslogsService.getLog("InContentAdsDurationMax");
            var InContentAdsSkipTimeMin = await this.adslogsService.getLog("InContentAdsSkipTimeMin");
            var InContentAdsSkipTimeMax = await this.adslogsService.getLog("InContentAdsSkipTimeMax");
            var InContentCPAPrice = await this.adslogsService.getLog("InContentCPAPrice");
            var InContentCPVPrice = await this.adslogsService.getLog("InContentCPVPrice");
            var EconomySharingInContent = await this.adslogsService.getLog("EconomySharingInContent");
            var InBetweenAdsDurationMin = await this.adslogsService.getLog("InBetweenAdsDurationMin");
            var InBetweenAdsDurationMax = await this.adslogsService.getLog("InBetweenAdsDurationMax");
            var InBetweenAdsSkipTimeMin = await this.adslogsService.getLog("InBetweenAdsSkipTimeMin");
            var InBetweenAdsSkipTimeMax = await this.adslogsService.getLog("InBetweenAdsSkipTimeMax");
            var InBetweenCPAPrice = await this.adslogsService.getLog("InBetweenCPAPrice");
            var InBetweenCPVPrice = await this.adslogsService.getLog("InBetweenCPVPrice");
            var EconomySharingInBetween = await this.adslogsService.getLog("EconomySharingInBetween");
            var PopUpAdsDurationMin = await this.adslogsService.getLog("PopUpAdsDurationMin");
            var PopUpAdsDurationMax = await this.adslogsService.getLog("PopUpAdsDurationMax");
            var PopUpAdsSkipTimeMin = await this.adslogsService.getLog("PopUpAdsSkipTimeMin");
            var PopUpAdsSkipTimeMax = await this.adslogsService.getLog("PopUpAdsSkipTimeMax");
            var PopUpCPAPrice = await this.adslogsService.getLog("PopUpCPAPrice");
            var PopUpCPVPrice = await this.adslogsService.getLog("PopUpCPVPrice");
            var EconomySharingSPonsorPopUp = await this.adslogsService.getLog("EconomySharingSPonsorPopUp");
            var CreditPrice = await this.adslogsService.getLog("CreditPrice");
            var AdsDurationMin = await this.adslogsService.getLog("AdsDurationMin");
            var AdsDurationMax = await this.adslogsService.getLog("AdsDurationMax");
            var AdsPlanMin = await this.adslogsService.getLog("AdsPlanMin");
            var AdsPlanMax = await this.adslogsService.getLog("AdsPlanMax");
            
            //----------------Create Response----------------
            var responseData = {
                adsSetting:[
                    {
                        Jenis: "InContentAdsDurationMin",
                        Nilai: (getSetting_InContentAds.durationMin != undefined) ? getSetting_InContentAds.durationMin : 0,
                        Unit: "Detik",
                        Aktifitas: InContentAdsDurationMin[0].userbasics_data[0].fullName,
                        Date: InContentAdsDurationMin[0].dateTime,
                    },
                    {
                        Jenis: "InContentAdsDurationMax",
                        Nilai: (getSetting_InContentAds.durationMax != undefined) ? getSetting_InContentAds.durationMax : 0,
                        Unit: "Detik",
                        Aktifitas: InContentAdsDurationMax[0].userbasics_data[0].fullName,
                        Date: InContentAdsDurationMax[0].dateTime,
                    },
                    {
                        Jenis: "InContentAdsSkipTimeMin",
                        Nilai: (getSetting_InContentAds.skipMin != undefined) ? getSetting_InContentAds.skipMin:0,
                        Unit: "Detik",
                        Aktifitas: InContentAdsSkipTimeMin[0].userbasics_data[0].fullName,
                        Date: InContentAdsSkipTimeMin[0].dateTime,
                    },
                    {
                        Jenis: "InContentAdsSkipTimeMax",
                        Nilai: (getSetting_InContentAds.skipMax != undefined) ? getSetting_InContentAds.skipMax : 0,
                        Unit: "Detik",
                        Aktifitas: InContentAdsSkipTimeMax[0].userbasics_data[0].fullName,
                        Date: InContentAdsSkipTimeMax[0].dateTime,
                    },
                    {
                        Jenis: "InContentCPAPrice",
                        Nilai: (getSetting_InContentAds.CPA != undefined) ? getSetting_InContentAds.CPA : 0,
                        Unit: "Kredit",
                        Aktifitas: InContentCPAPrice[0].userbasics_data[0].fullName,
                        Date: InContentCPAPrice[0].dateTime,
                    },
                    {
                        Jenis: "InContentCPVPrice",
                        Nilai: (getSetting_InContentAds.CPV != undefined) ? getSetting_InContentAds.CPV : 0,
                        Unit: "Kredit",
                        Aktifitas: InContentCPVPrice[0].userbasics_data[0].fullName,
                        Date: InContentCPVPrice[0].dateTime,
                    },
                    {
                        Jenis: "EconomySharingInContent",
                        Nilai: (getSetting_InContentAds.rewards != undefined) ? getSetting_InContentAds.rewards : 0,
                        Unit: "Rupiah",
                        Aktifitas: EconomySharingInContent[0].userbasics_data[0].fullName,
                        Date: EconomySharingInContent[0].dateTime,
                    },
                    {
                        Jenis: "InBetweenAdsDurationMin",
                        Nilai: (getSetting_InBetweenAds.durationMin != undefined) ? getSetting_InBetweenAds.durationMin : 0,
                        Unit: "Detik",
                        Aktifitas: InBetweenAdsDurationMin[0].userbasics_data[0].fullName,
                        Date: InBetweenAdsDurationMin[0].dateTime,
                    },
                    {
                        Jenis: "InBetweenAdsDurationMax",
                        Nilai: (getSetting_InBetweenAds.durationMax != undefined) ? getSetting_InBetweenAds.durationMax : 0,
                        Unit: "Detik",
                        Aktifitas: InBetweenAdsDurationMax[0].userbasics_data[0].fullName,
                        Date: InBetweenAdsDurationMax[0].dateTime,
                    },
                    {
                        Jenis: "InBetweenAdsSkipTimeMin",
                        Nilai: (getSetting_InBetweenAds.skipMin != undefined) ? getSetting_InBetweenAds.skipMin : 0,
                        Unit: "Detik",
                        Aktifitas: InBetweenAdsSkipTimeMin[0].userbasics_data[0].fullName,
                        Date: InBetweenAdsSkipTimeMin[0].dateTime,
                    },
                    {
                        Jenis: "InBetweenAdsSkipTimeMax",
                        Nilai: (getSetting_InBetweenAds.skipMax != undefined) ? getSetting_InBetweenAds.skipMax : 0,
                        Unit: "Detik",
                        Aktifitas: InBetweenAdsSkipTimeMax[0].userbasics_data[0].fullName,
                        Date: InBetweenAdsSkipTimeMax[0].dateTime,
                    },
                    {
                        Jenis: "InBetweenCPAPrice",
                        Nilai: (getSetting_InBetweenAds.CPA != undefined) ? getSetting_InBetweenAds.CPA : 0,
                        Unit: "Kredit",
                        Aktifitas: InBetweenCPAPrice[0].userbasics_data[0].fullName,
                        Date: InBetweenCPAPrice[0].dateTime,
                    },
                    {
                        Jenis: "InBetweenCPVPrice",
                        Nilai: (getSetting_InBetweenAds.CPV != undefined) ? getSetting_InBetweenAds.CPV : 0,
                        Unit: "Kredit",
                        Aktifitas: InBetweenCPVPrice[0].userbasics_data[0].fullName,
                        Date: InBetweenCPVPrice[0].dateTime,
                    },
                    {
                        Jenis: "EconomySharingInBetween",
                        Nilai: (getSetting_InBetweenAds.rewards != undefined) ? getSetting_InBetweenAds.rewards : 0,
                        Unit: "Rupiah",
                        Aktifitas: EconomySharingInBetween[0].userbasics_data[0].fullName,
                        Date: EconomySharingInBetween[0].dateTime,
                    },


                    {
                        Jenis: "PopUpAdsDurationMin",
                        Nilai: (getSetting_PopUpAds.durationMin != undefined) ? getSetting_PopUpAds.durationMin : 0,
                        Unit: "Detik",
                        Aktifitas: PopUpAdsDurationMin[0].userbasics_data[0].fullName,
                        Date: PopUpAdsDurationMin[0].dateTime,
                    },
                    {
                        Jenis: "PopUpAdsDurationMax",
                        Nilai: (getSetting_PopUpAds.durationMax != undefined) ? getSetting_PopUpAds.durationMax : 0,
                        Unit: "Detik",
                        Aktifitas: PopUpAdsDurationMax[0].userbasics_data[0].fullName,
                        Date: PopUpAdsDurationMax[0].dateTime,
                    },
                    {
                        Jenis: "PopUpAdsSkipTimeMin",
                        Nilai: (getSetting_PopUpAds.skipMin != undefined) ? getSetting_PopUpAds.skipMin : 0,
                        Unit: "Detik",
                        Aktifitas: PopUpAdsSkipTimeMin[0].userbasics_data[0].fullName,
                        Date: PopUpAdsSkipTimeMin[0].dateTime,
                    },
                    {
                        Jenis: "PopUpAdsSkipTimeMax",
                        Nilai: (getSetting_PopUpAds.skipMax != undefined) ? getSetting_PopUpAds.skipMax : 0,
                        Unit: "Detik",
                        Aktifitas: PopUpAdsSkipTimeMax[0].userbasics_data[0].fullName,
                        Date: PopUpAdsSkipTimeMax[0].dateTime,
                    },
                    {
                        Jenis: "PopUpCPAPrice",
                        Nilai: (getSetting_PopUpAds.CPA != undefined) ? getSetting_PopUpAds.CPA : 0,
                        Unit: "Kredit",
                        Aktifitas: PopUpCPAPrice[0].userbasics_data[0].fullName,
                        Date: PopUpCPAPrice[0].dateTime,
                    },
                    {
                        Jenis: "PopUpCPVPrice",
                        Nilai: (getSetting_PopUpAds.CPV != undefined) ? getSetting_PopUpAds.CPV : 0,
                        Unit: "Kredit",
                        Aktifitas: PopUpCPVPrice[0].userbasics_data[0].fullName,
                        Date: PopUpCPVPrice[0].dateTime,
                    },
                    {
                        Jenis: "EconomySharingSPonsorPopUp",
                        Nilai: (getSetting_PopUpAds.rewards != undefined) ? getSetting_PopUpAds.rewards : 0,
                        Unit: "Rupiah",
                        Aktifitas: EconomySharingSPonsorPopUp[0].userbasics_data[0].fullName,
                        Date: EconomySharingSPonsorPopUp[0].dateTime,
                    },


                    {
                        Jenis: "CreditPrice",
                        Nilai: (getSetting_CreditPrice.value != undefined) ? getSetting_CreditPrice.value : 0,
                        Unit: getSetting_AdsPlanMax.remark,
                        Aktifitas: CreditPrice[0].userbasics_data[0].fullName,
                        Date: CreditPrice[0].dateTime,
                    },
                    {
                        Jenis: "AdsDurationMin",
                        Nilai: (getSetting_AdsDurationMin.value != undefined) ? getSetting_AdsDurationMin.value : 0,
                        Unit: getSetting_AdsPlanMax.remark,
                        Aktifitas: AdsDurationMin[0].userbasics_data[0].fullName,
                        Date: AdsDurationMin[0].dateTime,
                    },
                    {
                        Jenis: "AdsDurationMax",
                        Nilai: (getSetting_AdsDurationMax.value != undefined) ? getSetting_AdsDurationMax.value : 0,
                        Unit: getSetting_AdsPlanMax.remark,
                        Aktifitas: AdsDurationMax[0].userbasics_data[0].fullName,
                        Date: AdsDurationMax[0].dateTime,
                    },
                    {
                        Jenis: "AdsPlanMin",
                        Nilai: (getSetting_AdsPlanMin.value != undefined) ? getSetting_AdsPlanMin.value : 0,
                        Unit: getSetting_AdsPlanMax.remark,
                        Aktifitas: AdsPlanMin[0].userbasics_data[0].fullName,
                        Date: AdsPlanMin[0].dateTime,
                    },
                    {
                        Jenis: "AdsPlanMax",
                        Nilai: (getSetting_AdsPlanMax.value != undefined) ? getSetting_AdsPlanMax.value : 0,
                        Unit: getSetting_AdsPlanMax.remark,
                        Aktifitas: AdsPlanMax[0].userbasics_data[0].fullName,
                        Date: AdsPlanMax[0].dateTime,
                    },
                ],
                //     InContentAdsDurationMin: getSetting_InContentAds.durationMin,
                //     InContentAdsDurationMax: getSetting_InContentAds.durationMax,
                //     InContentAdsSkipTimeMin: getSetting_InContentAds.skipMin,
                //     InContentAdsSkipTimeMax: getSetting_InContentAds.skipMax,
                //     InContentCPAPrice: getSetting_InContentAds.CPA,
                //     InContentCPVPrice: getSetting_InContentAds.CPV,
                //     EconomySharingInContent: getSetting_InContentAds.rewards,

                //     InBetweenAdsDurationMin: getSetting_InBetweenAds.durationMin,
                //     InBetweenAdsDurationMax: getSetting_InBetweenAds.durationMax,
                //     InBetweenAdsSkipTimeMin: getSetting_InBetweenAds.skipMin,
                //     InBetweenAdsSkipTimeMax: getSetting_InBetweenAds.skipMax,
                //     InBetweenCPAPrice: getSetting_InBetweenAds.CPA,
                //     InBetweenCPVPrice: getSetting_InBetweenAds.CPV,
                //     EconomySharingInBetween: getSetting_InBetweenAds.rewards,

                //     PopUpAdsDurationMin: getSetting_PopUpAds.durationMin,
                //     PopUpAdsDurationMax: getSetting_PopUpAds.durationMax,
                //     PopUpAdsSkipTimeMin: getSetting_PopUpAds.skipMin,
                //     PopUpAdsSkipTimeMax: getSetting_PopUpAds.skipMax,
                //     PopUpCPAPrice: getSetting_PopUpAds.CPA,
                //     PopUpCPVPrice: getSetting_PopUpAds.CPV,
                //     EconomySharingSPonsorPopUp: getSetting_PopUpAds.rewards,

                //     CreditPrice: getSetting_CreditPrice.value,
                //     AdsDurationMin: getSetting_AdsDurationMin.value,
                //     AdsDurationMax: getSetting_AdsDurationMax.value,
                //     AdsPlanMin: getSetting_AdsPlanMin.value,
                //     AdsPlanMax: getSetting_AdsPlanMax.value,
                // },
                adsCTAButton,
                adsNotification: {
                    title_id: getSetting_Notification.subject_id,
                    title_en: getSetting_Notification.subject,
                    body_id: getSetting_Notification.body_detail_id,
                    body_end: getSetting_Notification.body_detail,
                },
            }
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get setting ads succesfully", responseData
            );
        } catch (e) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ' + e.toString(),
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('update')
    @HttpCode(HttpStatus.ACCEPTED)
    async updateAdsSetting(@Body() body, @Headers() headers) {
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

        var _id_InContentAds = this.configService.get("ID_ADS_IN_CONTENT");
        var _id_InBetweenAds = this.configService.get("ID_ADS_IN_BETWEEN");
        var _id_PopUpAds = this.configService.get("ID_ADS_IN_POPUP");

        var _id_setting_CreditPrice = this.configService.get("ID_SETTING_ADS_CREDIT_PRICE");
        var _id_setting_AdsDurationMin = this.configService.get("ID_SETTING_ADS_DURATION_MIN");
        var _id_setting_AdsDurationMax = this.configService.get("ID_SETTING_ADS_DURATION_MAX");
        var _id_setting_AdsPlanMin = this.configService.get("ID_SETTING_ADS_PLAN_MIN");
        var _id_setting_AdsPlanMax = this.configService.get("ID_SETTING_ADS_PLAN_MAX");
        var _id_setting_CTAButton = this.configService.get("ID_SETTING_ADS_CTA_BUTTON");

        var AdsLogsDto_ = new AdsLogsDto();
        var nameActivitas: string[] = [];
        //----------------In Content Ads----------------
        if(
            (body.InContentAdsDurationMin != undefined) ||
            (body.InContentAdsDurationMax != undefined) ||
            (body.InContentAdsSkipTimeMin != undefined) ||
            (body.InContentAdsSkipTimeMax != undefined) ||
            (body.InContentCPAPrice != undefined) ||
            (body.InContentCPVPrice != undefined) ||
            (body.EconomySharingInContent != undefined) 
        ) {
            var AdsTypeDto_ = new AdsTypeDto();
            //----------------DURATION MIN----------------
            if (body.InContentAdsDurationMin!=undefined){ 
                //VALIDASI PARAM value
                var ceck_InContentAdsDurationMin = await this.utilsService.validateParam("InContentAdsDurationMin", body.InContentAdsDurationMin, "number")
                if (ceck_InContentAdsDurationMin != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_InContentAdsDurationMin,
                    );
                }
                AdsTypeDto_.durationMin = body.InContentAdsDurationMin; 
                nameActivitas.push("InContentAdsDurationMin");
            }
            //----------------DURATION MAX----------------
            if (body.InContentAdsDurationMax != undefined) {
                //VALIDASI PARAM value
                var ceck_InContentAdsDurationMax = await this.utilsService.validateParam("InContentAdsDurationMax", body.InContentAdsDurationMax, "number")
                if (ceck_InContentAdsDurationMax != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_InContentAdsDurationMax,
                    );
                }
                AdsTypeDto_.durationMax = body.InContentAdsDurationMax;
                nameActivitas.push("InContentAdsDurationMax");
            }
            //----------------SKIP MIN----------------
            if (body.InContentAdsSkipTimeMin != undefined) {
                //VALIDASI PARAM value
                var ceck_InContentAdsSkipTimeMin = await this.utilsService.validateParam("InContentAdsSkipTimeMin", body.InContentAdsSkipTimeMin, "number")
                if (ceck_InContentAdsSkipTimeMin != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_InContentAdsSkipTimeMin,
                    );
                } 
                AdsTypeDto_.skipMin = body.InContentAdsSkipTimeMin;
                nameActivitas.push("InContentAdsSkipTimeMin");
            }
            //----------------SKIP MAX----------------
            if (body.InContentAdsSkipTimeMax != undefined) {
                //VALIDASI PARAM value
                var ceck_InContentAdsSkipTimeMax = await this.utilsService.validateParam("InContentAdsSkipTimeMax", body.InContentAdsSkipTimeMax, "number")
                if (ceck_InContentAdsSkipTimeMax != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_InContentAdsSkipTimeMax,
                    );
                } 
                AdsTypeDto_.skipMax = body.InContentAdsSkipTimeMax;
                nameActivitas.push("InContentAdsSkipTimeMax");
            }
            //----------------CPA PRICE----------------
            if (body.InContentCPAPrice != undefined) {
                //VALIDASI PARAM value
                var ceck_InContentCPAPrice = await this.utilsService.validateParam("InContentCPAPrice", body.InContentCPAPrice, "number")
                if (ceck_InContentCPAPrice != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_InContentCPAPrice,
                    );
                } 
                AdsTypeDto_.CPA = body.InContentCPAPrice;
                nameActivitas.push("InContentCPAPrice");
            }
            //----------------CPV PRICE----------------
            if (body.InContentCPVPrice != undefined) {
                //VALIDASI PARAM value
                var ceck_InContentCPVPrice = await this.utilsService.validateParam("InContentCPVPrice", body.InContentCPVPrice, "number")
                if (ceck_InContentCPVPrice != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_InContentCPVPrice,
                    );
                } 
                AdsTypeDto_.CPV = body.InContentCPVPrice;
                nameActivitas.push("InContentCPVPrice");
            }
            //----------------ECONOMY SHARING----------------
            if (body.EconomySharingInContent != undefined) {
                //VALIDASI PARAM value
                var ceck_EconomySharingInContent = await this.utilsService.validateParam("EconomySharingInContent", body.EconomySharingInContent, "number")
                if (ceck_EconomySharingInContent != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_EconomySharingInContent,
                    );
                } 
                AdsTypeDto_.rewards = body.EconomySharingInContent;
                nameActivitas.push("EconomySharingInContent"); 
            }
            try {
                await this.adsTypeService.update(_id_InContentAds, AdsTypeDto_);
            } catch (e) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, ' + e.toString(),
                );
            }
        } 

        //----------------In Between Ads----------------
        if (
            (body.InBetweenAdsDurationMin != undefined) ||
            (body.InBetweenAdsDurationMax != undefined) ||
            (body.InBetweenAdsSkipTimeMin != undefined) ||
            (body.InBetweenAdsSkipTimeMax != undefined) ||
            (body.InBetweenCPAPrice != undefined) ||
            (body.InBetweenCPVPrice != undefined) ||
            (body.EconomySharingInBetween != undefined)
        ) {
            var AdsTypeDto_ = new AdsTypeDto();
            //----------------DURATION MIN----------------
            if (body.InBetweenAdsDurationMin != undefined) {
                //VALIDASI PARAM value
                var ceck_InBetweenAdsDurationMin = await this.utilsService.validateParam("InBetweenAdsDurationMin", body.InBetweenAdsDurationMin, "number")
                if (ceck_InBetweenAdsDurationMin != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_InBetweenAdsDurationMin,
                    );
                } 
                AdsTypeDto_.durationMin = body.InBetweenAdsDurationMin;
                nameActivitas.push("InBetweenAdsDurationMin"); 
            }
            //----------------DURATION MAX----------------
            if (body.InBetweenAdsDurationMax != undefined) {
                //VALIDASI PARAM value
                var ceck_InBetweenAdsDurationMax = await this.utilsService.validateParam("InBetweenAdsDurationMax", body.InBetweenAdsDurationMax, "number")
                if (ceck_InBetweenAdsDurationMax != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_InBetweenAdsDurationMax,
                    );
                } 
                AdsTypeDto_.durationMax = body.InBetweenAdsDurationMax;
                nameActivitas.push("InBetweenAdsDurationMax"); 
            }
            //----------------SKIP MIN----------------
            if (body.InBetweenAdsSkipTimeMin != undefined) {
                //VALIDASI PARAM value
                var ceck_InBetweenAdsSkipTimeMin = await this.utilsService.validateParam("InBetweenAdsSkipTimeMin", body.InBetweenAdsSkipTimeMin, "number")
                if (ceck_InBetweenAdsSkipTimeMin != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_InBetweenAdsSkipTimeMin,
                    );
                } 
                AdsTypeDto_.skipMin = body.InBetweenAdsSkipTimeMin;
                nameActivitas.push("InBetweenAdsSkipTimeMin"); 
            }
            //----------------SKIP MAX----------------
            if (body.InBetweenAdsSkipTimeMax != undefined) {
                //VALIDASI PARAM value
                var ceck_InBetweenAdsSkipTimeMax = await this.utilsService.validateParam("InBetweenAdsSkipTimeMax", body.InBetweenAdsSkipTimeMax, "number")
                if (ceck_InBetweenAdsSkipTimeMax != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_InBetweenAdsSkipTimeMax,
                    );
                } 
                AdsTypeDto_.skipMax = body.InBetweenAdsSkipTimeMax;
                nameActivitas.push("InBetweenAdsSkipTimeMax"); 
            }
            //----------------CPA PRICE----------------
            if (body.InBetweenCPAPrice != undefined) {
                //VALIDASI PARAM value
                var ceck_InBetweenCPAPrice = await this.utilsService.validateParam("InBetweenCPAPrice", body.InBetweenCPAPrice, "number")
                if (ceck_InBetweenCPAPrice != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_InBetweenCPAPrice,
                    );
                } 
                AdsTypeDto_.CPA = body.InBetweenCPAPrice;
                nameActivitas.push("InBetweenCPAPrice"); 
            }
            //----------------CPV PRICE----------------
            if (body.InBetweenCPVPrice != undefined) {
                //VALIDASI PARAM value
                var ceck_InBetweenCPVPrice = await this.utilsService.validateParam("InBetweenCPVPrice", body.InBetweenCPVPrice, "number")
                if (ceck_InBetweenCPVPrice != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_InBetweenCPVPrice,
                    );
                } 
                AdsTypeDto_.CPV = body.InBetweenCPVPrice;
                nameActivitas.push("InBetweenCPVPrice"); 
            }
            //----------------ECONOMY SHARING----------------
            if (body.EconomySharingInBetween != undefined) {
                //VALIDASI PARAM value
                var ceck_EconomySharingInBetween = await this.utilsService.validateParam("EconomySharingInBetween", body.EconomySharingInBetween, "number")
                if (ceck_EconomySharingInBetween != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_EconomySharingInBetween,
                    );
                } 
                AdsTypeDto_.rewards = body.EconomySharingInBetween;
                nameActivitas.push("EconomySharingInBetween"); 
            }
            try {
                await this.adsTypeService.update(_id_InBetweenAds, AdsTypeDto_);
            } catch (e) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, ' + e.toString(),
                );
            }
        }

        //----------------POP UP Ads----------------
        if (
            (body.PopUpAdsDurationMin != undefined) ||
            (body.PopUpAdsDurationMax != undefined) ||
            (body.PopUpAdsSkipTimeMin != undefined) ||
            (body.PopUpAdsSkipTimeMax != undefined) ||
            (body.PopUpCPAPrice != undefined) ||
            (body.PopUpCPVPrice != undefined) ||
            (body.EconomySharingSPonsorPopUp != undefined)
        ) {
            var AdsTypeDto_ = new AdsTypeDto();
            //----------------DURATION MIN----------------
            if (body.PopUpAdsDurationMin != undefined) {
                //VALIDASI PARAM value
                var ceck_PopUpAdsDurationMin = await this.utilsService.validateParam("PopUpAdsDurationMin", body.PopUpAdsDurationMin, "number")
                if (ceck_PopUpAdsDurationMin != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_PopUpAdsDurationMin,
                    );
                } 
                AdsTypeDto_.durationMin = body.PopUpAdsDurationMin;
                nameActivitas.push("PopUpAdsDurationMin"); 
            }
            //----------------DURATION MAX----------------
            if (body.PopUpAdsDurationMax != undefined) {
                //VALIDASI PARAM value
                var ceck_PopUpAdsDurationMax = await this.utilsService.validateParam("PopUpAdsDurationMax", body.PopUpAdsDurationMax, "number")
                if (ceck_PopUpAdsDurationMax != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_PopUpAdsDurationMax,
                    );
                } 
                AdsTypeDto_.durationMax = body.PopUpAdsDurationMax;
                nameActivitas.push("PopUpAdsDurationMax"); 
            }
            //----------------SKIP MIN----------------
            if (body.PopUpAdsSkipTimeMin != undefined) {
                //VALIDASI PARAM value
                var ceck_PopUpAdsSkipTimeMin = await this.utilsService.validateParam("PopUpAdsSkipTimeMin", body.PopUpAdsSkipTimeMin, "number")
                if (ceck_PopUpAdsSkipTimeMin != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_PopUpAdsSkipTimeMin,
                    );
                } 
                AdsTypeDto_.skipMin = body.PopUpAdsSkipTimeMin;
                nameActivitas.push("PopUpAdsSkipTimeMin"); 
            }
            //----------------SKIP MAX----------------
            if (body.PopUpAdsSkipTimeMax != undefined) {
                //VALIDASI PARAM value
                var ceck_PopUpAdsSkipTimeMax = await this.utilsService.validateParam("PopUpAdsSkipTimeMax", body.PopUpAdsSkipTimeMax, "number")
                if (ceck_PopUpAdsSkipTimeMax != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_PopUpAdsSkipTimeMax,
                    );
                } 
                AdsTypeDto_.skipMax = body.PopUpAdsSkipTimeMax;
                nameActivitas.push("PopUpAdsSkipTimeMax"); 
            }
            //----------------CPA PRICE----------------
            if (body.PopUpCPAPrice != undefined) {
                //VALIDASI PARAM value
                var ceck_PopUpCPAPrice = await this.utilsService.validateParam("PopUpCPAPrice", body.PopUpCPAPrice, "number")
                if (ceck_PopUpCPAPrice != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_PopUpCPAPrice,
                    );
                } 
                AdsTypeDto_.CPA = body.PopUpCPAPrice;
                nameActivitas.push("PopUpCPAPrice"); 
            }
            //----------------CPV PRICE----------------
            if (body.PopUpCPVPrice != undefined) {
                //VALIDASI PARAM value
                var ceck_PopUpCPVPrice = await this.utilsService.validateParam("PopUpCPVPrice", body.PopUpCPVPrice, "number")
                if (ceck_PopUpCPVPrice != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_PopUpCPVPrice,
                    );
                } 
                AdsTypeDto_.CPV = body.PopUpCPVPrice;
                nameActivitas.push("PopUpCPVPrice"); 
            }
            //----------------ECONOMY SHARING----------------
            if (body.EconomySharingSPonsorPopUp != undefined) {
                //VALIDASI PARAM value
                var ceck_EconomySharingSPonsorPopUp = await this.utilsService.validateParam("EconomySharingSPonsorPopUp", body.EconomySharingSPonsorPopUp, "number")
                if (ceck_EconomySharingSPonsorPopUp != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_EconomySharingSPonsorPopUp,
                    );
                } 
                AdsTypeDto_.rewards = body.EconomySharingSPonsorPopUp;
                nameActivitas.push("EconomySharingSPonsorPopUp"); 
            }
            try {
                await this.adsTypeService.update(_id_PopUpAds, AdsTypeDto_);
            } catch (e) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, ' + e.toString(),
                );
            }
        }

        //----------------Ads Setting----------------
        if (
            (body.CreditPrice != undefined) ||
            (body.AdsDurationMin != undefined) ||
            (body.AdsDurationMax != undefined) ||
            (body.AdsPlanMin != undefined) ||
            (body.AdsPlanMax != undefined) ||
            (body.CTAButtonIndex != undefined) ||
            (body.CTAButtonText != undefined) 
        ) {
            //----------------CREDIT PRICE----------------
            if (body.CreditPrice != undefined) {
                //VALIDASI PARAM value
                var ceck_CreditPrice = await this.utilsService.validateParam("CreditPrice", body.CreditPrice, "number")
                if (ceck_CreditPrice != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_CreditPrice,
                    );
                }
                try {
                    nameActivitas.push("CreditPrice"); 
                    await this.adssettingService.updateAdsSetting(_id_setting_CreditPrice, body.CreditPrice);
                } catch (e) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed, ' + e.toString(),
                    );
                }
            }
            //----------------ADS DURATION MIN----------------
            if (body.AdsDurationMin != undefined) {
                //VALIDASI PARAM value
                var ceck_AdsDurationMin = await this.utilsService.validateParam("AdsDurationMin", body.AdsDurationMin, "number")
                if (ceck_AdsDurationMin != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_AdsDurationMin,
                    );
                }
                try {
                    nameActivitas.push("AdsDurationMin");
                    await this.adssettingService.updateAdsSetting(_id_setting_AdsDurationMin, body.AdsDurationMin);
                } catch (e) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed, ' + e.toString(),
                    );
                }
            }
            //----------------ADS DURATION MAX----------------
            if (body.AdsDurationMax != undefined) {
                //VALIDASI PARAM value
                var ceck_AdsDurationMax = await this.utilsService.validateParam("AdsDurationMax", body.AdsDurationMax, "number")
                if (ceck_AdsDurationMax != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_AdsDurationMax,
                    );
                }
                try {
                    nameActivitas.push("AdsDurationMax");
                    await this.adssettingService.updateAdsSetting(_id_setting_AdsDurationMax, body.AdsDurationMax);
                } catch (e) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed, ' + e.toString(),
                    );
                }
            }
            //----------------ADS PLAN MIN----------------
            if (body.AdsPlanMin != undefined) {
                //VALIDASI PARAM value
                var ceck_AdsPlanMin = await this.utilsService.validateParam("AdsPlanMin", body.AdsPlanMin, "number")
                if (ceck_AdsPlanMin != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_AdsPlanMin,
                    );
                }
                try {
                    nameActivitas.push("AdsPlanMin");
                    await this.adssettingService.updateAdsSetting(_id_setting_AdsPlanMin, body.AdsPlanMin);
                } catch (e) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed, ' + e.toString(),
                    );
                }
            }
            //----------------ADS PLAN MAX----------------
            if (body.AdsPlanMax != undefined) {
                //VALIDASI PARAM value
                var ceck_AdsPlanMax = await this.utilsService.validateParam("AdsPlanMax", body.AdsPlanMax, "number")
                if (ceck_AdsPlanMax != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_AdsPlanMax,
                    );
                }
                try {
                    nameActivitas.push("AdsPlanMax");
                    await this.adssettingService.updateAdsSetting(_id_setting_AdsPlanMax, body.AdsPlanMax);
                } catch (e) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed, ' + e.toString(),
                    );
                }
            }
            //----------------CTA BUTTON----------------
            if ((body.CTAButtonIndex != undefined) || (body.CTAButton != undefined)) {
                try {
                    var data_CTABUtton = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_CTAButton));
                    const stringValue = data_CTABUtton.value.toString();
                    const stringSplit = stringValue.split(',');
                    if (stringSplit[body.CTAButtonIndex] == undefined) {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed',
                        );
                    }
                    stringSplit[body.CTAButtonIndex] = body.CTAButton.toString();
                    nameActivitas.push("CTAButton"); 
                    await this.adssettingService.updateAdsSetting(_id_setting_CTAButton, stringSplit);
                } catch (e) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed, ' + e.toString(),
                    );
                }
            }
        }

        //----------------Ads Template Notification----------------
        if (
            (body.title_id != undefined) ||
            (body.title_en != undefined) ||
            (body.body_id != undefined) ||
            (body.body_end != undefined)
        ) {
            //VALIDASI PARAM title_id
            var ceck_title_id = await this.utilsService.validateParam("title_id", body.title_id, "string")
            if (ceck_title_id != "") {
                await this.errorHandler.generateBadRequestException(
                    ceck_title_id,
                );
            }
            //VALIDASI PARAM title_en
            var ceck_title_en = await this.utilsService.validateParam("title_en", body.title_en, "string")
            if (ceck_title_en != "") {
                await this.errorHandler.generateBadRequestException(
                    ceck_title_en,
                );
            }
            //VALIDASI PARAM body_id
            var ceck_body_id = await this.utilsService.validateParam("body_id", body.body_id, "string")
            if (ceck_body_id != "") {
                await this.errorHandler.generateBadRequestException(
                    ceck_body_id,
                );
            }
            //VALIDASI PARAM body_end
            var ceck_body_end = await this.utilsService.validateParam("body_end", body.body_end, "string")
            if (ceck_body_end != "") {
                await this.errorHandler.generateBadRequestException(
                    ceck_body_end,
                );
            }
            if (!((body.body_end.toString()).includes("${rewards}"))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed required text ${rewards}',
                );
            }
            if (!((body.body_id.toString()).includes("${rewards}"))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed required text ${rewards}',
                );
            }
            try {
                var event = "NOTIFY_REWARDS";
                var category = "NOTIFICATION";
                var CreateTemplatesRepoDto_ = new CreateTemplatesRepoDto();
                CreateTemplatesRepoDto_.body_detail = body.body_end.toString();
                CreateTemplatesRepoDto_.body_detail_id = body.body_id.toString();
                CreateTemplatesRepoDto_.subject = body.title_en.toString();
                CreateTemplatesRepoDto_.subject_id = body.title_id.toString();
                nameActivitas.push("NotificationAds"); 
                await this.adsNotificationService.updateAdsNotification(event, category, CreateTemplatesRepoDto_);
            } catch (e) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, ' + e.toString(),
                );
            }
        }

        try {
            AdsLogsDto_.iduser = new mongoose.Types.ObjectId(ubasic._id.toString());
            AdsLogsDto_.nameActivitas = nameActivitas; 
            AdsLogsDto_.dateTime = await this.utilsService.getDateTimeString();
            this.adslogsService.create(AdsLogsDto_);

            var getSetting_InContentAds = await this.adsTypeService.findOne(_id_InContentAds);
            var getSetting_InBetweenAds = await this.adsTypeService.findOne(_id_InBetweenAds);
            var getSetting_PopUpAds = await this.adsTypeService.findOne(_id_PopUpAds);
            var getSetting_CreditPrice = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_CreditPrice));
            var getSetting_AdsDurationMin = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsDurationMin));
            var getSetting_AdsDurationMax = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsDurationMax));
            var getSetting_AdsPlanMin = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsPlanMin));
            var getSetting_AdsPlanMax = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsPlanMax));
            var getSetting_CTAButton = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_CTAButton));
            var adsCTAButton = await Promise.all(((getSetting_CTAButton.value.toString()).split(',')).map(async (item, index) => {
                return {
                    CTAButtonIndex: index,
                    CTAButton: item
                };
            }));
            var getSetting_Notification = await this.adsNotificationService.getAdsNotification("NOTIFY_REWARDS", "NOTIFICATION");
            
            //----------------Get Log----------------
            var InContentAdsDurationMin = await this.adslogsService.getLog("InContentAdsDurationMin");
            var InContentAdsDurationMax = await this.adslogsService.getLog("InContentAdsDurationMax");
            var InContentAdsSkipTimeMin = await this.adslogsService.getLog("InContentAdsSkipTimeMin");
            var InContentAdsSkipTimeMax = await this.adslogsService.getLog("InContentAdsSkipTimeMax");
            var InContentCPAPrice = await this.adslogsService.getLog("InContentCPAPrice");
            var InContentCPVPrice = await this.adslogsService.getLog("InContentCPVPrice");
            var EconomySharingInContent = await this.adslogsService.getLog("EconomySharingInContent");
            var InBetweenAdsDurationMin = await this.adslogsService.getLog("InBetweenAdsDurationMin");
            var InBetweenAdsDurationMax = await this.adslogsService.getLog("InBetweenAdsDurationMax");
            var InBetweenAdsSkipTimeMin = await this.adslogsService.getLog("InBetweenAdsSkipTimeMin");
            var InBetweenAdsSkipTimeMax = await this.adslogsService.getLog("InBetweenAdsSkipTimeMax");
            var InBetweenCPAPrice = await this.adslogsService.getLog("InBetweenCPAPrice");
            var InBetweenCPVPrice = await this.adslogsService.getLog("InBetweenCPVPrice");
            var EconomySharingInBetween = await this.adslogsService.getLog("EconomySharingInBetween");
            var PopUpAdsDurationMin = await this.adslogsService.getLog("PopUpAdsDurationMin");
            var PopUpAdsDurationMax = await this.adslogsService.getLog("PopUpAdsDurationMax");
            var PopUpAdsSkipTimeMin = await this.adslogsService.getLog("PopUpAdsSkipTimeMin");
            var PopUpAdsSkipTimeMax = await this.adslogsService.getLog("PopUpAdsSkipTimeMax");
            var PopUpCPAPrice = await this.adslogsService.getLog("PopUpCPAPrice");
            var PopUpCPVPrice = await this.adslogsService.getLog("PopUpCPVPrice");
            var EconomySharingSPonsorPopUp = await this.adslogsService.getLog("EconomySharingSPonsorPopUp");
            var CreditPrice = await this.adslogsService.getLog("CreditPrice");
            var AdsDurationMin = await this.adslogsService.getLog("AdsDurationMin");
            var AdsDurationMax = await this.adslogsService.getLog("AdsDurationMax");
            var AdsPlanMin = await this.adslogsService.getLog("AdsPlanMin");
            var AdsPlanMax = await this.adslogsService.getLog("AdsPlanMax");

            //----------------Create Response----------------
            var responseData = {
                adsSetting: [
                    {
                        Jenis: "InContentAdsDurationMin",
                        Nilai: (getSetting_InContentAds.durationMin != undefined) ? getSetting_InContentAds.durationMin : 0,
                        Unit: "Detik",
                        Aktifitas: InContentAdsDurationMin[0].userbasics_data[0].fullName,
                        Date: InContentAdsDurationMin[0].dateTime,
                    },
                    {
                        Jenis: "InContentAdsDurationMax",
                        Nilai: (getSetting_InContentAds.durationMax != undefined) ? getSetting_InContentAds.durationMax : 0,
                        Unit: "Detik",
                        Aktifitas: InContentAdsDurationMax[0].userbasics_data[0].fullName,
                        Date: InContentAdsDurationMax[0].dateTime,
                    },
                    {
                        Jenis: "InContentAdsSkipTimeMin",
                        Nilai: (getSetting_InContentAds.skipMin != undefined) ? getSetting_InContentAds.skipMin : 0,
                        Unit: "Detik",
                        Aktifitas: InContentAdsSkipTimeMin[0].userbasics_data[0].fullName,
                        Date: InContentAdsSkipTimeMin[0].dateTime,
                    },
                    {
                        Jenis: "InContentAdsSkipTimeMax",
                        Nilai: (getSetting_InContentAds.skipMax != undefined) ? getSetting_InContentAds.skipMax : 0,
                        Unit: "Detik",
                        Aktifitas: InContentAdsSkipTimeMax[0].userbasics_data[0].fullName,
                        Date: InContentAdsSkipTimeMax[0].dateTime,
                    },
                    {
                        Jenis: "InContentCPAPrice",
                        Nilai: (getSetting_InContentAds.CPA != undefined) ? getSetting_InContentAds.CPA : 0,
                        Unit: "Kredit",
                        Aktifitas: InContentCPAPrice[0].userbasics_data[0].fullName,
                        Date: InContentCPAPrice[0].dateTime,
                    },
                    {
                        Jenis: "InContentCPVPrice",
                        Nilai: (getSetting_InContentAds.CPV != undefined) ? getSetting_InContentAds.CPV : 0,
                        Unit: "Kredit",
                        Aktifitas: InContentCPVPrice[0].userbasics_data[0].fullName,
                        Date: InContentCPVPrice[0].dateTime,
                    },
                    {
                        Jenis: "EconomySharingInContent",
                        Nilai: (getSetting_InContentAds.rewards != undefined) ? getSetting_InContentAds.rewards : 0,
                        Unit: "Rupiah",
                        Aktifitas: EconomySharingInContent[0].userbasics_data[0].fullName,
                        Date: EconomySharingInContent[0].dateTime,
                    },
                    {
                        Jenis: "InBetweenAdsDurationMin",
                        Nilai: (getSetting_InBetweenAds.durationMin != undefined) ? getSetting_InBetweenAds.durationMin : 0,
                        Unit: "Detik",
                        Aktifitas: InBetweenAdsDurationMin[0].userbasics_data[0].fullName,
                        Date: InBetweenAdsDurationMin[0].dateTime,
                    },
                    {
                        Jenis: "InBetweenAdsDurationMax",
                        Nilai: (getSetting_InBetweenAds.durationMax != undefined) ? getSetting_InBetweenAds.durationMax : 0,
                        Unit: "Detik",
                        Aktifitas: InBetweenAdsDurationMax[0].userbasics_data[0].fullName,
                        Date: InBetweenAdsDurationMax[0].dateTime,
                    },
                    {
                        Jenis: "InBetweenAdsSkipTimeMin",
                        Nilai: (getSetting_InBetweenAds.skipMin != undefined) ? getSetting_InBetweenAds.skipMin : 0,
                        Unit: "Detik",
                        Aktifitas: InBetweenAdsSkipTimeMin[0].userbasics_data[0].fullName,
                        Date: InBetweenAdsSkipTimeMin[0].dateTime,
                    },
                    {
                        Jenis: "InBetweenAdsSkipTimeMax",
                        Nilai: (getSetting_InBetweenAds.skipMax != undefined) ? getSetting_InBetweenAds.skipMax : 0,
                        Unit: "Detik",
                        Aktifitas: InBetweenAdsSkipTimeMax[0].userbasics_data[0].fullName,
                        Date: InBetweenAdsSkipTimeMax[0].dateTime,
                    },
                    {
                        Jenis: "InBetweenCPAPrice",
                        Nilai: (getSetting_InBetweenAds.CPA != undefined) ? getSetting_InBetweenAds.CPA : 0,
                        Unit: "Kredit",
                        Aktifitas: InBetweenCPAPrice[0].userbasics_data[0].fullName,
                        Date: InBetweenCPAPrice[0].dateTime,
                    },
                    {
                        Jenis: "InBetweenCPVPrice",
                        Nilai: (getSetting_InBetweenAds.CPV != undefined) ? getSetting_InBetweenAds.CPV : 0,
                        Unit: "Kredit",
                        Aktifitas: InBetweenCPVPrice[0].userbasics_data[0].fullName,
                        Date: InBetweenCPVPrice[0].dateTime,
                    },
                    {
                        Jenis: "EconomySharingInBetween",
                        Nilai: (getSetting_InBetweenAds.rewards != undefined) ? getSetting_InBetweenAds.rewards : 0,
                        Unit: "Rupiah",
                        Aktifitas: EconomySharingInBetween[0].userbasics_data[0].fullName,
                        Date: EconomySharingInBetween[0].dateTime,
                    },


                    {
                        Jenis: "PopUpAdsDurationMin",
                        Nilai: (getSetting_PopUpAds.durationMin != undefined) ? getSetting_PopUpAds.durationMin : 0,
                        Unit: "Detik",
                        Aktifitas: PopUpAdsDurationMin[0].userbasics_data[0].fullName,
                        Date: PopUpAdsDurationMin[0].dateTime,
                    },
                    {
                        Jenis: "PopUpAdsDurationMax",
                        Nilai: (getSetting_PopUpAds.durationMax != undefined) ? getSetting_PopUpAds.durationMax : 0,
                        Unit: "Detik",
                        Aktifitas: PopUpAdsDurationMax[0].userbasics_data[0].fullName,
                        Date: PopUpAdsDurationMax[0].dateTime,
                    },
                    {
                        Jenis: "PopUpAdsSkipTimeMin",
                        Nilai: (getSetting_PopUpAds.skipMin != undefined) ? getSetting_PopUpAds.skipMin : 0,
                        Unit: "Detik",
                        Aktifitas: PopUpAdsSkipTimeMin[0].userbasics_data[0].fullName,
                        Date: PopUpAdsSkipTimeMin[0].dateTime,
                    },
                    {
                        Jenis: "PopUpAdsSkipTimeMax",
                        Nilai: (getSetting_PopUpAds.skipMax != undefined) ? getSetting_PopUpAds.skipMax : 0,
                        Unit: "Detik",
                        Aktifitas: PopUpAdsSkipTimeMax[0].userbasics_data[0].fullName,
                        Date: PopUpAdsSkipTimeMax[0].dateTime,
                    },
                    {
                        Jenis: "PopUpCPAPrice",
                        Nilai: (getSetting_PopUpAds.CPA != undefined) ? getSetting_PopUpAds.CPA : 0,
                        Unit: "Kredit",
                        Aktifitas: PopUpCPAPrice[0].userbasics_data[0].fullName,
                        Date: PopUpCPAPrice[0].dateTime,
                    },
                    {
                        Jenis: "PopUpCPVPrice",
                        Nilai: (getSetting_PopUpAds.CPV != undefined) ? getSetting_PopUpAds.CPV : 0,
                        Unit: "Kredit",
                        Aktifitas: PopUpCPVPrice[0].userbasics_data[0].fullName,
                        Date: PopUpCPVPrice[0].dateTime,
                    },
                    {
                        Jenis: "EconomySharingSPonsorPopUp",
                        Nilai: (getSetting_PopUpAds.rewards != undefined) ? getSetting_PopUpAds.rewards : 0,
                        Unit: "Rupiah",
                        Aktifitas: EconomySharingSPonsorPopUp[0].userbasics_data[0].fullName,
                        Date: EconomySharingSPonsorPopUp[0].dateTime,
                    },


                    {
                        Jenis: "CreditPrice",
                        Nilai: (getSetting_CreditPrice.value != undefined) ? getSetting_CreditPrice.value : 0,
                        Unit: getSetting_AdsPlanMax.remark,
                        Aktifitas: CreditPrice[0].userbasics_data[0].fullName,
                        Date: CreditPrice[0].dateTime,
                    },
                    {
                        Jenis: "AdsDurationMin",
                        Nilai: (getSetting_AdsDurationMin.value != undefined) ? getSetting_AdsDurationMin.value : 0,
                        Unit: getSetting_AdsPlanMax.remark,
                        Aktifitas: AdsDurationMin[0].userbasics_data[0].fullName,
                        Date: AdsDurationMin[0].dateTime,
                    },
                    {
                        Jenis: "AdsDurationMax",
                        Nilai: (getSetting_AdsDurationMax.value != undefined) ? getSetting_AdsDurationMax.value : 0,
                        Unit: getSetting_AdsPlanMax.remark,
                        Aktifitas: AdsDurationMax[0].userbasics_data[0].fullName,
                        Date: AdsDurationMax[0].dateTime,
                    },
                    {
                        Jenis: "AdsPlanMin",
                        Nilai: (getSetting_AdsPlanMin.value != undefined) ? getSetting_AdsPlanMin.value : 0,
                        Unit: getSetting_AdsPlanMax.remark,
                        Aktifitas: AdsPlanMin[0].userbasics_data[0].fullName,
                        Date: AdsPlanMin[0].dateTime,
                    },
                    {
                        Jenis: "AdsPlanMax",
                        Nilai: (getSetting_AdsPlanMax.value != undefined) ? getSetting_AdsPlanMax.value : 0,
                        Unit: getSetting_AdsPlanMax.remark,
                        Aktifitas: AdsPlanMax[0].userbasics_data[0].fullName,
                        Date: AdsPlanMax[0].dateTime,
                    },
                ],
                //     InContentAdsDurationMin: getSetting_InContentAds.durationMin,
                //     InContentAdsDurationMax: getSetting_InContentAds.durationMax,
                //     InContentAdsSkipTimeMin: getSetting_InContentAds.skipMin,
                //     InContentAdsSkipTimeMax: getSetting_InContentAds.skipMax,
                //     InContentCPAPrice: getSetting_InContentAds.CPA,
                //     InContentCPVPrice: getSetting_InContentAds.CPV,
                //     EconomySharingInContent: getSetting_InContentAds.rewards,

                //     InBetweenAdsDurationMin: getSetting_InBetweenAds.durationMin,
                //     InBetweenAdsDurationMax: getSetting_InBetweenAds.durationMax,
                //     InBetweenAdsSkipTimeMin: getSetting_InBetweenAds.skipMin,
                //     InBetweenAdsSkipTimeMax: getSetting_InBetweenAds.skipMax,
                //     InBetweenCPAPrice: getSetting_InBetweenAds.CPA,
                //     InBetweenCPVPrice: getSetting_InBetweenAds.CPV,
                //     EconomySharingInBetween: getSetting_InBetweenAds.rewards,

                //     PopUpAdsDurationMin: getSetting_PopUpAds.durationMin,
                //     PopUpAdsDurationMax: getSetting_PopUpAds.durationMax,
                //     PopUpAdsSkipTimeMin: getSetting_PopUpAds.skipMin,
                //     PopUpAdsSkipTimeMax: getSetting_PopUpAds.skipMax,
                //     PopUpCPAPrice: getSetting_PopUpAds.CPA,
                //     PopUpCPVPrice: getSetting_PopUpAds.CPV,
                //     EconomySharingSPonsorPopUp: getSetting_PopUpAds.rewards,

                //     CreditPrice: getSetting_CreditPrice.value,
                // },
                adsCTAButton,
                adsNotification: {
                    title_id: getSetting_Notification.subject_id,
                    title_en: getSetting_Notification.subject,
                    body_id: getSetting_Notification.body_detail_id,
                    body_end: getSetting_Notification.body_detail,
                },
            }

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Update setting ads succesfully", responseData
            );
        } catch (e) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ' + e.toString(),
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/notification')
    @HttpCode(HttpStatus.ACCEPTED)
    async getAdsNotification(@Headers() headers) {
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

        //----------------NOTIFICATION----------------
        var event = "NOTIFY_REWARDS";
        var category = "NOTIFICATION";
        var data = await this.adsNotificationService.getAdsNotification(event, category);
        var dataResponse = {
            title_id: data.subject_id,
            title_en: data.subject,
            body_id: data.body_detail_id,
            body_end: data.body_detail,
        }

        return await this.errorHandler.generateAcceptResponseCodeWithData(
            "Get Ads Notification succesfully", dataResponse
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post('/notification/update')
    @HttpCode(HttpStatus.ACCEPTED)
    async updateAdsNotification(@Body() body: any, @Headers() headers) {
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
        //VALIDASI PARAM title_id
        var ceck_title_id = await this.utilsService.validateParam("title_id", body.title_id, "string")
        if (ceck_title_id != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_title_id,
            );
        }
        //VALIDASI PARAM title_en
        var ceck_title_en = await this.utilsService.validateParam("title_en", body.title_en, "string")
        if (ceck_title_en != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_title_en,
            );
        }
        //VALIDASI PARAM body_id
        var ceck_body_id = await this.utilsService.validateParam("body_id", body.body_id, "string")
        if (ceck_body_id != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_body_id,
            );
        }
        //VALIDASI PARAM body_end
        var ceck_body_end = await this.utilsService.validateParam("body_end", body.body_end, "string")
        if (ceck_body_end != "") {
            await this.errorHandler.generateBadRequestException(
                ceck_body_end,
            );
        }
        if (!((body.body_end.toString()).includes("${rewards}"))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed required text ${rewards}',
            );
        }
        if (!((body.body_id.toString()).includes("${rewards}"))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed required text ${rewards}',
            );
        }

        //----------------NOTIFICATION----------------
        try {
            var event = "NOTIFY_REWARDS";
            var category = "NOTIFICATION";
            var CreateTemplatesRepoDto_ = new CreateTemplatesRepoDto();
            CreateTemplatesRepoDto_.body_detail = body.body_end.toString();
            CreateTemplatesRepoDto_.body_detail_id = body.body_id.toString();
            CreateTemplatesRepoDto_.subject = body.title_en.toString();
            CreateTemplatesRepoDto_.subject_id = body.title_id.toString();
            await this.adsNotificationService.updateAdsNotification(event, category, CreateTemplatesRepoDto_);
            var responseData = {
                "title_id": body.title_id,
                "title_en": body.title_en,
                "body_id": body.body_id,
                "body_end": body.body_end,
            }
            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Update ads Notification succesfully", responseData
            );
        } catch (e) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ' + e.toString(),
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/cta')
    @HttpCode(HttpStatus.ACCEPTED)
    async getAdsCTA(@Headers() headers) {
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

        var _id_setting_CTAButton = this.configService.get("ID_SETTING_ADS_CTA_BUTTON");;
        var getSetting_CTAButton = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_CTAButton));
        var adsCTAButton = await Promise.all(((getSetting_CTAButton.value.toString()).split(',')).map(async (item, index) => {
            return {
                CTAButtonIndex: index,
                CTAButton: item
            };
        }));

        return await this.errorHandler.generateAcceptResponseCodeWithData(
            "Get setting CTA ads succesfully", adsCTAButton
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post('/cta/update')
    @HttpCode(HttpStatus.ACCEPTED)
    async updateAdsCTA(@Body() body: any, @Headers() headers) {
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

        //----------------CTA BUTTON----------------
        if ((body.CTAButtonIndex != undefined) || (body.CTAButton != undefined)) {
            var _id_setting_CTAButton = this.configService.get("ID_SETTING_ADS_CTA_BUTTON");
            try {
                var data_CTABUtton = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_CTAButton));
                const stringValue = data_CTABUtton.value.toString();
                const stringSplit = stringValue.split(',');
                if (stringSplit[body.CTAButtonIndex] == undefined) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed',
                    );
                }
                stringSplit[body.CTAButtonIndex] = body.CTAButton.toString();
                await this.adssettingService.updateAdsSetting(_id_setting_CTAButton, stringSplit);

                var getSetting_CTAButton = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_CTAButton));
                var adsCTAButton = await Promise.all(((getSetting_CTAButton.value.toString()).split(',')).map(async (item, index) => {
                    return {
                        CTAButtonIndex: index,
                        CTAButton: item
                    };
                }));
                return await this.errorHandler.generateAcceptResponseCodeWithData(
                    "Update setting CTA ads succesfully", adsCTAButton
                );
            } catch (e) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, ' + e.toString(),
                );
            }
        }
    }
}
