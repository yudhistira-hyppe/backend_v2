import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DevicelogService } from './devicelog.service';
import { DevicelogController } from './devicelog.controller';
import { ConfigModule } from '@nestjs/config';
import { Devicelog, DevicelogSchema } from './schemas/devicelog.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Devicelog.name, schema: DevicelogSchema }], 'SERVER_FULL')
    ],
    controllers: [DevicelogController],
    providers: [DevicelogService],
    exports: [DevicelogService],
})
export class DevicelogModule { }
