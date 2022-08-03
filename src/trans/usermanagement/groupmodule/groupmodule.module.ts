
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupModuleController } from './groupmodule.controller';
import { GroupModuleService } from './groupmodule.service';
import { ConfigModule } from '@nestjs/config';
import { GroupModule, GroupModuleSchema } from './schemas/groupmodule.schema';
import { UtilsModule } from '../../../utils/utils.module';

@Module({

    imports: [
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: GroupModule.name, schema: GroupModuleSchema }], 'SERVER_TRANS')
    ],
    controllers: [GroupModuleController],
    exports: [GroupModuleService],
    providers: [GroupModuleService],
})
export class GroupModuleModule { }
