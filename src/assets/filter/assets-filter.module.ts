import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetsFilterController } from './assets-filter.controller';
import { AssetsFilterService } from './assets-filter.service';
import { ConfigModule } from '@nestjs/config';
import { AssetsFilter, AssetsFilterSchema } from './schemas/assets-filter.schema';
import { UtilsModule } from '../../utils/utils.module';
import { UserbasicsModule } from '../../trans/userbasics/userbasics.module';
import { LogapisModule } from 'src/trans/logapis/logapis.module';

@Module({
    imports: [

        UserbasicsModule,
        UtilsModule,
        LogapisModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: AssetsFilter.name, schema: AssetsFilterSchema }], 'SERVER_FULL')
    ],
    controllers: [AssetsFilterController],
    providers: [AssetsFilterService],
    exports: [AssetsFilterService],

})
export class AssetsFilterModule { }
