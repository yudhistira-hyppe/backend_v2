import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, HttpStatus, Put, Headers } from '@nestjs/common';
import { AdsService } from './ads.service';
import { CreateAdsDto } from './dto/create-ads.dto';
import { Ads } from './schemas/ads.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UservouchersService } from '../uservouchers/uservouchers.service';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { CitiesService } from '../../infra/cities/cities.service';
import { AdstypesService } from '../adstypes/adstypes.service';
import { FileInterceptor, FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
@Controller('api/ads')
export class AdsController {

    constructor(private readonly adsService: AdsService,
        private readonly uservouchersService: UservouchersService,
        private readonly userbasicsService: UserbasicsService,
        private citiesService: CitiesService,
        private adstypesService: AdstypesService,) { }

    @Post()
    async create(@Res() res, @Headers('x-auth-token') auth: string, @Body() CreateAdsDto: CreateAdsDto, @Request() req) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        var token = auth;
        var reptoken = token.replace("Bearer ", "");
        var x = await this.parseJwt(reptoken);
        var email = x.email;

        var ubasic = await this.userbasicsService.findOne(email);

        var iduser = ubasic._id;
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var dtexpired = new Date(CreateAdsDto.expiredAt);

        var dataUservoucher = null;
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        try {
            dataUservoucher = await this.uservouchersService.findUser(mongoose.Types.ObjectId(iduser));
        } catch (e) {
            dataUservoucher = null;
        }

        var typeadsId = CreateAdsDto.typeAdsID;
        var datatypesAds = null;
        var creditValue = 0;
        try {
            datatypesAds = await this.adstypesService.findOne(mongoose.Types.ObjectId(typeadsId));
            console.log(datatypesAds);
            creditValue = datatypesAds._doc.creditValue;

        } catch (e) {
            datatypesAds = null;
            creditValue = 0;
        }

        if (dataUservoucher !== null) {
            try {

                CreateAdsDto.timestamp = dt.toISOString();
                CreateAdsDto.expiredAt = dtexpired.toISOString();
                CreateAdsDto.userID = iduser;
                CreateAdsDto.status = "DRAFT";
                CreateAdsDto.isActive = false;
                CreateAdsDto.totalUsedCredit = creditValue;
                CreateAdsDto.userVoucherID = mongoose.Types.ObjectId(CreateAdsDto.userVoucherID);
                CreateAdsDto.typeAdsID = mongoose.Types.ObjectId(CreateAdsDto.typeAdsID);
                CreateAdsDto.placingID = mongoose.Types.ObjectId(CreateAdsDto.placingID);
                let data = await this.adsService.create(CreateAdsDto);
                res.status(HttpStatus.OK).json({
                    response_code: 202,
                    "data": data,
                    "message": messages
                });
            } catch (e) {
                res.status(HttpStatus.BAD_REQUEST).json({

                    "message": messagesEror
                });
            }
        } else {
            res.status(HttpStatus.BAD_REQUEST).json({

                "message": "Silahkan beli voucher dahulu.."
            });
        }

    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<Ads[]> {
        return this.adsService.findAll();
    }
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Ads> {
        return this.adsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.adsService.delete(id);
    }
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Res() res, @Param('id') id: string, @Body() createAdsDto: CreateAdsDto) {

        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.adsService.update(id, createAdsDto);
            res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": data,
                "message": messages
            });
        } catch (e) {
            res.status(HttpStatus.BAD_REQUEST).json({

                "message": messagesEror
            });
        }
    }
    async parseJwt(token) {

        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    };

}
