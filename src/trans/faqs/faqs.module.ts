import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FaqsController } from './faqs.controller';
import { FaqService } from './faqs.service';
import { ConfigModule } from '@nestjs/config';
import { Faqs, FaqsSchema } from './schemas/faqs.schema';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { LogapisModule } from '../logapis/logapis.module';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
    imports: [

        ConfigModule.forRoot(), UserbasicsModule, UtilsModule, LogapisModule,
        MongooseModule.forFeature([{ name: Faqs.name, schema: FaqsSchema }], 'SERVER_FULL')
    ],
    controllers: [FaqsController],
    exports: [FaqService],
    providers: [FaqService],

})
export class FaqsModule { }
