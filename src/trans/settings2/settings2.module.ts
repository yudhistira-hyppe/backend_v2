import { Module } from '@nestjs/common';
import { Settings2Service } from './settings2.service';
import { Settings2Controller } from './settings2.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsMixed, Settings2Schema } from './schemas/settings2.schema';
import { LogapisModule } from '../logapis/logapis.module';

@Module({
  imports: [
      LogapisModule,
      ConfigModule.forRoot(),
      MongooseModule.forFeature([{ name: SettingsMixed.name, schema: Settings2Schema }], 'SERVER_FULL')
  ],
  controllers: [Settings2Controller],
  providers: [Settings2Service],
  exports:[Settings2Service]
})
export class Settings2Module {}
