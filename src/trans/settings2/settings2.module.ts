import { Module } from '@nestjs/common';
import { Settings2Service } from './settings2.service';
import { Settings2Controller } from './settings2.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Settings, SettingsSchema } from './schemas/settings.schema';

@Module({
  imports: [
      ConfigModule.forRoot(),
      MongooseModule.forFeature([{ name: Settings.name, schema: SettingsSchema }], 'SERVER_FULL')
  ],
  controllers: [Settings2Controller],
  providers: [Settings2Service]
})
export class Settings2Module {}
