import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils/utils.module';
import { LogapisModule } from 'src/trans/logapis/logapis.module';
import { ConfigModule } from '@nestjs/config';
import { FiltercategoryController } from './filtercategory.controller';
import { FiltercategoryService } from './filtercategory.service';
import { Filtercategory, filterCategorySchema } from './schemas/filtercategory.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports:[
        UtilsModule,
        LogapisModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([
            {
                name: Filtercategory.name, schema: filterCategorySchema
            }
        ], 'SERVER_FULL')
    ],
    controllers: [FiltercategoryController],
    providers: [FiltercategoryService],
    exports: [FiltercategoryService]
})
export class FiltercategoryModule {}
