import { Module } from '@nestjs/common';
import { Settings3Service } from './settings3.service';
import { Settings3Controller } from './settings3.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsString, Settings3Schema } from './schemas/settings3.schema';

@Module({
  imports: [
      ConfigModule.forRoot(),
      MongooseModule.forFeature([{ name: SettingsString.name, schema: Settings3Schema }], 'SERVER_FULL')
  ],
  controllers: [Settings3Controller],
  providers: [Settings3Service]
})
export class Settings3Module {}
