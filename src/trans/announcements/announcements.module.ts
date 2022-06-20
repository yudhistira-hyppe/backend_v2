import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { ConfigModule } from '@nestjs/config';
import { Announcements, AnnouncementsSchema } from './schemas/announcement.schema';
import { UserbasicsModule } from '../userbasics/userbasics.module';
@Module({

    imports: [

        ConfigModule.forRoot(), UserbasicsModule,
        MongooseModule.forFeature([{ name: Announcements.name, schema: AnnouncementsSchema }], 'SERVER_TRANS')
    ],
    controllers: [AnnouncementsController],
    exports: [AnnouncementsService],
    providers: [AnnouncementsService],

})
export class AnnouncementsModule { }
