import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { TemplatesRepo, TemplatesRepoSchema } from '../../../infra/templates_repo/schemas/templatesrepo.schema';
import { AdsNotificationController } from './adsnotification.controller';
import { AdsNotificationService } from './adsnotification.service';
@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: TemplatesRepo.name, schema: TemplatesRepoSchema }], 'SERVER_FULL')
    ],
    controllers: [AdsNotificationController],
    providers: [AdsNotificationService],
    exports: [AdsNotificationService],
})
export class AdsNotificationModule {}