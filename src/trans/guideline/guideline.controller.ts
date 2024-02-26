import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, BadRequestException, Headers } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Res, HttpStatus, Response, Req } from '@nestjs/common';
import { Request } from 'express';
import { GuidelineService } from './guideline.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import mongoose, { Types } from 'mongoose';

@Controller('api/guidelines')
export class GuidelineController {
    constructor(
        private readonly getGuidelineService: GuidelineService,
        private readonly basic2SS: UserbasicnewService
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Req() request: Request, @Headers() headers, @Res() res): Promise<any> {
        const userdata = await this.basic2SS.findBymail(headers['x-auth-user']);
        var request_json = JSON.parse(JSON.stringify(request.body));
        let checkDuplicate = await this.getGuidelineService.findByName(request_json.name);
        if (!checkDuplicate) {
            request_json._id = new mongoose.Types.ObjectId();
            request_json.createdAt = new Date(Date.now());
            request_json.updatedAt = new Date(Date.now());
            request_json.createdBy = userdata._id;
            request_json.status = 'DRAFT';
            request_json.isActive = true;
            request_json.approvedBy = null;
            let data = await this.getGuidelineService.create(request_json);
            res.send({ response_code: 202, data });
            return { response_code: 202, data };
        } else { throw new BadRequestException("Name already exists"); }
    }

    @Put("/update")
    @UseGuards(JwtAuthGuard)
    async update(@Req() request: Request, @Headers() headers, @Res() res): Promise<any> {
        const userdata = await this.basic2SS.findBymail(headers['x-auth-user']);
        var request_json = JSON.parse(JSON.stringify(request.body));
        request_json.updatedAt = new Date(Date.now());
        request_json.updatedBy = userdata._id;
        let data = await this.getGuidelineService.update(request_json.id, request_json);
        res.send({ response_code: 202, data });
        return { response_code: 202, data };
    }

    @Post("/delete")
    @UseGuards(JwtAuthGuard)
    async delete(@Req() request: Request, @Headers() headers, @Res() res): Promise<any> {
        var request_json = JSON.parse(JSON.stringify(request.body));
        let data = await this.getGuidelineService.delete(request_json.id);
        res.send({ response_code: 202, data });
        return { response_code: 202, data };
    }

    @Post("/list")
    @UseGuards(JwtAuthGuard)
    async list(@Req() request: Request, @Headers() headers, @Res() res): Promise<any> {
        var request_json = JSON.parse(JSON.stringify(request.body));
        let skip = request_json.page * request_json.limit;
        let isActive = undefined;
        if (request_json.filterIsActive) isActive = request_json.isActive;
        let data = await this.getGuidelineService.listAll(skip, request_json.limit, request_json.descending, isActive);
        res.send({ response_code: 202, data });
        return { response_code: 202, data };
    }
}