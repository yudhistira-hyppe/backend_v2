import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentqmaticService } from './Contentqmatic.service';
import { ContentqmaticController } from './Contentqmatic.controller';
import { ConfigModule } from '@nestjs/config';
import { Contentqmatic, ContentqmaticSchema } from './schemas/Contentqmatic.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Contentqmatic.name, schema: ContentqmaticSchema }],'SERVER_CONTENT')
    ],
    controllers: [ContentqmaticController],
    providers: [ContentqmaticService],
    exports: [ContentqmaticService],
})
export class ContentqmaticModule {}
