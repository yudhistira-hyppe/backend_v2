import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaproofpictsService } from './Mediaproofpicts.service';
import { MediaproofpictsController } from './Mediaproofpicts.controller';
import { ConfigModule } from '@nestjs/config';
import { Mediaproofpicts, MediaproofpictsSchema } from './schemas/Mediaproofpicts.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Mediaproofpicts.name, schema: MediaproofpictsSchema }],'SERVER_CONTENT')
    ],
    controllers: [MediaproofpictsController],
    providers: [MediaproofpictsService],
    exports: [MediaproofpictsService],
})
export class MediaproofpictsModule {}
