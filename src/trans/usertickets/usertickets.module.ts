import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserticketsController } from './usertickets.controller';
import { UserticketsService } from './usertickets.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { Usertickets, UserticketsSchema } from './schemas/usertickets.schema';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { UserticketdetailsController } from './userticketdetails/userticketdetails.controller';
import { UserticketdetailsService } from './userticketdetails/userticketdetails.service';
import { UserticketdetailsModule } from './userticketdetails/userticketdetails.module';
import { MediaprofilepictsModule } from '../../content/mediaprofilepicts/mediaprofilepicts.module';
import { UtilsModule } from '../../utils/utils.module';
import { SeaweedfsModule } from '../../stream/seaweedfs/seaweedfs.module';
@Module({
    imports: [

        UserbasicsModule, MediaprofilepictsModule, UtilsModule, SeaweedfsModule, NestjsFormDataModule, ConfigService, ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Usertickets.name, schema: UserticketsSchema }], 'SERVER_TRANS')
    ],
    controllers: [UserticketsController],
    exports: [UserticketsService],
    providers: [UserticketsService],

})
export class UserticketsModule { }
