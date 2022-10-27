import { Body, Headers, Controller, Delete, Get, Param, Post, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ContenteventsService } from './contentevents.service';
import { ContentEventId, CreateContenteventsDto } from './dto/create-contentevents.dto';
import { Contentevents } from './schemas/contentevents.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GroupModuleService } from '../../trans/usermanagement/groupmodule/groupmodule.service';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { InsightsService } from '../insights/insights.service';
import { PostDisqusService } from '../disqus/post/postdisqus.service';
import { request } from 'http';
import { TemplatesRepo } from '../../infra/templates_repo/schemas/templatesrepo.schema';

@Controller()
export class ContenteventsController {
  constructor(
    private readonly contenteventsService: ContenteventsService,
    private readonly groupModuleService: GroupModuleService,
    private readonly utilsService: UtilsService,
    private readonly insightsService: InsightsService,
    private readonly postsService: PostDisqusService,
    private readonly errorHandler: ErrorHandler) { }

  @Post('api/contentevents')
  async create(@Body() CreateContenteventsDto: CreateContenteventsDto) {
    await this.contenteventsService.create(CreateContenteventsDto);
  }

  @Get('api/contentevents')
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Contentevents[]> {
    return this.contenteventsService.findAll();
  }

  @Get('api/contentevents/:email')
  async findOneId(@Param('email') email: string): Promise<Contentevents> {
    return this.contenteventsService.findOne(email);
  }

  @Delete('api/contentevents/:id')
  async delete(@Param('id') id: string) {
    return this.contenteventsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/contentevents/useractivitynow')
  async countUsersActivityNow(@Body('date') date: Date, @Headers() headers): Promise<Object> {
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, email is required',
    //   );
    // }

    // var user_email_header = headers['x-auth-user'];
    // if (!(await this.groupModuleService.validasiModule2(user_email_header, 'Dashboard-User-Activity-Now', 'view'))){
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, user permission cannot acces module',
    //   );
    // }
    return this.contenteventsService.UserActivityNow(date);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/contentevents/useractivitybeforetoday')
  async countUserActivityBeforeToday(
    @Body('day') day: number, @Headers() headers
  ): Promise<Object> {
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, email is required',
    //   );
    // }

    // var user_email_header = headers['x-auth-user'];
    // if (!(await this.groupModuleService.validasiModule2(user_email_header, 'Dashboard-User-Activity-Before-Today', 'view'))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, user permission cannot acces module',
    //   );
    // }
    return this.contenteventsService.UserActivityBeforeToday(day);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/contentevents/useractivitysize')
  async countUserActivitySize(@Body('day') day: number, @Headers() headers
  ): Promise<Object> {
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, email is required',
    //   );
    // }

    // var user_email_header = headers['x-auth-user'];
    // if (!(await this.groupModuleService.validasiModule2(user_email_header, 'Dashboard-User-Activity-Size', 'view'))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, user permission cannot acces module',
    //   );
    // }
    return this.contenteventsService.UserActivitySize(day);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/contentevents/useractivitysizeYear')
  async countUserActivitySizeYear(@Body('year') year: number, @Headers() headers): Promise<Object> {
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, email is required',
    //   );
    // }

    // var user_email_header = headers['x-auth-user'];
    // if (!(await this.groupModuleService.validasiModule2(user_email_header, 'Engagement-User-Activity-Size-Year', 'view'))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, user permission cannot acces module',
    //   );
    // }
    return this.contenteventsService.UserActivitySizeYear(year);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/contentevents/useractivityyear')
  async countUserActivityYear(@Body('year') year: number, @Headers() headers): Promise<Object> {
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, email is required',
    //   );
    // }

    // var user_email_header = headers['x-auth-user'];
    // if (!(await this.groupModuleService.validasiModule2(user_email_header, 'Engagement-User-Activity-Year', 'view'))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, user permission cannot acces module',
    //   );
    // }
    return this.contenteventsService.UserActivityYear(year);
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/friend/:email')
  async friend(@Param('email') email: string, @Headers() headers) {
    var data = await this.contenteventsService.friend(email, headers);
    return {
      response_code: 202,
      data: data,
      count_friend: (await data).length,
      messages: {
        info: ['Succes Get Friend'],
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/posts/interactive')
  async interactive(@Req() request: any, @Headers() headers) {
    if (headers['x-auth-user'] == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed auth-user undefined',
      );
    }
    if (request.body.eventType == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, param eventType is required',
      );
    }
    if (request.body.receiverParty == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, param eventType is required',
      );
    }

    const eventType = request.body.eventType;
    const email_user = headers['x-auth-user'];
    const email_receiverParty = request.body.receiverParty;
    const current_date = await this.utilsService.getDateTimeString();

    if (eventType == "FOLLOWING") {
      var ceck_data_FOLLOWER = await this.contenteventsService.ceckData(email_receiverParty, "FOLLOWER", "ACCEPT", email_user, "", "");
      var ceck_data_FOLLOWING = await this.contenteventsService.ceckData(email_user, "FOLLOWING", "ACCEPT", "", email_receiverParty, "");
      if (!(await this.utilsService.ceckData(ceck_data_FOLLOWER)) && !(await this.utilsService.ceckData(ceck_data_FOLLOWING))) {
        var _id_1 = (await this.utilsService.generateId());
        var _id_2 = (await this.utilsService.generateId());
        var CreateContenteventsDto1 = new CreateContenteventsDto();
        CreateContenteventsDto1._id = _id_1
        CreateContenteventsDto1.contentEventID = _id_1
        CreateContenteventsDto1.email = email_receiverParty
        CreateContenteventsDto1.eventType = "FOLLOWER"
        CreateContenteventsDto1.active = true
        CreateContenteventsDto1.event = "ACCEPT"
        CreateContenteventsDto1.createdAt = current_date
        CreateContenteventsDto1.updatedAt = current_date
        CreateContenteventsDto1.sequenceNumber = 1
        CreateContenteventsDto1.flowIsDone = true
        CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
        CreateContenteventsDto1.receiverParty = email_user

        var CreateContenteventsDto2 = new CreateContenteventsDto();
        CreateContenteventsDto2._id = _id_2
        CreateContenteventsDto2.contentEventID = _id_2
        CreateContenteventsDto2.email = email_user
        CreateContenteventsDto2.eventType = "FOLLOWING"
        CreateContenteventsDto2.active = true
        CreateContenteventsDto2.event = "ACCEPT"
        CreateContenteventsDto2.createdAt = current_date
        CreateContenteventsDto2.updatedAt = current_date
        CreateContenteventsDto2.sequenceNumber = 1
        CreateContenteventsDto2.flowIsDone = true
        CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
        CreateContenteventsDto2.senderParty = email_receiverParty
        try {
          await this.contenteventsService.create(CreateContenteventsDto1);
          await this.contenteventsService.create(CreateContenteventsDto2);
          await this.insightsService.updateFollower(email_receiverParty);
          await this.insightsService.updateFollowing(email_user);
          this.sendInteractiveFCM(email_receiverParty, "FOLLOWER", "", email_user);
          this.sendInteractiveFCM(email_user, "FOLLOWING", "", email_receiverParty);
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed, ' +
            error,
          );
        }
      }
    } else if (eventType == "VIEW") {
      var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "VIEW", "DONE", email_receiverParty, "", request.body.postID);
      var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "VIEW", "ACCEPT", "", email_user, request.body.postID);
      if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
        var _id_1 = (await this.utilsService.generateId());
        var _id_2 = (await this.utilsService.generateId());
        var CreateContenteventsDto1 = new CreateContenteventsDto();
        CreateContenteventsDto1._id = _id_1
        CreateContenteventsDto1.contentEventID = _id_1
        CreateContenteventsDto1.email = email_user
        CreateContenteventsDto1.eventType = "VIEW"
        CreateContenteventsDto1.active = true
        CreateContenteventsDto1.event = "DONE"
        CreateContenteventsDto1.createdAt = current_date
        CreateContenteventsDto1.updatedAt = current_date
        CreateContenteventsDto1.sequenceNumber = 1
        CreateContenteventsDto1.flowIsDone = true
        CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
        CreateContenteventsDto1.receiverParty = email_receiverParty
        CreateContenteventsDto1.postID = request.body.postID

        var CreateContenteventsDto2 = new CreateContenteventsDto();
        CreateContenteventsDto2._id = _id_2
        CreateContenteventsDto2.contentEventID = _id_2
        CreateContenteventsDto2.email = email_receiverParty
        CreateContenteventsDto2.eventType = "VIEW"
        CreateContenteventsDto2.active = true
        CreateContenteventsDto2.event = "ACCEPT"
        CreateContenteventsDto2.createdAt = current_date
        CreateContenteventsDto2.updatedAt = current_date
        CreateContenteventsDto2.sequenceNumber = 1
        CreateContenteventsDto2.flowIsDone = true
        CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
        CreateContenteventsDto2.senderParty = email_user
        CreateContenteventsDto2.postID = request.body.postID
        try {
          await this.contenteventsService.create(CreateContenteventsDto1);
          await this.contenteventsService.create(CreateContenteventsDto2);
          await this.postsService.updateView(email_receiverParty, request.body.postID);
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed, ' +
            error,
          );
        }
      }
    } else if (eventType == "LIKE") {
      var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "LIKE", "DONE", email_receiverParty, "", request.body.postID);
      var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "LIKE", "ACCEPT", "", email_user, request.body.postID);
      if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
        var _id_1 = (await this.utilsService.generateId());
        var _id_2 = (await this.utilsService.generateId());
        var CreateContenteventsDto1 = new CreateContenteventsDto();
        CreateContenteventsDto1._id = _id_1
        CreateContenteventsDto1.contentEventID = _id_1
        CreateContenteventsDto1.email = email_user
        CreateContenteventsDto1.eventType = "LIKE"
        CreateContenteventsDto1.active = true
        CreateContenteventsDto1.event = "DONE"
        CreateContenteventsDto1.createdAt = current_date
        CreateContenteventsDto1.updatedAt = current_date
        CreateContenteventsDto1.sequenceNumber = 1
        CreateContenteventsDto1.flowIsDone = true
        CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
        CreateContenteventsDto1.receiverParty = email_receiverParty
        CreateContenteventsDto1.postID = request.body.postID

        var CreateContenteventsDto2 = new CreateContenteventsDto();
        CreateContenteventsDto2._id = _id_2
        CreateContenteventsDto2.contentEventID = (await this.utilsService.generateId())
        CreateContenteventsDto2.email = email_receiverParty
        CreateContenteventsDto2.eventType = "LIKE"
        CreateContenteventsDto2.active = true
        CreateContenteventsDto2.event = "ACCEPT"
        CreateContenteventsDto2.createdAt = current_date
        CreateContenteventsDto2.updatedAt = current_date
        CreateContenteventsDto2.sequenceNumber = 1
        CreateContenteventsDto2.flowIsDone = true
        CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
        CreateContenteventsDto2.senderParty = email_user
        CreateContenteventsDto2.postID = request.body.postID
        try {
          await this.contenteventsService.create(CreateContenteventsDto1);
          await this.contenteventsService.create(CreateContenteventsDto2);
          await this.postsService.updateLike(email_receiverParty, request.body.postID);
          this.sendInteractiveFCM(email_receiverParty, "LIKE", request.body.postID, email_user);
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed, ' +
            error,
          );
        }
      }
    } else if (eventType == "UNLIKE") {
      var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "LIKE", "DONE", email_receiverParty, "", request.body.postID);
      var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "LIKE", "ACCEPT", "", email_user, request.body.postID);
      if ((await this.utilsService.ceckData(ceck_data_DONE)) && (await this.utilsService.ceckData(ceck_data_ACCEPT))) {
        try {
          await this.contenteventsService.updateUnlike(email_user, "LIKE", "DONE", request.body.postID);
          await this.contenteventsService.updateUnlike(email_receiverParty, "LIKE", "ACCEPT", request.body.postID);
          await this.postsService.updateUnLike(email_receiverParty, request.body.postID);
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed, ' +
            error,
          );
        }
      }
    } else if (eventType == "UNFOLLOW") {
      var ceck_data_FOLLOWER = await this.contenteventsService.ceckData(email_receiverParty, "FOLLOWER", "ACCEPT", email_user, "", "");
      var ceck_data_FOLLOWING = await this.contenteventsService.ceckData(email_user, "FOLLOWING", "ACCEPT", "", email_receiverParty, "");
      if ((await this.utilsService.ceckData(ceck_data_FOLLOWER)) && (await this.utilsService.ceckData(ceck_data_FOLLOWING))) {
        try {
          await this.contenteventsService.updateUnFollowing(email_user, "FOLLOWING", email_receiverParty);
          await this.contenteventsService.updateUnFollower(email_receiverParty, "FOLLOWER", email_user);
          await this.insightsService.updateUnFollower(email_receiverParty);
          await this.insightsService.updateUnFollowing(email_user);
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed, ' +
            error,
          );
        }
      }
    } else if (eventType == "REACTION") {
      var ceck_data_DONE = await this.contenteventsService.ceckData(email_user, "REACTION", "DONE", email_receiverParty, "", request.body.postID);
      var ceck_data_ACCEPT = await this.contenteventsService.ceckData(email_receiverParty, "REACTION", "ACCEPT", "", email_user, request.body.postID);
      if (!(await this.utilsService.ceckData(ceck_data_DONE)) && !(await this.utilsService.ceckData(ceck_data_ACCEPT))) {
        var _id_1 = (await this.utilsService.generateId());
        var _id_2 = (await this.utilsService.generateId());
        var CreateContenteventsDto1 = new CreateContenteventsDto();
        CreateContenteventsDto1._id = _id_1
        CreateContenteventsDto1.contentEventID = _id_1
        CreateContenteventsDto1.email = email_user
        CreateContenteventsDto1.eventType = "REACTION"
        CreateContenteventsDto1.active = true
        CreateContenteventsDto1.event = "DONE"
        CreateContenteventsDto1.createdAt = current_date
        CreateContenteventsDto1.updatedAt = current_date
        CreateContenteventsDto1.sequenceNumber = 1
        CreateContenteventsDto1.flowIsDone = true
        CreateContenteventsDto1._class = "io.melody.hyppe.content.domain.ContentEvent"
        CreateContenteventsDto1.receiverParty = email_receiverParty
        CreateContenteventsDto1.reactionUri = request.body.reactionUri
        CreateContenteventsDto1.postID = request.body.postID

        var CreateContenteventsDto2 = new CreateContenteventsDto();
        CreateContenteventsDto2._id = _id_2
        CreateContenteventsDto2.contentEventID = _id_2
        CreateContenteventsDto2.email = email_receiverParty
        CreateContenteventsDto2.eventType = "REACTION"
        CreateContenteventsDto2.active = true
        CreateContenteventsDto2.event = "ACCEPT"
        CreateContenteventsDto2.createdAt = current_date
        CreateContenteventsDto2.updatedAt = current_date
        CreateContenteventsDto2.sequenceNumber = 1
        CreateContenteventsDto2.flowIsDone = true
        CreateContenteventsDto2._class = "io.melody.hyppe.content.domain.ContentEvent"
        CreateContenteventsDto2.senderParty = email_user
        CreateContenteventsDto2.reactionUri = request.body.reactionUri
        CreateContenteventsDto2.postID = request.body.postID
        try {
          await this.contenteventsService.create(CreateContenteventsDto1);
          await this.contenteventsService.create(CreateContenteventsDto2);
          await this.postsService.updateReaction(email_receiverParty, request.body.postID);
          this.sendInteractiveFCM(email_receiverParty, "REACTION", request.body.postID, email_user);
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed, ' +
            error,
          );
        }
      }
    }

    return {
      response_code: 202,
      messages: {
        info: ['Successful'],
      },
    }
  }

  async sendInteractiveFCM(email: string, type: string, postID: string, receiverParty: string) {
    var Templates_ = new TemplatesRepo();
    Templates_ = await this.utilsService.getTemplate_repo(type, 'NOTIFICATION');

    var get_username_email = await this.utilsService.getUsertname(email);
    var get_username_receiverParty = await this.utilsService.getUsertname(receiverParty);

    var email = email;
    var titlein = get_username_receiverParty?.toString() || '';
    var titleen = get_username_receiverParty?.toString() || '';
    var bodyin = "";
    var bodyen = "";

    var email_post = "";

    if (type == "LIKE") {
      var posts = await this.postsService.findid(postID);
      var bodyin_get = Templates_.body_detail_id.toString();
      var bodyen_get = Templates_.body_detail.toString();

      var post_type = "";
      if (await this.utilsService.ceckData(posts)) {
        post_type = posts.postType.toString();
        email_post = posts.email.toString();
      }

      var new_bodyin_get = bodyin_get.replace("${post_type}", "Hypper" + post_type[0].toUpperCase() + post_type.substring(1));
      var new_bodyen_get = bodyen_get.replace("${post_type}", "Hypper" + post_type[0].toUpperCase() + post_type.substring(1));

      var bodyin = new_bodyin_get;
      var bodyen = new_bodyen_get;
    } else {
      var bodyin = Templates_.body_detail_id.toString();
      var bodyen = Templates_.body_detail.toString();
    }
    var eventType = type.toString();
    var event = "ACCEPT";
    if (type == "LIKE") {
      if (email != email_post) {
        await this.utilsService.sendFcm(email, titlein, titleen, bodyin, bodyen, eventType, event);
      }
    } else {
      await this.utilsService.sendFcm(email, titlein, titleen, bodyin, bodyen, eventType, event);
    }
  }
}
