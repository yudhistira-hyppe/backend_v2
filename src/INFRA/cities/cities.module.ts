import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { ConfigModule } from '@nestjs/config';
import { Cities, CitiesSchema } from './schemas/cities.schema';
@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Cities.name, schema: CitiesSchema }],'SERVER_INFRA')
    ],
    controllers: [CitiesController],
    providers: [CitiesService],
    exports: [CitiesService],
})
export class CitiesModule {}
