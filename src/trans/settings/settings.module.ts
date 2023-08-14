import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { ConfigModule } from '@nestjs/config';
import { Settings, SettingsSchema } from './schemas/settings.schema';
import { LogapisModule } from '../logapis/logapis.module';

@Module({

    imports: [
        LogapisModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Settings.name, schema: SettingsSchema }], 'SERVER_FULL')
    ],
    controllers: [SettingsController],
    providers: [SettingsService],
    exports: [SettingsService],
})
export class SettingsModule { }
