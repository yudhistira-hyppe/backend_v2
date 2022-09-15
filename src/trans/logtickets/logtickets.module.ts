import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogticketsController } from './logtickets.controller';
import { LogticketsService } from './logtickets.service';
import { ConfigModule } from '@nestjs/config';
import { Logtickets, LogticketsSchema } from './schemas/logtickets.schema';
import { MediaprofilepictsModule } from '../../content/mediaprofilepicts/mediaprofilepicts.module';
@Module({

    imports: [
        MediaprofilepictsModule, ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Logtickets.name, schema: LogticketsSchema }], 'SERVER_TRANS')
    ],
    controllers: [LogticketsController],
    providers: [LogticketsService],
    exports: [LogticketsService],
})
export class LogticketsModule { }
