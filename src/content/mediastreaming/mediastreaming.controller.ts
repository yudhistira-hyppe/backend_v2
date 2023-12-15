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

    //Get EXPIRATION_TIME_LIVE
    const GET_EXPIRATION_TIME_LIVE = this.configService.get("EXPIRATION_TIME_LIVE");
    const EXPIRATION_TIME_LIVE = await this.utilsService.getSetting_Mixed(GET_EXPIRATION_TIME_LIVE);
  
    const expireTime = Math.round(((currentDate.date.getTime())/1000)) + Number(EXPIRATION_TIME_LIVE.toString());
    const getUrl = await this.mediastreamingService.generateUrl(profile._id.toString(), expireTime);
    let _MediastreamingDto_ = new MediastreamingDto();
    _MediastreamingDto_._id = new mongoose.Types.ObjectId();
    _MediastreamingDto_.userId = new mongoose.Types.ObjectId(profile._id.toString());
    _MediastreamingDto_.expireTime = Long.fromInt(expireTime);
    _MediastreamingDto_.view = [];
    _MediastreamingDto_.comment = [];
    _MediastreamingDto_.like = [];
    _MediastreamingDto_.share = [];
    _MediastreamingDto_.follower = [];
    _MediastreamingDto_.urlStream = getUrl.urlStream;
    _MediastreamingDto_.urlIngest = getUrl.urlIngest;
    _MediastreamingDto_.createAt = currentDate.dateString; 
    if (MediastreamingDto_.title != undefined) {
      _MediastreamingDto_.title = MediastreamingDto_.title;
    }
    _MediastreamingDto_.status = true;
    _MediastreamingDto_.startLive = currentDate.dateString; 

    const data = await this.mediastreamingService.createStreaming(_MediastreamingDto_);
    const dataResponse = {};
    dataResponse['_id'] = data._id;
    dataResponse['title'] = data.title;
    dataResponse['userId'] = data.userId;
    dataResponse['expireTime'] = Number(data.expireTime);
    dataResponse['startLive'] = data.startLive;
    dataResponse['status'] = data.status;
    dataResponse['view'] = data.view;
    dataResponse['comment'] = data.comment;
    dataResponse['like'] = data.like;
    dataResponse['share'] = data.share;
    dataResponse['follower'] = data.follower;
    dataResponse['urlStream'] = data.urlStream;
    dataResponse['urlIngest'] = data.urlIngest;
    dataResponse['createAt'] = data.createAt;
    const Response = {
      response_code: 202,
      data: dataResponse,
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
        if (Number(ceckId.expireTime) > Number(getDateTime)) {
          if (MediastreamingDto_.title != undefined) {
            _MediastreamingDto_.title = MediastreamingDto_.title;
          }
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
          const dataStream = await this.mediastreamingService.findOneStreaming(MediastreamingDto_._id.toString());
          const dataStreamSend = {
            _id: MediastreamingDto_._id,
            viewCount: dataStream.view.length,
          }
          this.appGateway.eventStream("VIEW_STREAM", JSON.stringify(dataStreamSend));
        } 
      }
      //CECK TYPE CLOSE_VIEW
      if (MediastreamingDto_.type == "CLOSE_VIEW") {
        const ceckView = await this.mediastreamingService.findView(profile._id.toString());
        if (await this.utilsService.ceckData(ceckView)) {
          await this.mediastreamingService.updateView(MediastreamingDto_._id.toString(), profile._id.toString(), true, false, currentDate);
          const dataStream = await this.mediastreamingService.findOneStreaming(MediastreamingDto_._id.toString());
          const dataStreamSend = {
            _id: MediastreamingDto_._id,
            viewCount: dataStream.view.length,
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
  @Post('/view/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  async getViewStreaming(@Param('id') id: string, @Headers() headers) {
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
    //VALIDASI PARAM _id
    var ceckId = await this.utilsService.validateParam("id", id.toString(), "string")
    if (ceckId != "") {
      await this.errorHandler.generateBadRequestException(
        ceckId,
      );
    }

    const data = await this.mediastreamingService.getDataView(id.toString());
    return await this.errorHandler.generateAcceptResponseCodeWithData(
      "Get view succesfully", data,
    );
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
