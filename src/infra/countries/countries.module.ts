import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';
import { ConfigModule } from '@nestjs/config';
import { Countries, CountriesSchema } from './schemas/countries.schema';
@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Countries.name, schema: CountriesSchema }], 'SERVER_FULL')
    ],
    controllers: [CountriesController],
    providers: [CountriesService],
    exports: [CountriesService],
})
export class CountriesModule { }
