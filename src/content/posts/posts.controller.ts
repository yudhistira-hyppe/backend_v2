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

@Controller()
export class PostsController {
  private readonly logger = new Logger(PostsController.name);
  
  constructor(private readonly PostsService: PostsService,
    private readonly postContentService: PostContentService,
    private readonly userauthsService: UserauthsService,
    private readonly utilsService: UtilsService,
    private readonly errorHandler: ErrorHandler,
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
        "messages": { },
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
    let t = {'response' : 'Done'};
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

  @UseGuards(JwtAuthGuard)
  @Post('api/posts/getinteractives')
  @HttpCode(HttpStatus.ACCEPTED)
  async getinteractives(
    @Query('eventType') eventType: string,
    @Query('withDetail') withDetail: boolean,
    @Query('withEvents') withEvents: string,
    @Query('postID') postID: string,
    @Query('pageRow') pageRow: number,
    @Query('pageNumber') pageNumber: number,
    @Query('senderOrReceiver') senderOrReceiver: string) {

  }
}
