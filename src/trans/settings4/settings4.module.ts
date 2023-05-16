import { Module } from '@nestjs/common';
import { Settings4Service } from './settings4.service';
import { Settings4Controller } from './settings4.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsArray, Settings4Schema } from './schemas/settings4.schema';

@Module({
  imports: [
      ConfigModule.forRoot(),
      MongooseModule.forFeature([{ name: SettingsArray.name, schema: Settings4Schema }], 'SERVER_FULL')
  ],
  controllers: [Settings4Controller],
  providers: [Settings4Service]
})
export class Settings4Module {}
