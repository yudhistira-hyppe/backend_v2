import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InsightlogsService } from './insightlogs.service';
import { InsightlogsController } from './insightlogs.controller';
import { ConfigModule } from '@nestjs/config';
import { Insightlogs, InsightlogsSchema } from './schemas/insightlogs.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Insightlogs.name, schema: InsightlogsSchema }],'SERVER_CONTENT')
    ],
    controllers: [InsightlogsController],
    providers: [InsightlogsService],
    exports: [InsightlogsService],

})
export class InsightlogsModule {}
