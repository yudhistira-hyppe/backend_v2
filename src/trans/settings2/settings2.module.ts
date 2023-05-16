import { Module } from '@nestjs/common';
import { Settings2Service } from './settings2.service';
import { Settings2Controller } from './settings2.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsBoolean, Settings2Schema } from './schemas/settings2.schema';

@Module({
  imports: [
      ConfigModule.forRoot(),
      MongooseModule.forFeature([{ name: SettingsBoolean.name, schema: Settings2Schema }], 'SERVER_FULL')
  ],
  controllers: [Settings2Controller],
  providers: [Settings2Service]
})
export class Settings2Module {}
