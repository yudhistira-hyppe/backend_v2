
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pph21sController } from './pph21s.controller';
import { Pph21sService } from './pph21s.service';
import { ConfigModule } from '@nestjs/config';
import { Pph21s, Pph21sSchema } from './schemas/pph21s.schema';

@Module({

    imports: [

        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Pph21s.name, schema: Pph21sSchema }], 'SERVER_FULL')
    ],
    controllers: [Pph21sController],
    exports: [Pph21sService],
    providers: [Pph21sService],
})
export class Pph21sModule { }
