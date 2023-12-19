import { Body, Controller, HttpCode, Headers, Get, HttpStatus, Post, UseGuards, Query } from '@nestjs/common';
import { MediastreamingService } from './mediastreaming.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { Long } from 'mongodb';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import mongoose from 'mongoose';
import { MediastreamingDto, MediastreamingRequestDto } from './dto/mediastreaming.dto';
import { ConfigService } from '@nestjs/config';
import { MediastreamingalicloudService } from './mediastreamingalicloud.service';
import { AppGateway } from '../socket/socket.gateway';
import { UserauthsService } from 'src/trans/userauths/userauths.service';
import { MediastreamingrequestService } from './mediastreamingrequest.service';

@Controller("api/live") 
export class MediastreamingController {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly errorHandler: ErrorHandler,
    private readonly configService: ConfigService,
    private readonly mediastreamingService: MediastreamingService,
    private readonly mediastreamingalicloudService: MediastreamingalicloudService,
    private readonly userbasicsService: UserbasicsService, 
    private readonly userauthService: UserauthsService, 
    private readonly mediastreamingrequestService: MediastreamingrequestService, 
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
    const generateId = new mongoose.Types.ObjectId();
  
    const expireTime = Math.round(((currentDate.date.getTime())/1000)) + Number(EXPIRATION_TIME_LIVE.toString());
    const getUrl = await this.mediastreamingService.generateUrl(generateId.toString(), expireTime);
    let _MediastreamingDto_ = new MediastreamingDto();
    _MediastreamingDto_._id = generateId;
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
  async updateStreaming(@Body() MediastreamingDto_: MediastreamingDto, @Headers() headers) {
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
    var profile_auth = await this.userauthService.findOne(headers['x-auth-user']);
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
        const ceckView = await this.mediastreamingService.findView(MediastreamingDto_._id.toString(), profile._id.toString());
        console.log("ceckView",ceckView);
        if (!(await this.utilsService.ceckData(ceckView))) {
          //UPDATE VIEW
          const dataView = {
            userId: new mongoose.Types.ObjectId(profile._id.toString()),
            status: true,
            createAt: currentDate,
            updateAt: currentDate
          }
          await this.mediastreamingService.insertView(MediastreamingDto_._id.toString(), dataView);
          //UPDATE COMMENT
          const dataComment = {
            userId: new mongoose.Types.ObjectId(profile._id.toString()),
            status: true,
            messages: profile_auth.username +" Join in room",
            createAt: currentDate,
            updateAt: currentDate
          }
          await this.mediastreamingService.insertComment(MediastreamingDto_._id.toString(), dataComment);
          //SEND VIEW COUNT
          const dataStream = await this.mediastreamingService.findOneStreaming(MediastreamingDto_._id.toString());
          console.log(dataStream)
          const dataStreamSend = {
            data: {
              idStream: dataStream._id,
              viewCount: dataStream.view.length
            }
          }
          console.log(dataStreamSend)
          this.appGateway.eventStream("VIEW_STREAM", JSON.stringify(dataStreamSend));
          //SEND COMMENT SINGLE
          const getUser = await this.userbasicsService.getUser(profile._id.toString());
          getUser[0]["idStream"] = MediastreamingDto_._id.toString();
          getUser[0]["messages"] = profile_auth.username + " Join in room";
          const singleSend = {
            data: getUser[0]
          }
          this.appGateway.eventStream("COMMENT_STREAM_SINGLE", JSON.stringify(singleSend));
        } 
      }
      //CECK TYPE CLOSE_VIEW
      if (MediastreamingDto_.type == "CLOSE_VIEW") {
        const ceckView = await this.mediastreamingService.findView(MediastreamingDto_._id.toString(), profile._id.toString());
        if (await this.utilsService.ceckData(ceckView)) {
          //UPDATE VIEW
          await this.mediastreamingService.updateView(MediastreamingDto_._id.toString(), profile._id.toString(), true, false, currentDate);
          //UPDATE COMMENT
          const dataComment = {
            userId: new mongoose.Types.ObjectId(profile._id.toString()),
            status: true,
            messages: profile_auth.username + " Leave in room",
            createAt: currentDate,
            updateAt: currentDate
          }
          await this.mediastreamingService.insertComment(MediastreamingDto_._id.toString(), dataComment);
          //SEND VIEW COUNT
          const dataStream = await this.mediastreamingService.findOneStreaming(MediastreamingDto_._id.toString());
          const dataStreamSend = {
            data: {
              idStream: dataStream._id,
              viewCount: dataStream.view.length
            }
          }
          this.appGateway.eventStream("VIEW_STREAM", JSON.stringify(dataStreamSend));
          //SEND COMMENT SINGLE
          const getUser = await this.userbasicsService.getUser(profile._id.toString());
          getUser[0]["idStream"] = MediastreamingDto_._id.toString();
          getUser[0]["messages"] = profile_auth.username + " Leave in room";
          const singleSend = {
            data: getUser[0]
          }
          this.appGateway.eventStream("COMMENT_STREAM_SINGLE", JSON.stringify(singleSend));
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
            data:{
              idStream: dataStream._id,
              likeCount: dataStream.like.length
            }
          }
          this.appGateway.eventStream("LIKE_STREAM", JSON.stringify(dataStreamSend));
        }
      }
      //CECK TYPE COMMENT
      if (MediastreamingDto_.type == "COMMENT") {
        if (MediastreamingDto_.messages !=undefined) {
          //UPDATE COMMENT
          const dataComment = {
            userId: new mongoose.Types.ObjectId(profile._id.toString()),
            status: true,
            messages: MediastreamingDto_.messages,
            createAt: currentDate,
            updateAt: currentDate
          };
          await this.mediastreamingService.insertComment(MediastreamingDto_._id.toString(), dataComment);
          //SEND COMMENT SINGLE
          const getUser = await this.userbasicsService.getUser(profile._id.toString());
          getUser[0]["idStream"] = MediastreamingDto_._id.toString();
          getUser[0]["messages"] = MediastreamingDto_.messages;
          const singleSend = {
            data: getUser[0]
          }
          this.appGateway.eventStream("COMMENT_STREAM_SINGLE", JSON.stringify(singleSend));
          //SEND COMMENT ALL
          const getData = await this.mediastreamingService.getDataComment(MediastreamingDto_._id.toString())
          const allSend = {
            data: getData
          }
          this.appGateway.eventStream("COMMENT_STREAM_ALL", JSON.stringify(allSend));
        }
      }
      //CECK TYPE COMMENT
      if (MediastreamingDto_.type == "COMMENT_DISABLED") {
        if (MediastreamingDto_.commentDisabled != undefined) {
          const allSend = {
            data: {
              idStream: MediastreamingDto_._id,
              comment: MediastreamingDto_.commentDisabled
            }
          }
          this.appGateway.eventStream("COMMENT_STREAM_DISABLED", JSON.stringify(allSend));
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
  @Post('/view')
  @HttpCode(HttpStatus.ACCEPTED)
  async getViewStreaming(@Body() MediastreamingDto_: MediastreamingDto, @Headers() headers) {
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
    var ceckId = await this.utilsService.validateParam("_id", MediastreamingDto_._id.toString(), "string")
    if (ceckId != "") {
      await this.errorHandler.generateBadRequestException(
        ceckId,
      );
    }
    console.log(MediastreamingDto_)

    const data = await this.mediastreamingService.getDataView(MediastreamingDto_._id.toString(), MediastreamingDto_.page, MediastreamingDto_.limit);
    return await this.errorHandler.generateAcceptResponseCodeWithData(
      "Get view succesfully", data,
    );
  }

  @Get('/callback/apsara')
  @HttpCode(HttpStatus.OK)
  async getCallback(
    @Query('action') action: string,
    @Query('ip') ip: string,
    @Query('id') id: string,
    @Query('app	') app: string,
    @Query('appname') appname: string,
    @Query('time') time: string,
    @Query('usrargs') usrargs: string,
    @Query('height') height: string,
    @Query('width') width: string){
      if (id!=undefined){
        const CeckData = await this.mediastreamingService.findOneStreaming(id.toString());
        if (await this.utilsService.ceckData(CeckData)){
          let MediastreamingDto_ = new MediastreamingDto();
          if (action = "publish_done") {
            MediastreamingDto_.status = false;
            MediastreamingDto_.endLive = await this.utilsService.getIntegertoDate(Number(time));
          }
          // if (action = "publish") {
          //   MediastreamingDto_.status = true;
          //   MediastreamingDto_.startLive = await this.utilsService.getIntegertoDate(Number(time));
          // }
          this.mediastreamingService.updateStreaming(id.toString(), MediastreamingDto_)
        }
      }
      const param = {
        action: action,
        ip: ip,
        id: id,
        app: app,
        appname: appname,
        time: time,
        usrargs: usrargs,
        height: height,
        width: width,
      }
      const response = {
        code: 200,
        messages: "Succes"
      }
      let MediastreamingRequestDto_ = new MediastreamingRequestDto();
      MediastreamingRequestDto_._id = new mongoose.Types.ObjectId();
      MediastreamingRequestDto_.url = "/api/live/callback/apsara";
      MediastreamingRequestDto_.request = param;
      MediastreamingRequestDto_.response = response;
      MediastreamingRequestDto_.createAt = await this.utilsService.getDateTimeString();
      MediastreamingRequestDto_.updateAt = await this.utilsService.getDateTimeString();
      this.mediastreamingrequestService.createStreamingRequest(MediastreamingRequestDto_);
      return response
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
      let _id: mongoose.Types.ObjectId[] = [];
      const data = await this.mediastreamingalicloudService.DescribeLiveStreamsOnlineList(undefined, pageSize, pageNumber);
      if (data.totalNum>0){
        const arrayOnline = data.onlineInfo.liveStreamOnlineInfo;
        _id = arrayOnline.map(function (item) {
          return new mongoose.Types.ObjectId(item['streamName']);
        });
      }
      return await this.errorHandler.generateAcceptResponseCodeWithData(
        "Get stream succesfully", _id,
      );
    }catch(e){

    }
  }

  @Post('/test')
  async exampleGenerateLink(){
    const getUrl = await this.mediastreamingService.generateUrlTest("657fb4b76ea72f0b782c610a", 1702873753);
  }
}
