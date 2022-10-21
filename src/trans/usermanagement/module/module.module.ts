
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';
import { ConfigModule } from '@nestjs/config';
import { Module as Module_, ModuleSchema } from './schemas/module.schema';
import { UtilsModule } from '../../../utils/utils.module';

@Module({

    imports: [
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Module_.name, schema: ModuleSchema }], 'SERVER_FULL')
    ],
    controllers: [ModuleController],
    exports: [ModuleService],
    providers: [ModuleService],
})
export class ModuleModule { }
