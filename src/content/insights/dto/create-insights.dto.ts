import { Long } from "mongodb";
import { ContentEventId, CreateContenteventsDto } from "../../../content/contentevents/dto/create-contentevents.dto";
import { ProfileDTO } from "../../../utils/data/Profile";
import { ContentDto } from "../../../content/disqus/dto/create-disqus.dto";
import { UtilsService } from '../../../utils/utils.service';
import { CreatePostsDto } from "../../../content/posts/dto/create-posts.dto";
import { Insights } from "../schemas/insights.schema";
import { Insightlogs } from "../../../content/insightlogs/schemas/insightlogs.schema";

export class CreateInsightsDto {
  _id: String;
  insightID: String;
  active: boolean;
  createdAt: String;
  updatedAt: String;
  email: String;
  followers: Long;
  followings: Long;
  unfollows: Long;
  likes: Long;
  views: Long;
  views_profile: Long;
  comments: Long;
  posts: Long;
  shares: Long;
  reactions: Long;
  _class: String;
  insightLogs: [
    {
      $ref: String;
      $id: { oid: String };
      $db: String;
    },
  ]
}

export class InsightsDto {
  eventType: String;
  contentDto: ContentDto;
  profile: ProfileDTO;
  receiverParty: ProfileDTO;
  replyEvent: String;
  replyEventInReceiver: String;
  validStep3: boolean;
  validStep4: boolean;
  validStep5: boolean;
  prevPresent: boolean;
  insightSender: CreateInsightsDto;
  insightReceiver: CreateInsightsDto;
  parentInSender: CreateContenteventsDto;
  parentInReceiver: CreateContenteventsDto;
  contentEvent: CreateContenteventsDto;
  contentPost: CreatePostsDto;
  eventId: ContentEventId;
  receiverEventId: ContentEventId;
}

// export class InsightsDto {
//   constructor(private readonly utilsService: UtilsService) { }

//   eventType: String;
//   contentDto: ContentDto;
//   profile: ProfileDTO;
//   receiverParty: ProfileDTO;
//   replyEvent: String;
//   replyEventInReceiver: String;
//   validStep3: boolean;
//   validStep4: boolean;
//   validStep5: boolean;
//   prevPresent: boolean;
//   insightSender: CreateInsightsDto;
//   insightReceiver: CreateInsightsDto;
//   parentInSender: CreateContenteventsDto;
//   parentInReceiver: CreateContenteventsDto;
//   contentEvent: CreateContenteventsDto;
//   contentPost: CreatePostsDto;
//   eventId: ContentEventId;
//   receiverEventId: ContentEventId;

//   // async InsightDto(inDto: ContentDto) {
// 	// 	this.contentDto = inDto;
//   //   this.eventType = inDto.eventType;
//   //   this.validStep3 = false;
//   //   this.validStep4 = false;
//   //   this.prevPresent = false;
// 	// }

//   // async step1(profile: ProfileDTO, receiverParty: ProfileDTO) {
//   //   var retVal = false;
//   //   if (profile != null && receiverParty != null) {
//   //     this.profile = profile;
//   //     this.receiverParty = receiverParty;
//   //     retVal = (!(profile.email == receiverParty.email)) ? true : false;
//   //   }
//   //   return retVal;
//   // }

//   // async step2(insightSender: CreateInsightsDto, insightReceiver: CreateInsightsDto) {
//   //   var retVal = false;
//   //   if ((await this.utilsService.ceckData(insightSender)) && (await this.utilsService.ceckData(insightReceiver))) {
//   //     this.insightSender = insightSender;
//   //     this.insightReceiver = insightReceiver;
//   //     retVal = true;
//   //   }
//   //   return retVal;
//   // }

//   // async step3(Contentevents_Sender: CreateContenteventsDto, Contentevents_Receiver: CreateContenteventsDto) {
//   //   this.parentInSender = Contentevents_Sender;
//   //   this.parentInReceiver = Contentevents_Receiver;
//   //   this.validStep3 = true;
//   // }

//   // async step3_(ContentPost: CreatePostsDto, contentEvent: CreateContenteventsDto) {
//   //   this.contentPost = ContentPost;
//   //   this.contentEvent = contentEvent;
//   //   this.validStep3 = true;
//   //   this.prevPresent = (await this.utilsService.ceckData(contentEvent))
//   // }

//   // async step3__(contentEvent: CreateContenteventsDto) {
//   //   this.contentEvent = contentEvent;
//   //   this.validStep3 = true;
//   //   this.prevPresent = (await this.utilsService.ceckData(contentEvent))
//   // }

//   // async step4(inReplyEvent: string, inReplyEventInReceiver: string, withPrev: boolean): Promise<boolean> {
//   //   if (this.validStep3) {
//   //     var inEventId = new ContentEventId();
//   //     if(await this.utilsService.ceckData(this.contentEvent) && withPrev){
//   //       inEventId.dtoID = this.contentEvent._id;
//   //       inEventId.eventType = this.contentEvent.eventType;
//   //       inEventId.parent = this.contentEvent;
//   //     } else {
//   //       inEventId.dtoID = await this.utilsService.generateId();
//   //       inEventId.eventType = this.contentEvent.eventType;
//   //       var CreateContenteventsDto_ = new CreateContenteventsDto();
//   //       CreateContenteventsDto_._id = await this.utilsService.generateId();
//   //       CreateContenteventsDto_.contentEventID = await this.utilsService.generateId();
//   //       CreateContenteventsDto_.eventType = this.contentEvent.eventType;
//   //       CreateContenteventsDto_.active = true;
//   //       CreateContenteventsDto_.flowIsDone = false;
//   //       CreateContenteventsDto_.createdAt = await this.utilsService.getDateTimeString();
//   //       CreateContenteventsDto_.updatedAt = await this.utilsService.getDateTimeString();
//   //       inEventId.parent = CreateContenteventsDto_;
//   //     }
//   //     var inRecvEventId = new ContentEventId();

//   //     inRecvEventId.dtoID = await this.utilsService.generateId();
//   //     inRecvEventId.eventType = this.contentEvent.eventType;
//   //     var _CreateContenteventsDto_ = new CreateContenteventsDto();
//   //     _CreateContenteventsDto_._id = await this.utilsService.generateId();
//   //     _CreateContenteventsDto_.contentEventID = await this.utilsService.generateId();
//   //     _CreateContenteventsDto_.eventType = this.contentEvent.eventType;
//   //     _CreateContenteventsDto_.active = true;
//   //     _CreateContenteventsDto_.flowIsDone = false;
//   //     _CreateContenteventsDto_.createdAt = await this.utilsService.getDateTimeString();
//   //     _CreateContenteventsDto_.updatedAt = await this.utilsService.getDateTimeString();
//   //     inRecvEventId.parent = _CreateContenteventsDto_;

//   //     inRecvEventId.parent.event = inReplyEventInReceiver;
//   //     inRecvEventId.parent.email = this.profile.email;
//   //     inRecvEventId.parent.receiverParty = this.receiverParty.email.toString();
//   //     inRecvEventId.parent.flowIsDone = true;

//   //     inEventId.parent.event = inReplyEvent;
//   //     inEventId.parent.email = this.profile.email;
//   //     inEventId.parent.receiverParty = this.receiverParty.email.toString();
//   //     inEventId.parent.flowIsDone = true;
      
//   //     this.eventId = inEventId;
//   //     this.receiverEventId = inRecvEventId;
//   //     this.validStep4 = true;
//   //   }
//   //   return this.validStep4;
//   // }

//   // async step5(): Promise<boolean> {
//   //   if (this.validStep4) {
//   //     if (this.isContentPost()) {
//   //       if (await this.utilsService.ceckData(this.contentPost)) {
//   //         this.eventId.parent.postID = this.contentPost.postID;
//   //         this.receiverEventId.parent.postID = this.contentPost.postID;
//   //         this.validStep5 = true;
//   //       }
//   //     } else {
//   //       this.validStep5 = true;
//   //     }
//   //   }

//   //   return this.validStep5;
//   // }

//   // async restrictContentPost(): Promise<boolean> {
// 	// 	var retVal = false;
//   //   if (this.step5()) {
//   //     if (this.isContentPost()) {
        
//   //       retVal = !(this.contentPost.email == this.profile.email)
//   //         || !(this.contentPost.email == this.contentDto.email);
//   //     }
//   //   }
//   //   return retVal;
//   // }

//   // public isContentPost() {
//   //   return (this.contentDto.postID!=undefined)?true:false;
//   // }

//   // async increaseReaction(): Promise<Insightlogs> {
// 	// 	Insightlogs item = this.insightReceiver. .increaseReaction(this.getProfile().getEmail(),
//   //   this.getContentPost().get().getPostID());
//   //   if (item != null) {
//   //     this.getContentPost().get().increaseReaction();
//   //     this.getReceiverEventId().get().getParent().setReactionUri(this.getContentDto().getReactionUri());
//   //     this.getEventId().get().getParent().setReactionUri(this.getContentDto().getReactionUri());
//   //   }
//   //   return Optional.ofNullable(item);
//   // }

//   // async increaseReaction_(mate: String, postID: String): Promise<Insightlogs> {
//   //   this.reactions += 1;
// 	// 	InsightLog item = this.addInsightLog(mate, EventInsight.REACTION.getName(), postID);

//   //   return item;
//   // }
// }


