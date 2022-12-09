import { Controller} from '@nestjs/common';
import { ContentDto, CreateDisqusDto, DisqusResDto } from 'src/content/disqus/dto/create-disqus.dto';
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
    private readonly utilsService: UtilsService,
    private readonly disqusLogService: DisquslogsService,
    private readonly postDisqusService: PostDisqusService,) { }

  async buildDisqus(CreateDisqusDto_: CreateDisqusDto, CreateDisquslogsDto_: Disquslogs) {
    let retVal = new DisqusResDto();
    let getValDisquslogs = await this.retvalDisqusLog(CreateDisquslogsDto_);
    let arrayisquslogs: DisquslogsDto[] = [];
    arrayisquslogs.push(getValDisquslogs);

    retVal.disqusLogs = arrayisquslogs;
    retVal.email = CreateDisqusDto_.email;
    retVal.room = CreateDisqusDto_.room;

    retVal.eventType = CreateDisqusDto_.eventType;
    retVal.active = CreateDisqusDto_.active;
    retVal.createdAt = CreateDisqusDto_.createdAt;
    retVal.updatedAt = CreateDisqusDto_.updatedAt;
    retVal.lastestMessage = CreateDisqusDto_.lastestMessage;

    var profile = await this.utilsService.generateProfile(String(CreateDisqusDto_.email), 'PROFILE');
    if (profile.username != undefined) {
      retVal.username = profile.username;
    }
    if (profile.fullName != undefined) {
      retVal.fullName = profile.fullName;
    }
    if (profile.avatar != undefined) {
      retVal.avatar = profile.avatar;
    }

    var profile_mate = await this.utilsService.generateProfile(String(CreateDisqusDto_.mate), 'PROFILE');
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
    mateInfo['email'] = CreateDisqusDto_.mate;
    retVal.mate = mateInfo;

    var senderReciverInfo = {};
    var currentEmail = CreateDisqusDto_.email;
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

  async retvalDisqusLog(DisqusLog: Disquslogs) {
    var retVal = new DisquslogsDto();
    retVal.disqusID = DisqusLog.disqusID;
    retVal.postType = DisqusLog.postType;
    retVal.lineID = DisqusLog._id;
    retVal.sender = DisqusLog.sender;
    retVal.receiver = DisqusLog.receiver;
    retVal.active = DisqusLog.active;
    retVal.createdAt = DisqusLog.createdAt;
    retVal.updatedAt = DisqusLog.updatedAt;
    retVal.txtMessages = DisqusLog.txtMessages;
    retVal.reactionUri = DisqusLog.reactionUri;
    return retVal;
  }
}
