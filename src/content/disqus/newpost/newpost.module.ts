import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Newpost, NewpostSchema } from '..//../disqus/newpost/schemas/newpost.schema';
import { NewpostController } from './newpost.controller';
import { NewpostService } from './newpost.service';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Newpost.name, schema: NewpostSchema }], 'SERVER_FULL')
    ],
    controllers: [NewpostController],
    providers: [NewpostService],
    exports: [NewpostService],
})
export class NewpostModule { }
