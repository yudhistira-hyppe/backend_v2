import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './Notifications.service';
import { NotificationsController } from './Notifications.controller';
import { ConfigModule } from '@nestjs/config';
import { Notifications, NotificationsSchema } from './schemas/Notifications.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Notifications.name, schema: NotificationsSchema }],'SERVER_CONTENT')
    ],
    controllers: [NotificationsController],
    providers: [NotificationsService],
    exports: [NotificationsService],
})
export class NotificationsModule {}
