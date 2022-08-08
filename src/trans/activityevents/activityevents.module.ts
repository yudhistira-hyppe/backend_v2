import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityeventsService } from './activityevents.service';
import { ActivityeventsController } from './activityevents.controller';
import { ConfigModule } from '@nestjs/config';
import { Activityevents, ActivityeventsSchema } from './schemas/activityevents.schema';
import { UtilsModule } from '../../utils/utils.module';
import { GroupModuleModule } from '../../trans/usermanagement/groupmodule/groupmodule.module';

@Module({
    imports: [
        GroupModuleModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Activityevents.name, schema: ActivityeventsSchema }],'SERVER_TRANS')
    ],
    controllers: [ActivityeventsController],
    providers: [ActivityeventsService],
    exports: [ActivityeventsService],
})
export class ActivityeventsModule {


}
