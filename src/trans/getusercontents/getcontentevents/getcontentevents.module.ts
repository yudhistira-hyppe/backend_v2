import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GetcontenteventsService } from './getcontentevents.service';
import { GetcontenteventsController } from './getcontentevents.controller';
import { ConfigModule } from '@nestjs/config';
import { Getcontentevents, GetcontenteventsSchema } from './schemas/getcontentevents.schema';
import { ContenteventsModule } from '../../../content/contentevents/contentevents.module';
import { CountriesModule } from '../../../infra/countries/countries.module';
import { UtilsModule } from '../../../utils/utils.module';
import { PostsModule } from '../../../content/posts/posts.module';
import { MediaprofilepictsModule } from '../../../content/mediaprofilepicts/mediaprofilepicts.module';

@Module({

    imports: [
        MediaprofilepictsModule,
        UtilsModule, PostsModule,
        ConfigModule.forRoot(), ContenteventsModule, CountriesModule,
        MongooseModule.forFeature([{ name: Getcontentevents.name, schema: GetcontenteventsSchema }], 'SERVER_TRANS')
    ],
    controllers: [GetcontenteventsController],
    providers: [GetcontenteventsService],
    exports: [GetcontenteventsService],
})
export class GetcontenteventsModule { }
