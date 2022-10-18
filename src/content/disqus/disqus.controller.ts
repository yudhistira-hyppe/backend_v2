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

@Controller('api/')
export class DisqusController {

  constructor(private readonly DisqusService: DisqusService,
    private readonly disquscontactsService: DisquscontactsService,
    //private readonly reactionsService: ReactionsService,
    private readonly utilsService: UtilsService,
    private readonly postDisqusService: PostDisqusService,
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
    var retVal = [{}];

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
      if (!isQuery){
        if (type == "DIRECT_MSG") {
          var retVal = [{}];
          retVal.push(this.buildDisqus(ContentDto_, true));
          ContentDto_.disqus = retVal;
          isValid = true;
          for (var retValCount = 0; retValCount < retVal.length; retValCount++){
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

  private async buildDisqus(ContentDto_: ContentDto,buildInteractive:boolean){
    var CreateDisquscontactsDto_ = new CreateDisquscontactsDto();
    CreateDisquscontactsDto_ = await this.disquscontactsService.findByEmailAndMate(ContentDto_.email.toString(), ContentDto_.receiverParty.toString());
    if (await this.utilsService.ceckData(CreateDisquscontactsDto_)){
      var IdDisqus = CreateDisquscontactsDto_.disqus.id.toString();
      var CreateDisqusDto_ = new CreateDisqusDto();
      if (CreateDisquscontactsDto_.disqus != null) {
        CreateDisqusDto_ = await this.DisqusService.findOne(IdDisqus);
      } else {
        var DataId = await this.utilsService.generateId();
        CreateDisqusDto_._id = DataId;
        CreateDisqusDto_.room = DataId;
        CreateDisqusDto_.disqusID = ContentDto_.disqusID;
        CreateDisqusDto_.eventType = ContentDto_.eventType;
        CreateDisqusDto_.email = ContentDto_.email;
        CreateDisqusDto_.mate = ContentDto_.mate;
        CreateDisqusDto_.active = ContentDto_.active;
        CreateDisqusDto_.createdAt = await this.utilsService.getDateTimeString();
        CreateDisqusDto_.updatedAt = await this.utilsService.getDateTimeString();
      }
      if (ContentDto_.postID != undefined) {
        var PostData = await this.postDisqusService.findid(ContentDto_.postID.toString());
        if (await this.utilsService.ceckData(PostData)) {
          ContentDto_.postContent = PostData;
          ContentDto_.postType = PostData.postType;
          if (buildInteractive){
            var _ContentDto_ = new ContentDto();
            _ContentDto_ = ContentDto_;
            ContentDto_.eventType = "REACTION";
            ContentDto_.postType = PostData.postType;
            ContentDto_.receiverParty = PostData.email;
            ContentDto_.reactionUri = ContentDto_.reactionUri;

					// InsightDto insightDto = this.validationEvent(contentDto);
          //   this.processInsightEvent(insightDto);
          }
        }
      }
    }
  }

  private async validationEvent(ContentDto_: ContentDto){
    var post = await this.postDisqusService.findContentPost(ContentDto_.postID.toString());
    var InsightsDto = new InsightsDto();
    
  }

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
