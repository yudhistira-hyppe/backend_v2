import { Controller, Get, HttpCode, HttpStatus, UseGuards, Headers, Post, Body } from '@nestjs/common';
import { AssetsFilterService } from './assets-filter.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from 'src/utils/error.handler';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import { CreateAssetsFilterDto, UpdateAssetsFilterDto } from './dto/create-assets-filter.dto';
import mongoose from 'mongoose';


@Controller('api/assets/filter')
export class AssetsFilterController {
    constructor(
        private readonly assetsFilterService: AssetsFilterService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler,
        private readonly userbasicsService: UserbasicsService,
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
    async getfilter(@Headers() headers) {
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
        var profile = await this.userbasicsService.findOne(headers['x-auth-user']);
        if (!(await this.utilsService.ceckData(profile))) {
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
        return await this.assetsFilterService.find(assetsUser);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/update')
    async updateAssets(@Headers() headers, @Body() UpdateAssetsFilterDto_: UpdateAssetsFilterDto) {
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
        var profile = await this.userbasicsService.findOne(headers['x-auth-user']);
        if (!(await this.utilsService.ceckData(profile))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }

        if (UpdateAssetsFilterDto_.assets!=undefined){
            if (UpdateAssetsFilterDto_.assets.length < 0) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, Param assets is required',
                );
            } 
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, Param assets is required',
            );
        }

        var _UpdateAssetsFilterDto_ = new UpdateAssetsFilterDto()
        _UpdateAssetsFilterDto_.assets = UpdateAssetsFilterDto_.assets.map(function (i) {
            return new mongoose.Types.ObjectId(i);
        });
        this.userbasicsService.updateUserAssets(headers['x-auth-user'], _UpdateAssetsFilterDto_.assets)

        return {
            response_code: 202,
            messages: {
                info: ['Update successfully'],
            },
        }; 
    }
}
