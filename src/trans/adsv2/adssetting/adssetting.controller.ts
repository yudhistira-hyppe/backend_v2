import { Body, Controller, Get, Post, UseGuards, Headers, HttpStatus, HttpCode, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { AdssettingService } from './adssetting.service';
import { UtilsService } from '../../../utils/utils.service';
import { ErrorHandler } from '../../../utils/error.handler';
import mongoose from 'mongoose';
import { AdsTypeService } from '../adstype/adstype.service';
import { AdsTypeDto } from '../adstype/dto/adstype.dto';
import { CreateTemplatesRepoDto } from '../../../infra/templates_repo/dto/create-templatesrepo.dto';
import { AdsNotificationService } from './adsnotification.service';
import { ConfigService } from '@nestjs/config';
import { AdsLogsDto } from '../adslog/dto/adslog.dto';
import { UserbasicsService } from '../../../trans/userbasics/userbasics.service';
import { AdslogsService } from '../adslog/adslog.service';
import { AdsObjectivitasService } from '../adsobjectivitas/adsobjectivitas.service';
import { AdsObjectivitasDto } from '../adsobjectivitas/dto/adsobjectivitas.dto';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { AdsPriceCreditsService } from '../adspricecredits/adspricecredits.service';
import { AdsPriceCredits } from '../adspricecredits/schema/adspricecredits.schema';
import { AdsRewardsService } from '../adsrewards/adsrewards.service';
import { AdsRewards } from '../adsrewards/schema/adsrewards.schema';

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
        private readonly adsObjectivitasService: AdsObjectivitasService,
        private readonly logapiSS: LogapisService,
        private readonly adsPriceCreditsService: AdsPriceCreditsService,
        private readonly adsRewardsService: AdsRewardsService,
        private readonly errorHandler: ErrorHandler) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    @HttpCode(HttpStatus.ACCEPTED)
    async getAdsSetting(@Headers() headers, @Body() body, @Request() req): Promise<any> {
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
        //ADS ID OBJECTIVITAS
        var _id_Objectivitas_Action = this.configService.get("ID_ADS_OBJECTTIVITAS_ACTION");
        var _remark_Objectivitas_Action_Similirity_Min = this.configService.get("REMARK_ADS_OBJECTTIVITAS_ACTION_SIMILARITY_MIN");
        var _remark_Objectivitas_Action_Similirity_Max = this.configService.get("REMARK_ADS_OBJECTTIVITAS_ACTION_SIMILARITY_MAX");

        var _id_Objectivitas_Awareness = this.configService.get("ID_ADS_OBJECTTIVITAS_AWARENESS");
        var _remark_Objectivitas_Awareness_Similirity_Min = this.configService.get("REMARK_ADS_OBJECTTIVITAS_AWARENESS_SIMILARITY_MIN");
        var _remark_Objectivitas_Awareness_Similirity_Max = this.configService.get("REMARK_ADS_OBJECTTIVITAS_AWARENESS_SIMILARITY_MAX");

        var _id_Objectivitas_Consideration = this.configService.get("ID_ADS_OBJECTTIVITAS_CONSIDERATION");
        var _remark_Objectivitas_Consideration_Similirity_Min = this.configService.get("REMARK_ADS_OBJECTTIVITAS_CONSIDERATION_SIMILARITY_MIN");
        var _remark_Objectivitas_Consideration_Similirity_Max = this.configService.get("REMARK_ADS_OBJECTTIVITAS_CONSIDERATION_SIMILARITY_MAX");

        //ADS ID TYPE ADS
        var _id_InContentAds = this.configService.get("ID_ADS_IN_CONTENT");
        var _remark_InContentAds_Duration_Min = this.configService.get("REMARK_ADS_IN_CONTENT_DURATION_MIN");
        var _remark_InContentAds_Duration_Max = this.configService.get("REMARK_ADS_IN_CONTENT_DURATION_MAX");
        var _remark_InContentAds_Skip_Time_Min = this.configService.get("REMARK_ADS_IN_CONTENT_SKIP_TIME_MIN");
        var _remark_InContentAds_Skip_Time_Max = this.configService.get("REMARK_ADS_IN_CONTENT_SKIP_TIME_MAX");
        var _remark_InContentAds_CPV_Price = this.configService.get("REMARK_ADS_IN_CONTENT_CPV_PRICE");
        var _remark_InContentAds_CPA_Price = this.configService.get("REMARK_ADS_IN_CONTENT_CPA_PRICE");
        var _remark_InContentAds_Economy_Sharing = this.configService.get("REMARK_ADS_IN_CONTENT_ECONOMY_SHARING");

        var _id_InBetweenAds = this.configService.get("ID_ADS_IN_BETWEEN");
        var _remark_InBetweenAds_Duration_Min = this.configService.get("REMARK_ADS_IN_BETWEEN_DURATION_MIN");
        var _remark_InBetweenAds_Duration_Max = this.configService.get("REMARK_ADS_IN_BETWEEN_DURATION_MAX");
        var _remark_InBetweenAds_Skip_Time_Min = this.configService.get("REMARK_ADS_IN_BETWEEN_SKIP_TIME_MIN");
        var _remark_InBetweenAds_Skip_Time_Max = this.configService.get("REMARK_ADS_IN_BETWEEN_SKIP_TIME_MAX");
        var _remark_InBetweenAds_CPV_Price = this.configService.get("REMARK_ADS_IN_BETWEEN_CPV_PRICE");
        var _remark_InBetweenAds_CPA_Price = this.configService.get("REMARK_ADS_IN_BETWEEN_CPA_PRICE");
        var _remark_InBetweenAds_Economy_Sharing = this.configService.get("REMARK_ADS_IN_BETWEEN_ECONOMY_SHARING");

        var _id_PopUpAds = this.configService.get("ID_ADS_IN_POPUP");
        var _remark_PopUpAds_Duration_Min = this.configService.get("REMARK_ADS_IN_POPUP_DURATION_MIN");
        var _remark_PopUpAds_Duration_Max = this.configService.get("REMARK_ADS_IN_POPUP_DURATION_MAX");
        var _remark_PopUpAds_Skip_Time_Min = this.configService.get("REMARK_ADS_IN_POPUP_SKIP_TIME_MIN");
        var _remark_PopUpAds_Skip_Time_Max = this.configService.get("REMARK_ADS_IN_POPUP_SKIP_TIME_MAX");
        var _remark_PopUpAds_CPV_Price = this.configService.get("REMARK_ADS_IN_POPUP_CPV_PRICE");
        var _remark_PopUpAds_CPA_Price = this.configService.get("REMARK_ADS_IN_POPUP_CPA_PRICE");
        var _remark_PopUpAds_Economy_Sharing = this.configService.get("REMARK_ADS_IN_POPUP_ECONOMY_SHARING");

        //ADS SETTING
        //var _id_setting_CreditPrice = this.configService.get("ID_SETTING_ADS_CREDIT_PRICE");
        var _remark_setting_CreditPrice = this.configService.get("REMARK_SETTING_ADS_CREDIT_PRICE");

        var _id_setting_AdsDurationMin = this.configService.get("ID_SETTING_ADS_DURATION_MIN");
        var _remark_setting_AdsDurationMin = this.configService.get("REMARK_SETTING_ADS_DURATION_MIN");

        var _id_setting_AdsDurationMax = this.configService.get("ID_SETTING_ADS_DURATION_MAX");
        var _remark_setting_AdsDurationMax = this.configService.get("REMARK_SETTING_ADS_DURATION_MAX");

        var _id_setting_AdsPlanMin = this.configService.get("ID_SETTING_ADS_PLAN_MIN");
        var _remark_setting_AdsPlanMin = this.configService.get("REMARK_SETTING_ADS_PLAN_MIN");

        var _id_setting_AdsPlanMax = this.configService.get("ID_SETTING_ADS_PLAN_MAX");
        var _remark_setting_AdsPlanMax = this.configService.get("REMARK_SETTING_ADS_PLAN_MAX");

        var _id_setting_CTAButton = this.configService.get("ID_SETTING_ADS_CTA_BUTTON");
        var _remark_setting_CTAButton = this.configService.get("REMARK_SETTING_ADS_CTA_BUTTON");

        var _id_setting_Similirity_Gender = this.configService.get("ID_SETTING_ADS_GENDER_SIMILARITY");
        var _remark_setting_Similirity_Gender = this.configService.get("REMARK_SETTING_ADS_GENDER_SIMILARITY");

        var _id_setting_Similirity_Age = this.configService.get("ID_SETTING_ADS_AGE_SIMILARITY");
        var _remark_setting_Similirity_Age = this.configService.get("REMARK_SETTING_ADS_AGE_SIMILARITY");

        var _id_setting_Similirity_Interest = this.configService.get("ID_SETTING_ADS_INTEREST_SIMILARITY");
        var _remark_setting_Similirity_Interest = this.configService.get("REMARK_SETTING_ADSINTEREST_SIMILARITY");

        var _id_setting_Similirity_Location = this.configService.get("ID_SETTING_ADS_LOCATION_SIMILARITY");
        var _remark_setting_Similirity_Location = this.configService.get("REMARK_SETTING_ADS_LOCATION_SIMILARITY");

        try {
            //----------------Get Ads Data Setting----------------
            var getSetting_Objectivitas_Action = await this.adsObjectivitasService.findOne(_id_Objectivitas_Action);
            var getSetting_Objectivitas_Awareness = await this.adsObjectivitasService.findOne(_id_Objectivitas_Awareness);
            var getSetting_Objectivitas_Consideration = await this.adsObjectivitasService.findOne(_id_Objectivitas_Consideration);
            var getSetting_InContentAds = await this.adsTypeService.findOne(_id_InContentAds);
            var getSetting_InBetweenAds = await this.adsTypeService.findOne(_id_InBetweenAds);
            var getSetting_PopUpAds = await this.adsTypeService.findOne(_id_PopUpAds);
            var getSetting_CreditPrice = await this.adsPriceCreditsService.findStatusActive();
            var getSetting_Rewards_InContentAds = await this.adsRewardsService.findStatusActive(_id_InContentAds);
            var getSetting_Rewards_InBetweenAds = await this.adsRewardsService.findStatusActive(_id_InBetweenAds);
            var getSetting_Rewards_PopUpAds = await this.adsRewardsService.findStatusActive(_id_PopUpAds);
            var getSetting_AdsDurationMin = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsDurationMin));
            var getSetting_AdsDurationMax = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsDurationMax));
            var getSetting_AdsPlanMin = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsPlanMin));
            var getSetting_AdsPlanMax = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsPlanMax));
            var getSetting_CTAButton = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_CTAButton));
            var getSetting_Similirity_Gender = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_Similirity_Gender));
            var getSetting_Similirity_Age = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_Similirity_Age));
            var getSetting_Similirity_Interest = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_Similirity_Interest));
            var getSetting_Similirity_Location = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_Similirity_Location));
            var adsCTAButton = await Promise.all(((getSetting_CTAButton.value.toString()).split(',')).map(async (item, index) => {
                return {
                    CTAButtonIndex: index,
                    CTAButton: item
                };
            }));
            var getSetting_Notification = await this.adsNotificationService.getAdsNotification("NOTIFY_REWARDS", "NOTIFICATION");

            //----------------Get Log----------------
            var AwarenessSimiliarityAudienceMin = await this.adslogsService.getLog("AwarenessSimiliarityAudienceMin");
            var AwarenessSimiliarityAudienceMax = await this.adslogsService.getLog("AwarenessSimiliarityAudienceMax");

            var ConsiderationSimiliarityAudienceMin = await this.adslogsService.getLog("ConsiderationSimiliarityAudienceMin");
            var ConsiderationSimiliarityAudienceMax = await this.adslogsService.getLog("ConsiderationSimiliarityAudienceMax");

            var ActionSimiliarityAudienceMin = await this.adslogsService.getLog("ActionSimiliarityAudienceMin");
            var ActionSimiliarityAudienceMax = await this.adslogsService.getLog("ActionSimiliarityAudienceMax");

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
            var GenderCharacteristicWeight = await this.adslogsService.getLog("GenderCharacteristicWeight");
            var AgeCharacteristicWeight = await this.adslogsService.getLog("AgeCharacteristicWeight");
            var InterestCharacteristicWeight = await this.adslogsService.getLog("InterestCharacteristicWeight");
            var LocationCharacteristicWeight = await this.adslogsService.getLog("LocationCharacteristicWeight");

            //----------------Create Response----------------
            var responseData = {
                adsCTAButton,
                adsNotification: {
                    title_id: getSetting_Notification.subject_id,
                    title_en: getSetting_Notification.subject,
                    body_id: getSetting_Notification.body_detail_id,
                    body_end: getSetting_Notification.body_detail,
                },
            }

            var adsSetting = [
                //ADS CONTENT
                {
                    Jenis: "InContentAdsDurationMin",
                    Nilai: (getSetting_InContentAds.durationMin != undefined) ? getSetting_InContentAds.durationMin : 0,
                    Unit: "Detik",
                    Aktifitas: (InContentAdsDurationMin.length > 0) ? InContentAdsDurationMin[0].userbasics_data[0].fullName : "",
                    Date: (InContentAdsDurationMin.length > 0) ? InContentAdsDurationMin[0].dateTime : "-",
                    Desc: _remark_InContentAds_Duration_Min,
                },
                {
                    Jenis: "InContentAdsDurationMax",
                    Nilai: (getSetting_InContentAds.durationMax != undefined) ? getSetting_InContentAds.durationMax : 0,
                    Unit: "Detik",
                    Aktifitas: (InContentAdsDurationMax.length > 0) ? InContentAdsDurationMax[0].userbasics_data[0].fullName : "",
                    Date: (InContentAdsDurationMax.length > 0) ? InContentAdsDurationMax[0].dateTime : "-",
                    Desc: _remark_InContentAds_Duration_Max,
                },
                {
                    Jenis: "InContentAdsSkipTimeMin",
                    Nilai: (getSetting_InContentAds.skipMin != undefined) ? getSetting_InContentAds.skipMin : 0,
                    Unit: "Detik",
                    Aktifitas: (InContentAdsSkipTimeMin.length > 0) ? InContentAdsSkipTimeMin[0].userbasics_data[0].fullName : "",
                    Date: (InContentAdsSkipTimeMin.length > 0) ? InContentAdsSkipTimeMin[0].dateTime : "-",
                    Desc: _remark_InContentAds_Skip_Time_Min,
                },
                {
                    Jenis: "InContentAdsSkipTimeMax",
                    Nilai: (getSetting_InContentAds.skipMax != undefined) ? getSetting_InContentAds.skipMax : 0,
                    Unit: "Detik",
                    Aktifitas: (InContentAdsSkipTimeMax.length > 0) ? InContentAdsSkipTimeMax[0].userbasics_data[0].fullName : "",
                    Date: (InContentAdsSkipTimeMax.length > 0) ? InContentAdsSkipTimeMax[0].dateTime : "-",
                    Desc: _remark_InContentAds_Skip_Time_Max,
                },
                {
                    Jenis: "InContentCPAPrice",
                    Nilai: (getSetting_InContentAds.CPA != undefined) ? getSetting_InContentAds.CPA : 0,
                    Unit: "Kredit",
                    Aktifitas: (InContentCPAPrice.length > 0) ? InContentCPAPrice[0].userbasics_data[0].fullName : "",
                    Date: (InContentCPAPrice.length > 0) ? InContentCPAPrice[0].dateTime : "-",
                    Desc: _remark_InContentAds_CPA_Price,
                },
                {
                    Jenis: "InContentCPVPrice",
                    Nilai: (getSetting_InContentAds.CPV != undefined) ? getSetting_InContentAds.CPV : 0,
                    Unit: "Kredit",
                    Aktifitas: (InContentCPVPrice.length > 0) ? InContentCPVPrice[0].userbasics_data[0].fullName : "",
                    Date: (InContentCPVPrice.length > 0) ? InContentCPVPrice[0].dateTime : "-",
                    Desc: _remark_InContentAds_CPV_Price,
                },
                {
                    Jenis: "EconomySharingInContent",
                    Nilai: (getSetting_Rewards_InContentAds && getSetting_Rewards_InContentAds.rewardPrice != undefined) ? getSetting_Rewards_InContentAds.rewardPrice : 0,
                    Unit: "Rupiah",
                    Aktifitas: (EconomySharingInContent.length > 0) ? EconomySharingInContent[0].userbasics_data[0].fullName : "",
                    Date: (EconomySharingInContent.length > 0) ? EconomySharingInContent[0].dateTime : "-",
                    Desc: _remark_InContentAds_Economy_Sharing,
                },
                //ADS BETWEEN
                {
                    Jenis: "InBetweenAdsDurationMin",
                    Nilai: (getSetting_InBetweenAds.durationMin != undefined) ? getSetting_InBetweenAds.durationMin : 0,
                    Unit: "Detik",
                    Aktifitas: (InBetweenAdsDurationMin.length > 0) ? InBetweenAdsDurationMin[0].userbasics_data[0].fullName : "",
                    Date: (InBetweenAdsDurationMin.length > 0) ? InBetweenAdsDurationMin[0].dateTime : "-",
                    Desc: _remark_InBetweenAds_Duration_Min,
                },
                {
                    Jenis: "InBetweenAdsDurationMax",
                    Nilai: (getSetting_InBetweenAds.durationMax != undefined) ? getSetting_InBetweenAds.durationMax : 0,
                    Unit: "Detik",
                    Aktifitas: (InBetweenAdsDurationMax.length > 0) ? InBetweenAdsDurationMax[0].userbasics_data[0].fullName : "",
                    Date: (InBetweenAdsDurationMax.length > 0) ? InBetweenAdsDurationMax[0].dateTime : "-",
                    Desc: _remark_InBetweenAds_Duration_Max,
                },
                {
                    Jenis: "InBetweenAdsSkipTimeMin",
                    Nilai: (getSetting_InBetweenAds.skipMin != undefined) ? getSetting_InBetweenAds.skipMin : 0,
                    Unit: "Detik",
                    Aktifitas: (InBetweenAdsSkipTimeMin.length > 0) ? InBetweenAdsSkipTimeMin[0].userbasics_data[0].fullName : "",
                    Date: (InBetweenAdsSkipTimeMin.length > 0) ? InBetweenAdsSkipTimeMin[0].dateTime : "-",
                    Desc: _remark_InBetweenAds_Skip_Time_Min,
                },
                {
                    Jenis: "InBetweenAdsSkipTimeMax",
                    Nilai: (getSetting_InBetweenAds.skipMax != undefined) ? getSetting_InBetweenAds.skipMax : 0,
                    Unit: "Detik",
                    Aktifitas: (InBetweenAdsSkipTimeMax.length > 0) ? InBetweenAdsSkipTimeMax[0].userbasics_data[0].fullName : "",
                    Date: (InBetweenAdsSkipTimeMax.length > 0) ? InBetweenAdsSkipTimeMax[0].dateTime : "-",
                    Desc: _remark_InBetweenAds_Skip_Time_Max,
                },
                {
                    Jenis: "InBetweenCPAPrice",
                    Nilai: (getSetting_InBetweenAds.CPA != undefined) ? getSetting_InBetweenAds.CPA : 0,
                    Unit: "Kredit",
                    Aktifitas: (InBetweenCPAPrice.length > 0) ? InBetweenCPAPrice[0].userbasics_data[0].fullName : "",
                    Date: (InBetweenCPAPrice.length > 0) ? InBetweenCPAPrice[0].dateTime : "-",
                    Desc: _remark_InBetweenAds_CPA_Price,
                },
                {
                    Jenis: "InBetweenCPVPrice",
                    Nilai: (getSetting_InBetweenAds.CPV != undefined) ? getSetting_InBetweenAds.CPV : 0,
                    Unit: "Kredit",
                    Aktifitas: (InBetweenCPVPrice.length > 0) ? InBetweenCPVPrice[0].userbasics_data[0].fullName : "",
                    Date: (InBetweenCPVPrice.length > 0) ? InBetweenCPVPrice[0].dateTime : "-",
                    Desc: _remark_InBetweenAds_CPV_Price,
                },
                {
                    Jenis: "EconomySharingInBetween",
                    Nilai: (getSetting_Rewards_InBetweenAds && getSetting_Rewards_InBetweenAds.rewardPrice != undefined) ? getSetting_Rewards_InBetweenAds.rewardPrice : 0,
                    Unit: "Rupiah",
                    Aktifitas: (EconomySharingInBetween.length > 0) ? EconomySharingInBetween[0].userbasics_data[0].fullName : "",
                    Date: (EconomySharingInBetween.length > 0) ? EconomySharingInBetween[0].dateTime : "-",
                    Desc: _remark_InBetweenAds_Economy_Sharing,
                },
                //ADS POPUP
                {
                    Jenis: "PopUpAdsDurationMin",
                    Nilai: (getSetting_PopUpAds.durationMin != undefined) ? getSetting_PopUpAds.durationMin : 0,
                    Unit: "Detik",
                    Aktifitas: (PopUpAdsDurationMin.length > 0) ? PopUpAdsDurationMin[0].userbasics_data[0].fullName : "",
                    Date: (PopUpAdsDurationMin.length > 0) ? PopUpAdsDurationMin[0].dateTime : "-",
                    Desc: _remark_PopUpAds_Duration_Min,
                },
                {
                    Jenis: "PopUpAdsDurationMax",
                    Nilai: (getSetting_PopUpAds.durationMax != undefined) ? getSetting_PopUpAds.durationMax : 0,
                    Unit: "Detik",
                    Aktifitas: (PopUpAdsDurationMax.length > 0) ? PopUpAdsDurationMax[0].userbasics_data[0].fullName : "",
                    Date: (PopUpAdsDurationMax.length > 0) ? PopUpAdsDurationMax[0].dateTime : "-",
                    Desc: _remark_PopUpAds_Duration_Max,
                },
                {
                    Jenis: "PopUpAdsSkipTimeMin",
                    Nilai: (getSetting_PopUpAds.skipMin != undefined) ? getSetting_PopUpAds.skipMin : 0,
                    Unit: "Detik",
                    Aktifitas: (PopUpAdsSkipTimeMin.length > 0) ? PopUpAdsSkipTimeMin[0].userbasics_data[0].fullName : "",
                    Date: (PopUpAdsSkipTimeMin.length > 0) ? PopUpAdsSkipTimeMin[0].dateTime : "-",
                    Desc: _remark_PopUpAds_Skip_Time_Min,
                },
                {
                    Jenis: "PopUpAdsSkipTimeMax",
                    Nilai: (getSetting_PopUpAds.skipMax != undefined) ? getSetting_PopUpAds.skipMax : 0,
                    Unit: "Detik",
                    Aktifitas: (PopUpAdsSkipTimeMax.length > 0) ? PopUpAdsSkipTimeMax[0].userbasics_data[0].fullName : "",
                    Date: (PopUpAdsSkipTimeMax.length > 0) ? PopUpAdsSkipTimeMax[0].dateTime : "-",
                    Desc: _remark_PopUpAds_Skip_Time_Max,
                },
                {
                    Jenis: "PopUpCPAPrice",
                    Nilai: (getSetting_PopUpAds.CPA != undefined) ? getSetting_PopUpAds.CPA : 0,
                    Unit: "Kredit",
                    Aktifitas: (PopUpCPAPrice.length > 0) ? PopUpCPAPrice[0].userbasics_data[0].fullName : "",
                    Date: (PopUpCPAPrice.length > 0) ? PopUpCPAPrice[0].dateTime : "-",
                    Desc: _remark_PopUpAds_CPA_Price,
                },
                {
                    Jenis: "PopUpCPVPrice",
                    Nilai: (getSetting_PopUpAds.CPV != undefined) ? getSetting_PopUpAds.CPV : 0,
                    Unit: "Kredit",
                    Aktifitas: (PopUpCPVPrice.length > 0) ? PopUpCPVPrice[0].userbasics_data[0].fullName : "",
                    Date: (PopUpCPVPrice.length > 0) ? PopUpCPVPrice[0].dateTime : "-",
                    Desc: _remark_PopUpAds_CPV_Price,
                },
                {
                    Jenis: "EconomySharingSPonsorPopUp",
                    Nilai: (getSetting_Rewards_PopUpAds && getSetting_Rewards_PopUpAds.rewardPrice != undefined) ? getSetting_Rewards_PopUpAds.rewardPrice : 0,
                    Unit: "Rupiah",
                    Aktifitas: (EconomySharingSPonsorPopUp.length > 0) ? EconomySharingSPonsorPopUp[0].userbasics_data[0].fullName : "",
                    Date: (EconomySharingSPonsorPopUp.length > 0) ? EconomySharingSPonsorPopUp[0].dateTime : "-",
                    Desc: _remark_PopUpAds_Economy_Sharing,
                },
                //OBJECTIVITAS
                {
                    Jenis: "ActionSimiliarityAudienceMin",
                    Nilai: (getSetting_Objectivitas_Action.percentageMin != undefined) ? getSetting_Objectivitas_Action.percentageMin : 0,
                    Unit: "Persen",
                    Aktifitas: (ActionSimiliarityAudienceMin.length > 0) ? ActionSimiliarityAudienceMin[0].userbasics_data[0].fullName : "",
                    Date: (ActionSimiliarityAudienceMin.length > 0) ? ActionSimiliarityAudienceMin[0].dateTime : "-",
                    Desc: _remark_Objectivitas_Action_Similirity_Min,
                },
                {
                    Jenis: "ActionSimiliarityAudienceMax",
                    Nilai: (getSetting_Objectivitas_Action.percentageMax != undefined) ? getSetting_Objectivitas_Action.percentageMax : 0,
                    Unit: "Persen",
                    Aktifitas: (ActionSimiliarityAudienceMax.length > 0) ? ActionSimiliarityAudienceMax[0].userbasics_data[0].fullName : "",
                    Date: (ActionSimiliarityAudienceMax.length > 0) ? ActionSimiliarityAudienceMax[0].dateTime : "-",
                    Desc: _remark_Objectivitas_Action_Similirity_Max,
                },
                {
                    Jenis: "ConsiderationSimiliarityAudienceMin",
                    Nilai: (getSetting_Objectivitas_Consideration.percentageMin != undefined) ? getSetting_Objectivitas_Consideration.percentageMin : 0,
                    Unit: "Persen",
                    Aktifitas: (ConsiderationSimiliarityAudienceMin.length > 0) ? ConsiderationSimiliarityAudienceMin[0].userbasics_data[0].fullName : "",
                    Date: (ConsiderationSimiliarityAudienceMin.length > 0) ? ConsiderationSimiliarityAudienceMin[0].dateTime : "-",
                    Desc: _remark_Objectivitas_Consideration_Similirity_Min,
                },
                {
                    Jenis: "ConsiderationSimiliarityAudienceMax",
                    Nilai: (getSetting_Objectivitas_Consideration.percentageMax != undefined) ? getSetting_Objectivitas_Consideration.percentageMax : 0,
                    Unit: "Persen",
                    Aktifitas: (ConsiderationSimiliarityAudienceMax.length > 0) ? ConsiderationSimiliarityAudienceMax[0].userbasics_data[0].fullName : "",
                    Date: (ConsiderationSimiliarityAudienceMax.length > 0) ? ConsiderationSimiliarityAudienceMax[0].dateTime : "-",
                    Desc: _remark_Objectivitas_Consideration_Similirity_Max,
                },
                {
                    Jenis: "AwarenessSimiliarityAudienceMin",
                    Nilai: (getSetting_Objectivitas_Awareness.percentageMin != undefined) ? getSetting_Objectivitas_Awareness.percentageMin : 0,
                    Unit: "Persen",
                    Aktifitas: (AwarenessSimiliarityAudienceMin.length > 0) ? AwarenessSimiliarityAudienceMin[0].userbasics_data[0].fullName : "",
                    Date: (AwarenessSimiliarityAudienceMin.length > 0) ? AwarenessSimiliarityAudienceMin[0].dateTime : "-",
                    Desc: _remark_Objectivitas_Awareness_Similirity_Min,
                },
                {
                    Jenis: "AwarenessSimiliarityAudienceMax",
                    Nilai: (getSetting_Objectivitas_Awareness.percentageMax != undefined) ? getSetting_Objectivitas_Awareness.percentageMax : 0,
                    Unit: "Persen",
                    Aktifitas: (AwarenessSimiliarityAudienceMax.length > 0) ? AwarenessSimiliarityAudienceMax[0].userbasics_data[0].fullName : "",
                    Date: (AwarenessSimiliarityAudienceMax.length > 0) ? AwarenessSimiliarityAudienceMax[0].dateTime : "-",
                    Desc: _remark_Objectivitas_Awareness_Similirity_Max,
                },
                //ADS SETTING
                {
                    Jenis: "CreditPrice",
                    Nilai: (getSetting_CreditPrice.creditPrice != undefined) ? getSetting_CreditPrice.creditPrice : 0,
                    Unit: getSetting_CreditPrice.remark,
                    Aktifitas: (CreditPrice.length > 0) ? CreditPrice[0].userbasics_data[0].fullName : "",
                    Date: (CreditPrice.length > 0) ? CreditPrice[0].dateTime : "-",
                    Desc: _remark_setting_CreditPrice,
                },
                {
                    Jenis: "AdsDurationMin",
                    Nilai: (getSetting_AdsDurationMin.value != undefined) ? getSetting_AdsDurationMin.value : 0,
                    Unit: getSetting_AdsDurationMin.remark,
                    Aktifitas: (AdsDurationMin.length > 0) ? AdsDurationMin[0].userbasics_data[0].fullName : "",
                    Date: (AdsDurationMin.length > 0) ? AdsDurationMin[0].dateTime : "-",
                    Desc: _remark_setting_AdsDurationMin,
                },
                {
                    Jenis: "AdsDurationMax",
                    Nilai: (getSetting_AdsDurationMax.value != undefined) ? getSetting_AdsDurationMax.value : 0,
                    Unit: getSetting_AdsDurationMax.remark,
                    Aktifitas: (AdsDurationMax.length > 0) ? AdsDurationMax[0].userbasics_data[0].fullName : "",
                    Date: (AdsDurationMax.length > 0) ? AdsDurationMax[0].dateTime : "-",
                    Desc: _remark_setting_AdsDurationMax,
                },
                {
                    Jenis: "AdsPlanMin",
                    Nilai: (getSetting_AdsPlanMin.value != undefined) ? getSetting_AdsPlanMin.value : 0,
                    Unit: getSetting_AdsPlanMin.remark,
                    Aktifitas: (AdsPlanMin.length > 0) ? AdsPlanMin[0].userbasics_data[0].fullName : "",
                    Date: (AdsPlanMin.length > 0) ? AdsPlanMin[0].dateTime : "-",
                    Desc: _remark_setting_AdsPlanMin,
                },
                {
                    Jenis: "AdsPlanMax",
                    Nilai: (getSetting_AdsPlanMax.value != undefined) ? getSetting_AdsPlanMax.value : 0,
                    Unit: getSetting_AdsPlanMax.remark,
                    Aktifitas: (AdsPlanMax.length > 0) ? AdsPlanMax[0].userbasics_data[0].fullName : "",
                    Date: (AdsPlanMax.length > 0) ? AdsPlanMax[0].dateTime : "-",
                    Desc: _remark_setting_AdsPlanMax,
                },
                {
                    Jenis: "GenderCharacteristicWeight",
                    Nilai: (getSetting_Similirity_Gender.value != undefined) ? getSetting_Similirity_Gender.value : 0,
                    Unit: "Persen",
                    Aktifitas: (GenderCharacteristicWeight.length > 0) ? GenderCharacteristicWeight[0].userbasics_data[0].fullName : "",
                    Date: (GenderCharacteristicWeight.length > 0) ? GenderCharacteristicWeight[0].dateTime : "-",
                    Desc: _remark_setting_Similirity_Gender,
                },
                {
                    Jenis: "AgeCharacteristicWeight",
                    Nilai: (getSetting_Similirity_Age.value != undefined) ? getSetting_Similirity_Age.value : 0,
                    Unit: "Persen",
                    Aktifitas: (AgeCharacteristicWeight.length > 0) ? AgeCharacteristicWeight[0].userbasics_data[0].fullName : "",
                    Date: (AgeCharacteristicWeight.length > 0) ? AgeCharacteristicWeight[0].dateTime : "-",
                    Desc: _remark_setting_Similirity_Age,
                },
                {
                    Jenis: "InterestCharacteristicWeight",
                    Nilai: (getSetting_Similirity_Interest.value != undefined) ? getSetting_Similirity_Interest.value : 0,
                    Unit: "Persen",
                    Aktifitas: (InterestCharacteristicWeight.length > 0) ? InterestCharacteristicWeight[0].userbasics_data[0].fullName : "",
                    Date: (InterestCharacteristicWeight.length > 0) ? InterestCharacteristicWeight[0].dateTime : "-",
                    Desc: _remark_setting_Similirity_Interest,
                },
                {
                    Jenis: "LocationCharacteristicWeight",
                    Nilai: (getSetting_Similirity_Location.value != undefined) ? getSetting_Similirity_Location.value : 0,
                    Unit: "Persen",
                    Aktifitas: (LocationCharacteristicWeight.length > 0) ? LocationCharacteristicWeight[0].userbasics_data[0].fullName : "",
                    Date: (LocationCharacteristicWeight.length > 0) ? LocationCharacteristicWeight[0].dateTime : "-",
                    Desc: _remark_setting_Similirity_Location,
                },
            ];

            var adsSettingFilter = null;
            if (body.search != undefined) {
                if (body.search != "") {
                    var search = body.search.toLowerCase();
                    var condition = new RegExp(search);
                    if (body.type != undefined) {
                        if (body.type == "JENIS") {
                            adsSettingFilter = adsSetting.filter(function (el) {
                                return condition.test(el.Jenis.toLowerCase());
                            });
                        }
                        if (body.type == "DESKRIPSI") {
                            adsSettingFilter = adsSetting.filter(function (el) {
                                return condition.test(el.Desc.toLowerCase());
                            });
                        }
                    } else {
                        adsSettingFilter = adsSetting;
                    }
                } else {
                    adsSettingFilter = adsSetting;
                }
            } else {
                adsSettingFilter = adsSetting;
            }

            if (body.sort != undefined) {
                if (body.sort == "A-Z") {
                    adsSettingFilter.sort((a, b) => (a.Jenis > b.Jenis ? 1 : -1));
                } else if (body.sort == "Z-A") {
                    adsSettingFilter.sort((a, b) => (a.Jenis < b.Jenis ? 1 : -1));
                } else {
                    adsSettingFilter.sort((a, b) => (a.Jenis > b.Jenis ? 1 : -1));
                }
            } else {
                adsSettingFilter.sort((a, b) => (a.Jenis > b.Jenis ? 1 : -1));
            }

            responseData['adsSetting'] = adsSettingFilter;

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Get setting ads succesfully", responseData
            );
        } catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ' + e.toString(),
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('update')
    @HttpCode(HttpStatus.ACCEPTED)
    async updateAdsSetting(@Body() body, @Headers() headers, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var reqbody = JSON.parse(JSON.stringify(body));

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }

        //--------------------GET USERID--------------------
        const ubasic = await this.userbasicsService.findOne(headers['x-auth-user']);
        //ADS ID OBJECTIVITAS
        var _id_Objectivitas_Action = this.configService.get("ID_ADS_OBJECTTIVITAS_ACTION");
        var _remark_Objectivitas_Action_Similirity_Min = this.configService.get("REMARK_ADS_OBJECTTIVITAS_ACTION_SIMILARITY_MIN");
        var _remark_Objectivitas_Action_Similirity_Max = this.configService.get("REMARK_ADS_OBJECTTIVITAS_ACTION_SIMILARITY_MAX");

        var _id_Objectivitas_Awareness = this.configService.get("ID_ADS_OBJECTTIVITAS_AWARENESS");
        var _remark_Objectivitas_Awareness_Similirity_Min = this.configService.get("REMARK_ADS_OBJECTTIVITAS_AWARENESS_SIMILARITY_MIN");
        var _remark_Objectivitas_Awareness_Similirity_Max = this.configService.get("REMARK_ADS_OBJECTTIVITAS_AWARENESS_SIMILARITY_MAX");

        var _id_Objectivitas_Consideration = this.configService.get("ID_ADS_OBJECTTIVITAS_CONSIDERATION");
        var _remark_Objectivitas_Consideration_Similirity_Min = this.configService.get("REMARK_ADS_OBJECTTIVITAS_CONSIDERATION_SIMILARITY_MIN");
        var _remark_Objectivitas_Consideration_Similirity_Max = this.configService.get("REMARK_ADS_OBJECTTIVITAS_CONSIDERATION_SIMILARITY_MAX");

        //ADS ID TYPE ADS
        var _id_InContentAds = this.configService.get("ID_ADS_IN_CONTENT");
        var _remark_InContentAds_Duration_Min = this.configService.get("REMARK_ADS_IN_CONTENT_DURATION_MIN");
        var _remark_InContentAds_Duration_Max = this.configService.get("REMARK_ADS_IN_CONTENT_DURATION_MAX");
        var _remark_InContentAds_Skip_Time_Min = this.configService.get("REMARK_ADS_IN_CONTENT_SKIP_TIME_MIN");
        var _remark_InContentAds_Skip_Time_Max = this.configService.get("REMARK_ADS_IN_CONTENT_SKIP_TIME_MAX");
        var _remark_InContentAds_CPV_Price = this.configService.get("REMARK_ADS_IN_CONTENT_CPV_PRICE");
        var _remark_InContentAds_CPA_Price = this.configService.get("REMARK_ADS_IN_CONTENT_CPA_PRICE");
        var _remark_InContentAds_Economy_Sharing = this.configService.get("REMARK_ADS_IN_CONTENT_ECONOMY_SHARING");

        var _id_InBetweenAds = this.configService.get("ID_ADS_IN_BETWEEN");
        var _remark_InBetweenAds_Duration_Min = this.configService.get("REMARK_ADS_IN_BETWEEN_DURATION_MIN");
        var _remark_InBetweenAds_Duration_Max = this.configService.get("REMARK_ADS_IN_BETWEEN_DURATION_MAX");
        var _remark_InBetweenAds_Skip_Time_Min = this.configService.get("REMARK_ADS_IN_BETWEEN_SKIP_TIME_MIN");
        var _remark_InBetweenAds_Skip_Time_Max = this.configService.get("REMARK_ADS_IN_BETWEEN_SKIP_TIME_MAX");
        var _remark_InBetweenAds_CPV_Price = this.configService.get("REMARK_ADS_IN_BETWEEN_CPV_PRICE");
        var _remark_InBetweenAds_CPA_Price = this.configService.get("REMARK_ADS_IN_BETWEEN_CPA_PRICE");
        var _remark_InBetweenAds_Economy_Sharing = this.configService.get("REMARK_ADS_IN_BETWEEN_ECONOMY_SHARING");

        var _id_PopUpAds = this.configService.get("ID_ADS_IN_POPUP");
        var _remark_PopUpAds_Duration_Min = this.configService.get("REMARK_ADS_IN_POPUP_DURATION_MIN");
        var _remark_PopUpAds_Duration_Max = this.configService.get("REMARK_ADS_IN_POPUP_DURATION_MAX");
        var _remark_PopUpAds_Skip_Time_Min = this.configService.get("REMARK_ADS_IN_POPUP_SKIP_TIME_MIN");
        var _remark_PopUpAds_Skip_Time_Max = this.configService.get("REMARK_ADS_IN_POPUP_SKIP_TIME_MAX");
        var _remark_PopUpAds_CPV_Price = this.configService.get("REMARK_ADS_IN_POPUP_CPV_PRICE");
        var _remark_PopUpAds_CPA_Price = this.configService.get("REMARK_ADS_IN_POPUP_CPA_PRICE");
        var _remark_PopUpAds_Economy_Sharing = this.configService.get("REMARK_ADS_IN_POPUP_ECONOMY_SHARING");

        //ADS SETTING
        //var _id_setting_CreditPrice = this.configService.get("ID_SETTING_ADS_CREDIT_PRICE");
        var _remark_setting_CreditPrice = this.configService.get("REMARK_SETTING_ADS_CREDIT_PRICE");

        var _id_setting_AdsDurationMin = this.configService.get("ID_SETTING_ADS_DURATION_MIN");
        var _remark_setting_AdsDurationMin = this.configService.get("REMARK_SETTING_ADS_DURATION_MIN");

        var _id_setting_AdsDurationMax = this.configService.get("ID_SETTING_ADS_DURATION_MAX");
        var _remark_setting_AdsDurationMax = this.configService.get("REMARK_SETTING_ADS_DURATION_MAX");

        var _id_setting_AdsPlanMin = this.configService.get("ID_SETTING_ADS_PLAN_MIN");
        var _remark_setting_AdsPlanMin = this.configService.get("REMARK_SETTING_ADS_PLAN_MIN");

        var _id_setting_AdsPlanMax = this.configService.get("ID_SETTING_ADS_PLAN_MAX");
        var _remark_setting_AdsPlanMax = this.configService.get("REMARK_SETTING_ADS_PLAN_MAX");

        var _id_setting_CTAButton = this.configService.get("ID_SETTING_ADS_CTA_BUTTON");
        var _remark_setting_CTAButton = this.configService.get("REMARK_SETTING_ADS_CTA_BUTTON");

        var _id_setting_Similirity_Gender = this.configService.get("ID_SETTING_ADS_GENDER_SIMILARITY");
        var _remark_setting_Similirity_Gender = this.configService.get("REMARK_SETTING_ADS_GENDER_SIMILARITY");

        var _id_setting_Similirity_Age = this.configService.get("ID_SETTING_ADS_AGE_SIMILARITY");
        var _remark_setting_Similirity_Age = this.configService.get("REMARK_SETTING_ADS_AGE_SIMILARITY");

        var _id_setting_Similirity_Interest = this.configService.get("ID_SETTING_ADS_INTEREST_SIMILARITY");
        var _remark_setting_Similirity_Interest = this.configService.get("REMARK_SETTING_ADSINTEREST_SIMILARITY");

        var _id_setting_Similirity_Location = this.configService.get("ID_SETTING_ADS_LOCATION_SIMILARITY");
        var _remark_setting_Similirity_Location = this.configService.get("REMARK_SETTING_ADS_LOCATION_SIMILARITY");

        var AdsLogsDto_ = new AdsLogsDto();
        var nameActivitas: string[] = [];

        //----------------ADS Objectivitas Action----------------
        if (
            (body.ActionSimiliarityAudienceMin != undefined) ||
            (body.ActionSimiliarityAudienceMax != undefined)
        ) {
            var AdsObjectivitasDto_ = new AdsObjectivitasDto();
            //----------------SIMILIRITY MIN----------------
            if (body.ActionSimiliarityAudienceMin != undefined) {
                //VALIDASI PARAM value
                var ceck_ActionSimiliarityAudienceMin = await this.utilsService.validateParam("ActionSimiliarityAudienceMin", body.ActionSimiliarityAudienceMin, "number")
                if (ceck_ActionSimiliarityAudienceMin != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_ActionSimiliarityAudienceMin,
                    );
                }
                AdsObjectivitasDto_.percentageMin = body.ActionSimiliarityAudienceMin;
                nameActivitas.push("ActionSimiliarityAudienceMin");
            }
            //----------------DURATION MAX----------------
            if (body.ActionSimiliarityAudienceMax != undefined) {
                //VALIDASI PARAM value
                var ceck_ActionSimiliarityAudienceMax = await this.utilsService.validateParam("ActionSimiliarityAudienceMax", body.ActionSimiliarityAudienceMax, "number")
                if (ceck_ActionSimiliarityAudienceMax != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_ActionSimiliarityAudienceMax,
                    );
                }
                AdsObjectivitasDto_.percentageMax = body.ActionSimiliarityAudienceMax;
                nameActivitas.push("ActionSimiliarityAudienceMax");
            }
            try {
                await this.adsObjectivitasService.update(_id_Objectivitas_Action, AdsObjectivitasDto_);
            } catch (e) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, ' + e.toString(),
                );
            }
        }

        //----------------ADS Objectivitas Awareness----------------
        if (
            (body.AwarenessSimiliarityAudienceMin != undefined) ||
            (body.AwarenessSimiliarityAudienceMax != undefined)
        ) {
            var AdsObjectivitasDto_ = new AdsObjectivitasDto();
            //----------------SIMILIRITY MIN----------------
            if (body.AwarenessSimiliarityAudienceMin != undefined) {
                //VALIDASI PARAM value
                var ceck_AwarenessSimiliarityAudienceMin = await this.utilsService.validateParam("AwarenessSimiliarityAudienceMin", body.AwarenessSimiliarityAudienceMin, "number")
                if (ceck_AwarenessSimiliarityAudienceMin != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_AwarenessSimiliarityAudienceMin,
                    );
                }
                AdsObjectivitasDto_.percentageMin = body.AwarenessSimiliarityAudienceMin;
                nameActivitas.push("AwarenessSimiliarityAudienceMin");
            }
            //----------------DURATION MAX----------------
            if (body.AwarenessSimiliarityAudienceMax != undefined) {
                //VALIDASI PARAM value
                var ceck_AwarenessSimiliarityAudienceMax = await this.utilsService.validateParam("AwarenessSimiliarityAudienceMax", body.AwarenessSimiliarityAudienceMax, "number")
                if (ceck_AwarenessSimiliarityAudienceMax != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_AwarenessSimiliarityAudienceMax,
                    );
                }
                AdsObjectivitasDto_.percentageMax = body.AwarenessSimiliarityAudienceMax;
                nameActivitas.push("AwarenessSimiliarityAudienceMax");
            }
            try {
                await this.adsObjectivitasService.update(_id_Objectivitas_Awareness, AdsObjectivitasDto_);
            } catch (e) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, ' + e.toString(),
                );
            }
        }

        //----------------ADS Objectivitas Consideration----------------
        if (
            (body.ConsiderationSimiliarityAudienceMin != undefined) ||
            (body.ConsiderationSimiliarityAudienceMax != undefined)
        ) {
            var AdsObjectivitasDto_ = new AdsObjectivitasDto();
            //----------------SIMILIRITY MIN----------------
            if (body.ConsiderationSimiliarityAudienceMin != undefined) {
                //VALIDASI PARAM value
                var ceck_ConsiderationSimiliarityAudienceMin = await this.utilsService.validateParam("ConsiderationSimiliarityAudienceMin", body.ConsiderationSimiliarityAudienceMin, "number")
                if (ceck_ConsiderationSimiliarityAudienceMin != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_ConsiderationSimiliarityAudienceMin,
                    );
                }
                AdsObjectivitasDto_.percentageMin = body.ConsiderationSimiliarityAudienceMin;
                nameActivitas.push("ConsiderationSimiliarityAudienceMin");
            }
            //----------------DURATION MAX----------------
            if (body.ConsiderationSimiliarityAudienceMax != undefined) {
                //VALIDASI PARAM value
                var ceck_ConsiderationSimiliarityAudienceMax = await this.utilsService.validateParam("ConsiderationSimiliarityAudienceMax", body.ConsiderationSimiliarityAudienceMax, "number")
                if (ceck_ConsiderationSimiliarityAudienceMax != "") {
                    await this.errorHandler.generateBadRequestException(
                        ceck_ConsiderationSimiliarityAudienceMax,
                    );
                }
                AdsObjectivitasDto_.percentageMax = body.ConsiderationSimiliarityAudienceMax;
                nameActivitas.push("ConsiderationSimiliarityAudienceMax");
            }
            try {
                await this.adsObjectivitasService.update(_id_Objectivitas_Consideration, AdsObjectivitasDto_);
            } catch (e) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, ' + e.toString(),
                );
            }
        }

        //----------------In Content Ads----------------
        if (
            (body.InContentAdsDurationMin != undefined) ||
            (body.InContentAdsDurationMax != undefined) ||
            (body.InContentAdsSkipTimeMin != undefined) ||
            (body.InContentAdsSkipTimeMax != undefined) ||
            (body.InContentCPAPrice != undefined) ||
            (body.InContentCPVPrice != undefined)
        ) {
            var AdsTypeDto_ = new AdsTypeDto();
            //----------------DURATION MIN----------------
            if (body.InContentAdsDurationMin != undefined) {
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
            // //----------------ECONOMY SHARING----------------
            // if (body.EconomySharingInContent != undefined) {
            //     //VALIDASI PARAM value
            //     var ceck_EconomySharingInContent = await this.utilsService.validateParam("EconomySharingInContent", body.EconomySharingInContent, "number")
            //     if (ceck_EconomySharingInContent != "") {
            //         await this.errorHandler.generateBadRequestException(
            //             ceck_EconomySharingInContent,
            //         );
            //     }
            //     AdsTypeDto_.rewards = body.EconomySharingInContent;
            //     nameActivitas.push("EconomySharingInContent");
            // }
            try {
                await this.adsTypeService.update(_id_InContentAds, AdsTypeDto_);
            } catch (e) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, ' + e.toString(),
                );
            }
        }

        if ((body.EconomySharingInContent != undefined)) {
            //VALIDASI PARAM value
            var ceck_EconomySharingInContent = await this.utilsService.validateParam("EconomySharingInContent", body.EconomySharingInContent, "number")
            if (ceck_EconomySharingInContent != "") {
                await this.errorHandler.generateBadRequestException(
                    ceck_EconomySharingInContent,
                );
            }
            var getSetting_InContentAds_ = await this.adsTypeService.findOne(_id_InContentAds);
            try {
                nameActivitas.push("EconomySharingInContent");
                const currentDate = await this.utilsService.getDateTimeISOString()
                let AdsRewards_ = new AdsRewards();
                AdsRewards_._id = new mongoose.Types.ObjectId();
                AdsRewards_.iduser = new mongoose.Types.ObjectId(ubasic._id.toString());
                AdsRewards_.idAdsType = new mongoose.Types.ObjectId(getSetting_InContentAds_._id.toString());
                AdsRewards_.nameType = getSetting_InContentAds_.nameType.toString();
                AdsRewards_.createAt = currentDate;
                AdsRewards_.updateAt = currentDate;
                AdsRewards_.status = true;
                AdsRewards_.rewardPrice = body.EconomySharingInContent;
                await this.adsRewardsService.create(AdsRewards_);
            } catch (e) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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
            (body.InBetweenCPVPrice != undefined)
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
            // if (body.EconomySharingInBetween != undefined) {
            //     //VALIDASI PARAM value
            //     var ceck_EconomySharingInBetween = await this.utilsService.validateParam("EconomySharingInBetween", body.EconomySharingInBetween, "number")
            //     if (ceck_EconomySharingInBetween != "") {
            //         await this.errorHandler.generateBadRequestException(
            //             ceck_EconomySharingInBetween,
            //         );
            //     }
            //     AdsTypeDto_.rewards = body.EconomySharingInBetween;
            //     nameActivitas.push("EconomySharingInBetween");
            // }
            try {
                await this.adsTypeService.update(_id_InBetweenAds, AdsTypeDto_);
            } catch (e) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, ' + e.toString(),
                );
            }
        }

        if ((body.EconomySharingInBetween != undefined)) {
            //VALIDASI PARAM value
            var ceck_EconomySharingInBetween = await this.utilsService.validateParam("EconomySharingInBetween", body.EconomySharingInBetween, "number")
            if (ceck_EconomySharingInBetween != "") {
                await this.errorHandler.generateBadRequestException(
                    ceck_EconomySharingInBetween,
                );
            }
            var getSetting_InBetweenAds_ = await this.adsTypeService.findOne(_id_InBetweenAds);
            try {
                nameActivitas.push("EconomySharingInBetween");
                const currentDate = await this.utilsService.getDateTimeISOString()
                let AdsRewards_ = new AdsRewards();
                AdsRewards_._id = new mongoose.Types.ObjectId();
                AdsRewards_.iduser = new mongoose.Types.ObjectId(ubasic._id.toString());
                AdsRewards_.idAdsType = new mongoose.Types.ObjectId(getSetting_InBetweenAds_._id.toString());
                AdsRewards_.nameType = getSetting_InBetweenAds_.nameType.toString();
                AdsRewards_.createAt = currentDate;
                AdsRewards_.updateAt = currentDate;
                AdsRewards_.status = true;
                AdsRewards_.rewardPrice = body.EconomySharingInBetween;
                await this.adsRewardsService.create(AdsRewards_);
            } catch (e) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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
            (body.PopUpCPVPrice != undefined)
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
            // if (body.EconomySharingSPonsorPopUp != undefined) {
            //     //VALIDASI PARAM value
            //     var ceck_EconomySharingSPonsorPopUp = await this.utilsService.validateParam("EconomySharingSPonsorPopUp", body.EconomySharingSPonsorPopUp, "number")
            //     if (ceck_EconomySharingSPonsorPopUp != "") {
            //         await this.errorHandler.generateBadRequestException(
            //             ceck_EconomySharingSPonsorPopUp,
            //         );
            //     }
            //     AdsTypeDto_.rewards = body.EconomySharingSPonsorPopUp;
            //     nameActivitas.push("EconomySharingSPonsorPopUp");
            // }
            try {
                await this.adsTypeService.update(_id_PopUpAds, AdsTypeDto_);
            } catch (e) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, ' + e.toString(),
                );
            }
        }

        if ((body.EconomySharingSPonsorPopUp != undefined)) {
            //VALIDASI PARAM value
            var ceck_EconomySharingSPonsorPopUp = await this.utilsService.validateParam("EconomySharingSPonsorPopUp", body.EconomySharingSPonsorPopUp, "number")
            if (ceck_EconomySharingSPonsorPopUp != "") {
                await this.errorHandler.generateBadRequestException(
                    ceck_EconomySharingSPonsorPopUp,
                );
            }
            var getSetting_PopUpAds_ = await this.adsTypeService.findOne(_id_PopUpAds);
            try {
                nameActivitas.push("EconomySharingInBetween");
                const currentDate = await this.utilsService.getDateTimeISOString()
                let AdsRewards_ = new AdsRewards();
                AdsRewards_._id = new mongoose.Types.ObjectId();
                AdsRewards_.iduser = new mongoose.Types.ObjectId(ubasic._id.toString());
                AdsRewards_.idAdsType = new mongoose.Types.ObjectId(getSetting_PopUpAds_._id.toString());
                AdsRewards_.nameType = getSetting_PopUpAds_.nameType.toString();
                AdsRewards_.createAt = currentDate;
                AdsRewards_.updateAt = currentDate;
                AdsRewards_.status = true;
                AdsRewards_.rewardPrice = body.EconomySharingSPonsorPopUp;
                await this.adsRewardsService.create(AdsRewards_);
            } catch (e) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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
            (body.CTAButtonText != undefined) ||
            (body.GenderCharacteristicWeight != undefined) ||
            (body.AgeCharacteristicWeight != undefined) ||
            (body.InterestCharacteristicWeight != undefined) ||
            (body.LocationCharacteristicWeight != undefined)
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
                    const currentDate = await this.utilsService.getDateTimeISOString()
                    let AdsPriceCredits_ = new AdsPriceCredits();
                    AdsPriceCredits_._id = new mongoose.Types.ObjectId();
                    AdsPriceCredits_.iduser = new mongoose.Types.ObjectId(ubasic._id.toString());
                    AdsPriceCredits_.createAt = currentDate;
                    AdsPriceCredits_.updateAt = currentDate;
                    AdsPriceCredits_.status = true;
                    AdsPriceCredits_.creditPrice = body.CreditPrice;
                    await this.adsPriceCreditsService.create(AdsPriceCredits_);
                } catch (e) {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                    await this.errorHandler.generateBadRequestException(
                        ceck_AdsDurationMax,
                    );
                }
                try {
                    nameActivitas.push("AdsDurationMax");
                    await this.adssettingService.updateAdsSetting(_id_setting_AdsDurationMax, body.AdsDurationMax);
                } catch (e) {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                    await this.errorHandler.generateBadRequestException(
                        ceck_AdsPlanMin,
                    );
                }
                try {
                    nameActivitas.push("AdsPlanMin");
                    await this.adssettingService.updateAdsSetting(_id_setting_AdsPlanMin, body.AdsPlanMin);
                } catch (e) {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                    await this.errorHandler.generateBadRequestException(
                        ceck_AdsPlanMax,
                    );
                }
                try {
                    nameActivitas.push("AdsPlanMax");
                    await this.adssettingService.updateAdsSetting(_id_setting_AdsPlanMax, body.AdsPlanMax);
                } catch (e) {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed, ' + e.toString(),
                    );
                }
            }
            //----------------CTA BUTTON----------------
            console.log(body.CTAButtonText);
            if (body.CTAButtonText != undefined) {
                try {
                    await this.adssettingService.updateAdsSetting(_id_setting_CTAButton, body.CTAButtonText);
                } catch (e) {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed, ' + e.toString(),
                    );
                }
            }
            //----------------ADS GENDER SIMILIRITY----------------
            if (body.GenderCharacteristicWeight != undefined) {
                //VALIDASI PARAM value
                var ceck_GenderCharacteristicWeight = await this.utilsService.validateParam("GenderCharacteristicWeight", body.GenderCharacteristicWeight, "number")
                if (ceck_GenderCharacteristicWeight != "") {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                    await this.errorHandler.generateBadRequestException(
                        ceck_GenderCharacteristicWeight,
                    );
                }
                try {
                    nameActivitas.push("GenderCharacteristicWeight");
                    await this.adssettingService.updateAdsSetting(_id_setting_Similirity_Gender, body.GenderCharacteristicWeight);
                } catch (e) {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed, ' + e.toString(),
                    );
                }
            }
            //----------------ADS AGE SIMILIRITY----------------
            if (body.GenderCharacteristicWeight != undefined) {
                //VALIDASI PARAM value
                var ceck_AgeCharacteristicWeight = await this.utilsService.validateParam("AgeCharacteristicWeight", body.AgeCharacteristicWeight, "number")
                if (ceck_AgeCharacteristicWeight != "") {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                    await this.errorHandler.generateBadRequestException(
                        ceck_AgeCharacteristicWeight,
                    );
                }
                try {
                    nameActivitas.push("AgeCharacteristicWeight");
                    await this.adssettingService.updateAdsSetting(_id_setting_Similirity_Age, body.AgeCharacteristicWeight);
                } catch (e) {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed, ' + e.toString(),
                    );
                }
            }
            //----------------ADS INTEREST SIMILIRITY----------------
            if (body.InterestCharacteristicWeight != undefined) {
                //VALIDASI PARAM value
                var ceck_InterestCharacteristicWeight = await this.utilsService.validateParam("InterestCharacteristicWeight", body.AgeCharacteristicWeight, "number")
                if (ceck_InterestCharacteristicWeight != "") {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                    await this.errorHandler.generateBadRequestException(
                        ceck_InterestCharacteristicWeight,
                    );
                }
                try {
                    nameActivitas.push("InterestCharacteristicWeight");
                    await this.adssettingService.updateAdsSetting(_id_setting_Similirity_Interest, body.InterestCharacteristicWeight);
                } catch (e) {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed, ' + e.toString(),
                    );
                }
            }
            //----------------ADS INTEREST SIMILIRITY----------------
            if (body.InterestCharacteristicWeight != undefined) {
                //VALIDASI PARAM value
                var ceck_LocationCharacteristicWeight = await this.utilsService.validateParam("LocationCharacteristicWeight", body.LocationCharacteristicWeight, "number")
                if (ceck_LocationCharacteristicWeight != "") {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                    await this.errorHandler.generateBadRequestException(
                        ceck_LocationCharacteristicWeight,
                    );
                }
                try {
                    nameActivitas.push("LocationCharacteristicWeight");
                    await this.adssettingService.updateAdsSetting(_id_setting_Similirity_Location, body.LocationCharacteristicWeight);
                } catch (e) {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed, ' + e.toString(),
                    );
                }
            }

            // if ((body.CTAButtonIndex != undefined) || (body.CTAButton != undefined)) {
            //     try {
            //         var data_CTABUtton = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_CTAButton));
            //         const stringValue = data_CTABUtton.value.toString();
            //         const stringSplit = stringValue.split(',');
            //         if (stringSplit[body.CTAButtonIndex] == undefined) {
            //             await this.errorHandler.generateNotAcceptableException(
            //                 'Unabled to proceed',
            //             );
            //         }
            //         stringSplit[body.CTAButtonIndex] = body.CTAButton.toString();
            //         nameActivitas.push("CTAButton"); 
            //         await this.adssettingService.updateAdsSetting(_id_setting_CTAButton, stringSplit);
            //     } catch (e) {
            //         await this.errorHandler.generateNotAcceptableException(
            //             'Unabled to proceed, ' + e.toString(),
            //         );
            //     }
            // }
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
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                await this.errorHandler.generateBadRequestException(
                    ceck_title_id,
                );
            }
            //VALIDASI PARAM title_en
            var ceck_title_en = await this.utilsService.validateParam("title_en", body.title_en, "string")
            if (ceck_title_en != "") {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                await this.errorHandler.generateBadRequestException(
                    ceck_title_en,
                );
            }
            //VALIDASI PARAM body_id
            var ceck_body_id = await this.utilsService.validateParam("body_id", body.body_id, "string")
            if (ceck_body_id != "") {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                await this.errorHandler.generateBadRequestException(
                    ceck_body_id,
                );
            }
            //VALIDASI PARAM body_end
            var ceck_body_end = await this.utilsService.validateParam("body_end", body.body_end, "string")
            if (ceck_body_end != "") {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                await this.errorHandler.generateBadRequestException(
                    ceck_body_end,
                );
            }
            if (!((body.body_end.toString()).includes("${rewards}"))) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed required text ${rewards}',
                );
            }
            if (!((body.body_id.toString()).includes("${rewards}"))) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, ' + e.toString(),
                );
            }
        }

        try {
            AdsLogsDto_.iduser = new mongoose.Types.ObjectId(ubasic._id.toString());
            AdsLogsDto_.nameActivitas = nameActivitas;
            AdsLogsDto_.type = "SETTING";
            AdsLogsDto_.dateTime = await this.utilsService.getDateTimeString();
            this.adslogsService.create(AdsLogsDto_);

            //----------------Get Ads Data Setting----------------
            var getSetting_Objectivitas_Action = await this.adsObjectivitasService.findOne(_id_Objectivitas_Action);
            var getSetting_Objectivitas_Awareness = await this.adsObjectivitasService.findOne(_id_Objectivitas_Awareness);
            var getSetting_Objectivitas_Consideration = await this.adsObjectivitasService.findOne(_id_Objectivitas_Consideration);
            var getSetting_InContentAds = await this.adsTypeService.findOne(_id_InContentAds);
            var getSetting_InBetweenAds = await this.adsTypeService.findOne(_id_InBetweenAds);
            var getSetting_PopUpAds = await this.adsTypeService.findOne(_id_PopUpAds);
            var getSetting_Rewards_InContentAds = await this.adsRewardsService.findStatusActive(_id_InContentAds);
            var getSetting_Rewards_InBetweenAds = await this.adsRewardsService.findStatusActive(_id_InBetweenAds);
            var getSetting_Rewards_PopUpAds = await this.adsRewardsService.findStatusActive(_id_PopUpAds);
            var getSetting_CreditPrice = await this.adsPriceCreditsService.findStatusActive();
            var getSetting_AdsDurationMin = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsDurationMin));
            var getSetting_AdsDurationMax = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsDurationMax));
            var getSetting_AdsPlanMin = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsPlanMin));
            var getSetting_AdsPlanMax = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_AdsPlanMax));
            var getSetting_CTAButton = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_CTAButton));
            var getSetting_Similirity_Gender = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_Similirity_Gender));
            var getSetting_Similirity_Age = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_Similirity_Age));
            var getSetting_Similirity_Interest = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_Similirity_Interest));
            var getSetting_Similirity_Location = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_Similirity_Location));
            var adsCTAButton = await Promise.all(((getSetting_CTAButton.value.toString()).split(',')).map(async (item, index) => {
                return {
                    CTAButtonIndex: index,
                    CTAButton: item
                };
            }));
            var getSetting_Notification = await this.adsNotificationService.getAdsNotification("NOTIFY_REWARDS", "NOTIFICATION");

            //----------------Get Log----------------
            var AwarenessSimiliarityAudienceMin = await this.adslogsService.getLog("AwarenessSimiliarityAudienceMin");
            var AwarenessSimiliarityAudienceMax = await this.adslogsService.getLog("AwarenessSimiliarityAudienceMax");

            var ConsiderationSimiliarityAudienceMin = await this.adslogsService.getLog("ConsiderationSimiliarityAudienceMin");
            var ConsiderationSimiliarityAudienceMax = await this.adslogsService.getLog("ConsiderationSimiliarityAudienceMax");

            var ActionSimiliarityAudienceMin = await this.adslogsService.getLog("ActionSimiliarityAudienceMin");
            var ActionSimiliarityAudienceMax = await this.adslogsService.getLog("ActionSimiliarityAudienceMax");

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
            var GenderCharacteristicWeight = await this.adslogsService.getLog("GenderCharacteristicWeight");
            var AgeCharacteristicWeight = await this.adslogsService.getLog("AgeCharacteristicWeight");
            var InterestCharacteristicWeight = await this.adslogsService.getLog("InterestCharacteristicWeight");
            var LocationCharacteristicWeight = await this.adslogsService.getLog("LocationCharacteristicWeight");

            //----------------Create Response----------------
            var responseData = {
                adsSetting: [
                    //ADS CONTENT
                    {
                        Jenis: "InContentAdsDurationMin",
                        Nilai: (getSetting_InContentAds.durationMin != undefined) ? getSetting_InContentAds.durationMin : 0,
                        Unit: "Detik",
                        Aktifitas: (InContentAdsDurationMin.length > 0) ? InContentAdsDurationMin[0].userbasics_data[0].fullName : "",
                        Date: (InContentAdsDurationMin.length > 0) ? InContentAdsDurationMin[0].dateTime : "-",
                        Desc: _remark_InContentAds_Duration_Min,
                    },
                    {
                        Jenis: "InContentAdsDurationMax",
                        Nilai: (getSetting_InContentAds.durationMax != undefined) ? getSetting_InContentAds.durationMax : 0,
                        Unit: "Detik",
                        Aktifitas: (InContentAdsDurationMax.length > 0) ? InContentAdsDurationMax[0].userbasics_data[0].fullName : "",
                        Date: (InContentAdsDurationMax.length > 0) ? InContentAdsDurationMax[0].dateTime : "-",
                        Desc: _remark_InContentAds_Duration_Max,
                    },
                    {
                        Jenis: "InContentAdsSkipTimeMin",
                        Nilai: (getSetting_InContentAds.skipMin != undefined) ? getSetting_InContentAds.skipMin : 0,
                        Unit: "Detik",
                        Aktifitas: (InContentAdsSkipTimeMin.length > 0) ? InContentAdsSkipTimeMin[0].userbasics_data[0].fullName : "",
                        Date: (InContentAdsSkipTimeMin.length > 0) ? InContentAdsSkipTimeMin[0].dateTime : "-",
                        Desc: _remark_InContentAds_Skip_Time_Min,
                    },
                    {
                        Jenis: "InContentAdsSkipTimeMax",
                        Nilai: (getSetting_InContentAds.skipMax != undefined) ? getSetting_InContentAds.skipMax : 0,
                        Unit: "Detik",
                        Aktifitas: (InContentAdsSkipTimeMax.length > 0) ? InContentAdsSkipTimeMax[0].userbasics_data[0].fullName : "",
                        Date: (InContentAdsSkipTimeMax.length > 0) ? InContentAdsSkipTimeMax[0].dateTime : "-",
                        Desc: _remark_InContentAds_Skip_Time_Max,
                    },
                    {
                        Jenis: "InContentCPAPrice",
                        Nilai: (getSetting_InContentAds.CPA != undefined) ? getSetting_InContentAds.CPA : 0,
                        Unit: "Kredit",
                        Aktifitas: (InContentCPAPrice.length > 0) ? InContentCPAPrice[0].userbasics_data[0].fullName : "",
                        Date: (InContentCPAPrice.length > 0) ? InContentCPAPrice[0].dateTime : "-",
                        Desc: _remark_InContentAds_CPA_Price,
                    },
                    {
                        Jenis: "InContentCPVPrice",
                        Nilai: (getSetting_InContentAds.CPV != undefined) ? getSetting_InContentAds.CPV : 0,
                        Unit: "Kredit",
                        Aktifitas: (InContentCPVPrice.length > 0) ? InContentCPVPrice[0].userbasics_data[0].fullName : "",
                        Date: (InContentCPVPrice.length > 0) ? InContentCPVPrice[0].dateTime : "-",
                        Desc: _remark_InContentAds_CPV_Price,
                    },
                    {
                        Jenis: "EconomySharingInContent",
                        Nilai: (getSetting_Rewards_InContentAds.rewardPrice != undefined) ? getSetting_Rewards_InContentAds.rewardPrice : 0,
                        Unit: "Rupiah",
                        Aktifitas: (EconomySharingInContent.length > 0) ? EconomySharingInContent[0].userbasics_data[0].fullName : "",
                        Date: (EconomySharingInContent.length > 0) ? EconomySharingInContent[0].dateTime : "-",
                        Desc: _remark_InContentAds_Economy_Sharing,
                    },
                    //ADS BETWEEN
                    {
                        Jenis: "InBetweenAdsDurationMin",
                        Nilai: (getSetting_InBetweenAds.durationMin != undefined) ? getSetting_InBetweenAds.durationMin : 0,
                        Unit: "Detik",
                        Aktifitas: (InBetweenAdsDurationMin.length > 0) ? InBetweenAdsDurationMin[0].userbasics_data[0].fullName : "",
                        Date: (InBetweenAdsDurationMin.length > 0) ? InBetweenAdsDurationMin[0].dateTime : "-",
                        Desc: _remark_InBetweenAds_Duration_Min,
                    },
                    {
                        Jenis: "InBetweenAdsDurationMax",
                        Nilai: (getSetting_InBetweenAds.durationMax != undefined) ? getSetting_InBetweenAds.durationMax : 0,
                        Unit: "Detik",
                        Aktifitas: (InBetweenAdsDurationMax.length > 0) ? InBetweenAdsDurationMax[0].userbasics_data[0].fullName : "",
                        Date: (InBetweenAdsDurationMax.length > 0) ? InBetweenAdsDurationMax[0].dateTime : "-",
                        Desc: _remark_InBetweenAds_Duration_Max,
                    },
                    {
                        Jenis: "InBetweenAdsSkipTimeMin",
                        Nilai: (getSetting_InBetweenAds.skipMin != undefined) ? getSetting_InBetweenAds.skipMin : 0,
                        Unit: "Detik",
                        Aktifitas: (InBetweenAdsSkipTimeMin.length > 0) ? InBetweenAdsSkipTimeMin[0].userbasics_data[0].fullName : "",
                        Date: (InBetweenAdsSkipTimeMin.length > 0) ? InBetweenAdsSkipTimeMin[0].dateTime : "-",
                        Desc: _remark_InBetweenAds_Skip_Time_Min,
                    },
                    {
                        Jenis: "InBetweenAdsSkipTimeMax",
                        Nilai: (getSetting_InBetweenAds.skipMax != undefined) ? getSetting_InBetweenAds.skipMax : 0,
                        Unit: "Detik",
                        Aktifitas: (InBetweenAdsSkipTimeMax.length > 0) ? InBetweenAdsSkipTimeMax[0].userbasics_data[0].fullName : "",
                        Date: (InBetweenAdsSkipTimeMax.length > 0) ? InBetweenAdsSkipTimeMax[0].dateTime : "-",
                        Desc: _remark_InBetweenAds_Skip_Time_Max,
                    },
                    {
                        Jenis: "InBetweenCPAPrice",
                        Nilai: (getSetting_InBetweenAds.CPA != undefined) ? getSetting_InBetweenAds.CPA : 0,
                        Unit: "Kredit",
                        Aktifitas: (InBetweenCPAPrice.length > 0) ? InBetweenCPAPrice[0].userbasics_data[0].fullName : "",
                        Date: (InBetweenCPAPrice.length > 0) ? InBetweenCPAPrice[0].dateTime : "-",
                        Desc: _remark_InBetweenAds_CPA_Price,
                    },
                    {
                        Jenis: "InBetweenCPVPrice",
                        Nilai: (getSetting_InBetweenAds.CPV != undefined) ? getSetting_InBetweenAds.CPV : 0,
                        Unit: "Kredit",
                        Aktifitas: (InBetweenCPVPrice.length > 0) ? InBetweenCPVPrice[0].userbasics_data[0].fullName : "",
                        Date: (InBetweenCPVPrice.length > 0) ? InBetweenCPVPrice[0].dateTime : "-",
                        Desc: _remark_InBetweenAds_CPV_Price,
                    },
                    {
                        Jenis: "EconomySharingInBetween",
                        Nilai: (getSetting_Rewards_InBetweenAds.rewardPrice != undefined) ? getSetting_Rewards_InBetweenAds.rewardPrice : 0,
                        Unit: "Rupiah",
                        Aktifitas: (EconomySharingInBetween.length > 0) ? EconomySharingInBetween[0].userbasics_data[0].fullName : "",
                        Date: (EconomySharingInBetween.length > 0) ? EconomySharingInBetween[0].dateTime : "-",
                        Desc: _remark_InBetweenAds_Economy_Sharing,
                    },
                    //ADS POPUP
                    {
                        Jenis: "PopUpAdsDurationMin",
                        Nilai: (getSetting_PopUpAds.durationMin != undefined) ? getSetting_PopUpAds.durationMin : 0,
                        Unit: "Detik",
                        Aktifitas: (PopUpAdsDurationMin.length > 0) ? PopUpAdsDurationMin[0].userbasics_data[0].fullName : "",
                        Date: (PopUpAdsDurationMin.length > 0) ? PopUpAdsDurationMin[0].dateTime : "-",
                        Desc: _remark_PopUpAds_Duration_Min,
                    },
                    {
                        Jenis: "PopUpAdsDurationMax",
                        Nilai: (getSetting_PopUpAds.durationMax != undefined) ? getSetting_PopUpAds.durationMax : 0,
                        Unit: "Detik",
                        Aktifitas: (PopUpAdsDurationMax.length > 0) ? PopUpAdsDurationMax[0].userbasics_data[0].fullName : "",
                        Date: (PopUpAdsDurationMax.length > 0) ? PopUpAdsDurationMax[0].dateTime : "-",
                        Desc: _remark_PopUpAds_Duration_Max,
                    },
                    {
                        Jenis: "PopUpAdsSkipTimeMin",
                        Nilai: (getSetting_PopUpAds.skipMin != undefined) ? getSetting_PopUpAds.skipMin : 0,
                        Unit: "Detik",
                        Aktifitas: (PopUpAdsSkipTimeMin.length > 0) ? PopUpAdsSkipTimeMin[0].userbasics_data[0].fullName : "",
                        Date: (PopUpAdsSkipTimeMin.length > 0) ? PopUpAdsSkipTimeMin[0].dateTime : "-",
                        Desc: _remark_PopUpAds_Skip_Time_Min,
                    },
                    {
                        Jenis: "PopUpAdsSkipTimeMax",
                        Nilai: (getSetting_PopUpAds.skipMax != undefined) ? getSetting_PopUpAds.skipMax : 0,
                        Unit: "Detik",
                        Aktifitas: (PopUpAdsSkipTimeMax.length > 0) ? PopUpAdsSkipTimeMax[0].userbasics_data[0].fullName : "",
                        Date: (PopUpAdsSkipTimeMax.length > 0) ? PopUpAdsSkipTimeMax[0].dateTime : "-",
                        Desc: _remark_PopUpAds_Skip_Time_Max,
                    },
                    {
                        Jenis: "PopUpCPAPrice",
                        Nilai: (getSetting_PopUpAds.CPA != undefined) ? getSetting_PopUpAds.CPA : 0,
                        Unit: "Kredit",
                        Aktifitas: (PopUpCPAPrice.length > 0) ? PopUpCPAPrice[0].userbasics_data[0].fullName : "",
                        Date: (PopUpCPAPrice.length > 0) ? PopUpCPAPrice[0].dateTime : "-",
                        Desc: _remark_PopUpAds_CPA_Price,
                    },
                    {
                        Jenis: "PopUpCPVPrice",
                        Nilai: (getSetting_PopUpAds.CPV != undefined) ? getSetting_PopUpAds.CPV : 0,
                        Unit: "Kredit",
                        Aktifitas: (PopUpCPVPrice.length > 0) ? PopUpCPVPrice[0].userbasics_data[0].fullName : "",
                        Date: (PopUpCPVPrice.length > 0) ? PopUpCPVPrice[0].dateTime : "-",
                        Desc: _remark_PopUpAds_CPV_Price,
                    },
                    {
                        Jenis: "EconomySharingSPonsorPopUp",
                        Nilai: (getSetting_Rewards_PopUpAds.rewardPrice != undefined) ? getSetting_Rewards_PopUpAds.rewardPrice : 0,
                        Unit: "Rupiah",
                        Aktifitas: (EconomySharingSPonsorPopUp.length > 0) ? EconomySharingSPonsorPopUp[0].userbasics_data[0].fullName : "",
                        Date: (EconomySharingSPonsorPopUp.length > 0) ? EconomySharingSPonsorPopUp[0].dateTime : "-",
                        Desc: _remark_PopUpAds_Economy_Sharing,
                    },
                    //OBJECTIVITAS
                    {
                        Jenis: "ActionSimiliarityAudienceMin",
                        Nilai: (getSetting_Objectivitas_Action.percentageMin != undefined) ? getSetting_Objectivitas_Action.percentageMin : 0,
                        Unit: "Persen",
                        Aktifitas: (ActionSimiliarityAudienceMin.length > 0) ? ActionSimiliarityAudienceMin[0].userbasics_data[0].fullName : "",
                        Date: (ActionSimiliarityAudienceMin.length > 0) ? ActionSimiliarityAudienceMin[0].dateTime : "-",
                        Desc: _remark_Objectivitas_Action_Similirity_Min,
                    },
                    {
                        Jenis: "ActionSimiliarityAudienceMax",
                        Nilai: (getSetting_Objectivitas_Action.percentageMax != undefined) ? getSetting_Objectivitas_Action.percentageMax : 0,
                        Unit: "Persen",
                        Aktifitas: (ActionSimiliarityAudienceMax.length > 0) ? ActionSimiliarityAudienceMax[0].userbasics_data[0].fullName : "",
                        Date: (ActionSimiliarityAudienceMax.length > 0) ? ActionSimiliarityAudienceMin[0].dateTime : "-",
                        Desc: _remark_Objectivitas_Action_Similirity_Max,
                    },
                    {
                        Jenis: "ConsiderationSimiliarityAudienceMin",
                        Nilai: (getSetting_Objectivitas_Consideration.percentageMin != undefined) ? getSetting_Objectivitas_Consideration.percentageMin : 0,
                        Unit: "Persen",
                        Aktifitas: (ConsiderationSimiliarityAudienceMin.length > 0) ? ConsiderationSimiliarityAudienceMin[0].userbasics_data[0].fullName : "",
                        Date: (ConsiderationSimiliarityAudienceMin.length > 0) ? ConsiderationSimiliarityAudienceMin[0].dateTime : "-",
                        Desc: _remark_Objectivitas_Consideration_Similirity_Min,
                    },
                    {
                        Jenis: "ConsiderationSimiliarityAudienceMax",
                        Nilai: (getSetting_Objectivitas_Consideration.percentageMax != undefined) ? getSetting_Objectivitas_Consideration.percentageMax : 0,
                        Unit: "Persen",
                        Aktifitas: (ConsiderationSimiliarityAudienceMax.length > 0) ? ConsiderationSimiliarityAudienceMax[0].userbasics_data[0].fullName : "",
                        Date: (ConsiderationSimiliarityAudienceMax.length > 0) ? ConsiderationSimiliarityAudienceMax[0].dateTime : "-",
                        Desc: _remark_Objectivitas_Consideration_Similirity_Max,
                    },
                    {
                        Jenis: "AwarenessSimiliarityAudienceMin",
                        Nilai: (getSetting_Objectivitas_Awareness.percentageMin != undefined) ? getSetting_Objectivitas_Awareness.percentageMin : 0,
                        Unit: "Persen",
                        Aktifitas: (AwarenessSimiliarityAudienceMin.length > 0) ? AwarenessSimiliarityAudienceMin[0].userbasics_data[0].fullName : "",
                        Date: (AwarenessSimiliarityAudienceMin.length > 0) ? AwarenessSimiliarityAudienceMin[0].dateTime : "-",
                        Desc: _remark_Objectivitas_Awareness_Similirity_Min,
                    },
                    {
                        Jenis: "AwarenessSimiliarityAudienceMax",
                        Nilai: (getSetting_Objectivitas_Awareness.percentageMax != undefined) ? getSetting_Objectivitas_Awareness.percentageMax : 0,
                        Unit: "Persen",
                        Aktifitas: (AwarenessSimiliarityAudienceMax.length > 0) ? AwarenessSimiliarityAudienceMax[0].userbasics_data[0].fullName : "",
                        Date: (AwarenessSimiliarityAudienceMax.length > 0) ? AwarenessSimiliarityAudienceMax[0].dateTime : "-",
                        Desc: _remark_Objectivitas_Awareness_Similirity_Max,
                    },
                    //ADS SETTING
                    {
                        Jenis: "CreditPrice",
                        Nilai: (getSetting_CreditPrice.creditPrice != undefined) ? getSetting_CreditPrice.creditPrice : 0,
                        Unit: getSetting_AdsPlanMax.remark,
                        Aktifitas: (CreditPrice.length > 0) ? CreditPrice[0].userbasics_data[0].fullName : "",
                        Date: (CreditPrice.length > 0) ? CreditPrice[0].dateTime : "-",
                        Desc: _remark_setting_CreditPrice,
                    },
                    {
                        Jenis: "AdsDurationMin",
                        Nilai: (getSetting_AdsDurationMin.value != undefined) ? getSetting_AdsDurationMin.value : 0,
                        Unit: getSetting_AdsPlanMax.remark,
                        Aktifitas: (AdsDurationMin.length > 0) ? AdsDurationMin[0].userbasics_data[0].fullName : "",
                        Date: (AdsDurationMin.length > 0) ? AdsDurationMin[0].dateTime : "-",
                        Desc: _remark_setting_AdsDurationMin,
                    },
                    {
                        Jenis: "AdsDurationMax",
                        Nilai: (getSetting_AdsDurationMax.value != undefined) ? getSetting_AdsDurationMax.value : 0,
                        Unit: getSetting_AdsPlanMax.remark,
                        Aktifitas: (AdsDurationMax.length > 0) ? AdsDurationMax[0].userbasics_data[0].fullName : "",
                        Date: (AdsDurationMax.length > 0) ? AdsDurationMax[0].dateTime : "-",
                        Desc: _remark_setting_AdsDurationMax,
                    },
                    {
                        Jenis: "AdsPlanMin",
                        Nilai: (getSetting_AdsPlanMin.value != undefined) ? getSetting_AdsPlanMin.value : 0,
                        Unit: getSetting_AdsPlanMax.remark,
                        Aktifitas: (AdsPlanMin.length > 0) ? AdsPlanMin[0].userbasics_data[0].fullName : "",
                        Date: (AdsPlanMin.length > 0) ? AdsPlanMin[0].dateTime : "-",
                        Desc: _remark_setting_AdsPlanMin,
                    },
                    {
                        Jenis: "AdsPlanMax",
                        Nilai: (getSetting_AdsPlanMax.value != undefined) ? getSetting_AdsPlanMax.value : 0,
                        Unit: getSetting_AdsPlanMax.remark,
                        Aktifitas: (AdsPlanMax.length > 0) ? AdsPlanMax[0].userbasics_data[0].fullName : "",
                        Date: (AdsPlanMax.length > 0) ? AdsPlanMax[0].dateTime : "-",
                        Desc: _remark_setting_AdsPlanMax,
                    },
                    {
                        Jenis: "GenderCharacteristicWeight",
                        Nilai: (getSetting_Similirity_Gender.value != undefined) ? getSetting_Similirity_Gender.value : 0,
                        Unit: "Persen",
                        Aktifitas: (GenderCharacteristicWeight.length > 0) ? GenderCharacteristicWeight[0].userbasics_data[0].fullName : "",
                        Date: (GenderCharacteristicWeight.length > 0) ? GenderCharacteristicWeight[0].dateTime : "-",
                        Desc: _remark_setting_Similirity_Gender,
                    },
                    {
                        Jenis: "AgeCharacteristicWeight",
                        Nilai: (getSetting_Similirity_Age.value != undefined) ? getSetting_Similirity_Age.value : 0,
                        Unit: "Persen",
                        Aktifitas: (AgeCharacteristicWeight.length > 0) ? AgeCharacteristicWeight[0].userbasics_data[0].fullName : "",
                        Date: (AgeCharacteristicWeight.length > 0) ? AgeCharacteristicWeight[0].dateTime : "-",
                        Desc: _remark_setting_Similirity_Age,
                    },
                    {
                        Jenis: "InterestCharacteristicWeight",
                        Nilai: (getSetting_Similirity_Interest.value != undefined) ? getSetting_Similirity_Interest.value : 0,
                        Unit: "Persen",
                        Aktifitas: (InterestCharacteristicWeight.length > 0) ? InterestCharacteristicWeight[0].userbasics_data[0].fullName : "",
                        Date: (InterestCharacteristicWeight.length > 0) ? InterestCharacteristicWeight[0].dateTime : "-",
                        Desc: _remark_setting_Similirity_Interest,
                    },
                    {
                        Jenis: "LocationCharacteristicWeight",
                        Nilai: (getSetting_Similirity_Location.value != undefined) ? getSetting_Similirity_Location.value : 0,
                        Unit: "Persen",
                        Aktifitas: (LocationCharacteristicWeight.length > 0) ? LocationCharacteristicWeight[0].userbasics_data[0].fullName : "",
                        Date: (LocationCharacteristicWeight.length > 0) ? LocationCharacteristicWeight[0].dateTime : "-",
                        Desc: _remark_setting_Similirity_Location,
                    },
                ],
                adsCTAButton,
                adsNotification: {
                    title_id: getSetting_Notification.subject_id,
                    title_en: getSetting_Notification.subject,
                    body_id: getSetting_Notification.body_detail_id,
                    body_end: getSetting_Notification.body_detail,
                },
            }

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Update setting ads succesfully", responseData
            );
        } catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ' + e.toString(),
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/notification')
    @HttpCode(HttpStatus.ACCEPTED)
    async getAdsNotification(@Headers() headers, @Request() req) {
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

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

        return await this.errorHandler.generateAcceptResponseCodeWithData(
            "Get Ads Notification succesfully", dataResponse
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post('/notification/update')
    @HttpCode(HttpStatus.ACCEPTED)
    async updateAdsNotification(@Body() body: any, @Headers() headers, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var reqbody = JSON.parse(JSON.stringify(body));

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }
        //VALIDASI PARAM title_id
        var ceck_title_id = await this.utilsService.validateParam("title_id", body.title_id, "string")
        if (ceck_title_id != "") {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                ceck_title_id,
            );
        }
        //VALIDASI PARAM title_en
        var ceck_title_en = await this.utilsService.validateParam("title_en", body.title_en, "string")
        if (ceck_title_en != "") {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                ceck_title_en,
            );
        }
        //VALIDASI PARAM body_id
        var ceck_body_id = await this.utilsService.validateParam("body_id", body.body_id, "string")
        if (ceck_body_id != "") {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                ceck_body_id,
            );
        }
        //VALIDASI PARAM body_end
        var ceck_body_end = await this.utilsService.validateParam("body_end", body.body_end, "string")
        if (ceck_body_end != "") {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateBadRequestException(
                ceck_body_end,
            );
        }
        if (!((body.body_end.toString()).includes("${rewards}"))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed required text ${rewards}',
            );
        }
        if (!((body.body_id.toString()).includes("${rewards}"))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            return await this.errorHandler.generateAcceptResponseCodeWithData(
                "Update ads Notification succesfully", responseData
            );
        } catch (e) {

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ' + e.toString(),
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/cta')
    @HttpCode(HttpStatus.ACCEPTED)
    async getAdsCTA(@Headers() headers, @Request() req) {
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

        var _id_setting_CTAButton = this.configService.get("ID_SETTING_ADS_CTA_BUTTON");;
        var getSetting_CTAButton = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_CTAButton));
        var adsCTAButton = await Promise.all(((getSetting_CTAButton.value.toString()).split(',')).map(async (item, index) => {
            return {
                CTAButtonIndex: index,
                CTAButton: item
            };
        }));

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

        return await this.errorHandler.generateAcceptResponseCodeWithData(
            "Get setting CTA ads succesfully", adsCTAButton
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post('/cta/update')
    @HttpCode(HttpStatus.ACCEPTED)
    async updateAdsCTA(@Body() body: any, @Headers() headers, @Request() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var reqbody = JSON.parse(JSON.stringify(body));

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }

        //----------------CTA BUTTON----------------
        if (body.CTAButton != undefined) {
            try {
                var _id_setting_CTAButton = this.configService.get("ID_SETTING_ADS_CTA_BUTTON");
                await this.adssettingService.updateAdsSetting(_id_setting_CTAButton, body.CTAButton);
                var getSetting_CTAButton = await this.adssettingService.getAdsSetting(new mongoose.Types.ObjectId(_id_setting_CTAButton));
                var adsCTAButton = await Promise.all(((getSetting_CTAButton.value.toString()).split(',')).map(async (item, index) => {
                    return {
                        CTAButtonIndex: index,
                        CTAButton: item
                    };
                }));

                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                return await this.errorHandler.generateAcceptResponseCodeWithData(
                    "Update setting CTA ads succesfully", adsCTAButton
                );
            } catch (e) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, ' + e.toString(),
                );
            }
        }
    }
}
