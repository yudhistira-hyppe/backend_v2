import { Body, Controller, Post, UseGuards, Headers, HttpStatus, HttpCode, Get, Param, Query } from "@nestjs/common";
import { AdsNotificationService } from "./adsnotification.service";
import { JwtAuthGuard } from "../../../auth/jwt-auth.guard";
import { UtilsService } from "../../../utils/utils.service";
import { ErrorHandler } from "../../../utils/error.handler";
import { CreateTemplatesRepoDto } from "src/infra/templates_repo/dto/create-templatesrepo.dto";

@Controller('api/adsv2/adsnotification')
export class AdsNotificationController {
  constructor(
    private readonly adsNotificationService: AdsNotificationService,
    private readonly utilsService: UtilsService,
    private readonly errorHandler: ErrorHandler) { }

  @UseGuards(JwtAuthGuard)
  @Post('api/adsv2/adsnotification/update')
  @HttpCode(HttpStatus.ACCEPTED)
  async update(@Body() CreateTemplatesRepoDto_: CreateTemplatesRepoDto, @Headers() headers) {
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
    if (CreateTemplatesRepoDto_._id == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed param _id is required',
      );
    }
    const currentDate = await this.utilsService.getDateTimeString();
    var data = await this.adsNotificationService.update(CreateTemplatesRepoDto_._id.toString(), CreateTemplatesRepoDto_);
    var Response = {
      data: data,
      response_code: 202,
      messages: {
        info: [
          "Update Ads Notification succesfully"
        ]
      }
    }
    return Response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/adsv2/adsnotification/:id')
  async getOne(@Param('id') id: string, @Headers() headers) {
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
    if (id == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed param id is required',
      );
    }
    var data = await this.adsNotificationService.findOne(id);
    var Response = {
      data: data,
      response_code: 202,
      messages: {
        info: [
          "Get Ads Notification succesfully"
        ]
      }
    }
    return Response;
  }
}