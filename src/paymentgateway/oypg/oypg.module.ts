import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { OyPgController } from './oypg.controller';
import { OyPgService } from './oypg.service';
@Module({

    imports: [
        ConfigModule.forRoot()
    ],
    controllers: [OyPgController],
    providers: [OyPgService],
    exports: [OyPgService],
})
export class OyPgModule {}
