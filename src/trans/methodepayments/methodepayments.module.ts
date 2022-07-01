import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MethodepaymentsController } from './methodepayments.controller';
import { MethodepaymentsService } from './methodepayments.service';
import { ConfigModule } from '@nestjs/config';
import { Methodepayments, MethodepaymentsSchema } from './schemas/methodepayments.schema';
@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Methodepayments.name, schema: MethodepaymentsSchema }], 'SERVER_TRANS')
    ],
    controllers: [MethodepaymentsController],
    providers: [MethodepaymentsService],
    exports: [MethodepaymentsService],
})
export class MethodepaymentsModule { }
