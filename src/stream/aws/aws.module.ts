import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AwsController } from './aws.controller';
import { AwsService } from './aws.service';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';
@Module({

    imports: [HttpModule, ConfigService, ConfigModule.forRoot()],
    controllers: [AwsController],
    providers: [AwsService],
    exports: [AwsService],
})
export class AwsModule { }
