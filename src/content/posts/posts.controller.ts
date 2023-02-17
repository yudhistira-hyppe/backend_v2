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
import { CreatePostResponse, CreatePostsDto, PostLandingResponseApps, PostResponseApps, TagPeople } from './dto/create-posts.dto';
import { Posts } from './schemas/posts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserauthsService } from '../../trans/userauths/userauths.service';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostContentService } from './postcontent.service';
import { CreateUserplaylistDto } from '../../trans/userplaylist/dto/create-userplaylist.dto';
import { ContenteventsService } from '../contentevents/contentevents.service';
import { InsightsService } from '../insights/insights.service';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import mongoose from 'mongoose';
import { PostCommentService } from './postcomment.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DisqusService } from '../disqus/disqus.service';
import { ContentModService } from './contentmod.service';
import { OyPgService } from '../../paymentgateway/oypg/oypg.service';
import { MethodepaymentsService } from '../../trans/methodepayments/methodepayments.service';
import { PostBoostService } from './postboost.service';
import { TransactionsPostService } from '../../trans/transactionpost/transactionspost.service';

@Controller()
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(private readonly PostsService: PostsService,
    private readonly postContentService: PostContentService,
    private readonly userauthsService: UserauthsService,
    private readonly utilsService: UtilsService,
    private readonly errorHandler: ErrorHandler,
    private readonly bootsService: PostBoostService,
    private readonly contenteventsService: ContenteventsService,
    private readonly insightsService: InsightsService,
    private readonly userbasicsService: UserbasicsService,
    private readonly postCommentService: PostCommentService,
    private readonly notifService: NotificationsService,
    private readonly cmodService: ContentModService,
    private readonly disqusService: DisqusService,
    private transactionsPostService: TransactionsPostService,
    private readonly methodepaymentsService: MethodepaymentsService) { }

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

    await this.errorHandler.generateNotAcceptableException(
      'Unabled to proceed, user permission cannot acces module',
    );
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
      if (dataquery[0].metadata != undefined) {
        data_post['metadata'] = {
          "duration": (dataquery[0].metadata.duration != undefined) ? dataquery[0].metadata.duration : null,
          "postRoll": (dataquery[0].metadata.postRoll != undefined) ? dataquery[0].metadata.postRoll : null,
          "postType": (dataquery[0].metadata.postType != undefined) ? dataquery[0].metadata.postType : null,
          "preRoll": (dataquery[0].metadata.preRoll != undefined) ? dataquery[0].metadata.preRoll : null,
          "midRoll": (dataquery[0].metadata.midRoll != undefined) ? dataquery[0].metadata.midRoll : null,
          "postID": (dataquery[0].metadata.postID != undefined) ? dataquery[0].metadata.postID : null,
          "email": (dataquery[0].metadata.email != undefined) ? dataquery[0].metadata.email : null,
        };
      }
    }

    if (dataquery[0].datacontent != undefined) {
      if (dataquery[0].datacontent.leght > 0) {
        data_post['mediaBasePath'] = (dataquery[0].datacontent[0].mediaBasePath != undefined) ? dataquery[0].datacontent[0].mediaBasePath : null;
        data_post['mediaType'] = (dataquery[0].datacontent[0].mediaType != undefined) ? dataquery[0].datacontent[0].mediaType : null;
        data_post['mediaUri'] = (dataquery[0].datacontent[0].mediaUri != undefined) ? dataquery[0].datacontent[0].mediaUri : null;
      }
    }

    data_post['postType'] = (dataquery[0].postType != undefined) ? dataquery[0].postType : null;
    data_post['description'] = (dataquery[0].description != undefined) ? dataquery[0].description : null;
    data_post['active'] = (dataquery[0].active != undefined) ? dataquery[0].active : null;

    if (dataquery[0].datauser != undefined) {
      if (dataquery[0].datauser.leght > 0) {
        data_post['privacy'] = {
          "isPostPrivate": (dataquery[0].datauser.isPostPrivate != undefined) ? dataquery[0].datauser.isPostPrivate : null,
          "isCelebrity": (dataquery[0].datauser.isCelebrity != undefined) ? dataquery[0].datauser.isCelebrity : null,
          "isPrivate": (dataquery[0].datauser.isPrivate != undefined) ? dataquery[0].datauser.isPrivate : null,
        }
      }
    }
    if (dataquery[0].postType != undefined) {
      if (dataquery[0].postType == 'diary' || dataquery[0].postType == 'vid') {
        data_post['mediaThumbEndpoint'] = '/thumb/' + dataquery[0].postID;
      }
    }
    data_post['postID'] = (dataquery[0].postID != undefined) ? dataquery[0].postID : null;
    data_post['avatar'] = (dataquery[0].avatar != undefined) ? dataquery[0].avatar : null;
    if (dataquery[0].postType != undefined) {
      if (dataquery[0].postType == 'vid') {
        data_post['title'] = dataquery[0].description;
      }
    }
    data_post['tags'] = (dataquery[0].tags != undefined) ? dataquery[0].tags : null;
    data_post['allowComments'] = (dataquery[0].allowComments != undefined) ? dataquery[0].allowComments : null;
    data_post['createdAt'] = (dataquery[0].createdAt != undefined) ? dataquery[0].createdAt : null;

    if (dataquery[0].datauser != undefined) {
      if (dataquery[0].datauser.leght > 0) {
        if (dataquery[0].datauser.insight != undefined) {
          data_post['insight'] = {
            "shares": (dataquery[0].datauser.insight.shares != undefined) ? dataquery[0].datauser.insight.shares : null,
            "comments": (dataquery[0].datauser.insight.comments != undefined) ? dataquery[0].datauser.insight.comments : null,
            "reactions": (dataquery[0].datauser.insight.reactions != undefined) ? dataquery[0].datauser.insight.reactions : null,
            "views": (dataquery[0].datauser.insight.views != undefined) ? dataquery[0].datauser.insight.views : null,
            "likes": (dataquery[0].datauser.insight.likes != undefined) ? dataquery[0].datauser.insight.likes : null,
          };

          data_post['profileInsight'] = {
            "follower": (dataquery[0].datauser.insight.shares != undefined) ? dataquery[0].datauser.insight.followers : null,
            "following": (dataquery[0].datauser.insight.shares != undefined) ? dataquery[0].datauser.insight.followings : null,
          };
        }
      }
    }
    if (dataquery[0].postType != undefined) {
      if (dataquery[0].postType == 'pict') {
        endpoind = '/pict/';
      }
      if (dataquery[0].postType == 'vid') {
        endpoind = '/pict/';
      }
    }
    data_post['mediaEndpoint'] = endpoind + dataquery[0].datacontent[0].postID;
    data_post['email'] = dataquery[0].datauser.email;
    data_post['updatedAt'] = dataquery[0].updatedAt;
    data_post['username'] = dataquery[0].datauser.username;
    data_post['fullName'] = dataquery[0].datauser.fullName;

    var data = [data_post];
    var response = {
      "response_code": 202,
      "data": data,
      "messages": {
        info: ['Successful'],
      },
    }
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/v2/createpost')
  @UseInterceptors(FileInterceptor('postContent'))
  async createPost(@UploadedFile() file: Express.Multer.File, @Body() body, @Headers() headers): Promise<CreatePostResponse> {
    this.logger.log("createPost >>> start");
    console.log('>>>>>>>>>> BODY <<<<<<<<<<', JSON.stringify(body))
    return this.postContentService.createNewPost(file, body, headers);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/createpost')
  @UseInterceptors(FileInterceptor('postContent'))
  async createPostV2(@UploadedFile() file: Express.Multer.File, @Body() body, @Headers() headers): Promise<CreatePostResponse> {
    this.logger.log("createPost >>> start");
    console.log('>>>>>>>>>> BODY <<<<<<<<<<', JSON.stringify(body))
    return this.postContentService.createNewPostV2(file, body, headers);
  }

  @Post('api/posts/testUpload')
  @UseInterceptors(FileInterceptor('postContent'))
  async testPost(@UploadedFile() file: Express.Multer.File, @Body() body) {
    return this.postContentService.uploadVideo(file, body.postID.toString());
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
    var email = headers['x-auth-user'];
    var saleAmount = body.saleAmount;
    var data = null;
    var lang = await this.utilsService.getUserlanguages(email);


    var posts = await this.PostsService.findid(body.postID.toString());
    var dataTransaction = await this.transactionsPostService.findpostid(body.postID.toString());
    if (await this.utilsService.ceckData(dataTransaction)) {
      if (lang == "id") {
        await this.errorHandler.generateNotAcceptableException(
          "Tidak bisa mengedit postingan karena sedang dalam proses pembayaran",
        );
      } else {
        await this.errorHandler.generateNotAcceptableException(
          " Unable to edit the post because it is in the process of payment.",
        );
      }
    }
    data = await this.postContentService.updatePost(body, headers);
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postID', body.postID.toString());
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postType', posts.postType.toString());
    if (saleAmount > 0) {
      await this.utilsService.sendFcmV2(email, email.toString(), "POST", "POST", "UPDATE_POST_SELL", body.postID.toString(), posts.postType.toString())
      //await this.utilsService.sendFcm(email.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event, body.postID.toString(), posts.postType.toString());
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
    //if (body.visibility == 'PUBLIC') {

    return this.bootsService.getBoostV2(body, headers);
    //} else {
    //  return this.postContentService.getUserPostLandingPage(body, headers);
    //}


  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/getuserposts/my')
  @UseInterceptors(FileInterceptor('postContent'))
  async getUserPostMy(@Body() body, @Headers() headers): Promise<PostResponseApps> {
    this.logger.log("getUserPostMy >>> start: " + JSON.stringify(body));
    return this.postContentService.getUserPostMy(body, headers);
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/posts/getboost')
  async getPostBoost(
    @Query('pageNumber') pageNumber: number,
    @Query('pageRow') pageRow: number,
    @Headers() headers) {
    const pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
    const pageRow_ = (pageRow != undefined) ? (pageRow != 0) ? pageRow : 10 : 10;
    return this.postContentService.getUserPostBoost(pageNumber_, pageRow_, headers);
  }

  @Post('api/posts/getnotification')
  @UseInterceptors(FileInterceptor('postContent'))
  async getNotification(@Body() body, @Headers() headers) {
    this.logger.log("getNotification >>> start: " + JSON.stringify(body));
    let y = await this.postContentService.getNotification(body, headers);
    this.logger.log("getNotification >>> res: " + JSON.stringify(y));
    return y;
  }

  @Post('api/posts/getnotificationAll')
  async getNotificationAll() {
    return await this.notifService.getNotificationAll();
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/posts/tagpeople')
  async getTagpeople(@Headers() headers, @Body() body) {
    //CECK BAEARER TOKEN
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed token and email not match',
      );
    }

    //CECK DATA USER
    const data_userbasic = await this.userbasicsService.findOne(headers['x-auth-user']);
    if (!(await this.utilsService.ceckData(data_userbasic))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed User not found'
      );
    }

    if (body.postId == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, Param PostID required'
      );
    }

    var userEmail = headers['x-auth-user'];
    var post = await this.PostsService.findByPostId(body.postId.toString());
    let following = await this.contenteventsService.findFollowing(userEmail);
    if (await this.utilsService.ceckData(post)) {
      if (post.tagPeople != undefined && post.tagPeople.length > 0) {
        let atp = post.tagPeople;
        let atp1 = Array<TagPeople>();

        for (let x = 0; x < atp.length; x++) {
          let tp = atp[x];
          if (tp?.namespace) {
            let oid = tp.oid;
            let ua = await this.userauthsService.findById(oid.toString());
            if (ua != undefined) {
              let tp1 = new TagPeople();
              tp1.email = String(ua.email);
              tp1.username = String(ua.username);

              let ub = await this.userbasicsService.findOne(String(ua.email));
              if (ub != undefined) {
                tp1.avatar = await this.postContentService.getProfileAvatar(ub);
              }

              tp1.status = 'TOFOLLOW';
              if (tp1.email == userEmail) {
                tp1.status = "UNLINK";
              } else {
                for (let i = 0; i < following.length; i++) {
                  let fol = following[i];
                  if (fol.email == tp1.email) {
                    tp1.status = "FOLLOWING";
                  }
                }
              }
              atp1.push(tp1);
            }
          }
        }


        return {
          response_code: 202,
          data: atp1,
          messages: {
            info: ['successfuly'],
          },
        };
      }
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, Data Post not found'
      );
    }
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

  @Post('api/posts/cmod/socket')
  async cmod(@Body() body) {
    this.logger.log("cmod >>> start: " + JSON.stringify(body));
    var event = body.event;
    var payload = body.payload;
    this.cmodService.ws(event, JSON.stringify(payload));
    let t = { 'response': 'Done' };
    return JSON.stringify(t);
  }

  @Get('api/posts/ads')
  async getPostAds(@Headers() headers) {
    return await this.bootsService.sendSoketAds(headers['x-auth-user']);
  }

  @Post('api/posts/notifyapsara/cmod/image')
  async notifyApsaraCmodImage(@Body() body, @Headers() headers) {
    this.logger.log("notifyApsaraCmodImage >>> start: " + JSON.stringify(body));
    this.cmodService.cmodResponse(body);
    let t = { 'response': 'Done' };
    return JSON.stringify(t);
  }

  @Post('api/posts/getvideo')
  async getVideo(@Body() body, @Headers() headers) {
    this.logger.log("getVideo >>> start: " + JSON.stringify(body));
    var definition = "SD";
    if (body.definition != undefined) {
      definition = String(body.definition);
    }
    return this.postContentService.getVideoApsaraSingle(String(body.apsaraId), definition);
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
  async generateNewUserPlaylist() {
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

  @Get('api/posts/getpostm2m')
  @HttpCode(HttpStatus.ACCEPTED)
  async getPostM2M(@Query('postID') postID: string,) {
    var response = {};
    var post = await this.PostsService.findByPostId(postID);
    if (await this.utilsService.ceckData(post)) {
      var media = await this.PostsService.findOnepostID(postID);
      if (await this.utilsService.ceckData(media)) {
        var data = [];
        var data_ = {};
        if (media[0].datacontent[0].mediaBasePath != undefined) {
          data_["mediaBasePath"] = media[0].datacontent[0].mediaBasePath;
        }
        if (post.postType != undefined) {
          data_["postType"] = post.postType;
          if (post.postType == 'vid') {
            if (media[0].datacontent[0].apsaraId != undefined) {
              var dataApsara = await this.postContentService.getVideoApsaraSingleNoDefinition(media[0].datacontent[0].apsaraId);
              var metadata = {
                duration: dataApsara.Duration
              }
              console.log(dataApsara);
              data_['metadata'] = metadata;
            }
          } else if (post.postType == 'diary') {
            if (media[0].datacontent[0].apsaraId != undefined) {
              var dataApsara = await this.postContentService.getVideoApsaraSingleNoDefinition(media[0].datacontent[0].apsaraId);
              var metadata = {
                duration: dataApsara.Duration
              }
              console.log(dataApsara);
              data_['metadata'] = metadata;
            }
          } else if (post.postType == 'story') {
            if (media[0].datacontent[0].apsaraId != undefined) {
              var dataApsara = await this.postContentService.getVideoApsaraSingleNoDefinition(media[0].datacontent[0].apsaraId);
              var metadata = {
                duration: dataApsara.Duration
              }
              console.log(dataApsara);
              data_['metadata'] = metadata;
            }
          }
        }
        if (media[0].datacontent[0].mediaUri != undefined) {
          data_["mediaUri"] = media[0].datacontent[0].mediaUri;
        }
        if (post.description != undefined) {
          data_["description"] = post.description;
        }
        if (post.active != undefined) {
          data_["active"] = post.active;
        }
        if (media[0].datacontent[0].mediaType != undefined) {
          data_["mediaType"] = media[0].datacontent[0].mediaType;
        }
        if (post.postID != undefined) {
          data_["postID"] = post.postID;
        }
        if (post.tags != undefined) {
          data_["tags"] = post.tags;
        }
        if (post.allowComments != undefined) {
          data_["allowComments"] = post.allowComments;
        }
        if (post.createdAt != undefined) {
          data_["createdAt"] = post.createdAt;
        }
        if (media[0].datauser.insight != undefined) {
          data_["insight"] = media[0].datauser.insight;
        }
        if (post.email != undefined) {
          data_["email"] = post.email;
          var dataUserauth = await this.userauthsService.findOneByEmail(post.email.toString());
          if (await this.utilsService.ceckData(dataUserauth)) {
            data_["username"] = dataUserauth.username;
          }
        }
        if (post.email != undefined) {
          var dataUserbasic = await this.userbasicsService.findOne(post.email.toString());
          if (await this.utilsService.ceckData(dataUserbasic)) {
            data_["fullName"] = dataUserbasic.fullName;
          }
        }
        if (post.updatedAt != undefined) {
          data_["updatedAt"] = post.updatedAt;
        }
        data.push(data_)
        response = {
          "response_code": 202,
          "data": data,
          "messages": {
            info: [
              "Succesfully"
            ]
          }
        }
      } else {
        response = {
          "response_code": 202,
          "data": [],
          "messages": {
            info: [
              "Succesfully"
            ]
          }
        }
      }
    } else {
      response = {
        "response_code": 202,
        "data": [],
        "messages": {
          info: [
            "Succesfully"
          ]
        }
      }
    }
    return response;
  }

  @Get('thumb/:id')
  @HttpCode(HttpStatus.OK)
  async thumb(
    @Param('id') id: string,
    @Query('x-auth-token') token: string,
    @Query('x-auth-user') email: string, @Res() response) {
    if ((id != undefined) && (token != undefined) && (email != undefined)) {
      if (await this.utilsService.validasiTokenEmailParam(token, email)) {
        var dataMedia = await this.PostsService.findOnepostID(id);
        if (await this.utilsService.ceckData(dataMedia)) {
          var thum_data = "";
          if (dataMedia[0].datacontent[0].fsTargetThumbUri != undefined) {
            thum_data = dataMedia[0].datacontent[0].fsTargetThumbUri;
          } else {
            thum_data = dataMedia[0].datacontent[0].fsSourceUri;
          }
          if (thum_data != '') {
            var data = await this.PostsService.thum(thum_data);
            if (data != null) {
              response.set("Content-Type", "image/jpeg");
              response.send(data);
            } else {
              response.send(null);
            }
          } else {
            response.send(null);
          }
        } else {
          response.send(null);
        }
      } else {
        response.send(null);
      }
    } else {
      response.send(null);
    }
  }

  @Get('pict/:id')
  @HttpCode(HttpStatus.OK)
  async pict(
    @Param('id') id: string,
    @Query('x-auth-token') token: string,
    @Query('x-auth-user') email: string, @Res() response) {
    if ((id != undefined) && (token != undefined) && (email != undefined)) {
      if (await this.utilsService.validasiTokenEmailParam(token, email)) {
        var dataMedia = await this.PostsService.findOnepostID(id);
        if (await this.utilsService.ceckData(dataMedia)) {
          var image_data = "";
          var mediaMime = "";
          if (dataMedia[0].datacontent[0].fsSourceUri != undefined) {
            image_data = dataMedia[0].datacontent[0].fsSourceUri;
          }
          if (dataMedia[0].datacontent[0].mediaMime != undefined) {
            mediaMime = dataMedia[0].datacontent[0].mediaMime;
          } else {
            mediaMime = "image/jpeg";
          }
          if (image_data != '') {
            var data = await this.PostsService.pict(image_data);
            if (data != null) {
              response.set("Content-Type", "image/png");
              response.send(data);
            } else {
              response.send(null);
            }
          } else {
            response.send(null);
          }
        } else {
          response.send(null);
        }
      } else {
        response.send(null);
      }
    } else {
      response.send(null);
    }
  }

  @Get('stream/:id')
  @HttpCode(HttpStatus.OK)
  async stream(@Param('id') mediaFile: string, @Headers() headers, @Res() response) {
    if ((headers['x-auth-user'] != undefined) && (headers['x-auth-token'] != undefined) && (headers['post-id'] != undefined) && (mediaFile != undefined)) {
      if (await this.utilsService.validasiTokenEmailParam(headers['x-auth-token'], headers['x-auth-user'])) {
        var dataMedia = await this.PostsService.findOnepostID(headers['post-id']);
        if (await this.utilsService.ceckData(dataMedia)) {
          var mediaBasePath = "";
          if (dataMedia != null) {
            if (dataMedia[0].datacontent[0].mediaBasePath != undefined) {
              mediaBasePath = dataMedia[0].datacontent[0].mediaBasePath;
            }
            if (mediaBasePath != "") {
              var data = await this.PostsService.stream(mediaBasePath + mediaFile);
              if (data != null) {
                response.set("Content-Type", "application/octet-stream");
                response.send(data);
              } else {
                response.send(null);
              }
            } else {
              response.send(null);
            }
          } else {
            response.send(null);
          }
        } else {
          response.send(null);
        }
      } else {
        response.send(null);
      }
    } else {
      response.send(null);
    }
  }

  @Get('api/posts/getMax')
  async testdm() {
    return await this.cmodService.getMax2();
  }

  @UseGuards(JwtAuthGuard)
  @Put('api/posts/delete/:id')
  async deletePost(@Res() res, @Param('id') id: string) {
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };
    // var idobj = mongoose.Types.ObjectId(id);
    try {
      let data = await this.PostsService.updatenonaktif(id);
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

  @Post('api/posts/postbychart')
  @UseGuards(JwtAuthGuard)
  async getPostChartBasedDate(@Req() request: Request): Promise<any> {
    var data = null;
    var date = null;
    var iduser = null;

    const messages = {
      "info": ["The process successful"],
    };

    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["date"] !== undefined) {
      date = request_json["date"];
    }
    else {
      throw new BadRequestException("Unabled to proceed");
    }

    var tempdata = await this.PostsService.getPostByDate(date);
    var getdata = [];
    try {
      getdata = tempdata[0].resultdata;
    }
    catch (e) {
      getdata = [];
    }

    var startdate = new Date(date);
    startdate.setDate(startdate.getDate() - 1);
    var tempdate = new Date(startdate).toISOString().split("T")[0];
    var end = new Date().toISOString().split("T")[0];
    var array = [];

    //kalo lama, berarti error disini!!
    while (tempdate != end) {
      var temp = new Date(tempdate);
      temp.setDate(temp.getDate() + 1);
      tempdate = new Date(temp).toISOString().split("T")[0];
      //console.log(tempdate);

      let obj = getdata.find(objs => objs._id === tempdate);
      //console.log(obj);
      if (obj == undefined) {
        obj =
        {
          _id: tempdate,
          totaldata: 0
        }
      }

      array.push(obj);
    }

    data =
    {
      data: array,
      total: (getdata.length == parseInt('0') ? parseInt('0') : tempdata[0].total)
    }

    return { response_code: 202, messages, data };
  }

  @Get('api/posts/showsertifikasistatbychart')
  @UseGuards(JwtAuthGuard)
  async getCertifiedStatByChart(@Req() request: Request): Promise<any> {
    var data = null;

    const messages = {
      "info": ["The process successful"],
    };

    var tempdata = await this.PostsService.getAllSertifikasiChart();
    try {
      data = tempdata[0].data;
    }
    catch (e) {
      data = [
        {
          "id": "TIDAK BERSERTIFIKAT",
          "total": 0,
          "persentase": 0
        },
        {
          "id": "BERSERTIFIKAT",
          "total": 0,
          "persentase": 0
        }
      ];
    }

    return { response_code: 202, messages, data };
  }

  @Post('api/posts/analityc')
  @UseGuards(JwtAuthGuard)
  async getByChart(@Req() request: Request): Promise<any> {
    var data = null;
    var startdate = null;
    var enddate = null;
    var datasummary = [];
    var lengviews = 0;
    var arrdataview = [];
    const messages = {
      "info": ["The process successful"],
    };
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["startdate"] !== undefined) {
      startdate = request_json["startdate"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["enddate"] !== undefined) {
      enddate = request_json["enddate"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    var date1 = new Date(startdate);
    var date2 = new Date(enddate);

    //calculate time difference  
    var time_difference = date2.getTime() - date1.getTime();

    //calculate days difference by dividing total milliseconds in a day  
    var resultTime = time_difference / (1000 * 60 * 60 * 24);
    console.log(resultTime);
    try {
      datasummary = await this.PostsService.analiticPost(startdate, enddate);
      lengviews = datasummary.length;
    }
    catch (e) {
      datasummary = [];
      lengviews = 0;
    }

    if (resultTime > 0) {
      for (var i = 0; i < resultTime + 1; i++) {
        var dt = new Date(startdate);
        dt.setDate(dt.getDate() + i);
        var splitdt = dt.toISOString();
        var dts = splitdt.split('T');
        var stdt = dts[0].toString();
        var diary = 0;
        var pict = 0;
        var vid = 0;
        var story = 0;
        for (var j = 0; j < lengviews; j++) {
          if (datasummary[j].date == stdt) {
            diary = datasummary[j].diary;
            pict = datasummary[j].pict;
            vid = datasummary[j].vid;
            story = datasummary[j].story;
            break;
          }
        }
        arrdataview.push({
          'date': stdt,
          'diary': diary,
          'pict': pict,
          'vid': vid,
          'story': story
        });

      }

    }

    return { response_code: 202, messages, data: arrdataview };
  }

  @Post('api/posts/landing-page/recentStory')
  @UseGuards(JwtAuthGuard)
  async getRecentStory(@Req() request: Request): Promise<any> {
    var data = null;
    var email = null;

    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["email"] !== undefined) {
      email = request_json["email"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    const messages = {
      "info": ["The process successful"],
    };

    var tempdata = await this.userauthsService.getRecentStory(email);
    for (var i = 0; i < tempdata.length; i++) {
      var getdata = tempdata[i].story;
      for (var j = 0; j < getdata.length; j++) {
        var listvideo = [];
        var listimage = [];
        var getchildata = getdata[j];
        var response = null;
        if (getchildata.mediaType == "image" || getchildata.mediaType == "images") {
          listimage.push(getchildata.apsaraId);
          try {
            getchildata.media = await this.postContentService.getImageApsara(listimage);
          } catch (e) {
            getchildata.media = {};
          }
        }

      }
    }


    data = tempdata;


    return { response_code: 202, data, messages };
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/story/following/')
  async getAllFollowerStoryBasedEmail(@Req() request: Request): Promise<any> {
    var data = null;
    var email = null;

    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["email"] !== undefined) {
      email = request_json["email"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    const messages = {
      "info": ["The process successful"],
    };

    var tempdata = await this.contenteventsService.getFollowerStoryByEmail(email);
    //console.log(tempdata);
    for (var i = 0; i < tempdata.length; i++) {
      var getdata = tempdata[i].story;
      for (var j = 0; j < getdata.length; j++) {
        var listimage = [];
        var getchildata = getdata[j];
        if (getchildata.mediaType == "image" || getchildata.mediaType == "images") {
          listimage.push(getchildata.apsaraId);
          try {
            getchildata.media = await this.postContentService.getImageApsara(listimage);
          } catch (e) {
            getchildata.media = {};
          }
        }
      }
    }

    data = tempdata;

    return { response_code: 202, data, messages };
  }


  @Post('api/posts/interaksi')
  @UseGuards(JwtAuthGuard)
  async getByCharti(@Req() request: Request): Promise<any> {
    var data = null;
    var startdate = null;
    var enddate = null;
    var datasummary = [];
    var lengviews = 0;
    var arrdataview = [];
    const messages = {
      "info": ["The process successful"],
    };
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["startdate"] !== undefined) {
      startdate = request_json["startdate"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["enddate"] !== undefined) {
      enddate = request_json["enddate"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    var date1 = new Date(startdate);
    var date2 = new Date(enddate);

    //calculate time difference  
    var time_difference = date2.getTime() - date1.getTime();

    //calculate days difference by dividing total milliseconds in a day  
    var resultTime = time_difference / (1000 * 60 * 60 * 24);
    console.log(resultTime);
    try {
      datasummary = await this.PostsService.analitycview(startdate, enddate);
      lengviews = datasummary.length;
    }
    catch (e) {
      datasummary = [];
      lengviews = 0;
    }

    if (resultTime > 0) {
      for (var i = 0; i < resultTime + 1; i++) {
        var dt = new Date(startdate);
        dt.setDate(dt.getDate() + i);
        var splitdt = dt.toISOString();
        var dts = splitdt.split('T');
        var stdt = dts[0].toString();
        var views = 0;
        var likes = 0;
        var comments = 0;

        for (var j = 0; j < lengviews; j++) {
          if (datasummary[j].date == stdt) {
            views = datasummary[j].views;
            likes = datasummary[j].likes;
            comments = datasummary[j].comments;

            break;
          }
        }
        arrdataview.push({
          'date': stdt,
          'views': views,
          'likes': likes,
          'comments': comments,

        });

      }

    }

    return { response_code: 202, messages, data: arrdataview };
  }

}
