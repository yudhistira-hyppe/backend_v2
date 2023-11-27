import { Module } from '@nestjs/common';
import { SettingsReadService } from './setting_read.service';
import { SettingsReadController } from './setting_read.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { SettingsRead, SettingsReadSchema } from './schema/setting_read.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: SettingsRead.name, schema: SettingsReadSchema }], 'SERVER_FULL_READ')
    ],
    controllers: [SettingsReadController],
    providers: [SettingsReadService],
    exports: [SettingsReadService],
})
export class SettingsReadModule { }
