import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { GenreController } from './genre.controller';
import { GenreService } from './genre.service';
import { Genre, GenreSchema } from './schemas/genre.schema';
import { UtilsModule } from '../../utils/utils.module';
import { LogapisModule } from 'src/trans/logapis/logapis.module';

@Module({
    imports: [
        UtilsModule,
        LogapisModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Genre.name, schema: GenreSchema }], 'SERVER_FULL')
    ],
    controllers: [GenreController],
    providers: [GenreService],
    exports: [GenreService],

})
export class GenreModule { }
