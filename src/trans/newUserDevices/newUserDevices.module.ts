import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NewUserDevicesService } from './newUserDevices.service';
import { NewUserDevicesController } from './newUserDevices.controller';
import { newUserDevices, newUserdeviceSchema } from './schemas/newUserDevices.schema'; 

@Module({
  imports:[
    ConfigModule,
    MongooseModule.forFeature([{ name: newUserDevices.name, schema: newUserdeviceSchema }], 'SERVER_FULL')
  ],
  controllers: [NewUserDevicesController],
  providers: [NewUserDevicesService],
  exports: [NewUserDevicesService]
})
export class NewUserDevicesModule {}
