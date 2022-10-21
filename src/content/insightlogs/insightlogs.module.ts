import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InsightlogsService } from './insightlogs.service';
import { InsightlogsController } from './insightlogs.controller';
import { ConfigModule } from '@nestjs/config';
import { Insightlogs, InsightlogsSchema } from './schemas/insightlogs.schema';
import { InsightsModule } from '../../content/insights/insights.module';
@Module({

    imports: [
        ConfigModule.forRoot(), InsightsModule,
        MongooseModule.forFeature([{ name: Insightlogs.name, schema: InsightlogsSchema }], 'SERVER_FULL')
    ],
    controllers: [InsightlogsController],
    providers: [InsightlogsService],
    exports: [InsightlogsService],

})
export class InsightlogsModule { }
