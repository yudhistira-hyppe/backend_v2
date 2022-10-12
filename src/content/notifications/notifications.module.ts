import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { ConfigModule } from '@nestjs/config';
import { Notifications, NotificationsSchema } from './schemas/notifications.schema';
import { UserbasicsModule } from 'src/trans/userbasics/userbasics.module';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Notifications.name, schema: NotificationsSchema }],'SERVER_CONTENT'),
        UserbasicsModule,
    ],
    controllers: [NotificationsController],
    providers: [NotificationsService],
    exports: [NotificationsService],
})
export class NotificationsModule {}
