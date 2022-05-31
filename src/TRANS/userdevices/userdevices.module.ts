import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserdevicesController } from './userdevices.controller';
import { UserdevicesService } from './userdevices.service';
import { Userdevice, UserdeviceSchema } from './schemas/userdevice.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Userdevice.name, schema: UserdeviceSchema }],'SERVER_TRANS')
  ],
  controllers: [UserdevicesController],
  exports: [UserdevicesService],
  providers: [UserdevicesService],
})
export class UserdevicesModule {}