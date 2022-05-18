import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DomaineventsService } from './domainevents.service';
import { DomaineventsController } from './domainevents.controller';
import { ConfigModule } from '@nestjs/config';
import { Domainevents, DomaineventsSchema } from './schemas/domainevents.schema';
@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Domainevents.name, schema: DomaineventsSchema }],'SERVER_TRANS')
    ],
    controllers: [DomaineventsController],
    providers: [DomaineventsService],
    exports: [DomaineventsService],
})
export class DomaineventsModule {}
