import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { ConfigModule } from '@nestjs/config';
import { Cities, CitiesSchema } from './schemas/cities.schema';
import { LogapisModule } from 'src/trans/logapis/logapis.module'; 

@Module({

    imports: [
        LogapisModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Cities.name, schema: CitiesSchema }], 'SERVER_FULL')
    ],
    controllers: [CitiesController],
    providers: [CitiesService],
    exports: [CitiesService],
})
export class CitiesModule { }
