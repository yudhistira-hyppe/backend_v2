import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { NewNotificationsDocument, newnotification } from './schemas/newnotification.schema';

@Injectable()
export class NewNotificationService {
    constructor(
        @InjectModel(newnotification.name, 'SERVER_FULL')
        private readonly notifmodel: Model<NewNotificationsDocument>,
    ) { }

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
}
