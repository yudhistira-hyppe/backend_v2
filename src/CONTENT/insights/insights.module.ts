import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InsightsService } from './Insights.service';
import { InsightsController } from './Insights.controller';
import { ConfigModule } from '@nestjs/config';
import { Insights, InsightsSchema } from './schemas/Insights.schema';

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
