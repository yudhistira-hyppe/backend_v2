import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DisqusService } from './disqus.service';
import { DisqusController } from './disqus.controller';
import { ConfigModule } from '@nestjs/config';
import { Disqus, DisqusSchema } from './schemas/disqus.schema';
import { UtilsModule } from '../../utils/utils.module';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { DisquslogsModule } from '../disquslogs/disquslogs.module';
import { DisquscontactsModule } from '../disquscontacts/disquscontacts.module';
import { PostDisqusModule } from './post/postdisqus.module';
import { InsightsModule } from '../insights/insights.module';
import { ContenteventsModule } from '../contentevents/contentevents.module';
import { UserbasicsModule } from '../../trans/userbasics/userbasics.module';
import { UserauthsModule } from '../../trans/userauths/userauths.module';

@Module({

    imports: [
        ContenteventsModule,
        InsightsModule,
        PostDisqusModule,
        DisquscontactsModule,
        DisquslogsModule,
        NestjsFormDataModule,
        UserbasicsModule,
        UserauthsModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Disqus.name, schema: DisqusSchema }],'SERVER_CONTENT')
    ],
    controllers: [DisqusController],
    providers: [DisqusService],
    exports: [DisqusService],
})
export class DisqusModule {}
