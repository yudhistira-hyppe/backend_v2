import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaprofilepictsService } from './Mediaprofilepicts.service';
import { MediaprofilepictsController } from './Mediaprofilepicts.controller';
import { ConfigModule } from '@nestjs/config';
import { Mediaprofilepicts, MediaprofilepictsSchema } from './schemas/Mediaprofilepicts.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Mediaprofilepicts.name, schema: MediaprofilepictsSchema }],'SERVER_CONTENT')
    ],
    controllers: [MediaprofilepictsController],
    providers: [MediaprofilepictsService],
    exports: [MediaprofilepictsService],
})
export class MediaprofilepictsModule {}
