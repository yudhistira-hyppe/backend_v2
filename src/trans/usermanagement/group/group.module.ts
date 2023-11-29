
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { ConfigModule } from '@nestjs/config';
import { Group, GroupSchema } from './schemas/group.schema';
import { UtilsModule } from '../../../utils/utils.module';
import { UserbasicsModule } from '../../../trans/userbasics/userbasics.module';
import { DivisionModule } from '../division/division.module';
import { UserauthsModule } from '../../../trans/userauths/userauths.module';
import { LogapisModule } from 'src/trans/logapis/logapis.module';
import { UserbasicnewModule } from 'src/trans/userbasicnew/userbasicnew.module';

@Module({
    imports: [
        UserbasicnewModule,
        UserauthsModule,
        LogapisModule,
        DivisionModule,
        UserbasicsModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }], 'SERVER_FULL')
    ],
    controllers: [GroupController],
    exports: [GroupService],
    providers: [GroupService],
})
export class GroupModule { }
