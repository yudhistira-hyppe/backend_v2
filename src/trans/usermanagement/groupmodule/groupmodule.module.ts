
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupModuleController } from './groupmodule.controller';
import { GroupModuleService } from './groupmodule.service';
import { ConfigModule } from '@nestjs/config';
import { GroupModule as GroupModule_, GroupModuleSchema } from './schemas/groupmodule.schema';
import { UtilsModule } from '../../../utils/utils.module';
import { GroupModule } from '../group/group.module';
import { ModuleModule } from '../module/module.module'; 
import { UserbasicsModule } from '../../../trans/userbasics/userbasics.module';
import { DivisionModule } from '../division/division.module';

@Module({

    imports: [
        DivisionModule,
        UserbasicsModule,
        ModuleModule,
        GroupModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: GroupModule_.name, schema: GroupModuleSchema }], 'SERVER_TRANS')
    ],
    controllers: [GroupModuleController],
    exports: [GroupModuleService],
    providers: [GroupModuleService],
})
export class GroupModuleModule {}
