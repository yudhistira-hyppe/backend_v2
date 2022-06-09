import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNotificationsDto } from './dto/create-notifications.dto';
import { Notifications, NotificationsDocument } from './schemas/notifications.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notifications.name, 'SERVER_CONTENT')
    private readonly NotificationsModel: Model<NotificationsDocument>,
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


}
