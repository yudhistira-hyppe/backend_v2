import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { ConfigModule } from '@nestjs/config';
import { Posts, PostsSchema } from './schemas/posts.schema';
import { UserauthsModule } from '../../trans/userauths/userauths.module';
@Module({

    imports: [
        ConfigModule.forRoot(), UserauthsModule,
        MongooseModule.forFeature([{ name: Posts.name, schema: PostsSchema }], 'SERVER_CONTENT')
    ],
    controllers: [PostsController],
    providers: [PostsService],
    exports: [PostsService],
})
export class PostsModule { }
