import { HttpCode, Controller, HttpStatus, Get, Req, Query, UseGuards, Headers, Post } from '@nestjs/common';
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
import mongoose from 'mongoose';
import { Posts } from '../content/posts/schemas/posts.schema';


@Controller('api/utils/')
export class UtilsController {

    constructor(
        private readonly interestsRepoService: InterestsRepoService,
        private readonly interestsService: InterestsService,
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
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('interest?')
    @HttpCode(HttpStatus.ACCEPTED)
    async interest(
        @Query('langIso') langIso: string,
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Query('search') search: string) {
        var langIso_ = langIso;
        var pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
        var pageRow_ = (pageRow != undefined) ? pageRow : 3;
        var search_ = search;

        var data = await this.interestsService.findCriteria(langIso_, pageNumber_, pageRow_, search_);
        var data_ = data.map(item => {
            return {
                _id: item._id,
                langIso: item.langIso,
                cts: item.createdAt,
                icon: item.icon,
                interestName: item.interestName
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
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('area?')
    @HttpCode(HttpStatus.ACCEPTED)
    async profilePict(
        @Query('countryID') countryID: string,
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Query('search') search: string) {
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
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('city?')
    @HttpCode(HttpStatus.ACCEPTED)
    async city(
        @Query('stateID') stateID: string,
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Query('search') search: string) {
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
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('country?')
    @HttpCode(HttpStatus.ACCEPTED)
    async country(
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Query('search') search: string) {
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
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('eula?')
    @HttpCode(HttpStatus.ACCEPTED)
    async eula(
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Query('langIso') langIso: string) {
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
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('welcomenotes?')
    @HttpCode(HttpStatus.ACCEPTED)
    async welcomenotes(
        @Query('langIso') langIso: string,
        @Query('countryCode') countryCode: string,
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number) {
        var langIso_ = langIso;
        var countryCode_ = countryCode;
        var pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
        var pageRow_ = (pageRow != undefined) ? pageRow : 3;

        var data = await this.welcomenotesService.findCriteria(langIso_, countryCode_, pageNumber_, pageRow_);
        var data_ = data.map(item => {
            return [{
                langIso: item.langIso,
            }, {
                content: item.content,
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
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('language?')
    @HttpCode(HttpStatus.ACCEPTED)
    async language(
        @Query('langIso') langIso: string,
        @Query('search') search: string) {
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
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('reaction?')
    @HttpCode(HttpStatus.ACCEPTED)
    async reaction(
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Query('search') search: string) {
        var pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
        var pageRow_ = (pageRow != undefined) ? pageRow : 3;
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
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('document?')
    @HttpCode(HttpStatus.ACCEPTED)
    async document(
        @Query('langIso') langIso: string,
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Query('search') search: string) {
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
        @Query('pageRow') pageRow: number) {
        var langIso_ = langIso;
        var reportType_ = reportType;
        var action_ = action;
        var pageNumber_ = (pageNumber != undefined) ? pageNumber :0;
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
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('gender?')
    @HttpCode(HttpStatus.ACCEPTED)
    async gender(
        @Query('langIso') langIso: string) {
        var langIso_ = langIso;
        if (langIso == undefined) {
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
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('martialstatus?')
    @HttpCode(HttpStatus.ACCEPTED)
    async martialstatus(
        @Query('langIso') langIso: string) {
        var langIso_ = langIso;
        if (langIso == undefined) {
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
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Post('logdevice')
    @HttpCode(HttpStatus.ACCEPTED)
    async logdevice(@Req() request: any, @Headers() header,) {
        if ((request.body.imei == undefined) || (request.body.log == undefined) || (request.body.type == undefined) || (header['x-auth-user'] == undefined)) {
            if (!(await this.utilsService.validasiTokenEmail(header))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed',
                );
            } else {
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
            return Response;
        } catch (e) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed',
            );
        }
    }

    @HttpCode(HttpStatus.ACCEPTED)
    @Post('generateProfile')
    async generateProfile(@Req() request: any) {
        return await this.utilsService.generateProfile(request.body.email, 'LOGIN');
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Get('getSetting')
    async getSettingMarketPlace(
        @Headers() headers) {
        let settingMarketPlace = false;
        if (headers['x-auth-user'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }
        var getsetting = await this.utilsService.getSetting_("633f8e57ce76000009000512");
        if (getsetting == undefined) {
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
        return Response;
    }
}
