import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contentevents, ContenteventsDocument } from 'src/content/contentevents/schemas/contentevents.schema';

@Injectable()
export class GetprofilecontenteventService {
  constructor(
    @InjectModel(Contentevents.name, 'SERVER_FULL')
    private readonly ContenteventsModel: Model<ContenteventsDocument>,
  ) { }

  async findByCriteria(email: string, EventType: string): Promise<Contentevents[]> {
    var Where = {}
    var Or = []
    Object.assign(Where, { email: email });
    if (EventType != "") {
      Object.assign(Where, { eventType: EventType });
    }
    Object.assign(Where, { event: "ACCEPT" });
    Object.assign(Where, { active: true });
    if (Object.keys(Or).length > 0) {
      Object.assign(Where, { $or: Or });
    } else {
      Object.assign(Where);
    }

    var sort = null;
    if (EventType != "") {
      if (EventType == "FOLLOWING" || EventType == "FOLLOWER") {
        sort = { sequenceNumber: 1, updatedAt: -1 }
      } else {
        sort = { postType: 1, updatedAt: -1 }
      }
    } else {
      sort = { postType: 1, updatedAt: -1 }
    }
    console.log(JSON.stringify(Where));
    const query = this.ContenteventsModel.find(Where).sort(sort);
    return query;
  }

  async findByCriteriaWithUser(email: string, EventType: string, email_view?: string): Promise<Contentevents[]> {
    var Where = {}
    var Or = []
    Object.assign(Where, { email: email });
    if (EventType != "") {
      Object.assign(Where, { eventType: EventType });
    }
    Object.assign(Where, { event: "ACCEPT" });
    Object.assign(Where, { active: true });
    if (Object.keys(Or).length > 0) {
      Object.assign(Where, { $or: Or });
    } else {
      Object.assign(Where);
    }

    if (email_view != undefined) {
      if (EventType == "FOLLOWING") {
        Object.assign(Where, { senderParty: email_view });
      }
    }

    var sort = null;
    if (EventType != "") {
      if (EventType == "FOLLOWING" || EventType == "FOLLOWER") {
        sort = { sequenceNumber: 1, updatedAt: -1 }
      } else {
        sort = { postType: 1, updatedAt: -1 }
      }
    } else {
      sort = { postType: 1, updatedAt: -1 }
    }
    console.log(JSON.stringify(Where));
    const query = this.ContenteventsModel.find(Where).sort(sort);
    return query;
  }
}
