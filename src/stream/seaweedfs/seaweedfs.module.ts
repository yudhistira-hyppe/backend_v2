import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeaweedfsController } from './seaweedfs.controller';
import { SeaweedfsService } from './seaweedfs.service';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';
@Module({

    imports: [HttpModule, ConfigService, ConfigModule.forRoot()],
    controllers: [SeaweedfsController],
    providers: [SeaweedfsService],
    exports: [SeaweedfsService],
})
export class SeaweedfsModule {}
