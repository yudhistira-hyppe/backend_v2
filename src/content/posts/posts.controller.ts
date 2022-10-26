import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
  Headers,
  Request, Logger,
  BadRequestException, HttpStatus, Put, Res, HttpCode, Query, UseInterceptors, UploadedFile
} from '@nestjs/common';
import { FormDataRequest } from 'nestjs-form-data';
import { PostsService } from './posts.service';
import { CreatePostResponse, CreatePostsDto, PostLandingResponseApps, PostResponseApps } from './dto/create-posts.dto';
import { Posts } from './schemas/posts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserauthsService } from '../../trans/userauths/userauths.service';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { GroupModuleService } from '../../trans/usermanagement/groupmodule/groupmodule.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { GlobalResponse } from '../../utils/data/globalResponse';
import { PostContentService } from './postcontent.service';
import { CreateUserplaylistDto } from '../../trans/userplaylist/dto/create-userplaylist.dto';
import { ContenteventsService } from '../contentevents/contentevents.service';
import { InsightsService } from '../insights/insights.service';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import { PostContentPlaylistService } from './postcontentplaylist.service';
import mongoose from 'mongoose';
import { PostCommentService } from './postcomment.service';
import { DisqusService } from './disqus.service';
import { NotificationsService } from '../notifications/notifications.service';

@Controller()
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(private readonly PostsService: PostsService,
    private readonly postContentService: PostContentService,
    private readonly userauthsService: UserauthsService,
    private readonly utilsService: UtilsService,
    private readonly errorHandler: ErrorHandler,
    private readonly contenteventsService: ContenteventsService,
    private readonly insightsService: InsightsService,
    private readonly userbasicsService: UserbasicsService,
    private readonly postCommentService: PostCommentService,    
    private readonly notifService: NotificationsService,
    private readonly disqusService: DisqusService,    
    private readonly groupModuleService: GroupModuleService) { }

  @Post()
  async create(@Body() CreatePostsDto: CreatePostsDto) {
    await this.PostsService.create(CreatePostsDto);
  }

  @Get('api/posts')
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Posts[]> {
    return this.PostsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/posts/regcontens')
  async regContent(): Promise<Object> {
    return this.PostsService.regcontenMonetize();
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/posts/newcontens')
  async newContent(): Promise<Object> {
    return this.PostsService.newcontenMonetize();
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/getcontent/')
  async getContent(@Req() req): Promise<Object> {
    var email = req.body.email;
    var type = req.body.type;
    var type_ = "all";
    if (email == undefined) {
      throw new BadRequestException('Unabled to proceed');
    }
    if (type != undefined) {
      type_ = type;
    }
    return this.PostsService.getContent(email, type_);
  }

  // @Get(':id')
  // async findOneId(@Param('id') id: string): Promise<Posts> {
  //   return this.PostsService.findOne(id);
  // }

  @Get('api/posts:email')
  async findOneId(@Param('email') email: string): Promise<Posts> {
    return this.PostsService.findOne(email);
  }

  @Get('api/posts/test')
  async test(): Promise<string> {
    console.log('sdfds');
    return this.postContentService.generateCertificate('da65f057-288f-49cf-9f43-f83251b2b098', 'id');
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.PostsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/monetizebyyear')
  async countPost(@Body('year') year: number, @Headers() headers): Promise<Object> {
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, email is required',
      );
    }

    var user_email_header = headers['x-auth-user'];
    if (!(await this.groupModuleService.validasiModule2(user_email_header, 'Beranda-Card-Status-Kepemilikan', 'view'))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, user permission cannot acces module',
      );
    }
    return this.PostsService.MonetizeByYear(year);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update:id')
  async update(@Res() res, @Param('id') id: string, @Req() request: Request) {
    var saleAmount = 0;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["saleAmount"] !== undefined) {
      saleAmount = request_json["saleAmount"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };
    try {
      let data = await this.PostsService.updateprice(id, saleAmount);
      res.status(HttpStatus.OK).json({
        response_code: 202,
        "message": messages
      });
    } catch (e) {
      res.status(HttpStatus.BAD_REQUEST).json({

        "message": messagesEror
      });
    }
  }


  @UseGuards(JwtAuthGuard)
  @Post('api/posts/deletetag')
  async deleteTag(@Req() request) {
    var email = null;
    var postID = null;
    var data = null;
    var dataauth = null;
    var tagPeople = [];
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["email"] !== undefined) {
      email = request_json["email"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["postID"] !== undefined) {
      postID = request_json["postID"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };

    try {
      dataauth = await this.userauthsService.findOneByEmail(email);
      var ido = dataauth._id;
    } catch (e) {
      throw new BadRequestException("Unabled to proceed");
    }
    //deletetagpeople
    try {

      this.PostsService.updateTags(postID, ido);
      return { response_code: 202, messages };
    } catch (e) {
      return { response_code: 500, messagesEror };
    }

  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Get('api/posts/getpost')
  async getposts(
    @Query() CreatePostsDto_: CreatePostsDto,
    @Headers() headers) {
    var dataquery = await this.PostsService.findOnepostID(CreatePostsDto_.postID.toString());
    var endpoind = '';
    var data_post = {};
    if (dataquery[0].postType == 'vid') {
      data_post['metadata'] = {
        "duration": dataquery[0].metadata.duration,
        "postRoll": dataquery[0].metadata.postRoll,
        "postType": dataquery[0].metadata.postType,
        "preRoll": dataquery[0].metadata.preRoll,
        "midRoll": dataquery[0].metadata.midRoll,
        "postID": dataquery[0].metadata.postID,
        "email": dataquery[0].metadata.email,
      };
    }
    data_post['mediaBasePath'] = dataquery[0].datacontent[0].mediaBasePath;
    data_post['postType'] = dataquery[0].postType;
    data_post['mediaUri'] = dataquery[0].datacontent[0].mediaUri;
    data_post['description'] = dataquery[0].description;
    data_post['active'] = dataquery[0].active;
    data_post['privacy'] = {
      "isPostPrivate": dataquery[0].datauser[0].isPostPrivate,
      "isCelebrity": dataquery[0].datauser[0].isCelebrity,
      "isPrivate": dataquery[0].datauser[0].isPrivate,
    }
    data_post['mediaType'] = dataquery[0].datacontent[0].mediaType;
    if (dataquery[0].postType == 'diary' || dataquery[0].postType == 'vid') {
      data_post['mediaThumbEndpoint'] = '/thumb/' + dataquery[0].postID;
    }
    data_post['postID'] = dataquery[0].postID;
    data_post['avatar'] = dataquery[0].datauser[0].avatar;
    if (dataquery[0].postType == 'vid') {
      data_post['title'] = dataquery[0].description;
    }
    data_post['tags'] = dataquery[0].tags;
    data_post['allowComments'] = dataquery[0].allowComments;
    data_post['createdAt'] = dataquery[0].createdAt;
    data_post['insight'] = {
      "shares": dataquery[0].datauser[0].insight.shares,
      "comments": dataquery[0].datauser[0].insight.comments,
      "reactions": dataquery[0].datauser[0].insight.reactions,
      "views": dataquery[0].datauser[0].insight.views,
      "likes": dataquery[0].datauser[0].insight.likes,
    };
    data_post['profileInsight'] = {
      "follower": dataquery[0].datauser[0].insight.followers,
      "following": dataquery[0].datauser[0].insight.followings,
    };
    if (dataquery[0].postType == 'pict') {
      endpoind = '/pict/';
    }
    if (dataquery[0].postType == 'vid') {
      endpoind = '/pict/';
    }
    data_post['mediaEndpoint'] = endpoind + dataquery[0].datacontent[0].postID;
    data_post['email'] = dataquery[0].datauser[0].email;
    data_post['updatedAt'] = dataquery[0].updatedAt;
    data_post['username'] = dataquery[0].datauser[0].username;

    var data = [data_post];
    var response = {
      "response_code": 202,
      "data": data,
      "messages": {},
    }
    return dataquery;
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/createpost')
  @UseInterceptors(FileInterceptor('postContent'))
  async createPost(@UploadedFile() file: Express.Multer.File, @Body() body, @Headers() headers): Promise<CreatePostResponse> {
    this.logger.log("createPost >>> start");
    return this.postContentService.createNewPost(file, body, headers);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/removecomment')
  @UseInterceptors(FileInterceptor('postContent'))
  async removeComment(@Body() body, @Headers() headers): Promise<CreatePostResponse> {
    this.logger.log("removeComment >>> start");
    return this.postCommentService.removeComment(body, headers);
  }  

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/postviewer')
  @UseInterceptors(FileInterceptor('postContent'))
  async postViewer(@Body() body, @Headers() headers): Promise<CreatePostResponse> {
    this.logger.log("postViewer >>> start");
    return this.postCommentService.postViewer(body, headers);
  }    

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/updatepost')
  @UseInterceptors(FileInterceptor('postContent'))  
  async updatePost(@Body() body, @Headers() headers): Promise<CreatePostResponse> {
    this.logger.log("updatePost >>> start");
    var titleinsukses = "Selamat";
    var titleensukses = "Congratulations";
    var bodyinsukses = "Konten Anda siap dijual";
    var bodyensukses = "Your content is ready for sale";
    var eventType = "POST";
    var event = "POST";
    var email = headers['x-auth-user'];
    var saleAmount = body.saleAmount;
    var data = null;

    data = await this.postContentService.updatePost(body, headers);

    if (saleAmount > 0) {
      await this.utilsService.sendFcm(email.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event);
    }

    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/getuserposts')
  @UseInterceptors(FileInterceptor('postContent'))
  async getUserPost(@Body() body, @Headers() headers): Promise<PostResponseApps> {
    this.logger.log("getUserPost >>> start: " + JSON.stringify(body));
    return this.postContentService.getUserPost(body, headers);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/getuserposts/landing-page')
  @UseInterceptors(FileInterceptor('postContent'))
  async getUserPostLandingPage(@Body() body, @Headers() headers): Promise<PostLandingResponseApps> {
    console.log(body);
    this.logger.log("getUserPostLandingPage >>> start: " + JSON.stringify(body));
    return this.postContentService.getUserPostLandingPage(body, headers);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/getuserposts/my')
  @UseInterceptors(FileInterceptor('postContent'))
  async getUserPostMy(@Body() body, @Headers() headers): Promise<PostResponseApps> {
    this.logger.log("getUserPostMy >>> start: " + JSON.stringify(body));
    return this.postContentService.getUserPostMy(body, headers);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/disqus')
  @UseInterceptors(FileInterceptor('postContent'))
  async disqus(@Body() body, @Headers() headers): Promise<PostResponseApps> {
    this.logger.log("disqus >>> start: " + JSON.stringify(body));
    return this.disqusService.createDisqus(body, headers);
  }

  @Post('api/posts/getnotification')
  async getNotification(@Body() body, @Headers() headers) {
    this.logger.log("getNotification >>> start: " + JSON.stringify(body));
    return this.notifService.getNotification(body, headers);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/getuserposts/byprofile')
  @UseInterceptors(FileInterceptor('postContent'))
  async getUserPostByProfile(@Body() body, @Headers() headers): Promise<PostResponseApps> {
    this.logger.log("getUserPostByProfile >>> start: " + JSON.stringify(body));
    return this.postContentService.getUserPostByProfile(body, headers);
  }

  @Post('api/posts/notifyapsara')
  async notifyApsara(@Body() body, @Headers() headers) {
    this.logger.log("notifyApsara >>> start: " + JSON.stringify(body));
    this.postContentService.updateNewPost(body, headers);
    let t = { 'response': 'Done' };
    return JSON.stringify(t);
  }

  @Post('api/posts/getvideo')
  async getVideo(@Body() body, @Headers() headers) {
    this.logger.log("getVideo >>> start: " + JSON.stringify(body));
    return this.postContentService.getVideoApsaraSingle(String(body.apsaraId));
  }

  @Post('api/userplaylist/generate')
  @HttpCode(HttpStatus.ACCEPTED)
  async generateUserPlaylist(@Body() CreateUserplaylistDto_: CreateUserplaylistDto) {
    return await this.PostsService.generateUserPlaylist(CreateUserplaylistDto_);
  }

  @Post('api/userplaylist/updategenerate')
  @HttpCode(HttpStatus.ACCEPTED)
  async updategenerateUserPlaylist(@Body() body) {
    var CreateUserplaylistDto_ = new CreateUserplaylistDto();
    CreateUserplaylistDto_.userPostId = new mongoose.Types.ObjectId(body.userPostId);
    CreateUserplaylistDto_.mediaId = body.mediaId;
    CreateUserplaylistDto_.postType = body.postType;
    return await this.PostsService.updateGenerateUserPlaylist(new mongoose.Types.ObjectId(body.oldUserPostID), CreateUserplaylistDto_);
  }

  @Post('api/userplaylist/updategenerate2')
  @HttpCode(HttpStatus.ACCEPTED)
  async updateGenerateUserPlaylist_(@Body() body) {
    var CreateUserplaylistDto_ = new CreateUserplaylistDto();
    CreateUserplaylistDto_.userPostId = new mongoose.Types.ObjectId(body.userPostId);
    CreateUserplaylistDto_.mediaId = body.mediaId;
    CreateUserplaylistDto_.postType = body.postType;
    return await this.PostsService.updateGenerateUserPlaylist_(CreateUserplaylistDto_);
  } 

  @Get('api/userplaylist/generateNewUserPlaylist')
  @HttpCode(HttpStatus.ACCEPTED)
  async generateNewUserPlaylist() {;
    return await this.PostsService.generateNewUserPlaylist("633d0c26c9dca3610d7209f9");
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/getinteractives')
  @HttpCode(HttpStatus.ACCEPTED)
  @FormDataRequest()
  async getinteractives(
    @Headers() headers,
    @Body() body,
    // @Query('eventType') eventType: string,
    // @Query('withDetail') withDetail: boolean,
    // @Query('withEvents') withEvents: string,
    // @Query('postID') postID: string,
    // @Query('pageRow') pageRow: number,
    // @Query('pageNumber') pageNumber: number,
    // @Query('senderOrReceiver') senderOrReceiver: string
  ) {
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

    let postID_ = "";
    let eventType_ = "";
    let withEvents_ = [];
    let withDetail_ = false;
    let pageRow_ = 10;
    let pageNumber_ = 1;
    let senderOrReceiver_ = "";

    if (body.pageRow != undefined) {
      pageRow_ = body.pageRow;
    }
    if (body.pageNumber != undefined) {
      pageNumber_ = body.pageNumber;
    }
    if (body.postID != undefined) {
      postID_ = body.postID;
    }
    if (body.eventType != undefined) {
      eventType_ = body.eventType;
    }
    if (body.withDetail != undefined) {
      withDetail_ = body.withDetail;
    }
    if (body.withEvents != undefined) {
      const Array_withEvents = body.withEvents.split(",");
      for (let i = 0; i < Array_withEvents.length; i++) {
        withEvents_.push(Array_withEvents[i]);
      }
    }
    if (body.senderOrReceiver != undefined) {
      senderOrReceiver_ = body.senderOrReceiver;
    }
    const insightsService_data = await this.insightsService.findemail(headers['x-auth-user']);
    const userbasicsService_data = await this.userbasicsService.findOne(headers['x-auth-user']);
    const contenteventsService_data = await this.contenteventsService.findByCriteria(headers['x-auth-user'], postID_, eventType_, withEvents_, pageRow_, pageNumber_);
    var getProfile_ = await this.utilsService.generateProfile(headers['x-auth-user'], 'PROFILE');
    var avatar_ = {}
    if (getProfile_ != null || getProfile_ != undefined) {
      if (getProfile_.avatar != null || getProfile_.avatar != undefined) {
        if (getProfile_.avatar.mediaBasePath != null || getProfile_.avatar.mediaBasePath != undefined) {
          Object.assign(avatar_, {
            "mediaBasePath": getProfile_.avatar.mediaBasePath,
          });
        }
        if (getProfile_.avatar.mediaUri != null || getProfile_.avatar.mediaUri != undefined) {
          Object.assign(avatar_, {
            "mediaUri": getProfile_.avatar.mediaUri,
          });
        }
        if (getProfile_.avatar.mediaType != null || getProfile_.avatar.mediaType != undefined) {
          Object.assign(avatar_, {
            "mediaType": getProfile_.avatar.mediaType,
          });
        }
        if (getProfile_.avatar.mediaEndpoint != null || getProfile_.avatar.mediaEndpoint != undefined) {
          Object.assign(avatar_, {
            "mediaEndpoint": getProfile_.avatar.mediaEndpoint,
          });
        }
      }
    }

    let data_response = [];
    for (let i = 0; i < contenteventsService_data.length; i++) {
      var emailSenderorreceiver = (contenteventsService_data[i].senderParty != undefined) ? contenteventsService_data[i].senderParty : (contenteventsService_data[i].receiverParty != undefined) ? contenteventsService_data[i].receiverParty : null;

      if (emailSenderorreceiver != null) {
        var getProfile = await this.utilsService.generateProfile(emailSenderorreceiver.toString(), 'PROFILE');
      }

      var datas = {}
      var senderOrReceiverInfo = {}
      var avatar = {}
      if (getProfile != null || getProfile != undefined) {
        if (getProfile.avatar != null || getProfile.avatar != undefined) {
          if (getProfile.avatar.mediaBasePath != null || getProfile.avatar.mediaBasePath != undefined) {
            Object.assign(avatar, {
              "mediaBasePath": getProfile.avatar.mediaBasePath,
            });
          }
          if (getProfile.avatar.mediaUri != null || getProfile.avatar.mediaUri != undefined) {
            Object.assign(avatar, {
              "mediaUri": getProfile.avatar.mediaUri,
            });
          }
          if (getProfile.avatar.mediaType != null || getProfile.avatar.mediaType != undefined) {
            Object.assign(avatar, {
              "mediaType": getProfile.avatar.mediaType,
            });
          }
          if (getProfile.avatar.mediaEndpoint != null || getProfile.avatar.mediaEndpoint != undefined) {
            Object.assign(avatar, {
              "mediaEndpoint": getProfile.avatar.mediaEndpoint,
            });
          }
        }
      }

      if (getProfile != null || getProfile != undefined) {
        Object.assign(senderOrReceiverInfo, {
          "fullName": (getProfile != null) ? (getProfile.fullName != undefined) ? getProfile.fullName : "" : "",
          avatar,
          "email": getProfile.email,
          "username": getProfile.username,
        });
      }
      if (withDetail_) {
        Object.assign(datas, {
          "createdAt": contenteventsService_data[i].createdAt,
        });
        Object.assign(datas, {
          "profileInsight": {
            "follower": insightsService_data.followers,
            "following": insightsService_data.followings,
          },
        });
        Object.assign(datas, {
          senderOrReceiverInfo,
        });
        Object.assign(datas, {
          "fullName": userbasicsService_data.fullName,
        });
      }
      var avatar = avatar_;
      Object.assign(datas, {
        "flowIsDone": contenteventsService_data[i].flowIsDone,
        "eventType": contenteventsService_data[i].eventType,
        avatar,
        "event": contenteventsService_data[i].event,
        "senderOrReceiver": (contenteventsService_data[i].senderParty != undefined) ? contenteventsService_data[i].senderParty : contenteventsService_data[i].receiverParty,
        "email": contenteventsService_data[i].email
      });
      if (getProfile_ != null || getProfile_ != undefined) {
        if (withDetail_) {
          Object.assign(datas, {
            "username": getProfile_.username,
          });
        }
      }
      data_response.push(datas);
    }
    let data_filter = [];
    console.log("senderOrReceiver_", senderOrReceiver_);
    if (senderOrReceiver_ != "") {
      data_filter = data_response.filter(function (data_response_) {
        return data_response_.senderOrReceiver == senderOrReceiver_;
      });
      data_response = data_filter;
    }
    return {
      "response_code": 202,
      "data": data_response,
      "messages": {
        "info": [
          "The process successful"
        ]
      }
    }
  }
}
