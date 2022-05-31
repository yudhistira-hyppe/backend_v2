import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';
import { ConfigModule } from '@nestjs/config';
import { Insights, InsightsSchema } from './schemas/insights.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Insights.name, schema: InsightsSchema }],'SERVER_CONTENT')
    ],
    controllers: [InsightsController],
    providers: [InsightsService],
    exports: [InsightsService],

})
export class InsightsModule {}
