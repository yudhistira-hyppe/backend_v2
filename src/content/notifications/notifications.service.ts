import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Userbasic } from '../../trans/userbasics/schemas/userbasic.schema';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import { CreateNotificationsDto, Messages, NotifResponseApps } from './dto/create-notifications.dto';
import { Notifications, NotificationsDocument } from './schemas/notifications.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notifications.name, 'SERVER_FULL')
    private readonly NotificationsModel: Model<NotificationsDocument>,

    private userService: UserbasicsService,
  ) { }

  async create(
    CreateNotificationsDto: CreateNotificationsDto,
  ): Promise<Notifications> {
    const createNotificationsDto = await this.NotificationsModel.create(
      CreateNotificationsDto,
    );
    return createNotificationsDto;
  }

  async findAll(): Promise<Notifications[]> {
    return this.NotificationsModel.find().exec();
  }

  async findlatest(email: string, skip: number, limit: number): Promise<object> {
    const query = await this.NotificationsModel.aggregate([
      { $match: { email: email } },
      {
        $addFields: {

          createdAt: "$createdAt"
        }
      },
      { $sort: { createdAt: -1 }, },
      { $skip: skip },
      { $limit: limit },
    ]);
    return query;
  }


  //    async findOne(id: string): Promise<Notifications> {
  //     return this.NotificationsModel.findOne({ _id: id }).exec();
  //   }
  async findOne(email: string): Promise<Notifications> {
    return this.NotificationsModel.findOne({ email: email }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.NotificationsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  async getNotification(body: any, headers: any): Promise<NotifResponseApps> {
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    if (profile == null) {
      let res = new NotifResponseApps();
      let msg = new Messages;
      msg.info = ["User tidak tedaftar"];
      res.messages = msg;
      res.response_code = 204;
      return res;
    }

    let res = new NotifResponseApps();
    let msg = new Messages;

    let dns: CreateNotificationsDto[] = [];
    let q = await this.getNotificationQuery(body, profile);
    for (let i = 0; i < q.length; i++) {
      let notif = q[i];
      let dn = <CreateNotificationsDto>notif;
      dns.push(dn);
    }

    res.data = dns;
    res.messages = msg;
    res.response_code = 202;
    return res;
  }

  private async getNotificationQuery(body: any, profile: Userbasic): Promise<Notifications[]> {
    let query = this.NotificationsModel.find();
    query.where('email', profile.email);

    if (body.postID != undefined) {
      query.where('postID', body.postID);
    }

    if (body.eventType != undefined) {
      query.where('eventType', body.eventType);
    }

    let row = 20;
    let page = 0;
    if (body.pageNumber != undefined) {
      page = body.pageNumber;
    }
    if (body.pageRow != undefined) {
      row = body.pageRow;
    }
    let skip = this.paging(page, row);
    query.skip(skip);
    query.limit(row);
    query.sort({ 'updatedAt': -1 });
    return await query.exec();
  }

  private paging(page: number, row: number) {
    if (page == 0 || page == 1) {
      return 0;
    }
    let num = ((page - 1) * row);
    return num;
  }
}
