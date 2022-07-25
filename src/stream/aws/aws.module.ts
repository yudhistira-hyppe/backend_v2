import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AwsController } from './aws.controller';
import { AwsService } from './aws.service';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express'; 
import { SeaweedfsModule } from '../seaweedfs/seaweedfs.module';

@Module({

    imports: [SeaweedfsModule, HttpModule, ConfigService, ConfigModule.forRoot()],
    controllers: [AwsController],
    providers: [AwsService],
    exports: [AwsService],
})
export class AwsModule { }
