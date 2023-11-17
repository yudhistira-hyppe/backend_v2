import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { NewNotificationsDocument, newnotification } from './schemas/newnotification.schema';
import { CreateNewNotificationsDto } from './dto/create-newnotification.dto';

@Injectable()
export class NewNotificationService {
    constructor(
        @InjectModel(newnotification.name, 'SERVER_FULL')
        private readonly notifmodel: Model<NewNotificationsDocument>,
    ) { }

    async create(
        CreateNotificationsDto: CreateNewNotificationsDto,
      ): Promise<newnotification> {
        const result = await this.notifmodel.create(
          CreateNotificationsDto,
        );

        console.log(result)

        return result;
    }

    async findAll()
    {
        var data = await this.notifmodel.find().exec();
        return data;
    }

    async findOne(id: string)
    {
        var data = await this.notifmodel.findOne({ id:id }).exec();

        return data;
    }

    async findCriteria(email: string, eventType: string, mate: string): Promise<newnotification> {
        return this.notifmodel.findOne({ email: email, eventType: eventType, mate: mate }).exec();
    }

    async updateNotifiaction(email: string, eventType: string, mate: string, currentDate: string) {
        this.notifmodel.updateOne(
          {
            email: email,
            eventType: eventType,
            mate: mate,
          },
          { createdAt: currentDate },
          function (err, docs) {
            if (err) {
              console.log(err);
            } else {
              console.log(docs);
            }
          },
        );
    }
}
