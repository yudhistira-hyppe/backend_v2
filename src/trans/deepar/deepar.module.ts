import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeepArController } from './deepar.controller';
import { DeepArService } from './deepar.service';
import { ConfigModule } from '@nestjs/config';
import { DeepAr, DeepArSchema } from './schemas/deepar.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: DeepAr.name, schema: DeepArSchema }], 'SERVER_FULL')
    ],
    controllers: [DeepArController],
    providers: [DeepArService],
    exports: [DeepArService],
})
export class DeepArModule { }
