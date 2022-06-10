import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentService } from '../comment/comment.service';
import { ConfigModule } from '@nestjs/config';
import { Comment, CommentSchema } from '../comment/schemas/comment.schema';
import { MediaprofilepictsModule } from '../../../content/mediaprofilepicts/mediaprofilepicts.module';
import { InsightsModule } from '../../../content/insights/insights.module';
import { PostsModule } from '../../../content/posts/posts.module';
import { MediavideosModule } from '../../../content/mediavideos/mediavideos.module';
import { MediapictsModule } from '../../../content/mediapicts/mediapicts.module';
import { UserauthsModule } from '../../userauths/userauths.module';
import { MediadiariesModule } from '../../../content/mediadiaries/mediadiaries.module';
import { DisqusModule } from '../../../content/disqus/disqus.module';
import { CommentController } from '../comment/comment.controller';
import { GetusercontentsModule } from '../../getusercontents/getusercontents.module';
import { DisquslogsModule } from '../../../content/disquslogs/disquslogs.module';



@Module({
    imports: [
        ConfigModule.forRoot(), UserauthsModule, MediaprofilepictsModule, InsightsModule, PostsModule, MediavideosModule, MediapictsModule, MediadiariesModule, DisqusModule, DisquslogsModule,

        MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }], 'SERVER_TRANS'),

    ],
    controllers: [CommentController],
    exports: [CommentService],
    providers: [CommentService],
})
export class CommentModule { }
