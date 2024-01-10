import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Disqus, DisqusSchema } from 'src/content/disqus/schemas/disqus.schema';
import { DisqusContentEventController } from './disquscontentevent.controller';
import { DisqusContentEventService } from './disqusdisquscontentevent.service';
import { UtilsModule } from '../../../utils/utils.module';
import { DisquslogsModule } from '../../disquslogs/disquslogs.module';
import { DisquscontactsModule } from '../../disquscontacts/disquscontacts.module';
import { PostDisqusModule } from '../../../content/disqus/post/postdisqus.module';
import { SocketModule } from '../../../content/socket/socket.module';
import { HttpModule } from '@nestjs/axios';

@Module({

    imports: [
        HttpModule,
        SocketModule,
        UtilsModule,
        DisquslogsModule,
        DisquscontactsModule,
        PostDisqusModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Disqus.name, schema: DisqusSchema }], 'SERVER_FULL')
    ],
    controllers: [DisqusContentEventController],
    providers: [DisqusContentEventService],
    exports: [DisqusContentEventService],
})
export class DisqusContentEventModule { }
