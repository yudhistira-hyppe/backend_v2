import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Faqdetails, FaqdetailsSchema } from './schemas/faqdetails.schema';
import { FaqdetailsController } from '../faqdetails/faqdetails.controller';
import { FaqdetailsService } from '../faqdetails/faqdetails.service';
import { UserbasicsModule } from '../../userbasics/userbasics.module';
import { FaqsModule } from '../../faqs/faqs.module';

@Module({

    imports: [

        ConfigModule.forRoot(), UserbasicsModule, FaqsModule,
        MongooseModule.forFeature([{ name: Faqdetails.name, schema: FaqdetailsSchema }], 'SERVER_FULL')
    ],
    controllers: [FaqdetailsController],
    exports: [FaqdetailsService],
    providers: [FaqdetailsService],
})
export class FaqdetailsModule { }
