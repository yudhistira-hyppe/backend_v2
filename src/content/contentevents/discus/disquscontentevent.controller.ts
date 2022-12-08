import { Controller} from '@nestjs/common';
import { ContentDto, DisqusResDto } from 'src/content/disqus/dto/create-disqus.dto';
import { PostDisqusService } from 'src/content/disqus/post/postdisqus.service';
import { Disqus } from 'src/content/disqus/schemas/disqus.schema';
import { DisquscontactsService } from 'src/content/disquscontacts/disquscontacts.service';
import { Disquscontacts } from 'src/content/disquscontacts/schemas/disquscontacts.schema';
import { DisquslogsService } from 'src/content/disquslogs/disquslogs.service';
import { DisquslogsDto } from 'src/content/disquslogs/dto/create-disquslogs.dto';
import { Disquslogs } from 'src/content/disquslogs/schemas/disquslogs.schema';
import { UtilsService } from 'src/utils/utils.service';
import { DisqusContentEventService } from './disqusdisquscontentevent.service';

const Long = require('mongodb').Long;
@Controller('api/')
export class DisqusContentEventController {

  constructor(private readonly disqusContentEventService: DisqusContentEventService,
    private readonly disquscontactsService: DisquscontactsService,
    //private readonly reactionsService: ReactionsService,
    private readonly utilsService: UtilsService,
    private readonly disqusLogService: DisquslogsService,
    private readonly postDisqusService: PostDisqusService,) { }

  async buildDisqus(dto: ContentDto, buildInteractive: boolean) {
    let cts = await this.disquscontactsService.findByEmailAndMate(dto.email.toString(), dto.receiverParty.toString());
    let dis = new Disqus();
    if (cts != undefined && cts.length > 0) {
      let ct = cts[0];
      console.log(ct.disqus_data_.disqusID);
      dis = await this.disqusContentEventService.findById(ct.disqus_data_.disqusID);
      console.log(dis._id);
    } else {
      var DataId = await this.utilsService.generateId();
      dis._id = DataId;
      dis.room = DataId;
      dis.disqusID = DataId;
      dis.eventType = dto.eventType;
      dis.email = dto.email;
      dis.mate = dto.receiverParty;
      dis.active = dto.active;
      dis.createdAt = await this.utilsService.getDateTimeString();
      dis.updatedAt = await this.utilsService.getDateTimeString();
    }

    if (dto.postID != undefined) {
      if (buildInteractive) {
        // Add reaction in post
        // let post = await this.postDisqusService.findid(dto.postID.toString());
        // let y = Number(post.reactions);
        // y = y + 1;
        // let yy = <any> y;
        // post.reactions = yy;

        // let cser = await this.contenteventsService.findSenderOrReceiverByPostID(String(post.postID), 'REACTION', String(dto.email), String(dto.receiverParty));

        // let insSender = this.insightsService.findemail(String(dto.email));
        // let insReceiver = this.insightsService.findemail(String(dto.receiverParty));
      }
    }

    //add disquslog

    let dl = new Disquslogs();
    var dlid = await this.utilsService.generateId();
    dl.createdAt = await this.utilsService.getDateTimeString();
    dl.disqusID = dto.disqusID
    dl.sequenceNumber = 0
    dl.active = true
    dl.updatedAt = await this.utilsService.getDateTimeString();
    dl._id = dlid;
    dl.sender = dto.email;
    dl.receiver = dto.receiverParty;
    dl.postType = dto.postType;
    dl.txtMessages = dto.txtMessages;
    dl.reactionUri = dto.reactionUri;
    dl._class = "io.melody.hyppe.content.domain.DisqusLog"
    dl.receiverActive = true
    dl.senderActive = true
    if (dto.postID != undefined) {
      dl.postID = dto.postID;
      var post = await this.postDisqusService.findByPostId(dto.postID.toString());
      var media = await this.postDisqusService.findOnepostID(dto.postID.toString());
      var media_ = {}
      if (await this.utilsService.ceckData(media)) {
        if (post.createdAt != undefined) {
          media_["createdAt"] = post.createdAt;
        }
        if (media[0].datacontent[0].mediaBasePath != undefined) {
          media_["mediaBasePath"] = media[0].datacontent[0].mediaBasePath;
        }
        if (post.postType != undefined) {
          media_["postType"] = post.postType;
        }
        if (media[0].datacontent[0].mediaUri != undefined) {
          media_["mediaUri"] = media[0].datacontent[0].mediaUri;
        }
        if (media[0].datacontent[0].mediaUri != undefined) {
          media_["mediaThumbUri"] = media[0].datacontent[0].mediaThumb;
        }
        if (post.description != undefined) {
          media_["description"] = post.description;
        }
        if (post.active != undefined) {
          media_["active"] = post.active;
        }
        if (media[0].datacontent[0].mediaType != undefined) {
          media_["mediaType"] = media[0].datacontent[0].mediaType;
        }
        if (media[0].datacontent[0].mediaType != undefined) {
          media_["mediaThumbEndpoint"] = "/thumb/" + post.postID;
        }
        if (post.postID != undefined) {
          media_["postID"] = post.postID;
        }
        if (media[0].datacontent[0].mediaUri != undefined) {
          media_["mediaEndpoint"] = "/stream/" + media[0].datacontent[0].mediaUri;
        }
        if (media[0].datacontent[0].apsara != undefined) {
          media_["apsara"] = media[0].datacontent[0].apsara
        }
        if (media[0].datacontent[0].apsaraId != undefined) {
          media_["apsaraId"] = media[0].datacontent[0].apsaraId
        }
      }
      dl.medias = [media_];
    }
    let ndl = await this.disqusLogService.create(dl);

    let agg = await this.aggrDisqusLogV2(String(dto.eventType), dl);
    let retVal = new DisqusResDto();
    let arr: DisquslogsDto[] = [];
    arr.push(agg);
    retVal.disqusLogs = arr;

    var usp = { "$ref": "disquslogs", "$id": String(ndl._id), "$db": "hyppe_trans_db" };
    let usparr = [];
    usparr.push(usp);
    dis.disqusLogs = usparr;

    dis.updatedAt = dl.createdAt;
    dis.lastestMessage = dl.txtMessages.substring(0, 21);
    dis.mateActive = true;
    dis.emailActive = true;
    this.disqusContentEventService.create(dis);

    if (cts == undefined || cts.length < 1) {

      let c0 = new Disquscontacts();
      var usy = { "$ref": "disqus", "$id": String(dis._id), "$db": "hyppe_trans_db" };
      c0.disqus = usy;
      var c0id = await this.utilsService.generateId();
      c0._id = c0id;
      c0.mate = dto.receiverParty;
      c0.email = dto.email;
      this.disquscontactsService.create(c0);

      let c1 = new Disquscontacts();
      var usy = { "$ref": "disqus", "$id": String(dis._id), "$db": "hyppe_trans_db" };
      c1.disqus = usy;
      var c1id = await this.utilsService.generateId();
      c1._id = c1id;
      c1.mate = dto.email;
      c1.email = dto.receiverParty;
      this.disquscontactsService.create(c1);
    }

    retVal.email = dis.email;
    retVal.room = dis.room;

    retVal.eventType = dis.eventType;
    retVal.active = dis.active;
    retVal.createdAt = dis.createdAt;
    retVal.updatedAt = dis.updatedAt;
    retVal.lastestMessage = dis.lastestMessage;

    var profile = await this.utilsService.generateProfile(String(dis.email), 'PROFILE');
    if (profile.username != undefined) {
      retVal.username = profile.username;
    }
    if (profile.fullName != undefined) {
      retVal.fullName = profile.fullName;
    }
    if (profile.avatar != undefined) {
      retVal.avatar = profile.avatar;
    }

    var profile_mate = await this.utilsService.generateProfile(String(dis.mate), 'PROFILE');
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
    mateInfo['email'] = dis.mate;
    retVal.mate = mateInfo;

    var senderReciverInfo = {};
    var currentEmail = dto.email;
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
    retVal.senderOrReceiverInfo = senderReciverInfo;

    return retVal;
  }

  private async aggrDisqusLogV2(eventType: string, DisqusLog: Disquslogs) {
    var retVal = new DisquslogsDto();
    retVal.disqusID = DisqusLog.disqusID;
    retVal.postType = DisqusLog.postType;

    if ((DisqusLog.postID != undefined) && (eventType == "DIRECT_MSG")) {
      var post = this.postDisqusService.findOnepostID(DisqusLog.postID.toString());
      //retVal.content = post;
    }
    //retVal.lineID = DisqusLog._id;
    retVal.sender = DisqusLog.sender;

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
        //retVal.senderInfo = mateInfo;
      }
    }
    retVal.receiver = DisqusLog.receiver;
    retVal.active = DisqusLog.active;
    retVal.createdAt = DisqusLog.createdAt;
    retVal.updatedAt = DisqusLog.updatedAt;
    retVal.txtMessages = DisqusLog.txtMessages;
    retVal.reactionUri = DisqusLog.reactionUri;

    // var reaction = 
    // io.melody.hyppe.infra.domain.Reactions reaction = this.findReactionByURI(item.getReactionUri());
    // if (reaction != null) {
    //   retVal.put("reaction_icon", reaction.getIcon());
    // }

    return retVal;
  }
}
