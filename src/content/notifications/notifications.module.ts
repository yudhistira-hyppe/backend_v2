import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { ConfigModule } from '@nestjs/config';
import { Notifications, NotificationsSchema } from './schemas/notifications.schema';
import { UserbasicsModule } from '../../trans/userbasics/userbasics.module';
import { LogapisModule } from 'src/trans/logapis/logapis.module';

@Module({

    imports: [
        LogapisModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Notifications.name, schema: NotificationsSchema }], 'SERVER_FULL'),
        UserbasicsModule,
    ],
    controllers: [NotificationsController],
    providers: [NotificationsService],
    exports: [NotificationsService],
})
export class NotificationsModule { }
