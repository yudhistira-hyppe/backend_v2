import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OyPgController } from './oypg.controller';
import { OyPgService } from './oypg.service';
import { HttpModule } from '@nestjs/axios';
@Module({

    imports: [HttpModule, ConfigService, ConfigModule.forRoot()],
    controllers: [OyPgController],
    providers: [OyPgService],
    exports: [OyPgService],
})
export class OyPgModule {}
