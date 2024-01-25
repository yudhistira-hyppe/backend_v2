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
import { SettingsModule } from '../settings/settings.module';
import { UserauthsModule } from '../userauths/userauths.module';
import { LogticketsModule } from '../logtickets/logtickets.module';
import { OssModule } from "../../stream/oss/oss.module";
import { LogapisModule } from '../logapis/logapis.module';
import { UserbasicnewModule } from 'src/trans/userbasicnew/userbasicnew.module';
@Module({
    imports: [

        UserbasicsModule, OssModule, MediaprofilepictsModule, UtilsModule, SeaweedfsModule, NestjsFormDataModule, ConfigService, SettingsModule, LogticketsModule, UserauthsModule, ConfigModule.forRoot(), LogapisModule, UserbasicnewModule,
        MongooseModule.forFeature([{ name: Usertickets.name, schema: UserticketsSchema }], 'SERVER_FULL')
    ],
    controllers: [UserticketsController],
    exports: [UserticketsService],
    providers: [UserticketsService],

})
export class UserticketsModule { }
