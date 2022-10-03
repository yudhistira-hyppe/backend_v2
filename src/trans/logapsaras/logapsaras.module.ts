import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogapsarasController } from './logapsaras.controller';
import { LogapsarasService } from './logapsaras.service';
import { ConfigModule } from '@nestjs/config';
import { Logapsaras, LogapsarasSchema } from './schemas/logapsaras.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Logapsaras.name, schema: LogapsarasSchema }], 'SERVER_TRANS')
    ],
    controllers: [LogapsarasController],
    providers: [LogapsarasService],
    exports: [LogapsarasService],

})
export class LogapsarasModule { }
