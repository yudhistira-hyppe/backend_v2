import { Module } from '@nestjs/common';
import { NewNotificationService } from './newnotification.service';
import { NewNotificationController } from './newnotification.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { NewNotificationsSchema, newnotification } from './schemas/newnotification.schema';

@Module({
  imports:[
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name:newnotification.name, schema: NewNotificationsSchema }], 'SERVER_FULL')
  ],
  controllers: [NewNotificationController],
  providers: [NewNotificationService],
  exports:[NewNotificationService],
})
export class NewNotificationModule {}
