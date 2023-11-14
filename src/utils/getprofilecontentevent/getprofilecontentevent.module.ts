import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GetprofilecontenteventService } from './getprofilecontentevent.service';
import { Contentevents, ContenteventsSchema } from 'src/content/contentevents/schemas/contentevents.schema';
@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Contentevents.name, schema: ContenteventsSchema }], 'SERVER_FULL')
    ],
    controllers: [],
    providers: [GetprofilecontenteventService],
    exports: [GetprofilecontenteventService],
})
export class GetprofilecontenteventModule { }
