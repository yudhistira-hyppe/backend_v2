import { Controller, Get, HttpCode, HttpStatus, UseGuards, Headers, Post, Body, Req } from '@nestjs/common';
import { AssetsFilterService } from './assets-filter.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from 'src/utils/error.handler';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import { CreateAssetsFilterDto, UpdateAssetsFilterDto } from './dto/create-assets-filter.dto';
import mongoose from 'mongoose';
import { LogapisService } from 'src/trans/logapis/logapis.service';


@Controller('api/assets/filter')
export class AssetsFilterController {
    constructor(
        private readonly assetsFilterService: AssetsFilterService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler,
        private readonly userbasicsService: UserbasicsService,
        private readonly logapiSS: LogapisService,
    ) {}


    @Post('/create')
    async createfilter(@Body() CreateAssetsFilterDto_: CreateAssetsFilterDto) {
        console.log(CreateAssetsFilterDto_);
        CreateAssetsFilterDto_._id = new mongoose.Types.ObjectId();
        return await this.assetsFilterService.create(CreateAssetsFilterDto_);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Get('/user')
    async getfilter(@Headers() headers, @Req() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }
        var profile = await this.userbasicsService.findOne(headers['x-auth-user']);
        if (!(await this.utilsService.ceckData(profile))) {

            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
        var assetsUser = await (await this.userbasicsService.findOne(headers['x-auth-user'])).userAssets;
        if (await this.utilsService.ceckData(assetsUser)){
            assetsUser.map(function (i) {
                return new mongoose.Types.ObjectId(i);
            });
        }

        var data = await this.assetsFilterService.find(assetsUser);

        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

        return {
            response_code: 202,
            data: data,
            messages: {
                info: ['Get assets successfully'],
            },
        }; 
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/update')
    async updateAssets(@Headers() headers, @Body() UpdateAssetsFilterDto_: UpdateAssetsFilterDto, @Req() req) {
        var timestamps_start = await this.utilsService.getDateTimeString(); 

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }
        var profile = await this.userbasicsService.findOne(headers['x-auth-user']);
        if (!(await this.utilsService.ceckData(profile))) {
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }

        if (UpdateAssetsFilterDto_.assets!=undefined){
            if (UpdateAssetsFilterDto_.assets.length < 0) {
                var fullurl = req.get("Host") + req.originalUrl;
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);
                
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, Param assets is required',
                );
            } 
        } else {
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, Param assets is required',
            );
        }

        var _UpdateAssetsFilterDto_ = new UpdateAssetsFilterDto()
        _UpdateAssetsFilterDto_.assets = UpdateAssetsFilterDto_.assets.map(function (i) {
            return new mongoose.Types.ObjectId(i);
        });
        this.userbasicsService.updateUserAssets(headers['x-auth-user'], _UpdateAssetsFilterDto_.assets)

        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(_UpdateAssetsFilterDto_));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

        return {
            response_code: 202,
            messages: {
                info: ['Update successfully'],
            },
        }; 
    }
}
