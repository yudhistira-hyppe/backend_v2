import { Body, Controller, HttpCode, Headers, Get, Param, HttpStatus, Post, UseGuards, Logger, Query, UseInterceptors, UploadedFile, Res, Request } from '@nestjs/common';
import { MediastreamingService } from './mediastreaming.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { Long } from 'mongodb';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import mongoose from 'mongoose';
import { MediastreamingDto } from './dto/mediastreaming.dto';
import { ConfigService } from '@nestjs/config';
import { MediastreamingalicloudService } from './mediastreamingalicloud.service';
import { AppGateway } from '../socket/socket.gateway';
import { Mediastreaming } from './schema/mediastreaming.schema';

@Controller("api/live") 
export class MediastreamingController {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly errorHandler: ErrorHandler,
    private readonly configService: ConfigService,
    private readonly mediastreamingService: MediastreamingService,
    private readonly mediastreamingalicloudService: MediastreamingalicloudService,
    private readonly userbasicsService: UserbasicsService,
    private readonly appGateway: AppGateway,) { } 

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  @HttpCode(HttpStatus.ACCEPTED)
  async createStreaming(@Body() MediastreamingDto_: MediastreamingDto, @Headers() headers) {
    const currentDate = await this.utilsService.getDate();
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
    //VALIDASI PARAM title
    var ceck_title = await this.utilsService.validateParam("title", MediastreamingDto_.title.toString(), "string")
    if (ceck_title != "") {
      await this.errorHandler.generateBadRequestException(
        ceck_title,
      );
    }

    //Get EXPIRATION_TIME_LIVE
    const GET_EXPIRATION_TIME_LIVE = this.configService.get("EXPIRATION_TIME_LIVE");
    const EXPIRATION_TIME_LIVE = await this.utilsService.getSetting_Mixed(GET_EXPIRATION_TIME_LIVE);
  
    const expireTime = currentDate.date.getTime() + Number(EXPIRATION_TIME_LIVE.toString());
    const getUrl = await this.mediastreamingService.generateUrl(profile._id.toString(), expireTime);
    let _MediastreamingDto_ = new MediastreamingDto();
    _MediastreamingDto_._id = new mongoose.Types.ObjectId();
    _MediastreamingDto_.userId = new mongoose.Types.ObjectId(profile._id.toString());
    _MediastreamingDto_.expireTime = Long.fromBigInt(expireTime);
    _MediastreamingDto_.title = MediastreamingDto_.title.toString();
    _MediastreamingDto_.status = false;
    _MediastreamingDto_.view = [];
    _MediastreamingDto_.comment = [];
    _MediastreamingDto_.like = [];
    _MediastreamingDto_.share = [];
    _MediastreamingDto_.follower = [];
    _MediastreamingDto_.urlStream = getUrl.urlStream;
    _MediastreamingDto_.urlIngest = getUrl.urlIngest;
    _MediastreamingDto_.createAt = currentDate.dateString;

    const data = await this.mediastreamingService.createStreaming(_MediastreamingDto_);
    var Response = {
      response_code: 202,
      data: data,
      messages: {
        info: [
          "Create stream succesfully"
        ]
      }
    }
    return Response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/update')
  @HttpCode(HttpStatus.ACCEPTED)
  async updateStreaming(@Body() MediastreamingDto_: MediastreamingDto, @Headers() headers, @Request() req) {
    console.log(MediastreamingDto_);
    const currentDate = await this.utilsService.getDateTimeString();
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
    //VALIDASI PARAM _id
    var ceck_id = await this.utilsService.validateParam("_id", MediastreamingDto_._id.toString(), "string")
    if (ceck_id != "") {
      await this.errorHandler.generateBadRequestException(
        ceck_id,
      );
    }
    //VALIDASI PARAM type
    var ceck_type = await this.utilsService.validateParam("type", MediastreamingDto_.type, "string")
    if (ceck_type != "") {
      await this.errorHandler.generateBadRequestException(
        ceck_type,
      );
    }

    const ceckId = await this.mediastreamingService.findOneStreaming(MediastreamingDto_._id.toString());
    let _MediastreamingDto_ = new MediastreamingDto();
    if (await this.utilsService.ceckData(ceckId)){
      //CECK TYPE START
      if (MediastreamingDto_.type == "START"){
        const getDateTime = new Date().getTime();
        if (ceckId.expireTime > Long.fromInt(getDateTime)) {
          _MediastreamingDto_.status = true;
          _MediastreamingDto_.startLive = currentDate;
          await this.mediastreamingService.updateStreaming(MediastreamingDto_._id.toString(), _MediastreamingDto_);
        } else {
          await this.errorHandler.generateInternalServerErrorException(
            'Unabled to proceed, Stream is expired ',
          );
        }
      }
      //CECK TYPE STOP
      if (MediastreamingDto_.type == "STOP") {
        _MediastreamingDto_.status = false;
        _MediastreamingDto_.endLive = currentDate;
        await this.mediastreamingService.updateStreaming(MediastreamingDto_._id.toString(), _MediastreamingDto_);
      }
      //CECK TYPE OPEN_VIEW
      if (MediastreamingDto_.type == "OPEN_VIEW") {
        const ceckView = await this.mediastreamingService.findView(profile._id.toString());
        if (!(await this.utilsService.ceckData(ceckView))) {
          const dataView = {
            userId: new mongoose.Types.ObjectId(profile._id.toString()),
            status: true,
            createAt: currentDate,
            updateAt: currentDate
          }
          await this.mediastreamingService.insertView(MediastreamingDto_._id.toString(), dataView);
          const getDataView = await this.mediastreamingService.getDataView(MediastreamingDto_._id.toString());
          const dataStreamSend = {
            _id: MediastreamingDto_._id,
            view: getDataView,
          }
          this.appGateway.eventStream("VIEW_STREAM", JSON.stringify(dataStreamSend));
        } 
      }
      //CECK TYPE CLOSE_VIEW
      if (MediastreamingDto_.type == "CLOSE_VIEW") {
        const ceckView = await this.mediastreamingService.findView(profile._id.toString());
        if (await this.utilsService.ceckData(ceckView)) {
          await this.mediastreamingService.updateView(MediastreamingDto_._id.toString(), profile._id.toString(), false, currentDate);
          const getDataView = await this.mediastreamingService.getDataView(MediastreamingDto_._id.toString());
          const dataStreamSend = {
            _id: MediastreamingDto_._id,
            view: getDataView,
          }
          this.appGateway.eventStream("VIEW_STREAM", JSON.stringify(dataStreamSend));
        }
      }
      //CECK TYPE LIKE
      if (MediastreamingDto_.type == "LIKE") {
        if (MediastreamingDto_.like.length > 0) {
          let dataLike = MediastreamingDto_.like;
          const likesave = dataLike.map((str) => ({ userId: new mongoose.Types.ObjectId(profile._id.toString()), createAt: str }));
          await this.mediastreamingService.insertLike(MediastreamingDto_._id.toString(), likesave);
          const dataStream = await this.mediastreamingService.findOneStreaming(MediastreamingDto_._id.toString());
          const dataStreamSend = {
            _id: dataStream._id,
            like: dataStream.like,
            likeCount: dataStream.like.length
          }
          this.appGateway.eventStream("LIKE_STREAM", JSON.stringify(dataStreamSend));
        }
      }
      return await this.errorHandler.generateAcceptResponseCode(
        "Update stream succesfully",
      );
    } else {
      await this.errorHandler.generateInternalServerErrorException(
        'Unabled to proceed, _id Stream not exist',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/list')
  @HttpCode(HttpStatus.ACCEPTED)
  async listStreaming(
    @Query('pageNumber') pageNumber: number,
    @Query('pageRow') pageSize: number, @Headers() headers) {
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

    try {
      let _id: string[] = [];
      const data = await this.mediastreamingalicloudService.DescribeLiveStreamsOnlineList(undefined, pageSize, pageNumber);
      if (data.totalNum>0){
        const arrayOnline = data.onlineInfo.liveStreamOnlineInfo;
        _id = arrayOnline.map(function (item) {
          return item['streamName'];
        });
      }
      return await this.errorHandler.generateAcceptResponseCodeWithData(
        "Get stream succesfully", _id,
      );
    }catch(e){

    }
  }
}
