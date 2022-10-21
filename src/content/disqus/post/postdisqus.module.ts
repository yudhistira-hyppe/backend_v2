import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Posts, PostsSchema } from '../../../content/posts/schemas/posts.schema';
import { PostDisqusController } from './postdisqus.controller';
import { PostDisqusService } from './postdisqus.service';
import { GetuserprofilesModule } from '../../../trans/getuserprofiles/getuserprofiles.module';

@Module({

    imports: [
        GetuserprofilesModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Posts.name, schema: PostsSchema }], 'SERVER_FULL')
    ],
    controllers: [PostDisqusController],
    providers: [PostDisqusService],
    exports: [PostDisqusService],
})
export class PostDisqusModule { }
