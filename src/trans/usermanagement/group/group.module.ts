
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { ConfigModule } from '@nestjs/config';
import { Group, GroupSchema } from './schemas/group.schema';
import { UtilsModule } from '../../../utils/utils.module';

@Module({
    imports: [
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }], 'SERVER_TRANS')
    ],
    controllers: [GroupController],
    exports: [GroupService],
    providers: [GroupService],
})
export class GroupModule { }
