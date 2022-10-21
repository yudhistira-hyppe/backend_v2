import { Body, Controller, Delete, Get, Param, Post, UseGuards, Headers, BadRequestException, Res, HttpStatus, Query, Request, Req, HttpCode } from '@nestjs/common';
import { DisqusService } from './disqus.service';
import { CreateDisqusDto, ContentDto } from './dto/create-disqus.dto';
import { Disqus } from './schemas/disqus.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FormDataRequest } from 'nestjs-form-data';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { DisquscontactsService } from '../disquscontacts/disquscontacts.service';
import { request } from 'https';
import { CreateDisquslogsDto } from '../disquslogs/dto/create-disquslogs.dto';
import { PostDisqusService } from './post/postdisqus.service';
import { ReactionsService } from '../../infra/reactions/reactions.service';
import { CreateDisquscontactsDto } from '../disquscontacts/dto/create-disquscontacts.dto';
// import { CreateInsightsDto, InsightsDto } from '../insights/dto/create-insights.dto';
import { ProfileDTO } from '../../utils/data/Profile'
import { InsightsService } from '../../content/insights/insights.service';
import { ContenteventsService } from '../contentevents/contentevents.service';
import { ContentEventId, CreateContenteventsDto } from '../contentevents/dto/create-contentevents.dto';
import { Contentevents } from '../contentevents/schemas/contentevents.schema';
import { Disquscontacts } from '../disquscontacts/schemas/disquscontacts.schema';
import { Posts } from '../posts/schemas/posts.schema';
import { CreateInsightsDto, InsightsDto } from '../insights/dto/create-insights.dto';
import { Insights } from '../insights/schemas/insights.schema';
const Long = require('mongodb').Long;
@Controller('api/')
export class DisqusController {

  constructor(private readonly DisqusService: DisqusService,
    private readonly disquscontactsService: DisquscontactsService,
    //private readonly reactionsService: ReactionsService,
    private readonly utilsService: UtilsService,
    private readonly postDisqusService: PostDisqusService,
    private readonly insightsService: InsightsService,
    private readonly contenteventsService: ContenteventsService,
    private readonly errorHandler: ErrorHandler) { }

  @Post('disqus')
  async create(@Body() CreateDisqusDto: CreateDisqusDto) {
    await this.DisqusService.create(CreateDisqusDto);
  }

  @Get('disqus')
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Disqus[]> {
    return this.DisqusService.findAll();
  }

  @Get('disqus/:email')
  async findOneId(@Param('email') email: string): Promise<Disqus> {
    return this.DisqusService.findOne(email);
  }

  @Delete('disqus/:id')
  async delete(@Param('id') id: string) {
    return this.DisqusService.delete(id);
  }

  //@UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @FormDataRequest()
  @Post('posts/disqus')
  async disqus(
    @Headers() headers, 
    @Body() ContentDto_: ContentDto, 
  ) {
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed token and email not match',
    //   );
    // }

    // if (headers['x-auth-token'] == undefined) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed email header is required',
    //   );
    // }

    var email_header = headers['x-auth-token'];
    let type = "";
    let isQuery = false;
    var retVal = [];

    if (ContentDto_.eventType == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed eventType is required',
      );
    }else{
      type = ContentDto_.eventType.toString();
    }

    if ((type == "DIRECT_MSG") || (type == "COMMENT")) {
      var isValid = false;
      isQuery = ContentDto_.isQuery;
      console.log("processDisqus >>> event: ", ContentDto_.eventType);
      if (!isQuery){
        if (type == "DIRECT_MSG") {
          retVal.push(this.buildDisqus(ContentDto_, true));
          ContentDto_.disqus = retVal;
          isValid = true;
          for (var retValCount = 0; retValCount < retVal.length; retValCount++){
            if (retVal[retValCount].room != undefined) {
              var roomName = retVal[retValCount].room;
            }
            // String roomName = AppUtils.getAsStr(it, QueryEnum.ROOM_FLD.getName());
            //var roomName = retVal[retValCount].room;
          }
        } else if ((type == "COMMENT") && (ContentDto_.postID!=undefined)) {
          
        }
      }else{
        if (type == "DIRECT_MSG") {
          var aDisqusContacts = (ContentDto_.receiverParty != undefined) ? await this.disquscontactsService.findDisqusByEmail(ContentDto_.email.toString()) : await this.disquscontactsService.findByEmailAndMate(ContentDto_.email.toString(), ContentDto_.receiverParty.toString());
          var withDetail = ContentDto_.withDetail;
          var detailOnly = ContentDto_.detailOnly;

          retVal['disqusID'] = aDisqusContacts[0].disqus_data[0].disqusID;
          if ((aDisqusContacts[0].disqus_data[0].email != undefined) && (aDisqusContacts[0].disqus_data[0].mate != undefined)) {
            if (detailOnly == false) {
              retVal['email'] = aDisqusContacts[0].disqus_data[0].email;
              retVal['room'] = aDisqusContacts[0].disqus_data[0].room;

              retVal['eventType'] = aDisqusContacts[0].disqus_data[0].eventType;
              retVal['active'] = aDisqusContacts[0].disqus_data[0].active;
              retVal['createdAt'] = aDisqusContacts[0].disqus_data[0].createdAt;
              retVal['updatedAt'] = aDisqusContacts[0].disqus_data[0].updatedAt;
              retVal['lastestMessage'] = aDisqusContacts[0].disqus_data[0].lastestMessage;

              var profile = await this.utilsService.generateProfile(aDisqusContacts[0].disqus_data[0].email, 'PROFILE');
              if (profile.username!=undefined){
                retVal['username'] = profile.username;
              }
              if (profile.fullName != undefined) {
                retVal['fullName'] = profile.fullName;
              }
              if (profile.avatar != undefined) {
                retVal['avatar'] = profile.avatar;
              }

              var profile_mate = await this.utilsService.generateProfile(aDisqusContacts[0].disqus_data[0].mate, 'PROFILE');
              var mateInfo = {};
              if (profile_mate.username != undefined) {
                mateInfo['username'] = profile_mate.username;
              }
              if (profile_mate.fullName != undefined) {
                mateInfo['fullName'] = profile_mate.fullName;
              }
              if (profile_mate.avatar != undefined) {
                mateInfo['avatar'] = profile_mate.avatar;
              }
              mateInfo['email'] = aDisqusContacts[0].disqus_data[0].mate;
              retVal['mate'] = mateInfo;

              var senderReciverInfo = {};
              var currentEmail = (ContentDto_.email) ? ContentDto_.email : email_header;
              if ((profile_mate != null) && (profile != null) && (currentEmail == profile_mate.email)) {
                senderReciverInfo['email'] = profile.fullName;
                senderReciverInfo['username'] = profile.username;
                senderReciverInfo['fullName'] = profile.fullName;
                if (profile.avatar != null) {
                  senderReciverInfo['avatar'] = profile.avatar;
                }
              } else if ((profile_mate != null) && (profile != null) && (currentEmail == profile.email)) {
                senderReciverInfo['email'] = profile_mate.fullName;
                senderReciverInfo['username'] = profile_mate.username;
                senderReciverInfo['fullName'] = profile_mate.fullName;
                if (profile_mate.avatar != null) {
                  senderReciverInfo['avatar'] = profile_mate.avatar;
                }
              }
              retVal['senderOrReceiverInfo'] = senderReciverInfo;

              if ((ContentDto_.pageNumber != undefined) && (ContentDto_.pageRow != undefined)) {
                var pageNumber = Number(ContentDto_.pageNumber);
                var pageRow = Number(ContentDto_.pageRow);
                var offset = pageNumber * pageRow;
                // retVal['disqusLogs'] = profile.avatar;
                // retVal.put("disqusLogs",streamSupplier.get().skip(offset).limit(pageRow).collect(Collectors.toList()));
              } else {
                // retVal['disqusLogs'] = profile.avatar;
                // retVal.put("disqusLogs", streamSupplier.get().collect(Collectors.toList()));
              }
            }

            if (withDetail || detailOnly) {

            }
          }
        } else if (type == "COMMENT") {
          //inDto.setDisqus(this.aggrCommentsQuery(inDto));
        }

        isValid = true;
      }

      if (isValid) {
        //inDto.buildResultInfo(inDto.getEventType(), ResBundle.instance().bundleAsStr(ResBundle.PR_DEFAULT_SUCCESS));
      } else {
        //inDto.buildErrorInfo(inDto.getEventType(), ResBundle.instance().bundleAsStr(ResBundle.AC_ERR_DEFAULT));
      }
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }

    return await this.disquscontactsService.findByEmailAndMate(ContentDto_.email.toString(), ContentDto_.receiverParty.toString());
  }

  private async buildComments(ContentDto_: ContentDto, buildInteractive: boolean) {
    var retVal = [];
    var Posts_ = new Posts();
    Posts_ = await this.postDisqusService.findid(ContentDto_.postID.toString());
    if ((await this.utilsService.ceckData(Posts_)) && Posts_.active && Posts_.allowComments) {
      
    }
  }

  private async aggrDisqusLog(eventType: string, DisqusLog: CreateDisquslogsDto){
    var retVal = {};
    retVal["disqusID"] = DisqusLog.disqusID;
    retVal["postType"] = DisqusLog.postType;

    if ((DisqusLog.postID != undefined) && (eventType =="DIRECT_MSG")) {
      var post = this.postDisqusService.findOnepostID(DisqusLog.postID.toString());
      retVal["content"] = post;
    }
    retVal["lineID"] = DisqusLog._id;
    retVal["sender"] = DisqusLog.sender;

    if (eventType == "COMMENT") {
      var mateInfo = {};
      var profile_mate = await this.utilsService.generateProfile(DisqusLog.sender.toString(), 'PROFILE');
      if ((profile_mate != null)) {
        mateInfo['email'] = profile_mate.fullName;
        mateInfo['username'] = profile_mate.username;
        mateInfo['fullName'] = profile_mate.fullName;
        if (profile_mate.avatar != null) {
          mateInfo['avatar'] = profile_mate.avatar;
        } 
        retVal["senderInfo"] = mateInfo;
      }
    }
    retVal["receiver"] = DisqusLog.receiver;
    retVal["active"] = DisqusLog.active;
    retVal["createdAt"] = DisqusLog.createdAt;
    retVal["updatedAt"] = DisqusLog.updatedAt;
    retVal["txtMessages"] = DisqusLog.txtMessages;
    retVal["reactionUri"] = DisqusLog.reactionUri;

    // var reaction = 
    // io.melody.hyppe.infra.domain.Reactions reaction = this.findReactionByURI(item.getReactionUri());
    // if (reaction != null) {
    //   retVal.put("reaction_icon", reaction.getIcon());
    // }

    return retVal;
  }

  private async buildDisqus(ContentDto_: ContentDto, buildInteractive: boolean) {
    var Disquscontacts_ = new Disquscontacts();
    Disquscontacts_ = await this.disquscontactsService.findByEmailAndMate(ContentDto_.email.toString(), ContentDto_.receiverParty.toString());
    if (await this.utilsService.ceckData(Disquscontacts_)){
      var IdDisqus = Disquscontacts_.disqus.id.toString();
      var Disqus_ = new Disqus();
      if (Disquscontacts_.disqus != null) {
        Disqus_ = await this.DisqusService.findOne(IdDisqus);
      } else {
        var DataId = await this.utilsService.generateId();
        Disqus_._id = DataId;
        Disqus_.room = DataId;
        Disqus_.disqusID = ContentDto_.disqusID;
        Disqus_.eventType = ContentDto_.eventType;
        Disqus_.email = ContentDto_.email;
        Disqus_.mate = ContentDto_.mate;
        Disqus_.active = ContentDto_.active;
        Disqus_.createdAt = await this.utilsService.getDateTimeString();
        Disqus_.updatedAt = await this.utilsService.getDateTimeString();
      }
      
      if (ContentDto_.postID != undefined) {
        var Posts_ = new Posts();
        Posts_ = await this.postDisqusService.findid(ContentDto_.postID.toString());
        if (await this.utilsService.ceckData(Posts_)) {
          ContentDto_.postContent = Posts_;
          ContentDto_.postType = Posts_.postType;
          if (buildInteractive){
            var _ContentDto_ = new ContentDto();
            _ContentDto_ = ContentDto_;
            _ContentDto_.eventType = "REACTION";
            _ContentDto_.postType = Posts_.postType;
            _ContentDto_.receiverParty = Posts_.email;
            _ContentDto_.reactionUri = ContentDto_.reactionUri;

            // var InsightsDto_ = new InsightsDto();
            // InsightsDto_ = await this.validationEvent(ContentDto_);
            // await this.processInsightEvent(InsightsDto_);
          }
        }
      }
    }
  }
  
  // private async processInsightEvent(InsightsDto_: InsightsDto): Promise<ContentDto> {
  //   if (InsightsDto_.contentDto.eventType =="REACTION") {
  //     if (InsightsDto_.validStep3) {

  //       var inEventId = new ContentEventId();
  //       var withPrev = false;
  //       if (await this.utilsService.ceckData(InsightsDto_.contentEvent) && withPrev){
  //         inEventId.dtoID = InsightsDto_.contentEvent._id;
  //         inEventId.eventType = InsightsDto_.contentEvent.eventType;
  //         inEventId.parent = InsightsDto_.contentEvent;
  //       } else {
  //         inEventId.dtoID = await this.utilsService.generateId();
  //         inEventId.eventType = InsightsDto_.contentEvent.eventType;
  //         var CreateContenteventsDto_ = new CreateContenteventsDto();
  //         CreateContenteventsDto_._id = await this.utilsService.generateId();
  //         CreateContenteventsDto_.contentEventID = await this.utilsService.generateId();
  //         CreateContenteventsDto_.eventType = InsightsDto_.contentEvent.eventType;
  //         CreateContenteventsDto_.active = true;
  //         CreateContenteventsDto_.flowIsDone = false;
  //         CreateContenteventsDto_.createdAt = await this.utilsService.getDateTimeString();
  //         CreateContenteventsDto_.updatedAt = await this.utilsService.getDateTimeString();
  //         inEventId.parent = CreateContenteventsDto_;
  //       }

  //       var inRecvEventId = new ContentEventId();
  //       inRecvEventId.dtoID = await this.utilsService.generateId();
  //       inRecvEventId.eventType = InsightsDto_.contentEvent.eventType;
  //       var _CreateContenteventsDto_ = new CreateContenteventsDto();
  //       _CreateContenteventsDto_._id = await this.utilsService.generateId();
  //       _CreateContenteventsDto_.contentEventID = await this.utilsService.generateId();
  //       _CreateContenteventsDto_.eventType = InsightsDto_.contentEvent.eventType;
  //       _CreateContenteventsDto_.active = true;
  //       _CreateContenteventsDto_.flowIsDone = false;
  //       _CreateContenteventsDto_.createdAt = await this.utilsService.getDateTimeString();
  //       _CreateContenteventsDto_.updatedAt = await this.utilsService.getDateTimeString();
  //       inRecvEventId.parent = _CreateContenteventsDto_;

  //       inRecvEventId.parent.event = "ACCEPT";
  //       inRecvEventId.parent.email = InsightsDto_.profile.email;
  //       inRecvEventId.parent.receiverParty = InsightsDto_.receiverParty.email.toString();
  //       inRecvEventId.parent.flowIsDone = true;

  //       inEventId.parent.event = "DONE";
  //       inEventId.parent.email = InsightsDto_.profile.email;
  //       inEventId.parent.receiverParty = InsightsDto_.receiverParty.email.toString();
  //       inEventId.parent.flowIsDone = true;
      
  //       InsightsDto_.eventId = inEventId;
  //       InsightsDto_.receiverEventId = inRecvEventId;
  //       InsightsDto_.validStep4 = true;
  //     }

  //     if (InsightsDto_.validStep4) {
  //       if (((InsightsDto_.contentDto.postID != undefined) ? true : false)) {
  //         if (await this.utilsService.ceckData(InsightsDto_.contentPost)) {
  //           InsightsDto_.eventId.parent.postID = InsightsDto_.contentPost.postID;
  //           InsightsDto_.receiverEventId.parent.postID = InsightsDto_.contentPost.postID;
  //           InsightsDto_.validStep5 = true;
  //         }
  //       } else {
  //         InsightsDto_.validStep5 = true;
  //       }

  //       if (InsightsDto_.validStep5) {
  //         if (InsightsDto_.contentPost.postID!=undefined) {
  //           if (!(InsightsDto_.contentPost.email == InsightsDto_.profile.email)
  //             || !(InsightsDto_.contentPost.email == InsightsDto_.contentDto.email)) {
  //             InsightsDto_.insightReceiver.reactions += Long.fromInt(1);

  //             InsightLog item = InsightsDto_.InsightReceiver.get().increaseComment(this.getProfile().getEmail(),
  //                 this.getContentPost().get().getPostID());


  //             var Insights_ = new Insights();
  //             Insights_.reactions += Long.fromInt(1);
              
  //             if (CollectionUtils.isNotEmpty(this.getInsightLogs())
  //               ? this.getInsightLogs().stream().anyMatch(s -> s.getMate().equals(mate)
  //                 && s.getEventInsight().equals(eventInsight) && s.getPostID().equals(postID))
  //               : false;){

  //             }

  //               InsightLog insightLog = null;
	// 	boolean exits = this.hasMateOfContent(mate, eventInsight, postID);
  //             if (!exits) {
  //               insightLog = new InsightLog(this.get_id(), mate, eventInsight, true);
  //               insightLog.setPostID(postID);
  //               this.getInsightLogs().add(insightLog);
  //             }
  //             return insightLog;



	// 	          item = this.addInsightLog(mate, EventInsight.REACTION.getName(), postID);


  //             Insightlogs item = InsightsDto_.insightReceiver.get().increaseReaction(this.getProfile().getEmail(), this.getContentPost().get().getPostID());
  //             if (item != null) {
  //               this.getContentPost().get().increaseReaction();
  //               this.getReceiverEventId().get().getParent().setReactionUri(this.getContentDto().getReactionUri());
  //               this.getEventId().get().getParent().setReactionUri(this.getContentDto().getReactionUri());
  //             }
  //             return Optional.ofNullable(item);



  //             Optional < InsightLog > item = insightDto.increaseReaction();
  //             if (item.isPresent()) {
  //               this.saveInteractive(insightDto, item.get());
  //               notifService.sendInsightFcm(insightDto);
  //             }
  //           }
  //         }
  //       }
  //     }
  //   } else if (EventInsight.COMMENT.getName().equals(insightDto.getContentDto().getEventType())) {
  //     if (insightDto.step4(EventType.DONE.getName(), EventType.ACCEPT.getName(), false)) {
  //       if (insightDto.restrictContentPost()) {
  //         Optional < InsightLog > item = insightDto.increaseComment();
  //         if (item.isPresent()) {
  //           this.saveInteractive(insightDto, item.get());
  //           notifService.sendInsightFcm(insightDto);

  //           contentService.broadcast(SocketEnum.POST_COMMENT.getName(), SocketEnum.POST_COMMENT.getName(), insightDto.toString());
  //         }
  //       }
  //     }

  //   } else if (EventInsight.CHAT.getName().equals(insightDto.getContentDto().getEventType())) {
  //     insightDto.step4(EventType.DONE.getName(), EventType.ACCEPT.getName(), false);
  //   }
  //   return insightDto.getContentDto();
  //   return new ContentDto();
  // }

  // private async validationEvent(ContentDto_: ContentDto): Promise<InsightsDto>{
  //   var InsightsDto_ = new InsightsDto();
  //   InsightsDto_.contentDto = ContentDto_;
  //   InsightsDto_.eventType = ContentDto_.eventType;
  //   InsightsDto_.validStep3 = false;
  //   InsightsDto_.validStep4 = false;
  //   InsightsDto_.prevPresent = false;

  //   var ProfileDTO_email = new ProfileDTO();
  //   ProfileDTO_email = await this.utilsService.generateProfile(ContentDto_.email.toString(), "FULL");
  //   var ProfileDTO_mate = new ProfileDTO();
  //   ProfileDTO_mate = await this.utilsService.generateProfile(ContentDto_.receiverParty.toString(), "FULL");

  //   if (ProfileDTO_email != null && ProfileDTO_mate != null) {

  //     InsightsDto_.profile = ProfileDTO_email;
  //     InsightsDto_.receiverParty = ProfileDTO_mate;

  //     if (((!(ProfileDTO_email.email == ProfileDTO_mate.email)) ? true : false)) {

  //       var insightSender = await this.insightsService.findemail(ProfileDTO_email.email.toString());
  //       var insightReceiver = await this.insightsService.findemail(ProfileDTO_mate.email.toString());

  //       if ((await this.utilsService.ceckData(insightSender)) && (await this.utilsService.ceckData(insightReceiver))) {

  //         InsightsDto_.insightSender = insightSender;
  //         InsightsDto_.insightReceiver = insightReceiver;

  //         if (ContentDto_.eventType == "FOLLOWER") {
  //           var Contentevents_Sender = new Contentevents();
  //           Contentevents_Sender = await this.contenteventsService.findParentBySender("FOLLOWER", InsightsDto_.profile.email.toString(), InsightsDto_.receiverParty.email.toString(), false);
  //           var Contentevents_Receiver = new Contentevents();
  //           Contentevents_Receiver = await this.contenteventsService.findParentByReceiver("FOLLOWING", InsightsDto_.receiverParty.email.toString(), InsightsDto_.profile.email.toString(), false);
  //           InsightsDto_.parentInSender = Contentevents_Sender;
  //           InsightsDto_.parentInReceiver = Contentevents_Receiver;
  //           InsightsDto_.validStep3 = true;
  //         } else {
  //           if (((InsightsDto_.contentDto.postID != undefined) ? true : false)) {
  //             var _contentEvent_ = (await this.contenteventsService.findSenderOrReceiverByPostID(ContentDto_.postID.toString(), ContentDto_.eventType.toString(), InsightsDto_.profile.email.toString(), InsightsDto_.receiverParty.email.toString()));
  //             var _ContentPost_ = (await this.postDisqusService.findContentPost(ContentDto_.postID.toString()));
  //             InsightsDto_.contentPost = _ContentPost_;
  //             InsightsDto_.contentEvent = _contentEvent_;
  //             InsightsDto_.validStep3 = true;
  //             InsightsDto_.prevPresent = (await this.utilsService.ceckData(_contentEvent_))
  //           } else {
  //             var _contentEvent_ = await this.contenteventsService.findSenderOrReceiver(InsightsDto_.contentDto.eventType.toString(), InsightsDto_.profile.email.toString(), InsightsDto_.receiverParty.email.toString());
  //             InsightsDto_.contentEvent = _contentEvent_;
  //             InsightsDto_.validStep3 = true;
  //             InsightsDto_.prevPresent = (await this.utilsService.ceckData(_contentEvent_));
  //           }
  //         }
  //       }
  //     }
  //   }
  //   return InsightsDto_;
  // }

  @Post('posts/disqus/deletedicuss')
  //@UseGuards(JwtAuthGuard)
  async deletedicuss(
    @Headers() headers,
    @Body() request: any) {
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed',
    //   );
    // }
    // if (request._id == undefined) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed',
    //   );
    // }
    // if (request.email == undefined) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed',
    //   );
    // }
    return this.DisqusService.deletedicuss(request);
  }
}
