import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FaqsController } from './faqs.controller';
import { FaqService } from './faqs.service';
import { ConfigModule } from '@nestjs/config';
import { Faqs, FaqsSchema } from './schemas/faqs.schema';
import { UserbasicsModule } from '../userbasics/userbasics.module';


@Module({
    imports: [

        ConfigModule.forRoot(), UserbasicsModule,
        MongooseModule.forFeature([{ name: Faqs.name, schema: FaqsSchema }], 'SERVER_TRANS')
    ],
    controllers: [FaqsController],
    exports: [FaqService],
    providers: [FaqService],

})
export class FaqsModule { }
