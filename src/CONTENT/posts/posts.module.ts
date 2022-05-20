import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './Posts.service';
import { PostsController } from './Posts.controller';
import { ConfigModule } from '@nestjs/config';
import { Posts, PostsSchema } from './schemas/Posts.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Posts.name, schema: PostsSchema }],'SERVER_CONTENT')
    ],
    controllers: [PostsController],
    providers: [PostsService],
    exports: [PostsService],
})
export class PostsModule {}
