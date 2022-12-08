import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Disqus, DisqusSchema } from 'src/content/disqus/schemas/disqus.schema';
import { DisqusContentEventController } from './disquscontentevent.controller';
import { DisqusContentEventService } from './disqusdisquscontentevent.service';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Disqus.name, schema: DisqusSchema }], 'SERVER_FULL')
    ],
    controllers: [DisqusContentEventController],
    providers: [DisqusContentEventService],
    exports: [DisqusContentEventService],
})
export class DisqusContentEventModule { }
