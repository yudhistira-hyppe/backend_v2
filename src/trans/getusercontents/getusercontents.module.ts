import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GetusercontentsController } from './getusercontents.controller';
import { GetusercontentsService } from './getusercontents.service';
import { ConfigModule } from '@nestjs/config';
import { Getusercontents, GetusercontentsSchema } from './schemas/getusercontents.schema';
import { MediaprofilepictsModule } from '../../content/mediaprofilepicts/mediaprofilepicts.module';
import { InsightsModule} from '../../content/insights/insights.module';
import { PostsModule} from '../../content/posts/posts.module';
import { MediavideosModule} from '../../content/mediavideos/mediavideos.module';
import { MediapictsModule} from '../../content/mediapicts/mediapicts.module';
import { UserauthsModule } from '../userauths/userauths.module';
import { MediadiariesModule} from '../../content/mediadiaries/mediadiaries.module';

@Module({

    imports: [
         ConfigModule.forRoot(),UserauthsModule,MediaprofilepictsModule,InsightsModule,PostsModule,MediavideosModule,MediapictsModule,MediadiariesModule,
    
        MongooseModule.forFeature([{ name: Getusercontents.name, schema: GetusercontentsSchema }],'SERVER_TRANS')
    ],
    controllers: [GetusercontentsController],
    exports: [GetusercontentsService],
    providers: [GetusercontentsService],
})
export class GetusercontentsModule {}
