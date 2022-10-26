import { Body, Headers,Controller, Delete, Get, Param, Post,UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ContenteventsService } from './contentevents.service';
import { ContentEventId, CreateContenteventsDto } from './dto/create-contentevents.dto';
import { Contentevents } from './schemas/contentevents.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GroupModuleService } from '../../trans/usermanagement/groupmodule/groupmodule.service';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { InsightsService } from '../insights/insights.service';
import { PostDisqusService } from '../disqus/post/postdisqus.service'; 

@Controller()
export class ContenteventsController {
  constructor(
    private readonly contenteventsService: ContenteventsService,
    private readonly groupModuleService: GroupModuleService,
    private readonly utilsService: UtilsService,
    private readonly insightsService: InsightsService,
    private readonly postsService: PostDisqusService,
    private readonly errorHandler: ErrorHandler) {}

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
  async friend( @Param('email') email: string, @Headers() headers) {
    var data = await this.contenteventsService.friend(email,headers);
    return {
      response_code: 202,
      data:data,
      count_friend:(await data).length,
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
    const email_receiverParty = request.body.eventType;
    const current_date = await this.utilsService.getDateTimeString();

    if (eventType == "FOLLOWING") {
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
      } catch (error) {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, ' +
          error,
        );
      }
    } else if (eventType == "VIEW") {
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
      CreateContenteventsDto1.postID = request.body.postID
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
    } else if (eventType == "LIKE") {
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
      CreateContenteventsDto1.postID = request.body.postID
      try {
        await this.contenteventsService.create(CreateContenteventsDto1);
        await this.contenteventsService.create(CreateContenteventsDto2);
        await this.postsService.updateLike(email_receiverParty, request.body.postID); 
      } catch (error) {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, ' +
          error,
        );
      }
    } else if (eventType == "UNLIKE") {
      try {
        await this.contenteventsService.updateUnlike(email_user, "UNLIKE", request.body.postID);
        await this.contenteventsService.updateUnlike(email_receiverParty, "UNLIKE", request.body.postID);
        await this.postsService.updateUnLike(email_receiverParty, request.body.postID); 
      } catch (error) {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, ' +
          error,
        );
      }
    } else if (eventType == "UNFOLLOW") {
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
    } else if (eventType == "REACTION") {
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
      CreateContenteventsDto2.postID = request.body.postID
      try {
        await this.contenteventsService.create(CreateContenteventsDto1);
        await this.contenteventsService.create(CreateContenteventsDto2);
        await this.postsService.updateReaction(email_receiverParty, request.body.postID);
      } catch (error) {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, ' +
          error,
        );
      } 
    }


    return {
      response_code: 202,
      messages: {
        info: ['Successful'],
      },
    };
    // var profile_user = await this.utilsService.generateProfile(email_user,'PROFILE');
    // var profile_receiverParty = await this.utilsService.generateProfile(email_receiverParty, 'PROFILE');

    // var contentPost = null;
    // var contentEvent = null;

    // var parentInSender = null;
    // var parentInReceiver = null;

    // var insightSender = null;
    // var insightReceiver = null;

    // var validStep1 = false;
    // var validStep2 = false;
    // var validStep3 = false;
    // var validStep4 = false;
    // var prevPresent = false;
    // if (!(await this.utilsService.ceckData(profile_user)) && !(await this.utilsService.ceckData(profile_receiverParty))){
    //   if ((profile_user.email) != (profile_receiverParty.email)){
    //     validStep1 = true;
    //   }
    // }

    // if (validStep1){
    //   insightSender = await this.insightsService.getinsight(profile_user.email.toString());
    //   insightReceiver = await this.insightsService.getinsight(profile_receiverParty.email.toString());
    //   if ((await this.utilsService.ceckData(insightSender)) && (await this.utilsService.ceckData(insightReceiver))) {
    //     validStep2 = true;
    //   }
    // }

    // if (validStep2){
    //   if (eventType == "FOLLOWER") {
    //     parentInSender = await this.contenteventsService.findParentBySender("FOLLOWER", profile_user.email.toString(), profile_receiverParty.email.toString(), false);
    //     parentInReceiver = await this.contenteventsService.findParentByReceiver("FOLLOWING", profile_receiverParty.email.toString(), profile_user.email.toString(), false);
    //     validStep3 = true;
    //   } else {
    //     if (request.body.postID != undefined) {
    //       contentPost = await this.postsService.findByPostId(request.body.postID);
    //       contentEvent = await this.contenteventsService.findSenderOrReceiverByPostID(request.body.postID, eventType, profile_user.email.toString(), profile_receiverParty.email.toString());
    //       validStep3 = true;
    //       prevPresent = (await this.utilsService.ceckData(contentEvent));
    //     } else {
    //       contentEvent = await this.contenteventsService.findSenderOrReceiver(eventType, profile_user.email.toString(), profile_receiverParty.email.toString());
    //       validStep3 = true;
    //     }
    //   }
    // }

    // if (validStep3){
    //   if (eventType=="FOLLOWING") {
    //     var isValid = false;
    //     var withPrev = false;
    //     if (validStep3) {
    //       var inEventId = new ContentEventId();
    //       if ((await this.utilsService.ceckData(contentEvent)) && withPrev){
    //         inEventId.dtoID = contentEvent._id;
    //         inEventId.eventType = contentEvent.eventType;
    //         inEventId.parent = contentEvent;
    //       } else {
    //         inEventId.dtoID = await this.utilsService.generateId();
    //         inEventId.eventType = eventType;
    //         var _id = await this.utilsService.generateId();
    //         var CreateContenteventsDto_ = new CreateContenteventsDto();
    //         CreateContenteventsDto_._id = _id;
    //         CreateContenteventsDto_.contentEventID = _id;
    //         CreateContenteventsDto_.active = true;
    //         CreateContenteventsDto_.flowIsDone = false;
    //         CreateContenteventsDto_.createdAt = curent_date;
    //         CreateContenteventsDto_.updatedAt = curent_date;
    //         inEventId.parent = CreateContenteventsDto_;
    //       }
    //       var inRecvEventId = new ContentEventId();
    //       inRecvEventId.dtoID = await this.utilsService.generateId();
    //       inRecvEventId.eventType = "FOLLOWER";
    //       var _id = await this.utilsService.generateId();
    //       var CreateContenteventsDto_ = new CreateContenteventsDto();
    //       CreateContenteventsDto_._id = _id;
    //       CreateContenteventsDto_.contentEventID = _id;
    //       CreateContenteventsDto_.active = true;
    //       CreateContenteventsDto_.flowIsDone = false;
    //       CreateContenteventsDto_.createdAt = curent_date;
    //       CreateContenteventsDto_.updatedAt = curent_date;
    //       inRecvEventId.parent = CreateContenteventsDto_;

    //       validStep4 = true;
    //     }

    //     if ((!prevPresent) && validStep4){
    //       var receiverList = await this.contenteventsService.findParentByReceiver_(eventType, email_user.toString(), email_receiverParty.toString());
    //       var senderList = await this.contenteventsService.findParentBySender_("FOLLOWER", email_user.toString(), email_user.toString());
    //     }

    //     if (!(await this.utilsService.ceckData(receiverList)) && !(await this.utilsService.ceckData(senderList)))
    //       insightDto.getEventId().get().getParent().setFlowIsDone(false);
    //       insightDto.getReceiverEventId().get().getParent().setFlowIsDone(false);

    //       this.saveInteractive(insightDto);
    //       notifService.sendInsightFcm(insightDto);

    //       isValid = true;
    //     }
    //   } else if (eventType == "FOLLOWER") {
    //     return this.processFollower(insightDto);
    //   } else if (eventType == "UNFOLLOW") {
    //     return this.processUnFollow(insightDto);
    //   } else {
    //     return this.processInsightEvent(insightDto);
    //   }
    // } else {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed',
    //   );
    // }
    //return this.ContenteventsService.interactive(request);
  }
}
