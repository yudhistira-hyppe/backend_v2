import { HttpCode, Controller, HttpStatus, Get, Req, Query, UseGuards, Headers, Post, BadRequestException, Request, Param, Res } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UtilsService } from './utils.service';
import { InterestsRepoService } from '../infra/interests_repo/interests_repo.service';
import { InterestsService } from '../infra/interests/interests.service';
import { AreasService } from '../infra/areas/areas.service';
import { CitiesService } from '../infra/cities/cities.service';
import { CountriesService } from '../infra/countries/countries.service';
import { EulasService } from '../infra/eulas/eulas.service';
import { WelcomenotesService } from '../infra/welcomenotes/welcomenotes.service';
import { LanguagesService } from '../infra/languages/languages.service';
import { ReactionsRepoService } from '../infra/reactions_repo/reactions_repo.service';
import { ReactionsService } from '../infra/reactions/reactions.service';
import { DocumentsService } from '../infra/documents/documents.service';
import { ReportsService } from '../infra/reports/reports.service';
import { CorevaluesService } from '../infra/corevalues/corevalues.service';
import { ErrorHandler } from './error.handler';
import { DevicelogService } from '../infra/devicelog/devicelog.service';
import { CreateDevicelogDto } from '../infra/devicelog/dto/create-devicelog.dto';
import { UserbasicsService } from '../trans/userbasics/userbasics.service';
import { TemplatesService } from '../infra/templates/templates.service';
import { SettingsService } from '../trans/settings/settings.service';
import mongoose from 'mongoose';
import { Posts } from '../content/posts/schemas/posts.schema';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { Cron, Interval } from '@nestjs/schedule';
import { CreateTemplatesDto } from 'src/infra/templates/dto/create-templates.dto';
import * as fs from 'fs';

@Controller('api/utils/')
export class UtilsController {

    constructor(
        private readonly interestsRepoService: InterestsRepoService,
        //private readonly interestsService: InterestsService,
        private readonly areasService: AreasService,
        private readonly citiesService: CitiesService,
        private readonly countriesService: CountriesService,
        private readonly eulasService: EulasService,
        private readonly welcomenotesService: WelcomenotesService,
        private readonly languagesService: LanguagesService,
        private readonly reactionsRepoService: ReactionsRepoService,
        private readonly reactionsService: ReactionsService,
        private readonly documentsService: DocumentsService,
        private readonly reportsService: ReportsService,
        private readonly corevaluesService: CorevaluesService,
        private readonly errorHandler: ErrorHandler,
        private readonly devicelogService: DevicelogService,
        private readonly utilsService: UtilsService,
        private readonly logapiSS: LogapisService,
        private readonly userbasicsService: UserbasicsService,
        private readonly templatesService: TemplatesService,
        private readonly settingsService: SettingsService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('interest?')
    @HttpCode(HttpStatus.ACCEPTED)
    async interest(
        @Query('langIso') langIso: string,
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Query('search') search: string,
        @Req() req,
        @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var langIso_ = langIso;
        var pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
        var pageRow_ = (pageRow != undefined) ? pageRow : 3;
        var search_ = search;

        var data = await this.interestsRepoService.findCriteria(langIso_, pageNumber_, pageRow_, search_);
        var bahasa = null;

        var data_ = data.map(item => {

            if (langIso_ == "id") {
                bahasa = item.interestNameId;
            } else {
                bahasa = item.interestName;
            }
            return {
                _id: item._id,
                langIso: item.langIso,
                cts: item.createdAt,
                icon: item.icon,
                interestName: bahasa,
                // interestNameId: item.interestNameId,
                // thumbnail: item.thumbnail
            };
        });
        var Response = {
            response_code: 202,
            total: data.length.toString(),
            data: data_,
            messages: {
                info: [
                    "Interests retrieved"
                ]
            },
            page: pageNumber
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('area?')
    @HttpCode(HttpStatus.ACCEPTED)
    async profilePict(
        @Query('countryID') countryID: string,
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Query('search') search: string,
        @Req() req,
        @Headers() headers
    ) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var countryID_ = countryID;
        var pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
        var pageRow_ = (pageRow != undefined) ? pageRow : 3;
        var search_ = search;

        var data = await this.areasService.findCriteria(countryID_, pageNumber_, pageRow_, search_);
        var data_ = data.map(item => {
            return {
                stateName: item.stateName,
                stateID: item.stateID,
            };
        });
        var Response = {
            response_code: 202,
            total: data.length.toString(),
            data: data_,
            messages: {
                info: [
                    "Area retrieved"
                ]
            },
            page: pageNumber
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('city?')
    @HttpCode(HttpStatus.ACCEPTED)
    async city(
        @Query('stateID') stateID: string,
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Query('search') search: string,
        @Headers() headers,
        @Req() req
    ) {

        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var stateID_ = stateID;
        var pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
        var pageRow_ = (pageRow != undefined) ? pageRow : 3;
        var search_ = search;

        var data = await this.citiesService.findCriteria(stateID_, pageNumber_, pageRow_, search_);
        var data_ = data.map(item => {
            return {
                cityName: item.cityName,
                cityID: item.cityID
            };
        });
        var Response = {
            response_code: 202,
            total: data.length.toString(),
            data: data_,
            messages: {
                info: [
                    "City retrieved"
                ]
            },
            page: pageNumber
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('country?')
    @HttpCode(HttpStatus.ACCEPTED)
    async country(
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Query('search') search: string,
        @Headers() headers,
        @Req() req) {

        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
        var pageRow_ = (pageRow != undefined) ? pageRow : 3;
        var search_ = search;

        var data = await this.countriesService.findCriteria(pageNumber_, pageRow_, search_);
        var data_ = data.map(item => {
            return {
                country: item.country,
                countryID: item.countryID
            };
        });
        var Response = {
            response_code: 202,
            total: data.length.toString(),
            data: data_,
            messages: {
                info: [
                    "City retrieved"
                ]
            },
            page: pageNumber
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('eula?')
    @HttpCode(HttpStatus.ACCEPTED)
    async eula(
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Query('langIso') langIso: string,
        @Req() req,
        @Headers() headers) {

        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
        var pageRow_ = (pageRow != undefined) ? pageRow : 3;
        var langIso_ = langIso;

        var data = await this.eulasService.findCriteria(pageNumber_, pageRow_, langIso_);
        var data_ = data.map(item => {
            return {
                langIso: item.langIso,
                eulaID: item.eulaID,
                version: item.version,
                eulaContent: item.eulaContent
            };
        });
        var Response = {
            response_code: 202,
            total: data.length.toString(),
            data: data_,
            messages: {
                info: [
                    "EULA retrieved"
                ]
            },
            page: pageNumber
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('welcomenotes?')
    @HttpCode(HttpStatus.ACCEPTED)
    async welcomenotes(
        @Query('langIso') langIso: string,
        @Query('countryCode') countryCode: string,
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Headers() headers,
        @Req() req) {

        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var langIso_ = langIso;
        var countryCode_ = countryCode;
        var pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
        var pageRow_ = (pageRow != undefined) ? pageRow : 3;

        var data = await this.welcomenotesService.findCriteria(langIso_, countryCode_, pageNumber_, pageRow_);
        var data_ = data.map(item => {
            return [{
                langIso: item.langIso,
            }, {
                content: item.content[0],
            }];
        });
        var Response = {
            response_code: 202,
            total: data.length.toString(),
            data: data_[0],
            messages: {
                info: [
                    "Welcome Notes retrieved"
                ]
            },
            page: pageNumber
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('language?')
    @HttpCode(HttpStatus.ACCEPTED)
    async language(
        @Query('langIso') langIso: string,
        @Query('search') search: string,
        @Headers() headers,
        @Req() req) {

        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var langIso_ = langIso;
        var search_ = search;

        var data = await this.languagesService.findCriteria(langIso_, search_);
        var data_ = data.map(item => {
            return {
                langIso: item.langIso,
                lang: item.lang,
                langID: item.langID,
            };
        });
        var Response = {
            response_code: 202,
            total: data.length.toString(),
            data: data_,
            messages: {
                info: [
                    "Language retrieved"
                ]
            },
            page: null
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('reaction?')
    @HttpCode(HttpStatus.ACCEPTED)
    async reaction(
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Query('search') search: string,
        @Headers() headers,
        @Req() req) {

        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
        var pageRow_ = (pageRow != undefined) ? pageRow : 20;
        var search_ = search;

        var data = await this.reactionsRepoService.findCriteria(pageNumber_, pageRow_, search_);
        var data_ = data.map(item => {
            return {
                _id: item._id,
                reactionId: item.reactionId,
                iconName: item.iconName,
                icon: item.icon,
                utf: item.utf,
                cts: item.cts,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                url: item.URL,
            };
        });
        var Response = {
            response_code: 202,
            total: data.length.toString(),
            data: data_,
            messages: {
                info: [
                    "Reactions retrieved"
                ]
            },
            page: null
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('document?')
    @HttpCode(HttpStatus.ACCEPTED)
    async document(
        @Query('langIso') langIso: string,
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Query('search') search: string,
        @Req() req,
        @Headers() headers) {

        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var langIso_ = langIso;
        var pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
        var pageRow_ = (pageRow != undefined) ? pageRow : 3;
        var search_ = search;

        var data = await this.documentsService.findCriteria(langIso_, pageNumber_, pageRow_, search_);
        var data_ = data.map(item => {
            return {
                _id: item._id,
                documentId: item.documentId,
                documentName: item.documentName,
                countryCode: item.countryCode,
                langIso: item.langIso,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            };
        });
        var Response = {
            response_code: 202,
            total: data.length.toString(),
            data: data_,
            messages: {
                info: [
                    "Reactions retrieved"
                ]
            },
            page: null
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('reportoption?')
    @HttpCode(HttpStatus.ACCEPTED)
    async reportoption(
        @Query('langIso') langIso: string,
        @Query('reportType') reportType: string,
        @Query('action') action: string,
        @Query('search') search: string,
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Headers() headers,
        @Req() req) {

        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var langIso_ = langIso;
        var reportType_ = reportType;
        var action_ = action;
        var pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
        var pageRow_ = (pageRow != undefined) ? pageRow : 3;
        var search_ = search;

        var data = await this.reportsService.findCriteria(langIso_, reportType_, action_, pageNumber_, pageRow_, search_);
        var data_ = data.map(item => {
            return {
                _id: item._id,
                langIso: item.langIso,
                action: item.action,
                remark: item.remark,
                remarkID: item.remarkID,
                reportType: item.reportType,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            };
        });
        var Response = {
            response_code: 202,
            total: data.length.toString(),
            data: data_,
            messages: {
                info: [
                    "Reports retrieved"
                ]
            },
            page: pageNumber
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('gender?')
    @HttpCode(HttpStatus.ACCEPTED)
    async gender(
        @Query('langIso') langIso: string,
        @Req() req,
        @Headers() headers) {

        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var langIso_ = langIso;
        if (langIso == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed',
            );
        }

        var data = await this.corevaluesService.findcore_type('gender');
        let data_gender = data.payload;

        let filter_gender = data_gender.filter(gender => gender['langIso'] == langIso_);
        var Response = {
            response_code: 202,
            data: ['[' + (filter_gender[0]['items']).toString() + ']'],
            messages: {
                info: [
                    "Gender retrieved"
                ]
            }
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('martialstatus?')
    @HttpCode(HttpStatus.ACCEPTED)
    async martialstatus(
        @Query('langIso') langIso: string,
        @Req() req,
        @Headers() headers) {

        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var langIso_ = langIso;
        if (langIso == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed',
            );
        }

        var data = await this.corevaluesService.findcore_type('martialstatus');
        let data_gender = data.payload;

        let filter_gender = data_gender.filter(gender => gender['langIso'] == langIso_);
        var Response = {
            response_code: 202,
            data: ['[' + (filter_gender[0]['items']).toString() + ']'],
            messages: {
                info: [
                    "Martial Status retrieved"
                ]
            }
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Post('logdevice')
    @HttpCode(HttpStatus.ACCEPTED)
    async logdevice(@Req() request: any, @Headers() header,) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = header['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var reqbody = JSON.parse(JSON.stringify(request.body));

        if ((request.body.imei == undefined) || (request.body.log == undefined) || (request.body.type == undefined) || (header['x-auth-user'] == undefined)) {
            if (!(await this.utilsService.validasiTokenEmail(header))) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed',
                );
            } else {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed',
                );
            }
        }
        try {
            var current_date = await this.utilsService.getDateTimeString();
            var CreateDevicelogDto_ = new CreateDevicelogDto();
            CreateDevicelogDto_._id = new mongoose.Types.ObjectId();
            CreateDevicelogDto_.email = header['x-auth-user'];
            CreateDevicelogDto_.imei = request.body.imei;
            CreateDevicelogDto_.log = request.body.log;
            CreateDevicelogDto_.type = request.body.type;
            CreateDevicelogDto_.createdAt = current_date;
            CreateDevicelogDto_.updatedAt = current_date;
            CreateDevicelogDto_._class = 'io.melody.hyppe.infra.domain.DeviceLog';
            await this.devicelogService.create(CreateDevicelogDto_);
            var Response = {
                response_code: 202,
                messages: {
                    info: [
                        "Succesfull"
                    ]
                }
            }

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            return Response;
        } catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed',
            );
        }
    }

    @HttpCode(HttpStatus.ACCEPTED)
    @Post('generateProfile')
    async generateProfile(@Req() request: any, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var reqbody = JSON.parse(JSON.stringify(request.body));

        var data = await this.utilsService.generateProfile(request.body.email, 'LOGIN');

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

        return data;

        // return await this.utilsService.generateProfile(request.body.email, 'LOGIN');
    }

    @HttpCode(HttpStatus.ACCEPTED)
    @Post('generateProfile/v2')
    async generateProfile2(@Req() request: any, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var reqbody = JSON.parse(JSON.stringify(request.body));

        var data = await this.utilsService.generateProfile2(request.body.email, 'LOGIN');

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

        return data;

        // return await this.utilsService.generateProfile(request.body.email, 'LOGIN');
    }
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Get('getSetting')
    async getSettingMarketPlace(
        @Headers() headers,
        @Req() req) {

        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        let settingMarketPlace = false;
        if (headers['x-auth-user'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }
        var getsetting = await this.utilsService.getSetting_("633f8e57ce76000009000512");
        if (getsetting == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, Setting not found',
            );
        }
        settingMarketPlace = Boolean(Number(getsetting));
        var Response = {
            response_code: 202,
            data: {
                settingMP: settingMarketPlace
            },
            messages: {
                info: [
                    "Succesfull"
                ]
            }
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return Response;
    }

    @Post('pushnotification')
    @UseGuards(JwtAuthGuard)
    async sendmasal(@Req() request: Request): Promise<any> {

        var titleIN = null;
        var bodyIN = null;
        var titleEN = null;
        var bodyEN = null;
        var emailuser = null;
        var data = null;
        var url = null;
        var email = null;
        var type = null;
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var strdate = dt.toISOString();
        var repdate = strdate.replace('T', ' ');
        var splitdate = repdate.split('.');
        var timedate = splitdate[0];

        var request_json = JSON.parse(JSON.stringify(request.body));

        if (request_json["titleIN"] !== undefined) {
            titleIN = request_json["titleIN"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["bodyIN"] !== undefined) {
            bodyIN = request_json["bodyIN"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["titleEN"] !== undefined) {
            titleEN = request_json["titleEN"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["bodyEN"] !== undefined) {
            bodyEN = request_json["bodyEN"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        url = request_json["url"];

        emailuser = request_json["emailuser"];
        type = request_json["type"];

        var CreateTemplatesDto_ = new CreateTemplatesDto();;
        CreateTemplatesDto_.name = "PUSH_NOTIFICATION"
        CreateTemplatesDto_.category = "NOTIFICATION";
        CreateTemplatesDto_.type = "PUSHNOTIFICATION";
        CreateTemplatesDto_.createdAt = timedate;
        CreateTemplatesDto_.email = email;
        CreateTemplatesDto_.body_detail = bodyEN;
        CreateTemplatesDto_.body_detail_id = bodyIN;
        CreateTemplatesDto_.action_buttons = url;
        CreateTemplatesDto_.subject = titleEN;
        CreateTemplatesDto_.subject_id = titleIN;
        CreateTemplatesDto_.event = "ACCEPT";
        CreateTemplatesDto_.active = true;
        CreateTemplatesDto_.type_sending = type;
        try {
            data = await this.templatesService.create(CreateTemplatesDto_);
            var idtemplate = data._id.toString();
            var response = {
                "response_code": 202,
                "data": data,
                "messages": {
                    info: ['Successfuly'],
                },
            }

            this.testSend(100, url, titleIN, bodyIN, type, emailuser, titleEN, bodyEN, idtemplate);

            return response;
        } catch (e) {
            await this.errorHandler.generateBadRequestException(
                'Failed create notification ' + e,
            );
        }

    }


    async testSend(limit: number, url: string, titlein: string, bodyin: string, type: string, emailuser: any[], titleen: string, bodyen: string, idtemplate: string) {
        var email = null;
        var datacount = null;
        var totalall = 0;

        if (type != undefined && type == "ALL") {
            try {
                datacount = await this.userbasicsService.getcount();
                totalall = datacount[0].totalpost / limit;
            } catch (e) {
                datacount = null;
                totalall = 0;
            }
            var totalpage = 0;
            var tpage2 = (totalall).toFixed(0);
            var tpage = (totalall % limit);
            if (tpage > 0 && tpage < 5) {
                totalpage = parseInt(tpage2) + 1;

            } else {
                totalpage = parseInt(tpage2);
            }

            console.log(totalpage);

            for (let x = 0; x < totalpage; x++) {
                var data = await this.userbasicsService.getuser(x, limit);
                for (var i = 0; i < data.length; i++) {
                    email = data[i].email;
                    console.log('data ke-' + i);
                    try {
                        console.log(i);
                        //await this.friendlistService.create(data[i]);

                        this.sendInteractiveFCM(email, url, titlein, bodyin, titleen, bodyen, idtemplate);
                    }
                    catch (e) {
                        //await this.friendlistService.update(data[i]._id, data[i]);
                    }
                }
            }
        }
        else if (type != undefined && type == "OPTION") {
            if (emailuser !== undefined && emailuser.length > 0) {


                for (var i = 0; i < emailuser.length; i++) {
                    email = emailuser[i];
                    console.log('data ke-' + i);
                    try {
                        console.log(i);
                        //await this.friendlistService.create(data[i]);

                        this.sendInteractiveFCM(email, url, titlein, bodyin, titleen, bodyen, idtemplate);
                    }
                    catch (e) {
                        //await this.friendlistService.update(data[i]._id, data[i]);
                    }
                }

            }
        }


    }

    async sendInteractiveFCM(email: string, url: string, titlein: string, bodyin: string, titleen: string, bodyen: string, idtemplate: string) {
        var idsetting = "64e81627123f00001a006092";
        var dataseting = null;
        var value = null;
        try {

            dataseting = await this.settingsService.findOne(idsetting);
            value = dataseting._doc.value;

        } catch (e) {
            value = 1000;
        }
        const action = () => new Promise((resolve, reject) => {
            this.utilsService.sendFcmPushNotif(email, titlein, bodyin, titleen, bodyen, "GENERAL", "ACCEPT", url, idtemplate)
            console.log("Action init ")
            return setTimeout(() => {
                console.log("Action completed")
                resolve;
            }, value)
        })

        const actionRecursion = () => {
            action().then(() => {
                setTimeout(actionRecursion, 1000)
            })
        }

        actionRecursion();
    }
    
    @Get('images/:id')
    async downloadFile(
        @Param('id') id: string, @Res() response) {
        const mime = require('mime-types')
        const pathUpload = "../../images/";
        const mime_type = mime.lookup(pathUpload + id)
        var file = fs.createReadStream(pathUpload + id);
        var stat = fs.statSync(pathUpload + id);
        response.setHeader('Content-Length', stat.size);
        response.setHeader('Content-Type', mime_type);
        response.setHeader('Content-Disposition', 'attachment; filename=' + id);
        file.pipe(response);
    }

}
