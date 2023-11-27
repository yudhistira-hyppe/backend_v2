import { Module } from '@nestjs/common';
import { PostsReadService } from './post_read.service';
import { PostsReadController } from './post_read.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsRead, PostsReadSchema } from './schema/post_read.schema';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from 'src/utils/utils.module';
import { LogapisModule } from 'src/trans/logapis/logapis.module';
import { SettingsReadModule } from '../setting_read/setting_read.module';
import { PostsModule } from 'src/content/posts/posts.module';
import { ContenteventsModule } from 'src/content/contentevents/contentevents.module';

@Module({
    imports: [
        SettingsReadModule,
        PostsModule,
        LogapisModule,
        ContenteventsModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: PostsRead.name, schema: PostsReadSchema }], 'SERVER_FULL_READ')
    ],
    controllers: [PostsReadController],
    providers: [PostsReadService],
    exports: [PostsReadService],
})
export class PostsReadModule { }
