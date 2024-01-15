import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Newpost, NewpostSchema } from '..//../disqus/newpost/schemas/newpost.schema';
import { NewpostController } from './newpost.controller';
import { NewpostService } from './newpost.service';
import { UtilsModule } from '../../../utils/utils.module';
import { SeaweedfsModule } from '../../../stream/seaweedfs/seaweedfs.module';
@Module({

    imports: [
        ConfigModule.forRoot(),UtilsModule,SeaweedfsModule,
        MongooseModule.forFeature([{ name: Newpost.name, schema: NewpostSchema }], 'SERVER_FULL')
    ],
    controllers: [NewpostController],
    providers: [NewpostService],
    exports: [NewpostService],
})
export class NewpostModule { }
