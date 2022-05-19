import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LanguagesService } from './Languages.service';
import { LanguagesController } from './Languages.controller';
import { ConfigModule } from '@nestjs/config';
import { Languages, LanguagesSchema } from './schemas/Languages.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Languages.name, schema: LanguagesSchema }],'SERVER_INFRA')
],
controllers: [LanguagesController],
providers: [LanguagesService],
exports: [LanguagesService],
})
export class LanguagesModule {}
