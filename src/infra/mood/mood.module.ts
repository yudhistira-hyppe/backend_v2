import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MoodController } from './mood.controller';
import { MoodService } from './mood.service';
import { Mood, MoodSchema } from './schemas/mood.schema';
import { UtilsModule } from '../../utils/utils.module';
import { LogapisModule } from 'src/trans/logapis/logapis.module'; 

@Module({
    imports: [
        LogapisModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Mood.name, schema: MoodSchema }], 'SERVER_FULL')
    ],
    controllers: [MoodController],
    providers: [MoodService],
    exports: [MoodService],

})
export class MoodModule { }
