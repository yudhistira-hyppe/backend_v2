import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NewcontenteventsService } from './newcontentevents.service';
import { NewcontenteventsController } from './newcontentevents.controller';
import { ConfigModule } from '@nestjs/config';
import { Newcontentevents, NewcontenteventsSchema } from './schemas/newcontentevents.schema';
import { UtilsModule } from '../../utils/utils.module';
@Module({
    imports: [
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Newcontentevents.name, schema: NewcontenteventsSchema }], 'SERVER_FULL')
    ],
    controllers: [NewcontenteventsController,],
    providers: [NewcontenteventsService],
    exports: [NewcontenteventsService],
})
export class NewcontenteventsModule { }
